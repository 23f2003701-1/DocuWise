import React, { createContext, useContext, useState, useCallback } from 'react';
import { DocumentItem, PaginatedResponse, DashboardStats, CategoryCount } from '../types';
import { documentService } from '../services/documentService';

interface DocumentContextType {
  documents: DocumentItem[];
  dashboardStats: DashboardStats | null;
  categories: CategoryCount[];
  isLoading: boolean;
  pagination: { total: number; page: number; pages: number } | null;
  fetchDocuments: (params?: Record<string, any>) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<{ total: number; page: number; pages: number } | null>(null);

  const fetchDocuments = useCallback(async (params?: Record<string, any>) => {
    setIsLoading(true);
    try {
      const result = await documentService.getDocuments(params);
      setDocuments(result.documents);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const stats = await documentService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await documentService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchDocuments(), fetchDashboard(), fetchCategories()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments, fetchDashboard, fetchCategories]);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        dashboardStats,
        categories,
        isLoading,
        pagination,
        fetchDocuments,
        fetchDashboard,
        fetchCategories,
        refreshAll,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
