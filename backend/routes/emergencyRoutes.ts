import { Router, Request, Response } from 'express';
import {
  acknowledgeEmergency,
  cancelFalseAlarm,
  listEmergencyRecords,
  triggerEmergencyEvent,
} from '../services/notificationService';
import { UserProfile } from '../../src/types';

export const emergencyRoutes = Router();

// 1. Trigger emergency assistance alert
emergencyRoutes.post('/alert', (req: Request, res: Response) => {
  const { reason = 'Emergency button activated', category = 'sos_button', user } = req.body;

  const seniorUser: UserProfile = user || {
    id: 'senior_1',
    name: 'Ramesh Sharma',
    role: 'senior',
    language: 'en',
    preferredSpeechRate: 0.85,
    highContrast: false,
    fontSize: 'large',
    emergencyContacts: [
      {
        id: 'c1',
        name: 'Priya Sharma (Daughter)',
        relation: 'Primary Caregiver',
        phone: '+91 98765 43210',
        email: 'priya.sharma@example.com',
        isPrimaryCaregiver: true,
      },
      {
        id: 'c2',
        name: 'Amit Sharma (Son)',
        relation: 'Son',
        phone: '+91 98111 22233',
        isPrimaryCaregiver: false,
      },
    ],
    privacySettings: {
      shareWellnessWithCaregiver: true,
      shareExercisesWithCaregiver: true,
      shareLearningProgress: true,
      allowEmergencyLocation: true,
      enableLongTermMemory: true,
    },
  };

  const { record, notificationSummary } = triggerEmergencyEvent(seniorUser, reason, category);

  res.json({
    success: true,
    record,
    summary: notificationSummary,
    emergencyNumber: '112',
    instructions: [
      'Remain seated or still if you have had a slip or fall.',
      'Tap Call 112 on your phone dialer to reach national dispatchers directly.',
      'Caregiver notification alerts have been queued across authorized channels.',
    ],
  });
});

// 2. List all emergency events
emergencyRoutes.get('/records', (_req: Request, res: Response) => {
  const records = listEmergencyRecords();
  res.json(records);
});

// 3. Caregiver acknowledges emergency alert
emergencyRoutes.post('/acknowledge', (req: Request, res: Response) => {
  const { recordId, caregiverName = 'Caregiver', notes = 'Acknowledged and attending' } = req.body;

  if (!recordId) {
    return res.status(400).json({ error: 'recordId is required' });
  }

  const updated = acknowledgeEmergency(recordId, caregiverName, notes);
  if (!updated) {
    return res.status(404).json({ error: 'Emergency record not found' });
  }

  res.json({ success: true, record: updated });
});

// 4. Cancel accidental trigger / false alarm
emergencyRoutes.post('/cancel', (req: Request, res: Response) => {
  const { recordId, reason = 'Accidental button press' } = req.body;

  if (!recordId) {
    return res.status(400).json({ error: 'recordId is required' });
  }

  const updated = cancelFalseAlarm(recordId, reason);
  if (!updated) {
    return res.status(404).json({ error: 'Emergency record not found' });
  }

  res.json({ success: true, record: updated });
});
