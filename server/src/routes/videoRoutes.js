import { Router } from 'express';
import { downloadClip, processUploadedVideo, registerUrl, uploadMiddleware, uploadVideo } from '../controllers/videoController.js';

export const videoRouter = Router();

videoRouter.post('/upload', uploadMiddleware.single('video'), uploadVideo);
videoRouter.post('/url', registerUrl);
videoRouter.post('/process', processUploadedVideo);
videoRouter.get('/download/:clipId/:format', downloadClip);
