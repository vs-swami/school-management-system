import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const ENROLLMENT_API_URL = `${API_BASE_URL}/enrollments`;

export const EnrollmentRepository = {
  getAllEnrollments: async () => {
    return await axios.get(ENROLLMENT_API_URL);
  },

  updateEnrollment: async (id, data) => {
    return await axios.put(`${ENROLLMENT_API_URL}/${id}`, data);
  },

  getEnrollmentById: async (id) => {
    return await axios.get(`${ENROLLMENT_API_URL}/${id}`);
  },

  createEnrollment: async (data) => {
    return await axios.post(ENROLLMENT_API_URL, data);
  },

  deleteEnrollment: async (id) => {
    return await axios.delete(`${ENROLLMENT_API_URL}/${id}`);
  },
};
