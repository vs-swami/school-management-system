import { create } from 'zustand';
import { StudentService } from '../services/StudentServices';
import { ExamResultService } from '../services/ExamResultService';
import { ClassThresholdService } from '../services/ClassThresholdService';

const studentService = new StudentService();
const examResultService = new ExamResultService();

export default create((set, get) => ({
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
      set({
        selectedStudent: student,
        loading: false
      });
      return student; // Add this line to return the student object
    } else {
      set({
        error: result.error,
        loading: false
      });
    }
  },

  createStudent: async (submissionData) => {
    set({ loading: true, error: null });
    
    const result = await studentService.createStudent(submissionData);
    
    if (result.success) {
      const newStudent = get().extractData(result);
      
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

  updateStudent: async (id, submissionData) => {
    set({ loading: true, error: null });
    
    const result = await studentService.updateStudent(id, submissionData);
    
    if (result.success) {
      const updatedStudent = get().extractData(result);
      
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

  uploadStudentDocument: async (studentId, documentType, file, description = null) => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.uploadStudentDocument(studentId, documentType, file, description);
      if (result.success) {
        get().fetchStudentById(studentId); // Refresh student data to include new document
        set({ loading: false });
        return { success: true, data: result.data };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store uploading student document:', error);
      set({ loading: false, error: 'An unexpected error occurred.' });
      return { success: false, error: 'An unexpected error occurred.' };
    }
  },

  updateStudentDocument: async (documentId, studentId, documentType, file, description = null) => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.updateStudentDocument(documentId, studentId, documentType, file, description);
      if (result.success) {
        get().fetchStudentById(studentId); // Refresh student data to include updated document
        set({ loading: false });
        return { success: true, data: result.data };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store updating student document:', error);
      set({ loading: false, error: 'An unexpected error occurred.' });
      return { success: false, error: 'An unexpected error occurred.' };
    }
  },

  deleteStudentDocument: async (documentId, studentId) => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.deleteStudentDocument(documentId);
      if (result.success) {
        get().fetchStudentById(studentId); // Refresh student data to reflect document deletion
        set({ loading: false });
        return { success: true };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store deleting student document:', error);
      set({ loading: false, error: 'An unexpected error occurred.' });
      return { success: false, error: 'An unexpected error occurred.' };
    }
  },

  approveNextStage: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const result = await examResultService.approveStudentForNextStage(studentId);
      if (result.success) {
        // Optionally update the selected student or refetch it to reflect changes
        get().fetchStudentById(studentId); 
        set({ loading: false });
        return { success: true, data: result.data };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store approving next stage:', error);
      set({ loading: false, error: 'An unexpected error occurred.' });
      return { success: false, error: 'An unexpected error occurred.' };
    }
  },

  // NEW: Action to fetch only exam results for a student
  fetchExamResultsForStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const result = await examResultService.getStudentExamResults(studentId);
      if (result.success) {
        set({ loading: false });
        // It's important to extract the data in the same way as other fetches
        const examResults = get().extractData(result);
        return { success: true, data: examResults };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store fetching student exam results:', error);
      set({ loading: false, error: 'An unexpected error occurred while fetching exam results.' });
      return { success: false, error: 'An unexpected error occurred while fetching exam results.' };
    }
  },

  // NEW: Action to save exam results independently
  saveExamResults: async (studentId, examResultsData) => {
    set({ loading: true, error: null });
    try {
      const result = await examResultService.createOrUpdateExamResults(studentId, examResultsData);
      if (result.success) {
        // No longer refetch entire student, as this store action focuses only on exam results
        // get().fetchStudentById(studentId); 
        set({ loading: false });
        return { success: true, data: result.data };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in store saving exam results:', error);
      set({ loading: false, error: 'An unexpected error occurred.' });
      return { success: false, error: 'An unexpected error occurred.' };
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

  // NEW: Action to reject a student
  rejectStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const { rejectStudent, selectedStudent, setLoading } = get();

      if (!selectedStudent || !selectedStudent.enrollments || selectedStudent.enrollments.length === 0) {
        throw new Error('Student enrollment data not found.');
      }
      const enrollmentToUpdate = { ...selectedStudent.enrollments[0], enrollment_status: 'Rejected' };

      setLoading(true);
      const result = await rejectStudent(selectedStudent.id, enrollmentToUpdate);
      setLoading(false);

      if (result.success) {
        set((state) => ({ 
          selectedStudent: { 
            ...state.selectedStudent, 
            enrollments: [
              { 
                ...state.selectedStudent.enrollments[0],
                enrollment_status: 'Rejected' // Update the status in the store
              }
            ]
          }
        }));
      }

      return result;
    } catch (error) {
      console.error('Error in store rejecting student:', error);
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchClassCapacity: async (classId, divisionId = null) => {
    set({ loading: true, error: null });
    try {
      const classThresholdService = new ClassThresholdService();
      const result = await classThresholdService.getAvailableCapacity(classId, divisionId);
      set({ loading: false });
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error fetching class capacity:', error);
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
}));