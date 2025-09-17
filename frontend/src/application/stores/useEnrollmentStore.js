import { create } from 'zustand';
import { EnrollmentRepository } from '../../data/repositories/EnrollmentRepository';

export const useEnrollmentStore = create((set) => ({
  enrollments: [],
  loading: false,
  error: null,

  fetchEnrollments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await EnrollmentRepository.getAllEnrollments();
      set({ enrollments: response || [], loading: false });
    } catch (error) {
      set({ error: error, loading: false });
    }
  },

  updateEnrollmentStatus: async (id, enrollment_status) => {
    set({ loading: true, error: null });
    try {
      const response = await EnrollmentRepository.updateEnrollment(id, { enrollment_status });
      set((state) => ({
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === id ? { ...enrollment, enrollment_status: response.enrollment_status, administration: response.administration } : enrollment
        ),
        loading: false,
      }));
      return { success: true, data: response };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  updateEnrollmentAdministration: async (enrollmentId, administrationData) => {
    set({ loading: true, error: null });
    try {
      const response = await EnrollmentRepository.updateEnrollmentAdministration(enrollmentId, administrationData);
      set((state) => ({
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === enrollmentId ? { ...enrollment, administration: response } : enrollment
        ),
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error, loading: false });
      throw error;
    }
  },
}));
