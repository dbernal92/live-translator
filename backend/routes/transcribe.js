import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ dest: `${__dirname}/../uploads/` });

const apiKey = process.env.ASSEMBLYAI_API_KEY?.trim();

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log('Transcribe Route Hit');
    console.log('File Path', filePath, 'Exists:', fs.existsSync(filePath));
    console.log('API Key Present', !!apiKey);

    // Read file into memory
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to AssemblyAI
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

    // Request transcription
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
        }),
      });

      const rawTranscriptText = await transcriptRes.text();
      // console.log('[Transcript Raw Response]', rawTranscriptText);

      const transcriptData = JSON.parse(rawTranscriptText);
      res.json({ transcript_id: transcriptData.id });
    } catch (transcriptErr) {
      console.error('[Transcription Request Error]', transcriptErr);
      return res.status(500).send('Failed to request transcription.');
    }
  } catch (error) {
    console.error('[Transcribe Route Error]', error);
    res.status(500).send('Something went wrong.');
  }
});

export { router as transcribeRouter };
