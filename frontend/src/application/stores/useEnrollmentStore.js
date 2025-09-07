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

  updateEnrollmentStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const response = await EnrollmentRepository.updateEnrollment(id, { status });
      set((state) => ({
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === id ? { ...enrollment, status: response.status } : enrollment
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error, loading: false });
    }
  },
}));
