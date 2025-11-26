export interface CallRecord {
  contactName: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: Date;
  duration?: number; // duración en segundos, opcional
}
