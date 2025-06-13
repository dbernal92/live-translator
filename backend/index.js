// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Log the AssemblyAI API key status (for debugging)
console.log('[Loaded API Key]', process.env.ASSEMBLYAI_API_KEY);

// Core server dependencies
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';

// Routers
import { transcribeRouter } from './routes/transcribe.js';

const PORT = process.env.PORT || 4000;

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Connection Error:', err));


// View Engine
app.set('views', "./views");
app.set("view engine", "pug");

// Middlewares
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.render("index");
})

// API Routes
app.use('/api/transcribe', transcribeRouter);

// Global error handling
app.use((err, _req, res, next) => {
    res.status(500).send(`Error: ${err.message}`);
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
