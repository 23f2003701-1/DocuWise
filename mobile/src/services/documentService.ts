import api from './api';
import {
  ApiResponse,
  DocumentItem,
  PaginatedResponse,
  AIAnalysisResult,
  AIAnalysisResponse,
  DashboardStats,
  CategoryCount,
} from '../types';
import * as FileSystem from 'expo-file-system';

export const documentService = {
  uploadDocument: async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    metadata: Record<string, string>
  ): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('document', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    // Append metadata fields
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const response = await api.post<ApiResponse<DocumentItem>>('/documents/upload', formData, {
      transformRequest: (data) => data,
      timeout: 60000, // longer timeout for upload
    });
    return response.data.data!;
  },

  getDocuments: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DocumentItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<DocumentItem>>>('/documents', {
      params,
    });
    return response.data.data!;
  },

  getDocumentById: async (id: string): Promise<DocumentItem> => {
    const response = await api.get<ApiResponse<DocumentItem>>(`/documents/${id}`);
    return response.data.data!;
  },

  updateDocument: async (id: string, data: Partial<DocumentItem>): Promise<DocumentItem> => {
    const response = await api.put<ApiResponse<DocumentItem>>(`/documents/${id}`, data);
    return response.data.data!;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  replaceDocument: async (
    id: string,
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('document', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await api.put<ApiResponse<DocumentItem>>(
      `/documents/${id}/replace`,
      formData,
      { transformRequest: (data) => data, timeout: 60000 }
    );
    return response.data.data!;
  },

  getCategories: async (): Promise<CategoryCount[]> => {
    const response = await api.get<ApiResponse<CategoryCount[]>>('/documents/categories');
    return response.data.data!;
  },

  getExpiryTracker: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/documents/expiry-tracker');
    return response.data.data!;
  },

  // AI
  analyzeDocument: async (documentId: string): Promise<AIAnalysisResponse> => {
    const response = await api.post<ApiResponse<AIAnalysisResponse>>('/ai/analyze', {
      documentId,
    });
    return response.data.data!;
  },

  getAIAnalysis: async (documentId: string): Promise<AIAnalysisResult> => {
    const response = await api.get<ApiResponse<AIAnalysisResult>>(
      `/ai/analysis/${documentId}`
    );
    return response.data.data!;
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard');
    return response.data.data!;
  },
};
