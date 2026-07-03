export type Screen = 'schedule' | 'pipeline' | 'inbox' | 'contacts' | 'settings' | 'profile';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  company?: string;
  department?: string;
  language?: string;
  timezone?: string;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'excel' | 'doc';
}

export interface ThreadMessage {
  id: string;
  sender: string;
  avatar?: string;
  body: string;
  date: string;
  isMe: boolean;
}

export interface SuggestedResponse {
  label: string;
  previewText: string;
  fullText: string;
}

export interface Email {
  id: string;

  sender: string;
  senderEmail: string;
  senderAvatar?: string;

  subject: string;
  body: string;

  time: string;
  date: string;

  // Used for Inbox badges
  score: string;
  bodyHtml?: string;
  aiSummary: string;

  isRead: boolean;
  isClicked: boolean;
  clickCount: number;

  sentiment: number;
  intent: number;
  engagement: number;

  suggestedResponses: SuggestedResponse[];

  recommendedNudge: string;

  attachments?: EmailAttachment[];

  threadHistory?: ThreadMessage[];
}
export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  score: number;
  engagement: number; // 1 to 4 bars
  avatar: string;
  aiNudge: string;
  lastInteraction: string;
}

export interface SuggestedTime {
  id: string;
  day: string;
  timeRange: string;
  badges?: string[];
  type: 'bolt' | 'schedule';
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'primary' | 'secondary' | 'tertiary';
}

export interface DailyEventMap {
  [day: number]: CalendarEvent[];
}
