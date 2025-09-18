import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import useStudentStore from '../../application/stores/useStudentStore';
import { AcademicYearRepository } from '../../data/repositories/AcademicYearRepository';
import { DivisionRepository } from '../../data/repositories/DivisionRepository';
import { ClassRepository } from '../../data/repositories/ClassRepository';
import { BusStopRepository } from '../../data/repositories/BusStopRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { extractGuardianData, extractEnrollmentData, extractExamResultsData } from '../../application/utils/studentFormUtils';
import { STUDENT_CONFIG, ERROR_MESSAGES } from '../../shared/constants/app';

// Use constants from shared config
const STEPS = STUDENT_CONFIG.STEPS;

/**
 * Formats initial data for the student form based on mode (create/edit)
 * @param {object|null} initialData - Existing student data for edit mode
 * @param {string} mode - Form mode ('create' or 'edit')
 * @returns {object} - Formatted form data structure
 */
const formatInitialData = (initialData, mode) => {
  if (mode === 'create' || !initialData) {
    return {
      gr_full_name: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: '',
      dob: '',
      guardians: [],
      enrollments: [{
        academic_year: '',
        class: '',
        gr_no: '',
        date_enrolled: '',
        admission_type: '',
        enrollment_status: STUDENT_CONFIG.ENROLLMENT_STATUS.ENQUIRY,
        administration: {
          division: '',
          seat_allocations: [{
            pickup_stop: '',
            drop_stop: '',
          }]
        },
      }],
      student_photo: null,
      guardian_photo: null,
      exam_results: [],
      documents: [],
    };
  }

  const formattedData = {
    ...initialData,
    dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
  };

  const rawGuardians = extractGuardianData(initialData.guardians);
  formattedData.guardians = rawGuardians.length > 0 ? rawGuardians : [{
    full_name: '',
    relation: '',
    mobile: '',
    occupation: '',
    primary_contact: false,
  }];

  const enrollmentToFormat = (initialData.enrollments && Array.isArray(initialData.enrollments) && initialData.enrollments.length > 0)
    ? initialData.enrollments[0] : {};

  const enrollmentData = extractEnrollmentData(enrollmentToFormat);

  formattedData.enrollments = [{
    id: enrollmentData?.id || '',
    academic_year: enrollmentData?.academic_year || '',
    class: enrollmentData?.class || '',
    gr_no: enrollmentData?.gr_no || '',
    date_enrolled: enrollmentData?.date_enrolled ?
      new Date(enrollmentData.date_enrolled).toISOString().split('T')[0] : '',
    admission_type: enrollmentData?.admission_type || '',
    enrollment_status: enrollmentData?.enrollment_status || STUDENT_CONFIG.ENROLLMENT_STATUS.ENQUIRY,
    lc_received: enrollmentData?.lc_received || false,
    administration: {
      division: enrollmentData?.administration?.division || '',
      seat_allocations: [{
        pickup_stop: enrollmentData?.administration?.seat_allocations?.[0]?.pickup_stop || '',
        drop_stop: enrollmentData?.administration?.seat_allocations?.[0]?.drop_stop || '',
      }]
    },
  }];

  const rawExamResults = extractExamResultsData(initialData.exam_results);
  formattedData.exam_results = rawExamResults.length > 0 ? rawExamResults : [];

  formattedData.documents = initialData.documents && Array.isArray(initialData.documents) ?
    initialData.documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type || '',
      description: doc.description || '',
      file: null,
      url: doc.url || null,
    })) : [];

  return formattedData;
};

/**
 * Custom hook for managing student form state and operations
 * Handles form data, validation, submission, and step navigation
 *
 * @param {string} mode - Form mode ('create' or 'edit')
 * @param {object|null} initialData - Initial student data for edit mode
 * @returns {object} - Form methods, state, and handlers
 */
