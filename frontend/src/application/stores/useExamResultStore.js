import { create } from 'zustand';
import { ExamResultService } from '../services/ExamResultService';

const examResultService = new ExamResultService();

export default create((set, get) => ({
  // State
  examResults: [],
  selectedExamResult: null,
  loading: false,
  error: null,
  filters: {},

  // Actions
  setExamResults: (examResults) => set({ examResults }),
  setSelectedExamResult: (examResult) => set({ selectedExamResult: examResult }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),

  // Helper function to extract data correctly
  extractData: (result) => {
    if (result.data) {
      if (result.data.data) {
        return result.data.data;
      }
      return result.data;
    }
    return result;
  },

  // Async Actions
  fetchExamResults: async (filters = {}) => {
    set({ loading: true, error: null });
    const result = await examResultService.getAllExamResults(filters);
    if (result.success) {
      const examResults = get().extractData(result);
      set({
        examResults: Array.isArray(examResults) ? examResults : [],
        loading: false
      });
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  },

  fetchExamResultById: async (id) => {
    set({ loading: true, error: null });
    const result = await examResultService.getExamResultById(id);
    if (result.success) {
      const examResult = get().extractData(result);
      set({
        selectedExamResult: examResult,
        loading: false
      });
      return examResult;
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  },

  createExamResult: async (submissionData) => {
    console.log('Creating exam result with data:', submissionData);
    set({ loading: true, error: null });
    const result = await examResultService.createExamResult(submissionData);
    if (result.success) {
      const newExamResult = get().extractData(result);
      const current = get();
      set({
        examResults: [...current.examResults, newExamResult],
        loading: false
      });
      return { success: true, data: newExamResult };
    } else {
      set({
        error: result.error,
        loading: false
      });
      return { success: false, error: result.error, details: result.details };
    }
  },

  updateExamResult: async (id, submissionData) => {
    console.log('Updating exam result with ID:', id);
    set({ loading: true, error: null });
    const result = await examResultService.updateExamResult(id, submissionData);
    if (result.success) {
      const updatedExamResult = get().extractData(result);
      const current = get();
      const updatedExamResults = current.examResults.map(examResult =>
        examResult.id === id ? updatedExamResult : examResult
      );
      set({
        examResults: updatedExamResults,
        selectedExamResult: updatedExamResult,
        loading: false
      });
      return { success: true, data: updatedExamResult };
    } else {
      set({
        error: result.error,
        loading: false
      });
      return { success: false, error: result.error, details: result.details };
    }
  },

  deleteExamResult: async (id) => {
    set({ loading: true, error: null });
    const result = await examResultService.deleteExamResult(id);
    if (result.success) {
      const current = get();
      const updatedExamResults = current.examResults.filter(examResult => examResult.id !== id);
      set({
        examResults: updatedExamResults,
        selectedExamResult: current.selectedExamResult?.id === id ? null : current.selectedExamResult,
        loading: false
      });
      return { success: true };
    } else {
      set({
        error: result.error,
        loading: false
      });
      return { success: false, error: result.error };
    }
  },
}));
