import { Router, Request, Response } from 'express';
import { addRAGDocument, deleteRAGDocument, listRAGDocuments, searchRAGKnowledge } from '../services/ragService';

export const ragRoutes = Router();

// 1. List indexed educational documents
ragRoutes.get('/documents', (_req: Request, res: Response) => {
  const docs = listRAGDocuments();
  res.json(docs);
});

// 2. Add or upload a new educational document
ragRoutes.post('/documents', (req: Request, res: Response) => {
  const { title, category, summary, content, tags, pageCount } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required for knowledge indexing.' });
  }

  const newDoc = addRAGDocument({
    title,
    category: category || 'smartphone',
    summary: summary || title,
    content,
    tags: Array.isArray(tags) ? tags : [category || 'elderly'],
    pageCount: pageCount || 1,
  });

  res.status(201).json(newDoc);
});

// 3. Remove an outdated document
ragRoutes.delete('/documents/:id', (req: Request, res: Response) => {
  const success = deleteRAGDocument(req.params.id);
  res.json({ success });
});

// 4. Semantic search endpoint for testing and source verification
ragRoutes.post('/search', (req: Request, res: Response) => {
  const { query = '' } = req.body;
  const results = searchRAGKnowledge(query, 3);
  res.json({ query, results });
});
