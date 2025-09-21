import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useStudentStore from '../../../application/stores/useStudentStore';

// Custom hooks
import { useStudentForm } from '../../hooks/useStudentForm';
import { useRouteManagement } from '../../hooks/useRouteManagement';
import { useExamResultsHandlers } from '../../hooks/useExamResultsHandlers';

// Components
import Alert from '../../components/students/Alert';
import StepTimeline from '../../components/students/StepTimeline';
import GuardianSection from '../../components/students/GuardianSection';
import StudentInfoStep from '../../components/students/steps/StudentInfoStep';
import DocumentsStep from '../../components/students/steps/DocumentsStep';
import ExamResultsStep from '../../components/students/steps/ExamResultsStep';
import AdministrationStep from '../../components/students/steps/AdministrationStep';
import SummaryStep from '../../components/students/steps/SummaryStep';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Constants
import { STUDENT_CONFIG } from '../../../shared/constants/app';





const StudentPage = ({ mode = 'create' }) => {
  const { fetchClassCapacity, selectedStudent } = useStudentStore();

  // Custom hooks
  const {
    register,
    control,
    formState: { errors },
    watch,
    getValues,
    setValue,
    currentStep,
    setCurrentStep,
    academicYears,
    classes,
    divisions,
    skipDocuments,
    setSkipDocuments,
    apiError,
    isSuccess,
    loading,
    localStudentId,
    setLocalStudentId,
    isStudentRejected,
    setIsStudentRejected,
    busStops,
    locations,
    selectedPickupLocationId,
    setSelectedPickupLocationId,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    resetForm,
    STEPS,
    TOTAL_STEPS,
  } = useStudentForm(mode);

  const {
    pickupStopRoutes,
    classCapacityData,
    setClassCapacityData,
    fetchPickupRoutes,
    fetchRoutesByLocation,
  } = useRouteManagement(currentStep, STEPS);

  const examResultHandlers = useExamResultsHandlers(
    localStudentId,
    setValue,
    setCurrentStep,
    setIsStudentRejected,
    (success) => {
      if (success) {
        // Handle success state if needed
      }
    },
    STEPS
  );

  const watchedExamResults = watch('exam_results', []);
  const pickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');

  // Step validation and completion tracking
  const getCompletedSteps = () => {
    const completed = [];
    const formData = getValues();

    // Step 0: Student Info - Check required fields
    if (formData.first_name && formData.last_name && formData.dob && formData.gender &&
        formData.guardians?.[0]?.full_name && formData.guardians?.[0]?.relation &&
        formData.guardians?.[0]?.mobile) {
      completed.push(0);
    }

    // Step 1: Documents - Always complete if skipped, otherwise check for uploaded documents
    if (skipDocuments || (formData.documents && formData.documents.length > 0)) {
      completed.push(1);
    }

    // Step 2: Exam Results - Complete if has exam results or if it's not required
    if (formData.exam_results && formData.exam_results.length > 0) {
      completed.push(2);
    }

    // Step 3: Administration - Check if division and pickup stop are selected
    const administration = formData.enrollments?.[0]?.administration;
    if (administration) {
      // Handle both object and ID formats for division and pickup_stop
      const hasDivision = administration.division &&
        (typeof administration.division === 'object' ? administration.division.id : administration.division);

      const hasPickupStop = administration.seat_allocations?.[0]?.pickup_stop &&
        (typeof administration.seat_allocations[0].pickup_stop === 'object' ?
          administration.seat_allocations[0].pickup_stop.id :
          administration.seat_allocations[0].pickup_stop);

      if (hasDivision && hasPickupStop) {
        completed.push(3);
      }
    }

    // Step 4: Summary - Always completed if reached (it's just a review step)
    if (currentStep >= 4) {
      completed.push(4);
    }

    return completed;
  };

  const getStepErrors = () => {
    const stepErrors = {};

    // Check for errors in each step based on form errors
    Object.keys(errors).forEach(field => {
      if (field.includes('first_name') || field.includes('last_name') ||
          field.includes('dob') || field.includes('gender') ||
          field.includes('guardians')) {
        stepErrors[0] = true;
      }
      if (field.includes('documents')) {
        stepErrors[1] = true;
      }
      if (field.includes('exam_results')) {
        stepErrors[2] = true;
      }
      if (field.includes('administration') || field.includes('division') ||
          field.includes('seat_allocations')) {
        stepErrors[3] = true;
      }
    });

    return stepErrors;
  };

  const completedSteps = getCompletedSteps();
  const stepErrors = getStepErrors();

  // Enhanced step navigation with validation
  const handleStepNavigation = (targetStep) => {
    // Allow navigation to previous steps or completed steps
    if (targetStep <= currentStep || completedSteps.includes(targetStep)) {
      setCurrentStep(targetStep);
    } else {
      // For forward navigation, check if previous steps are completed
      let canNavigate = true;
      for (let i = 0; i < targetStep; i++) {
        if (i === 1 && skipDocuments) continue; // Skip document validation if skipped
        if (!completedSteps.includes(i) && i < currentStep) {
          canNavigate = false;
          break;
        }
      }
      if (canNavigate) {
        setCurrentStep(targetStep);
      }
    }
  };


  // Effect to fetch class capacity data when navigating to the Administration step
  useEffect(() => {
    if (currentStep === STEPS.ADMINISTRATION && localStudentId && selectedStudent) {
      const fetchAndSetClassCapacity = async () => {
        // Handle class as either object with id or direct ID
        const enrollment = selectedStudent.enrollments?.[0];
        const classId = enrollment?.class?.id || enrollment?.class;

        if (classId) {
          const result = await fetchClassCapacity(classId);
          if (result.success) {
            // Find class name from the classes array if not in the result
            let className = result.data.class?.classname || result.data.class?.className;
            if (!className && classes && classes.length > 0) {
              const classObj = classes.find(c => String(c.id) === String(classId));
              className = classObj?.classname || classObj?.className;
            }

            // Also fetch the actual class data if we need more details
            setClassCapacityData({
              ...result.data,
              classId: classId,
              className: className
            });
          }
        }
      };
      fetchAndSetClassCapacity();
    }
  }, [currentStep, localStudentId, selectedStudent, fetchClassCapacity, setClassCapacityData, classes]);

  // Effect for pickup stop routes
  useEffect(() => {
    if (pickupStopId && currentStep === STEPS.ADMINISTRATION) {
      fetchPickupRoutes(pickupStopId).catch(() => {});
    }
  }, [pickupStopId, fetchPickupRoutes, currentStep, STEPS.ADMINISTRATION]);

  // Effect for location-based routes ONLY when no pickup stop is selected
  useEffect(() => {
    if (!pickupStopId && selectedPickupLocationId && currentStep === STEPS.ADMINISTRATION) {
      fetchRoutesByLocation(selectedPickupLocationId).catch(() => {});
    }
  }, [pickupStopId, selectedPickupLocationId, fetchRoutesByLocation, currentStep, STEPS.ADMINISTRATION]);

  // Enrollment handlers
  const handleEnrollStudent = async ({ divisionId, pickupStopId }) => {
    console.log('🎯 STARTING ENROLLMENT PROCESS');
    console.log('📝 Enrollment data:', { divisionId, pickupStopId });

    try {
      // Get current form values to see what we're working with
      const currentFormData = getValues();
      console.log('📋 Current form data before enrollment:', {
        studentId: localStudentId,
        currentEnrollment: currentFormData.enrollments?.[0],
        enrollmentStatus: currentFormData.enrollments?.[0]?.enrollment_status
      });

      // Update enrollment status
      setValue('enrollments.0.enrollment_status', 'Enrolled');
      console.log('✅ Set enrollment status to: Enrolled');

      // Update administration data
      setValue('enrollments.0.administration.division', divisionId);
      console.log('✅ Set division to:', divisionId);

      const admissionDate = new Date().toISOString().split('T')[0];
      setValue('enrollments.0.administration.date_of_admission', admissionDate);
      console.log('✅ Set admission date to:', admissionDate);

      // Update seat allocation data
      setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', pickupStopId);
      console.log('✅ Set pickup stop to:', pickupStopId);

      // Get updated form data
      const updatedFormData = getValues();
      console.log('📋 Updated form data before submission:', {
        enrollments: updatedFormData.enrollments,
        administration: updatedFormData.enrollments?.[0]?.administration
      });

      // Log the full enrollment object to debug
      console.log('📊 Full enrollment data to be sent:', JSON.stringify(updatedFormData.enrollments?.[0], null, 2));

      console.log('🚀 SUBMITTING ENROLLMENT...');

      // Submit the form
      await handleSubmit();

      console.log('🎉 ENROLLMENT SUBMISSION COMPLETED');
    } catch (error) {
      console.error('❌ ERROR during enrollment:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        data: error.response?.data
      });
    }
  };

  const handleUpdateToWaiting = async () => {
    try {
      // Update enrollment status to waiting
      setValue('enrollments.0.enrollment_status', 'Waiting');

      // Submit the form
      await handleSubmit();
    } catch (error) {
      console.error('Error updating status to waiting:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.COMBINED_INFO:
        return (
          <>
            <StudentInfoStep
              register={register}
              errors={errors}
              academicYears={academicYears}
              classes={classes}
              getValues={getValues}
              setValue={setValue}
            />
            <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
              <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Guardian Details</h4>
              <GuardianSection control={control} register={register} errors={errors} />
            </section>
          </>
        );
      case STEPS.DOCUMENTS:
        return (
          <DocumentsStep
            skipDocuments={skipDocuments}
            onSkipToggle={setSkipDocuments}
            studentId={localStudentId}
            documents={watch('documents', [])}
            setValue={setValue}
            watch={watch}
            getValues={getValues}
          />
        );
      case STEPS.EXAM_RESULTS:
        return (
          <ExamResultsStep
            watchedExamResults={watchedExamResults}
            localStudentId={localStudentId}
            academicYears={academicYears}
            classes={classes}
            control={control}
            register={register}
            errors={errors}
            {...examResultHandlers}
          />
        );
      case STEPS.ADMINISTRATION:
        return (
          <AdministrationStep
            isStudentRejected={isStudentRejected}
            classCapacityData={classCapacityData}
            busStops={busStops}
            locations={locations}
            selectedPickupLocationId={selectedPickupLocationId}
            onPickupLocationChange={setSelectedPickupLocationId}
            divisions={divisions}
            pickupStopRoutes={pickupStopRoutes || []}
            pickupStopId={pickupStopId}
            selectedStudent={selectedStudent}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onEnrollStudent={handleEnrollStudent}
            onUpdateToWaiting={handleUpdateToWaiting}
            loading={loading}
          />
        );
      case STEPS.SUMMARY:
        return (
          <SummaryStep
            formData={watch()}
            onEditStep={handleStepNavigation}
            skipDocuments={skipDocuments}
            busStops={busStops}
            locations={locations}
            classes={classes}
            divisions={divisions}
            academicYears={academicYears}
            classCapacityData={classCapacityData}
            pickupStopRoutes={pickupStopRoutes || []}
            selectedStudent={selectedStudent}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    // Show loading state when saving from first step
    if (currentStep === STEPS.COMBINED_INFO) {
      if (loading) return localStudentId ? 'Updating...' : 'Saving...';
      if (isSuccess) return 'Saved!';
      return 'Save & Continue';
    }

    if (currentStep < TOTAL_STEPS - 1) {
      if (currentStep === STEPS.ADMINISTRATION) return 'Review Summary';
      return 'Next';
    }

    if (currentStep === STEPS.SUMMARY) {
      if (loading) return mode === 'edit' ? 'Updating...' : 'Creating...';
      if (isSuccess) return mode === 'edit' ? 'Updated!' : 'Created!';
      return mode === 'edit' ? 'Update Student' : 'Create Student';
    }

    if (currentStep === STEPS.EXAM_RESULTS) return 'Continue to Administration';
    return 'Next';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <StepTimeline
            currentStep={currentStep}
            stepNames={STUDENT_CONFIG.STEP_NAMES}
            skipDocuments={skipDocuments}
            onStepClick={handleStepNavigation}
            allowNavigation={true}
            completedSteps={completedSteps}
            hasErrors={stepErrors}
          />
        </div>

        <form className="space-y-6 p-6">
          {isSuccess && <Alert type="success" message="Operation completed successfully!" />}
          {apiError && <Alert type="error" message={apiError} />}

          <ErrorBoundary>
            {renderStepContent()}
          </ErrorBoundary>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            {currentStep > 0 && (
              <button type="button" onClick={handlePreviousStep} className="btn btn-secondary" disabled={loading || isSuccess}>
                Previous
              </button>
            )}
            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={loading || isSuccess}>
              Cancel
            </button>
            <button
              type="button"
              onClick={currentStep === STEPS.SUMMARY ? handleSubmit : handleNextStep}
              className={`btn btn-primary flex items-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              )}
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 export { StudentPage};
export default StudentPage;