export const useStudentForm = (mode = 'create', initialData = null) => {
  const { createStudent, updateStudent, loading, setLoading, fetchStudentById, selectedStudent } = useStudentStore();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.COMBINED_INFO);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [skipDocuments, setSkipDocuments] = useState(false);
  const [isStudentRejected, setIsStudentRejected] = useState(false);
  const [busStops, setBusStops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedPickupLocationId, setSelectedPickupLocationId] = useState('');
  const { id } = useParams();
  const [localStudentId, setLocalStudentId] = useState(id);

  const formMethods = useForm({
    defaultValues: formatInitialData(null, 'create'),
  });

  const { reset, trigger, getValues, setValue, watch } = formMethods;

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [years, , classesData] = await Promise.all([
          AcademicYearRepository.findAll(),
          DivisionRepository.findAll(),
          ClassRepository.findAll()
        ]);
        setAcademicYears(years);
        setClasses(classesData);
      } catch (err) {
        setApiError(ERROR_MESSAGES.SERVER_ERROR);
      }
    };
    fetchData();
  }, []);

  // Load locations when on administration step
  useEffect(() => {
    if (currentStep === STEPS.ADMINISTRATION && !isStudentRejected) {
      const fetchLocations = async () => {
        try {
          const list = await LocationRepository.findAll();
          setLocations(list || []);
        } catch (e) {
          console.error('Error loading locations:', e);
          setLocations([]);
        }
      };
      fetchLocations();
    }
  }, [currentStep, isStudentRejected]);

  // Load bus stops for selected pickup location; clear selected stop when location changes
  useEffect(() => {
    if ((currentStep === STEPS.ADMINISTRATION || currentStep === STEPS.SUMMARY) && selectedPickupLocationId) {
      // Clear any previously selected stop when location changes (only on administration step)
      if (currentStep === STEPS.ADMINISTRATION) {
        setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', '');
      }
      const fetchStops = async () => {
        try {
          const list = await BusStopRepository.findByLocation(selectedPickupLocationId);
          setBusStops(list || []);
        } catch (e) {
          console.error('Error loading bus stops for location:', e);
          setBusStops([]);
        }
      };
      fetchStops();
    } else if (currentStep === STEPS.ADMINISTRATION && !selectedPickupLocationId) {
      setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', '');
      setBusStops([]);
    }
  }, [currentStep, selectedPickupLocationId]);

  // Load divisions when class is selected
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'enrollments.0.class' && value.enrollments?.[0]?.class) {
        const classId = value.enrollments[0].class;
        const fetchDivisions = async () => {
          try {
            const divisionsData = await DivisionRepository.findByClass(classId);
            setDivisions(divisionsData || []);
          } catch (error) {
            console.error('Error fetching divisions:', error);
            setDivisions([]);
          }
        };
        fetchDivisions();
      } else if (name === 'enrollments.0.class' && !value.enrollments?.[0]?.class) {
        // Clear divisions when class is cleared
        setDivisions([]);
        setValue('enrollments.0.administration.division', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Load divisions for existing students when form is populated
  useEffect(() => {
    const currentValues = getValues();
    const classId = currentValues.enrollments?.[0]?.class;

    if (classId && mode === 'edit' && academicYears.length > 0 && classes.length > 0) {
      const fetchDivisions = async () => {
        try {
          console.log('Loading divisions for existing student, classId:', classId);
          const divisionsData = await DivisionRepository.findByClass(classId);
          console.log('Divisions loaded:', divisionsData);
          setDivisions(divisionsData || []);
        } catch (error) {
          console.error('Error fetching divisions for existing student:', error);
          setDivisions([]);
        }
      };
      fetchDivisions();
    }
  }, [mode, getValues, academicYears.length, classes.length]);

  // Populate form data
  useEffect(() => {
    if ((mode === 'edit' && id) || mode === 'create') {
      if (academicYears.length > 0 && classes.length > 0) {
        const populateForm = async () => {
          if (mode === 'edit' && id) {
            const studentData = await fetchStudentById(id);
            if (studentData) {
              const formattedData = formatInitialData(studentData, mode);
              reset(formattedData);

              if (studentData.enrollments?.[0]?.enrollment_status === 'Rejected') {
                setIsStudentRejected(true);
                setCurrentStep(STEPS.ADMINISTRATION);
              } else {
                setIsStudentRejected(false);
                setCurrentStep(STEPS.COMBINED_INFO);
              }
            }
          } else {
            reset(formatInitialData(null, 'create'));
            setIsStudentRejected(false);
            setCurrentStep(STEPS.COMBINED_INFO);
          }
        };
        populateForm();
      }
    }
  }, [mode, id, fetchStudentById, reset, academicYears.length, classes.length]);

  const handleNextStep = async () => {
    const isValid = (currentStep === STEPS.DOCUMENTS && skipDocuments) ? true : await trigger();

    if (isValid && currentStep < Object.keys(STEPS).length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (!isValid) {
      setApiError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setApiError('');
    setIsSuccess(false);
    setLoading(true);

    const isValid = (currentStep === STEPS.DOCUMENTS && skipDocuments) ? true : await trigger();
    if (!isValid) {
      setLoading(false);
      setApiError(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    try {
      const allFormData = getValues();
      const result = localStudentId ?
        await updateStudent(localStudentId, allFormData) :
        await createStudent(allFormData);

      if (result.success) {
        setIsSuccess(true);
        if (mode === 'create' && result.data?.id) {
          setLocalStudentId(result.data.id);
        }
        setTimeout(() => {
          setIsSuccess(false);
          handleNextStep();
        }, 1000);
      } else {
        setApiError(result.error || 'An error occurred');
      }
    } catch (error) {
      setApiError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setApiError('');
    setIsSuccess(false);
    setSkipDocuments(false);
    reset(formatInitialData(null, 'create'));
  };

  return {
    // Form methods
    ...formMethods,

    // State
    currentStep,
    setCurrentStep,
    academicYears,
    classes,
    divisions,
    skipDocuments,
    setSkipDocuments,
    apiError,
    setApiError,
    isSuccess,
    setIsSuccess,
    loading,
    localStudentId,
    setLocalStudentId,
    selectedStudent,
    isStudentRejected,
    setIsStudentRejected,
    busStops,
    locations,
    selectedPickupLocationId,
    setSelectedPickupLocationId,

    // Handlers
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    resetForm,

    // Constants
    STEPS,
    TOTAL_STEPS: Object.keys(STEPS).length,
    setCurrentStep,
  };
};
