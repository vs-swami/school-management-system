import { create } from 'zustand';
import { StudentService } from '../services/StudentServices';
import { ExamResultService } from '../services/ExamResultService';
import { ClassService } from '../services/ClassService';
import { EnrollmentService } from '../services/EnrollmentService';

const studentService = new StudentService();
const examResultService = new ExamResultService();
const classService = new ClassService();
const enrollmentService = new EnrollmentService();

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

  // Helper function to extract data correctly for Strapi 5
  extractData: (result) => {
    // Handle different response formats
    if (result.data) {
      // Strapi 5: Check for nested data structure { data: [...], meta: {} }
      if (result.data.data && Array.isArray(result.data.data)) {
        return result.data.data;
      }
      // Direct data array
      if (Array.isArray(result.data)) {
        return result.data;
      }
      // If data is an object with data property
      if (result.data && typeof result.data === 'object' && result.data.data) {
        return result.data.data;
      }
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
      // The StudentService already returns the data in the correct format
      const students = result.data;
      console.log('useStudentStore.fetchStudents - Setting students:', students);

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
      const student = result.data;
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
    console.log('Creating student with data:', submissionData); 
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
      // Ensure error is a string
      const errorMessage = typeof result.error === 'string'
        ? result.error
        : result.error?.message || JSON.stringify(result.error);

      set({
        error: errorMessage,
        loading: false
      });
      return { success: false, error: errorMessage, details: result.details };
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
      // Ensure error is a string
      const errorMessage = typeof result.error === 'string'
        ? result.error
        : result.error?.message || JSON.stringify(result.error);

      set({
        error: errorMessage,
        loading: false
      });
      return { success: false, error: errorMessage, details: result.details };
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
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
      const result = await examResultService.bulkCreateOrUpdateExamResults(studentId, examResultsData);
      if (result.success) {
        // No longer refetch entire student, as this store action focuses only on exam results
        // get().fetchStudentById(studentId);
        set({ loading: false });
        return { success: true, data: result.data };
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || JSON.stringify(result.error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
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
      // Fetch class data to get student_limit
      const classResult = await classService.getClassById(classId);

      if (!classResult.success) {
        set({ loading: false, error: classResult.error });
        return { success: false, error: classResult.error };
      }

      const classData = classResult.data;
      const studentLimit = classData?.student_limit || 0;

      // Get current enrollment count for the class
      const enrollmentResult = await enrollmentService.getEnrollmentsByClass(classId, divisionId);

      if (!enrollmentResult.success) {
        set({ loading: false, error: enrollmentResult.error });
        return { success: false, error: enrollmentResult.error };
      }

      const currentEnrollments = enrollmentResult.data?.length || 0;
      const availableCapacity = studentLimit - currentEnrollments;

      set({ loading: false });

      return {
        success: true,
        data: {
          studentLimit,
          currentEnrollments,
          availableCapacity,
          isFull: availableCapacity <= 0,
          class: classData, // Include the full class data
          summary: {
            totalCapacity: studentLimit,
            totalEnrolled: currentEnrollments,
            overallUtilization: studentLimit > 0 ? Math.round((currentEnrollments / studentLimit) * 100) : 0
          },
          divisions: classData?.divisions || [] // Use divisions from the class data
        }
      };
    } catch (error) {
      console.error('Error fetching class capacity:', error);
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
}));