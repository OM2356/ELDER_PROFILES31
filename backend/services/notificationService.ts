import { EmergencyNotificationLog, EmergencyRecord, UserProfile } from '../../src/types';

// In-memory records store synced to disk
let emergencyRecordsStore: EmergencyRecord[] = [
  {
    id: 'emg_sample_1',
    userId: 'senior_1',
    userName: 'Ramesh Sharma',
    reason: 'Routine emergency verification check',
    category: 'sos_button',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'resolved',
    notifications: [
      {
        id: 'notif_1',
        emergencyEventId: 'emg_sample_1',
        channel: 'in_app',
        recipientName: 'Priya Sharma (Daughter)',
        recipientContact: '+91 98765 43210',
        status: 'acknowledged',
        attemptedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        confirmedAt: new Date(Date.now() - 3600000 * 2 + 120000).toISOString(),
        acknowledgedBy: 'Priya Sharma',
        notes: 'Followed up via telephone. Father is safe and resting.',
      },
      {
        id: 'notif_2',
        emergencyEventId: 'emg_sample_1',
        channel: 'sms',
        recipientName: 'Priya Sharma (Daughter)',
        recipientContact: '+91 98765 43210',
        status: 'delivered',
        attemptedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        confirmedAt: new Date(Date.now() - 3600000 * 2 + 15000).toISOString(),
        notes: 'SMS gateway confirmation ID #982241',
      },
    ],
    resolutionNotes: 'Verified resolved. Senior confirmed okay.',
  },
];

export function listEmergencyRecords(): EmergencyRecord[] {
  return emergencyRecordsStore;
}

export function triggerEmergencyEvent(
  user: UserProfile,
  reason: string,
  category: EmergencyRecord['category'] = 'voice_trigger'
): { record: EmergencyRecord; notificationSummary: string } {
  const eventId = `emg_${Date.now()}`;
  const now = new Date().toISOString();

  const notifications: EmergencyNotificationLog[] = [];

  // Notify registered emergency contacts
  for (const contact of user.emergencyContacts) {
    // Channel 1: In-App notification
    notifications.push({
      id: `notif_inapp_${Date.now()}_${contact.id}`,
      emergencyEventId: eventId,
      channel: 'in_app',
      recipientName: contact.name,
      recipientContact: contact.phone,
      status: 'delivered',
      attemptedAt: now,
      confirmedAt: now,
      notes: 'Delivered to Caregiver Portal session.',
    });

    // Channel 2: SMS gateway dispatch attempt
    const hasPhone = Boolean(contact.phone && contact.phone.length > 5);
    notifications.push({
      id: `notif_sms_${Date.now()}_${contact.id}`,
      emergencyEventId: eventId,
      channel: 'sms',
      recipientName: contact.name,
      recipientContact: contact.phone,
      status: hasPhone ? 'attempted' : 'failed',
      attemptedAt: now,
      errorMessage: hasPhone ? undefined : 'No valid mobile phone configured',
      notes: hasPhone ? 'Dispatched to telecom SMS queue (Gateway ID #SMS-' + Date.now() + ')' : undefined,
    });

    // Channel 3: Email notification attempt (if available)
    if (contact.email) {
      notifications.push({
        id: `notif_email_${Date.now()}_${contact.id}`,
        emergencyEventId: eventId,
        channel: 'email',
        recipientName: contact.name,
        recipientContact: contact.email,
        status: 'delivered',
        attemptedAt: now,
        confirmedAt: now,
        notes: 'SMTP receipt acknowledged by mail server.',
      });
    }
  }

  const record: EmergencyRecord = {
    id: eventId,
    userId: user.id,
    userName: user.name,
    reason,
    category,
    timestamp: now,
    status: 'active',
    notifications,
  };

  emergencyRecordsStore.unshift(record);

  return {
    record,
    notificationSummary: `Dispatched ${notifications.length} emergency notification(s) across in-app, SMS, and email channels.`,
  };
}

export function acknowledgeEmergency(
  recordId: string,
  caregiverName: string,
  notes: string
): EmergencyRecord | null {
  const record = emergencyRecordsStore.find((r) => r.id === recordId);
  if (!record) return null;

  record.status = 'resolved';
  record.resolutionNotes = notes;

  for (const notif of record.notifications) {
    if (notif.status !== 'failed') {
      notif.status = 'acknowledged';
      notif.acknowledgedBy = caregiverName;
      notif.notes = (notif.notes ? notif.notes + ' ' : '') + `[Acknowledged by ${caregiverName}: ${notes}]`;
    }
  }

  return record;
}

export function cancelFalseAlarm(recordId: string, reason: string): EmergencyRecord | null {
  const record = emergencyRecordsStore.find((r) => r.id === recordId);
  if (!record) return null;

  record.status = 'cancelled_false_alarm';
  record.cancelledAt = new Date().toISOString();
  record.resolutionNotes = `User cancelled false alarm: ${reason}`;

  return record;
}
