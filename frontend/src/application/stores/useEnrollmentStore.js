import { create } from 'zustand';
import { EnrollmentService } from '../services/EnrollmentService';

const enrollmentService = new EnrollmentService();

export const useEnrollmentStore = create((set) => ({
  enrollments: [],
  loading: false,
  error: null,

  fetchEnrollments: async () => {
    set({ loading: true, error: null });

    const result = await enrollmentService.getAllEnrollments();

    if (result.success) {
      console.log('Enrollments fetched successfully:', result.data);
      set({ enrollments: result.data || [], loading: false });
    } else {
      console.error('Error fetching enrollments:', result.error);
      set({ error: result.error, loading: false });
    }
  },

  updateEnrollmentStatus: async (id, enrollment_status) => {
    set({ loading: true, error: null });

    const result = await enrollmentService.updateEnrollmentStatus(id, enrollment_status);

    if (result.success) {
      set((state) => ({
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === id ? { ...enrollment, enrollment_status, administration: result.data.administration } : enrollment
        ),
        loading: false,
      }));
      return result;
    } else {
      set({ loading: false, error: result.error });
      return result;
    }
  },

  updateEnrollmentAdministration: async (enrollmentId, administrationData) => {
    set({ loading: true, error: null });

    const result = await enrollmentService.updateEnrollmentAdministration(enrollmentId, administrationData);

    if (result.success) {
      set((state) => ({
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === enrollmentId ? { ...enrollment, administration: result.data } : enrollment
        ),
        loading: false,
      }));
      return result.data;
    } else {
      set({ error: result.error, loading: false });
      throw new Error(result.error);
    }
  },
}));
