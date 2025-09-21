import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import useStudentStore from '../../application/stores/useStudentStore';
import { useAcademicYearService, useDivisionService, useClassService, useBusStopService, useLocationService } from '../../application/contexts/ServiceContext';
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
        enrollment_status: STUDENT_CONFIG.ENROLLMENT_STATUS.ENQUIRY, // Only for new students
      }],
      student_photo: null,
      guardian_photo: null,
      exam_results: [],
      documents: [],
    };
  }

  // Map from domain model properties to form field names
  const formattedData = {
    ...initialData,
    // Map firstName/lastName to form field names
    first_name: initialData.first_name,
    last_name: initialData.last_name,
    middle_name: initialData.middle_name,
    // Construct fullName if not present
    gr_full_name: initialData.fullName || initialData.gr_full_name ||
                  `${initialData.first_name} ${initialData.middle_name} ${initialData.last_name || ''}`.trim() || '',
    gender: initialData.gender,
    dob: initialData.dob ?
      new Date(initialData.dob).toISOString().split('T')[0] : '',
  };

  const rawGuardians = extractGuardianData(initialData.guardians);
  formattedData.guardians = rawGuardians

  const enrollmentToFormat = (initialData.enrollments && Array.isArray(initialData.enrollments) && initialData.enrollments.length > 0)
    ? initialData.enrollments[0] : {};

  const enrollmentData = extractEnrollmentData(enrollmentToFormat);

  console.log('📋 formatInitialData - enrollmentToFormat:', enrollmentToFormat);
  console.log('📋 formatInitialData - extractedEnrollmentData:', enrollmentData);
  console.log('📋 formatInitialData - administration from extracted:', enrollmentData?.administration);

  // CRITICAL: Never allow enrolled status to revert to enquiry
  let enrollmentStatus = enrollmentData?.enrollment_status || enrollmentToFormat?.enrollment_status || '';

  // Only default to ENQUIRY for brand new students (create mode with no existing data)
  if (!enrollmentStatus && mode === 'create') {
    enrollmentStatus = STUDENT_CONFIG.ENROLLMENT_STATUS.ENQUIRY;
  }

  formattedData.enrollments = [{
    id: enrollmentData?.id || '',
    academic_year: enrollmentData?.academic_year || '',
    class: enrollmentData?.class || '',
    gr_no: enrollmentData?.gr_no || '',
    date_enrolled: enrollmentData?.date_enrolled ?
      new Date(enrollmentData.date_enrolled).toISOString().split('T')[0] : '',
    admission_type: enrollmentData?.admission_type || '',
    enrollment_status: enrollmentStatus,
    lc_received: enrollmentData?.lc_received || false,
    administration: enrollmentData?.administration ? {
      // Handle both division as object and as ID
      division: (typeof enrollmentData.administration.division === 'object' && enrollmentData.administration.division?.id)
        ? String(enrollmentData.administration.division.id)
        : (enrollmentData.administration.division ? String(enrollmentData.administration.division) : ''),
      date_of_admission: enrollmentData.administration.date_of_admission || '',
      seat_allocations: enrollmentData.administration.seat_allocations && enrollmentData.administration.seat_allocations.length > 0 ? [{
        // Handle pickup_stop as object or ID
        pickup_stop: (typeof enrollmentData.administration.seat_allocations[0].pickup_stop === 'object' &&
                     enrollmentData.administration.seat_allocations[0].pickup_stop?.id)
          ? String(enrollmentData.administration.seat_allocations[0].pickup_stop.id)
          : (enrollmentData.administration.seat_allocations[0].pickup_stop ?
             String(enrollmentData.administration.seat_allocations[0].pickup_stop) : ''),
        bus_route: enrollmentData.administration.seat_allocations[0]?.bus_route || '',
      }] : [{ pickup_stop: '', bus_route: '' }]
    } : {
      division: '',
      date_of_admission: '',
      seat_allocations: [{ pickup_stop: '', bus_route: '' }]
    },
  }];

  console.log('📌 formatInitialData - Final enrollment administration:', formattedData.enrollments[0].administration);
  console.log('📌 formatInitialData - Pickup stop ID:', formattedData.enrollments[0].administration?.seat_allocations?.[0]?.pickup_stop);

  const rawExamResults = extractExamResultsData(initialData.examResults || initialData.exam_results);
  formattedData.exam_results = rawExamResults.length > 0 ? rawExamResults : [];

  formattedData.documents = initialData.documents && Array.isArray(initialData.documents) ?
    initialData.documents.map(doc => ({
      id: doc.id,
      document_type: doc.documentType || doc.document_type || '',
      description: doc.description || '',
      file: null,
      url: doc.url || doc.fileName || null,
    })) : [];
  console.log('Formatted initial form data:', formattedData);
  return formattedData;
};

/**
 * Custom hook for managing student form state and operations
 * Handles form data, validation, submission, and step navigation
 *
 * @param {string} mode - Form mode ('create' or 'edit')
 * @returns {object} - Form methods, state, and handlers
 */
