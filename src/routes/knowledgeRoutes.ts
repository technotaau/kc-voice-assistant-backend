import { Router, Request, Response } from 'express';
import knowledgeBaseService from '../services/knowledgeBaseService';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and MD files are allowed'));
    }
  }
});

// Search knowledge base
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const results = await knowledgeBaseService.searchKnowledge(query, limit);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Upload and index documents
router.post('/upload', upload.array('documents', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Reload documents to include the new uploads
    const documentsPath = path.join(__dirname, '../../documents');
    await knowledgeBaseService.loadDocuments(documentsPath);
    
    res.json({
      success: true,
      message: `Successfully uploaded and indexed ${files.length} document(s)`,
      files: files.map(f => f.originalname)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Clear knowledge base
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    await knowledgeBaseService.clearIndex();
    
    res.json({
      success: true,
      message: 'Knowledge base cleared successfully'
    });
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({ error: 'Failed to clear knowledge base' });
  }
});

// Reload documents
router.post('/reload', async (req: Request, res: Response) => {
  try {
    const documentsPath = path.join(__dirname, '../../documents');
    await knowledgeBaseService.loadDocuments(documentsPath);
    
    res.json({
      success: true,
      message: 'Documents reloaded successfully'
    });
  } catch (error) {
    console.error('Reload error:', error);
    res.status(500).json({ error: 'Failed to reload documents' });
  }
});

export default router;