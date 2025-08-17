// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import { Transcript } from '../models/Transcript.js';

// Setup current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create router and configure file upload destination
const router = express.Router();
const upload = multer({ dest: `${__dirname}/../uploads/` });

// Trim API key from .env
const apiKey = process.env.ASSEMBLYAI_API_KEY?.trim();


// GET /api/transcribe/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      method: 'GET',
      headers: {
        authorization: apiKey,
      },
    });

    const transcriptData = await response.json();

    if (transcriptData.status === 'completed') {
      await Transcript.findOneAndUpdate(
        { transcript_id: id },
        {
          text: transcriptData.text,
          confidence: transcriptData.confidence,
          words: transcriptData.words,
        },
        { new: true }
      );

      const updatedDoc = await Transcript.findOne({ transcript_id: id });
      console.log('[Transcript in DB]', updatedDoc);
    }

    console.log('[AssemblyAI Response]', transcriptData);
    res.json(transcriptData);
  } catch (error) {
    console.error('[Get Transcript Error]', error);
    res.status(500).send('Failed to retrieve transcript.');
  }
});


// GET /api/transcribe/
router.get('/', async (_req, res) => {
  try {
    const transcripts = await Transcript.find({});
    res.json(transcripts);
  } catch (error) {
    console.error('[All Transcripts Error]', error);
    res.status(500).json({ error: 'Failed to fetch transcripts from database.' });
  }
});


// POST /api/transcribe/
router.post('/', upload.single('audio'), async (req, res) => {
  let transcriptData;

  try {
    const filePath = req.file?.path;
    console.log('Transcribe Route Hit');
    console.log('File Path', filePath, 'Exists:', fs.existsSync(filePath));
    console.log('API Key Present', !!apiKey);

    const fileBuffer = fs.readFileSync(filePath);

    // Upload file to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'content-type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    const uploadData = await uploadRes.json();
    const audio_url = uploadData.upload_url;
    console.log('[Assembly Upload Raw Response]', uploadData);

    // Request transcription
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url,
        language_code: 'ko',
        speaker_labels: true,
      }),
    });

    transcriptData = await transcriptRes.json();
    console.log('[Transcript Data]', transcriptData);
    console.log('[Transcript ID]', transcriptData.id);

    // Save transcript ID to MongoDB
    try {
      await Transcript.create({ transcript_id: transcriptData.id });
    } catch (err) {
      if (err.code === 11000) {
        console.warn('Duplicate transcript_id detected. Skipping insert.');
      } else {
        throw err;
      }
    }

    res.json({ transcript_id: transcriptData.id });
  } catch (error) {
    console.error('[Transcribe Route Error]', error);
    if (!res.headersSent) {
      res.status(500).send('Something went wrong.');
    }
  }
});

export { router as transcribeRouter };
