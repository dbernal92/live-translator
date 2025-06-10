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

const apiKey = process.env.ASSEMBLYAI_API_KEY;

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // pload audio file to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'transfer-encoding': 'chunked',
      },
      body: fs.createReadStream(filePath),
    });

    const uploadData = await uploadRes.json();
    const audio_url = uploadData.upload_url;

    // Request transcription
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

    const transcriptData = await transcriptRes.json();
    res.json({ transcript_id: transcriptData.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transcription failed.' });
  }
});

export { router as transcribeRouter };
