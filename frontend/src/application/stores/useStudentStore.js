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
  
  // Async Actions
  fetchStudents: async (filters = {}) => {
    set({ loading: true, error: null });
    
    const result = await studentService.getAllStudents(filters);
    
    if (result.success) {
      set({ 
        students: result.data.data || [], 
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
      set({ 
        selectedStudent: result.data.data, 
        loading: false 
      });
    } else {
      set({ 
        error: result.error, 
        loading: false 
      });
    }
  },
  
  createStudent: async (studentData) => {
    set({ loading: true, error: null });
    
    const result = await studentService.createStudent(studentData);
    
    if (result.success) {
      // Update the students list
      const current = get();
      set({ 
        students: [...current.students, result.data.data],
        loading: false 
      });
      return { success: true, data: result.data.data };
    } else {
      set({ 
        error: result.error, 
        loading: false 
      });
      return { success: false, error: result.error, details: result.details };
    }
  },
  
  updateStudent: async (id, studentData) => {
    set({ loading: true, error: null });
    
    const result = await studentService.updateStudent(id, studentData);
    
    if (result.success) {
      const current = get();
      const updatedStudents = current.students.map(student =>
        student.id === id ? result.data.data : student
      );
      
      set({ 
        students: updatedStudents,
        selectedStudent: result.data.data,
        loading: false 
      });
      return { success: true, data: result.data.data };
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
      set({ 
        students: result.data.data || [], 
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