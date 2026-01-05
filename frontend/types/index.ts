export type UserRole = 'interviewer' | 'interviewee';
export type SessionStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type CurrentStatus = 'student' | 'professional';

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  fullName: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  // Interviewer fields
  yearsOfExperience?: number;
  domains?: string[];
  availabilityRadius?: number;
  // Interviewee fields
  currentStatus?: CurrentStatus;
  yearOfStudy?: number;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  intervieweeId: User | string;
  interviewerId: User | string;
  subject: string;
  status: SessionStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  recordingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  sessionId: string;
  authorId: User | string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

