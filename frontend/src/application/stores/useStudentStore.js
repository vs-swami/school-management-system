import { create } from 'zustand';
import { StudentService } from '../services/StudentServices';

const studentService = new StudentService();

export const useStudentStore = create((set, get) => ({
  // State
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  filters: {},

  // Actions
  setStudents: (students) => set({ students }),
  
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set({ filters }),

  // Helper function to extract data correctly
  extractData: (result) => {
    // Handle different response formats
    if (result.data) {
      // If data has a nested data property (Strapi paginated format)
      if (result.data.data) {
        return result.data.data;
      }
      // If data is directly the array/object
      return result.data;
    }
    // Fallback to result itself
    return result;
  },

  // Async Actions
  fetchStudents: async (filters = {}) => {
    set({ loading: true, error: null });
    
    const result = await studentService.getAllStudents(filters);
    
    if (result.success) {
      const students = get().extractData(result);
      console.log('Fetched students:', students); // Debug log
      
      set({
        students: Array.isArray(students) ? students : [],
        loading: false
      });
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  },

  fetchStudentById: async (id) => {
    set({ loading: true, error: null });
    
    const result = await studentService.getStudentById(id);
    
    if (result.success) {
      const student = get().extractData(result);
      console.log('Fetched student by ID:', student); // Debug log
      
      set({
        selectedStudent: student,
        loading: false
      });
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  },

  createStudent: async (submissionData, files) => {
    set({ loading: true, error: null });
    
    const result = await studentService.createStudent(submissionData, files);
    
    if (result.success) {
      const newStudent = get().extractData(result);
      console.log('Created student:', newStudent); // Debug log
      
      // Update the students list
      const current = get();
      set({
        students: [...current.students, newStudent],
        loading: false
      });
      return { success: true, data: newStudent };
    } else {
      set({
        error: result.error,
        loading: false
      });
      return { success: false, error: result.error, details: result.details };
    }
  },

  updateStudent: async (id, submissionData, files) => {
    set({ loading: true, error: null });
    
    const result = await studentService.updateStudent(id, submissionData, files);
    
    if (result.success) {
      const updatedStudent = get().extractData(result);
      console.log('Updated student:', updatedStudent); // Debug log
      
      const current = get();
      const updatedStudents = current.students.map(student =>
        student.id === id ? updatedStudent : student
      );
      
      set({
        students: updatedStudents,
        selectedStudent: updatedStudent,
        loading: false
      });
      return { success: true, data: updatedStudent };
    } else {
      set({
        error: result.error,
        loading: false
      });
      return { success: false, error: result.error, details: result.details };
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    
    const result = await studentService.deleteStudent(id);
    
    if (result.success) {
      const current = get();
      const updatedStudents = current.students.filter(student => student.id !== id);
      
      set({
        students: updatedStudents,
        selectedStudent: current.selectedStudent?.id === id ? null : current.selectedStudent,
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

  searchStudents: async (query) => {
    if (!query) {
      get().fetchStudents();
      return;
    }
    
    set({ loading: true, error: null });
    
    const result = await studentService.searchStudents(query);
    
    if (result.success) {
      const students = get().extractData(result);
      console.log('Search results:', students); // Debug log
      
      set({
        students: Array.isArray(students) ? students : [],
        loading: false
      });
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  }
}));