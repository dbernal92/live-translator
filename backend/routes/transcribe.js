// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import express from 'express';
import multer from 'multer'; // For handling file uploads
import fs from 'fs'; // For reading the uploaded file
import { fileURLToPath } from 'url'; // Helps get current file path in ES modules
import { dirname } from 'path'; // Helps get directory name in ES modules
import fetch from 'node-fetch'; // To send HTTP requests to AssemblyAI

// Import Mongoose model for storing transcript IDs
import { Transcript } from '../models/Transcript.js';

// Setup current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create router and configure file upload destination
const router = express.Router();
const upload = multer({ dest: `${__dirname}/../uploads/` });

// Trim API key from .env
const apiKey = process.env.ASSEMBLYAI_API_KEY?.trim();

// GET 
// Check the status of a transcription
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

    // If the transcription is completed, update record in MongoDB
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
    }

    res.json(transcriptData);
  } catch (error) {
    console.error('[Get Transcript Error]', error);
    res.status(500).send('Failed to retrieve transcript.');
  }
});

// View all transcripts
router.get('/', async (req, res) => {
  try {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/`, ); 
    const data = await response.json(); //parses the response into usable data
    res.json(data); //returns data back to requester
  }
  catch (error) {
    console.error(error); //debugging
    es.status(500).json({error: "Failed to fetch transcripts."})
  }
}) 






// POST
// Route to handle audio transcription
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log('Transcribe Route Hit');
    console.log('File Path', filePath, 'Exists:', fs.existsSync(filePath));
    console.log('API Key Present', !!apiKey);

    // Step 1: Read the uploaded file into memory
    const fileBuffer = fs.readFileSync(filePath);

    // Step 2: Upload file to AssemblyAI
    let audio_url;
    try {
      const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'content-type': 'application/octet-stream',
        },
        body: fileBuffer,
      });

      const rawUploadText = await uploadRes.text();
      console.log('[Assembly Upload Raw Response]', rawUploadText);

      const uploadData = JSON.parse(rawUploadText);
      audio_url = uploadData.upload_url;
    } catch (uploadErr) {
      console.error('[Upload Error]', uploadErr);
      return res.status(500).send('Failed to upload audio to AssemblyAI.');
    }

    // Step 3: Request transcription using uploaded audio URL
    try {
      const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url,
          language_code: 'ko', // Korean
          speaker_labels: true // Speaker separation
        }),
      });

      const rawTranscriptText = await transcriptRes.text();
      const transcriptData = JSON.parse(rawTranscriptText);

      // Step 4: Save transcript ID to MongoDB (handle duplicates gracefully)
      try {
        await Transcript.create({ transcript_id: transcriptData.id });
      } catch (err) {
        if (err.code === 11000) {
          console.warn('Duplicate transcript_id detected. Skipping insert.');
        } else {
          throw err;
        }
      }

      // Step 5: Respond to client with the transcript ID
      if (!res.headersSent) {
        res.json({ transcript_id: transcriptData.id });
      }
    } catch (transcriptErr) {
      console.error('[Transcription Request Error]', transcriptErr);
      if (!res.headersSent) {
        res.status(500).send('Failed to request transcription.');
      }
    }
  } catch (error) {
    console.error('[Transcribe Route Error]', error);
    if (!res.headersSent) {
      res.status(500).send('Something went wrong.');
    }
  }
});

// Export router for use in main app
export { router as transcribeRouter };
