import { Router, Request, Response } from 'express';
import {
  clearUserMemories,
  deleteUserMemoryItem,
  getUserMemory,
  saveUserMemoryItem,
  updatePersonalizationToggle,
} from '../services/memoryService';

export const memoryRoutes = Router();

// 1. Get user preferences and memory items
memoryRoutes.get('/preferences', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'senior_1';
  const memory = getUserMemory(userId);
  res.json(memory);
});

// 2. Save new memory item with user consent
memoryRoutes.post('/items', (req: Request, res: Response) => {
  const { userId = 'senior_1', category = 'preference', key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value are required to record a memory.' });
  }

  try {
    const newItem = saveUserMemoryItem(userId, category, key, value);
    res.json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Delete individual memory item
memoryRoutes.delete('/items/:id', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'senior_1';
  const itemId = req.params.id;

  const deleted = deleteUserMemoryItem(userId, itemId);
  res.json({ success: deleted });
});

// 4. Toggle personalization on/off
memoryRoutes.put('/toggle', (req: Request, res: Response) => {
  const { userId = 'senior_1', enable } = req.body;
  const state = updatePersonalizationToggle(userId, Boolean(enable));
  res.json({ success: true, enablePersonalization: state });
});

// 5. Clear all conversation memories
memoryRoutes.delete('/clear', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'senior_1';
  clearUserMemories(userId);
  res.json({ success: true, message: 'All conversational memories cleared.' });
});