export const useStudentForm = (mode = 'create') => {
  const { createStudent, updateStudent, loading, setLoading, fetchStudentById, selectedStudent } = useStudentStore();
  const academicYearService = useAcademicYearService();
  const divisionService = useDivisionService();
  const classService = useClassService();
  const busStopService = useBusStopService();
  const locationService = useLocationService();
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
        const [yearsResult, , classesResult] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          divisionService.getAllDivisions(),
          classService.getAllClasses()
        ]);
        // Ensure arrays for Strapi 5
        setAcademicYears(yearsResult.success ? yearsResult.data : []);
        setClasses(classesResult.success ? classesResult.data : []);
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
          const result = await locationService.getAllLocations();
          setLocations(result.success ? result.data : []);
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
      // Only clear the pickup stop if it's not already set (for new selections)
      // Don't clear when loading existing data
      const currentPickupStop = getValues('enrollments.0.administration.seat_allocations.0.pickup_stop');
      if (currentStep === STEPS.ADMINISTRATION && !currentPickupStop) {
        setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', '');
      }
      const fetchStops = async () => {
        try {
          const stopsResult = await busStopService.getAllBusStops();
          const filtered = stopsResult.success ?
            stopsResult.data.filter(stop => stop.location?.id === selectedPickupLocationId || stop.location === selectedPickupLocationId) : [];
          setBusStops(filtered);
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
            const divResult = await divisionService.getDivisionsByClass(classId);
            setDivisions(divResult.success ? divResult.data : []);
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
          const divResult = await divisionService.getDivisionsByClass(classId);
          setDivisions(divResult.success ? divResult.data : []);
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
            console.log('useStudentForm - Fetched student data for form population:', studentData);
            if (studentData) {
              const formattedData = formatInitialData(studentData, mode);
              reset(formattedData);

              // Extract and set the pickup location if it exists
              const administration = studentData.enrollments?.[0]?.administration;
              // Handle both camelCase (domain model) and snake_case (API) properties
              const seatAllocations = administration?.seatAllocations || administration?.seat_allocations;
              const firstAllocation = seatAllocations?.[0];
              const pickupStop = firstAllocation?.pickupStop || firstAllocation?.pickup_stop;

              if (pickupStop) {
                // Handle pickup_stop as either object or ID
                if (typeof pickupStop === 'object' && pickupStop.location) {
                  const locationId = typeof pickupStop.location === 'object' ?
                    pickupStop.location.id : pickupStop.location;
                  if (locationId) {
                    console.log('🎯 Setting pickup location from saved data:', locationId);
                    setSelectedPickupLocationId(String(locationId));
                  }
                }
              }

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

    if (!isValid) {
      setApiError(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    // Save student information when moving from first step
    if (currentStep === STEPS.COMBINED_INFO) {
      setApiError('');
      setIsSuccess(false);
      setLoading(true);

      try {
        const formData = getValues();
        console.log('Current form data:', formData);  

        // Prepare the student data for creation/update
        // Fix: Ensure enrollments is always an array
        const enrollmentData = Array.isArray(formData.enrollments)
          ? formData.enrollments[0]
          : formData.enrollments;

        const studentData = {
          ...formData,
          // Ensure enrollment status is set and enrollments is always an array
          enrollments: enrollmentData ? [{
            ...enrollmentData,
            enrollment_status: enrollmentData.enrollment_status || STUDENT_CONFIG.ENROLLMENT_STATUS.ENQUIRY
          }] : []
        };

        let result;
        if (localStudentId) {
          // Update existing student
          result = await updateStudent(localStudentId, studentData);
        } else {
          // Create new student
          result = await createStudent(studentData);
        }

        if (result.success) {
          setIsSuccess(true);

          // Save the student ID for subsequent steps
          // Strapi 5: Direct id access from result
          if (!localStudentId && result.data?.id) {
            setLocalStudentId(result.data.id);
            // Also update the form with the new student ID
            setValue('id', result.data.id);
          }

          // Proceed to next step after a brief success indication
          setTimeout(() => {
            setIsSuccess(false);
            setCurrentStep(prev => prev + 1);
            setLoading(false);
          }, 500);
        } else {
          // Handle error object properly
          const errorMessage = typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Failed to save student information';
          setApiError(errorMessage);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error saving student:', error);
        const errorMessage = error?.message || 'An error occurred while saving student information';
        setApiError(errorMessage);
        setLoading(false);
      }
    } else {
      // For other steps, just move forward
      if (currentStep < Object.keys(STEPS).length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Only called from Summary step to finalize the student creation/update
    setApiError('');
    setIsSuccess(false);
    setLoading(true);

    const isValid = await trigger();
    if (!isValid) {
      setLoading(false);
      setApiError(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    try {
      const allFormData = getValues();

      // Since student is already created in first step, always update here
      if (!localStudentId) {
        setApiError('Student ID not found. Please go back and save student information first.');
        setLoading(false);
        return;
      }

      const result = await updateStudent(localStudentId, allFormData);

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          // Could redirect to student list or reset form here
          // For now, just showing success message
        }, 2000);
      } else {
        // Handle error object properly
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'An error occurred';
        setApiError(errorMessage);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setApiError('');
    setIsSuccess(false);
    setSkipDocuments(false);
    setLocalStudentId(null);
    setCurrentStep(STEPS.COMBINED_INFO);
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
