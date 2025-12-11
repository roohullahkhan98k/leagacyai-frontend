export type Resume = {
  id: string;
  name: string;
  file: File | null;
  content?: ResumeContent;
  uploadDate: Date;
};

export type ResumeContent = {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
};

export type Experience = {
  company: string;
  position: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  achievements: string[];
};

export type Education = {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | 'Present';
};

export type JobDescription = {
  id: string;
  title: string;
  company: string;
  content: string;
  dateAdded: Date;
};

export type InterviewSession = {
  id: string;
  name: string;
  resumeId: string;
  jobDescriptionId?: string;
  date: Date;
  duration: number; // in minutes
  platform: 'Zoom' | 'Microsoft Teams' | 'Google Meet' | 'Other';
  questions: InterviewQuestion[];
  analytics?: InterviewAnalytics;
};

export type InterviewQuestion = {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational' | 'general';
  suggestedAnswer?: string;
  userAnswer?: string;
  confidence?: number;
};

export type InterviewAnalytics = {
  overallConfidence: number;
  fillerWordsCount: number;
  averageResponseTime: number; // in seconds
  toneAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  improvementSuggestions: string[];
};

export type TranscriptSummary = {
  id: string;
  timestamp: number;
  topics: string[];
  mainPoints: string[];
  actionItems: string[];
  keyDecisions: string[];
  followUpTasks: string[];
  notableQuotes: Array<{
    text: string;
    timestamp: number;
    speaker?: string;
  }>;
  paragraphSummary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type SummarySettings = {
  maxLength: 'short' | 'medium' | 'long';
  focusAreas: Array<'topics' | 'actions' | 'decisions' | 'quotes'>;
  updateInterval: number; // in seconds
  exportFormat: 'txt';
};

// Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: File;
}

// AI Interview API Types
export interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
}

export interface InterviewRecord {
  id: string;
  session_id: string;
  user_id?: string;
  title: string;
  status: 'active' | 'completed';
  qa_pairs: QAPair[];
  total_qa: number;
  started_at: string;
  ended_at?: string;
}

// Third-party module declarations
declare module 'cytoscape-cose-bilkent';