import { create } from 'zustand';
import { ClassService } from '../services/ClassService';

const classService = new ClassService();

export const useClassStore = create((set, get) => ({
  // State
  classes: [],
  divisions: [],
  enrollments: [],
  classMetrics: {},
  loading: false,
  error: null,
  selectedClass: null,

  // Actions
  fetchClasses: async () => {
    set({ loading: true, error: null });

    const result = await classService.getClassesWithSummary();

    if (result.success) {
      console.log('Classes fetched:', result.data);
      // Ensure data is always an array
      const classesData = Array.isArray(result.data) ? result.data : [];
      set({ classes: classesData, loading: false });
      return classesData;
    } else {
      set({ error: result.error, loading: false });
      return [];
    }
  },

  fetchDivisions: async () => {
    const result = await classService.getDivisions();

    if (result.success) {
      console.log('Divisions fetched:', result.data);
      set({ divisions: result.data || [] });
      return result.data;
    } else {
      set({ error: result.error });
      return [];
    }
  },

  fetchEnrollments: async () => {
    set({ loading: true, error: null });

    const result = await classService.getEnrollments();

    if (result.success) {
      console.log('Enrollments fetched for class metrics:', result.data);
      set({ enrollments: result.data || [], loading: false });

      // Automatically calculate metrics after fetching enrollments
      get().calculateClassMetrics();
      return result.data;
    } else {
      set({ error: result.error, loading: false });
      return [];
    }
  },

  fetchAllData: async () => {
    set({ loading: true, error: null });

    const result = await classService.getAllClassData();

    if (result.success) {
      set({
        classes: result.data.classes,
        divisions: result.data.divisions,
        enrollments: result.data.enrollments,
        loading: false
      });

      // Calculate metrics after all data is loaded
      if (result.data.classes.length > 0 || result.data.enrollments.length > 0) {
        get().calculateClassMetrics();
      }

      return result.data;
    } else {
      set({ error: result.error, loading: false });
      return result.data || { classes: [], divisions: [], enrollments: [] };
    }
  },

  calculateClassMetrics: () => {
    const { classes, enrollments, divisions } = get();
    const metrics = {};

    // Ensure data is arrays (Strapi 5 compatibility)
    const classesArray = Array.isArray(classes) ? classes : [];
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    const divisionsArray = Array.isArray(divisions) ? divisions : [];

    console.log('=== CALCULATING CLASS METRICS ===');
    console.log('Classes:', classesArray.length, 'Enrollments:', enrollmentsArray.length, 'Divisions:', divisionsArray.length);
    console.log('Raw enrollment data sample:', enrollmentsArray[0]);

    // Always initialize metrics for ALL classes from backend
    classesArray.forEach(cls => {
      const className = cls.classname || cls.name || `Class ${cls.id}`;
      metrics[className] = {
        classId: cls.id,
        classInfo: {
          name: className,
          description: cls.description || '',
          capacity: cls.capacity || null,
          academicLevel: cls.academic_level || '',
          // Fees now managed via Fee Assignments; no direct class fee fields
          // Thresholds if available
          thresholds: cls.class_thresholds || [],
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt
        },
        totalStudents: 0,
        divisions: {},
        admissionTypes: { new: 0, transfer: 0, readmission: 0 },
        modes: { online: 0, offline: 0 },
        recentAdmissions: [],
        monthlyAdmissions: {},
        enrolledStudents: [],
        isEmpty: true,
        // Potential revenue moved to fee assignments; keep placeholder
        potentialRevenue: 0
      };
    });

    // Don't create placeholder classes - only use actual classes from backend

    // Populate metrics with enrollment data
    enrollmentsArray.forEach((enrollment) => {
      // Get class from enrollment - check all possible locations
      const classStd = enrollment.class_standard ||
                      enrollment.class?.classname ||
                      enrollment.class?.name ||
                      enrollment.classname;

      if (!classStd) {
        console.warn('Enrollment missing class information:', enrollment);
        return;
      }

      // Normalize class name (handle case differences)
      const normalizedClass = classStd.toString().toLowerCase();
      const matchingMetricKey = Object.keys(metrics).find(key =>
        key.toLowerCase() === normalizedClass
      ) || classStd;

      if (!metrics[matchingMetricKey]) {
        // Skip enrollments for classes that don't exist in the system
        console.warn(`Enrollment references non-existent class: ${classStd}`);
        return;
      }

      const metric = metrics[matchingMetricKey];
      metric.totalStudents++;
      metric.isEmpty = false;

      // Get enrollment details - handle both old and new data structures
      // Check for division in enrollment directly (new structure) or in administration (old structure)
      const divisionName = enrollment.division?.name ||
                          enrollment.administration?.division?.name ||
                          'Unassigned';
      const admissionType = enrollment.admission_type ||
                           enrollment.administration?.admission_type ||
                           'unknown';
      const mode = enrollment.mode ||
                  enrollment.administration?.mode ||
                  'unknown';

      // Initialize division if not exists
      if (!metric.divisions[divisionName]) {
        metric.divisions[divisionName] = {
          count: 0,
          admissionTypes: { new: 0, transfer: 0, readmission: 0 },
          modes: { online: 0, offline: 0 },
          students: []
        };
      }

      metric.divisions[divisionName].count++;

      // Add detailed student info to division
      if (enrollment.student) {
        const studentInfo = {
          id: enrollment.student.id || enrollment.student_id,
          name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim() || 'Unknown Student',
          grNo: enrollment.gr_no,
          enrollmentId: enrollment.id,
          enrollmentStatus: enrollment.enrollment_status,
          dateEnrolled: enrollment.date_enrolled
        };

        metric.divisions[divisionName].students.push(studentInfo);

        // Also add to class-level enrolled students list
        if (!metric.enrolledStudents) {
          metric.enrolledStudents = [];
        }
        metric.enrolledStudents.push({
          ...studentInfo,
          division: divisionName,
          admissionType: admissionType,
          mode: mode
        });
      }

      // Update admission types
      if (admissionType in metric.admissionTypes) {
        metric.admissionTypes[admissionType]++;
        metric.divisions[divisionName].admissionTypes[admissionType]++;
      }

      // Update modes
      if (mode in metric.modes) {
        metric.modes[mode]++;
        metric.divisions[divisionName].modes[mode]++;
      }

      // Recent admissions (last 30 days)
      const admissionDateValue = enrollment.date_enrolled ||
                                enrollment.administration?.date_of_admission;

      if (admissionDateValue) {
        const admissionDate = new Date(admissionDateValue);
        const daysSinceAdmission = Math.floor((new Date() - admissionDate) / (1000 * 60 * 60 * 24));

        // Track monthly admissions for trends
        const monthYear = `${admissionDate.getMonth() + 1}/${admissionDate.getFullYear()}`;
        metric.monthlyAdmissions[monthYear] = (metric.monthlyAdmissions[monthYear] || 0) + 1;

        if (daysSinceAdmission <= 30) {
          metric.recentAdmissions.push({
            studentName: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim() || 'Unknown',
            grNo: enrollment.gr_no,
            division: divisionName,
            date: admissionDateValue,
            type: admissionType,
            daysSince: daysSinceAdmission
          });
        }
      }
    });

    // Sort recent admissions, calculate revenue, and finalize metrics
    Object.keys(metrics).forEach(classStd => {
      const metric = metrics[classStd];

      // Sort and limit recent admissions
      metric.recentAdmissions.sort((a, b) => new Date(b.date) - new Date(a.date));
      metric.recentAdmissions = metric.recentAdmissions.slice(0, 5);

      // Potential revenue can be computed from fee assignments; omitted here

      // Calculate average students per division
      const divisionCount = Object.keys(metric.divisions).length;
      metric.averagePerDivision = divisionCount > 0 ? Math.round(metric.totalStudents / divisionCount) : 0;
    });

    console.log('Final metrics calculated:', metrics);
    set({ classMetrics: metrics });
    return metrics;
  },

  // Selectors
  setSelectedClass: (className) => {
    set({ selectedClass: className });
  },

  getClassById: (id) => {
    const { classes } = get();
    return classes.find(c => c.id === id);
  },

  getClassMetric: (className) => {
    const { classMetrics } = get();
    return classMetrics[className];
  },

  getTotalStudents: () => {
    const { classMetrics } = get();
    return Object.values(classMetrics).reduce((sum, cls) => sum + cls.totalStudents, 0);
  },

  getTotalNewAdmissions: () => {
    const { classMetrics } = get();
    return Object.values(classMetrics).reduce((sum, cls) => sum + cls.admissionTypes.new, 0);
  },

  getActiveClasses: () => {
    const { classMetrics } = get();
    return Object.entries(classMetrics).filter(([_, metric]) => !metric.isEmpty).length;
  },

  // Actions for CRUD operations
  createClass: async (classData) => {
    set({ loading: true, error: null });

    const result = await classService.createClass(classData);

    if (result.success) {
      const { classes } = get();
      set({
        classes: [...classes, result.data],
        loading: false
      });

      // Recalculate metrics
      get().calculateClassMetrics();

      return result;
    } else {
      set({ error: result.error, loading: false });
      return result;
    }
  },

  updateClass: async (id, classData) => {
    set({ loading: true, error: null });

    const result = await classService.updateClass(id, classData);

    if (result.success) {
      const { classes } = get();
      set({
        classes: classes.map(c => c.id === id ? result.data : c),
        loading: false
      });

      // Recalculate metrics
      get().calculateClassMetrics();

      return result;
    } else {
      set({ error: result.error, loading: false });
      return result;
    }
  },

  deleteClass: async (id) => {
    set({ loading: true, error: null });

    const result = await classService.deleteClass(id);

    if (result.success) {
      const { classes } = get();
      set({
        classes: classes.filter(c => c.id !== id),
        loading: false
      });

      // Recalculate metrics
      get().calculateClassMetrics();

      return result;
    } else {
      set({ error: result.error, loading: false });
      return result;
    }
  },

  // Reset store
  reset: () => {
    set({
      classes: [],
      divisions: [],
      enrollments: [],
      classMetrics: {},
      loading: false,
      error: null,
      selectedClass: null
    });
  }
}));
