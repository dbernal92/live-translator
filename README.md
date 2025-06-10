# 🎙️ Live Korean-to-English Translator App

This project is a full-stack application that captures **live spoken Korean**, transcribes it to Korean text using speech recognition, and translates that text into **natural English** using the **Papago Translation API** — all displayed in real time through a React interface.

---

## 🚧 Status

**Currently in development.**  
Phase 1: Audio input setup (microphone access + audio upload) is in progress.

---

## 📌 Features (Planned)

- 🎤 Microphone-based live Korean audio input  
- 📝 Real-time transcription using speech-to-text API (AssemblyAI or Google STT)  
- 🌐 Natural translation to English using Papago API (NAVER Cloud)  
- 🖥️ Live display of Korean + English subtitles  
- 🔌 WebSocket integration for real-time updates  
- 📺 Optional OBS overlay mode for streamers

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Web Audio API
- WebSocket (planned)

### Backend
- Node.js + Express
- Multer (for handling audio blobs)
- AssemblyAI or Google STT API (for transcription)
- Papago API (for translation)

---

## 📁 Project Structure

```
live-translator/
├── client/ # React frontend
├── server/ # Node.js + Express backend
└── README.md
```

---

## 🧪 Development Setup

### 1. Clone the repo
```
git clone https://github.com/your-username/live-translator.git
cd live-translator
```

### 2. Install dependencies

#### Frontend
```
cd frontend
npm install
```

#### Backend
```
cd ../backend
npm install
```

### 3. Start development servers

# In one terminal tab (frontend)
```
cd frontend
npm run dev
```

# In another terminal tab (backend)
```
cd backend
npm run dev
```

## 🔒 API Keys
You’ll need to create a .env file in the /server folder for your transcription and translation APIs.

Example:

```
PAPAGO_CLIENT_ID=your-client-id
PAPAGO_CLIENT_SECRET=your-client-secret
ASSEMBLYAI_API_KEY=your-api-key
```

## ⚠️ License
All rights reserved.
You may not copy, modify, distribute, or use this project without express permission from the author.

## 🙋‍♀️ Author
Built by Darien Bernal

This project is part of an independent learning and portfolio initiative.
Do not reuse or republish without permission.
