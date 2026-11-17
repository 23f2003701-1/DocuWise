// === User Types ===
export interface User {
  id: string;
  name: string;
  email: string;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPreferences {
  expiryReminders: boolean;
  reminderDays: number[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// === Document Types ===
export type DocumentCategory =
  | 'Identity'
  | 'Educational'
  | 'Vehicle'
  | 'Insurance'
  | 'Financial'
  | 'Property'
  | 'Medical'
  | 'Legal'
  | 'Other';

export type ExpiryStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'No Expiry';

export interface DocumentItem {
  _id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  cloudinaryPublicId: string;
  originalFileName: string;
  description?: string;
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  expiryStatus: ExpiryStatus;
  tags: string[];
  isAIProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadData {
  title: string;
  category?: DocumentCategory;
  description?: string;
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
}

// === AI Analysis Types ===
export interface AIAnalysisResult {
  _id: string;
  documentId: string;
  userId: string;
  documentType: string;
  category: string;
  extractedFields: Record<string, any>;
  summary: string;
  importantDetails: string[];
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  confidence: number;
  createdAt: string;
}

export interface AIAnalysisResponse {
  analysis: AIAnalysisResult;
  document: DocumentItem;
}

// === Reminder / Notification Types ===
export interface Reminder {
  _id: string;
  documentId: DocumentItem | string;
  userId: string;
  reminderType: '30_day' | '7_day' | '1_day';
  message: string;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

// === Dashboard Types ===
export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardStats {
  totalDocuments: number;
  categoryCounts: CategoryCount[];
  statusCounts: StatusCount[];
  recentDocuments: DocumentItem[];
  upcomingExpiries: DocumentItem[];
}

// === API Response Types ===
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedResponse<T> {
  documents: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// === Navigation Types ===
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Documents: undefined;
  Upload: undefined;
  Expiry: undefined;
  Profile: undefined;
};

export type DocumentStackParamList = {
  MyDocuments: undefined;
  DocumentCategories: undefined;
  DocumentDetails: { documentId: string };
  DocumentPreview: { fileUrl: string; fileType: string; title: string };
  AIAnalysis: { documentId: string; analysis?: AIAnalysisResult; document?: DocumentItem };
  AISummary: { analysis: AIAnalysisResult };
  Search: undefined;
  UploadDocument: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  Notifications: undefined;
  Settings: undefined;
  DocumentDetails: { documentId: string };
  DocumentPreview: { fileUrl: string; fileType: string; title: string };
  AIAnalysis: { documentId: string; analysis?: AIAnalysisResult; document?: DocumentItem };
  AISummary: { analysis: AIAnalysisResult };
  Search: undefined;
};
