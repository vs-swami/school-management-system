import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import useStudentStore from '../../../application/stores/useStudentStore';
import { X, AlertCircle, CheckCircle, PlusCircle, MinusCircle, User, Calendar, Tag, BookOpen, Phone, Briefcase, Users, Droplets, Gauge, Activity, Sparkles } from 'lucide-react';
import { AcademicYearRepository } from '../../../data/repositories/AcademicYearRepository';
import { DivisionRepository } from '../../../data/repositories/DivisionRepository';
import { ClassRepository } from '../../../data/repositories/ClassRepository';
import { BusStopRepository } from '../../../data/repositories/BusStopRepository';
import Timeline from '../../components/common/Timeline';
import Modal from '../../components/common/Modal';
import { useParams } from 'react-router-dom';
import ExamResultForm from '../../components/students/ExamResultForm';
import ExamResultList from '../../components/students/ExamResultList';
import { extractGuardianData, extractEnrollmentData, extractExamResultsData } from '../../../application/utils/studentFormUtils';
import { BusRouteRepository } from '../../../data/repositories/BusRouteRepository';

// Constants
const STEPS = {
  COMBINED_INFO: 0,
  DOCUMENTS: 1,
  EXAM_RESULTS: 2,
  ADMINISTRATION: 3
};

const TOTAL_STEPS = Object.keys(STEPS).length;

// Helper function
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
        enrollment_status: 'Enquiry',
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
    enrollment_status: enrollmentData?.enrollment_status || 'Enquiry',
    lc_received: enrollmentData?.lc_received || false,
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

// Simple Alert Components
const Alert = ({ type, message }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} border rounded-md p-4`}>
      <div className="flex">
        <Icon className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} />
        <div>
          <h3 className={`text-sm font-medium ${textColor}`}>
            {isSuccess ? 'Success' : 'Error'}
          </h3>
          <p className={`mt-1 text-sm ${textColor.replace('800', '700')}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Simplified Form Components
const FormField = ({ label, type = "text", register, errors, required = false, icon: Icon, options, placeholder, children, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500" />}
      {label} {required && '*'}
    </label>
    {type === 'select' ? (
      <select 
        {...register} 
        className="input" 
        {...props} 
        onChange={(e) => {
          // Call the react-hook-form onChange first
          register.onChange(e);
          // Then call any custom onChange if provided
          if (onChange) {
            onChange(e.target.value, e);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : children ? (
      children
    ) : (
      <input type={type} {...register} className="input" {...props} />
    )}
    {errors && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
  </div>
);

// Segmented Control
const SegmentedControl = ({ label, options, value, onChange, icon: Icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500" />}
      {label}
    </label>
    <div className="mt-1 inline-flex rounded-md shadow-sm border border-gray-300">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium ${
            index === 0 ? 'rounded-l-md' : ''
          } ${
            index === options.length - 1 ? 'rounded-r-md' : ''
          } ${
            value === option.value 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            index > 0 ? '-ml-px border-l border-gray-300' : ''
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

// Guardian Management
const GuardianSection = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'guardians' });

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="relative border border-gray-300 rounded-lg p-4 bg-white">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Guardian #{index + 1}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              label="Full Name"
              register={register(`guardians.${index}.full_name`, { required: 'Guardian full name is required' })}
              errors={errors.guardians?.[index]?.full_name}
              required
              icon={User}
            />
            <FormField
              label="Relation"
              type="select"
              register={register(`guardians.${index}.relation`, { required: 'Relation is required' })}
              errors={errors.guardians?.[index]?.relation}
              options={[
                { value: 'father', label: 'Father' },
                { value: 'mother', label: 'Mother' },
                { value: 'guardian', label: 'Guardian' }
              ]}
              placeholder="Select Relation"
              required
              icon={Users}
            />
            <FormField
              label="Mobile Number"
              type="tel"
              register={register(`guardians.${index}.mobile`, { required: 'Mobile number is required' })}
              errors={errors.guardians?.[index]?.mobile}
              required
              icon={Phone}
            />
            <FormField
              label="Occupation"
              register={register(`guardians.${index}.occupation`)}
              errors={errors.guardians?.[index]?.occupation}
              icon={Briefcase}
            />
            <div className="md:col-span-2 flex items-center mt-2">
              <input 
                type="checkbox" 
                {...register(`guardians.${index}.primary_contact`)} 
                id={`primary_contact_${index}`} 
                className="mr-2" 
              />
              <label htmlFor={`primary_contact_${index}`} className="text-sm font-medium text-gray-700">
                Primary Contact
              </label>
            </div>
          </div>
          {index > 0 && (
            <button 
              type="button" 
              onClick={() => remove(index)} 
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <MinusCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
      <button 
        type="button" 
        onClick={() => append({ full_name: '', relation: '', mobile: '', occupation: '', primary_contact: false })} 
        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <PlusCircle className="h-5 w-5 mr-1" /> Add Guardian
      </button>
    </div>
  );
};

// Step Components
const StudentInfoStep = ({ register, errors, academicYears, classes, getValues, setValue }) => (
  <div className="space-y-8">
    <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Student Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <FormField label="Full Name (as per GR)" register={register('gr_full_name', { required: 'Full name is required' })} errors={errors.gr_full_name} required icon={User} />
        <FormField label="First Name" register={register('first_name', { required: 'First name is required' })} errors={errors.first_name} required icon={User} />
        <FormField label="Middle Name" register={register('middle_name')} errors={errors.middle_name} icon={User} />
        <FormField label="Last Name" register={register('last_name', { required: 'Last name is required' })} errors={errors.last_name} required icon={User} />
        <FormField label="Gender" type="select" register={register('gender', { required: 'Gender is required' })} errors={errors.gender} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} placeholder="Select Gender" required icon={Droplets} />
        <FormField label="Date of Birth" type="date" register={register('dob', { required: 'Date of birth is required' })} errors={errors.dob} required icon={Calendar} />
      </div>
    </section>

    <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Enrollment Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <FormField label="Academic Year" type="select" register={register('enrollments.0.academic_year', { required: 'Academic year is required' })} errors={errors.enrollments?.[0]?.academic_year} options={academicYears.map(year => ({ value: String(year.id), label: year.code }))} placeholder="Select Academic Year" required icon={BookOpen} />
        <FormField label="Class" type="select" register={register('enrollments.0.class', { required: 'Class is required' })} errors={errors.enrollments?.[0]?.class} options={classes.map(cls => ({ value: String(cls.id), label: cls.classname }))} placeholder="Select Class" required icon={Tag} />
        <FormField label="GR No." register={register('enrollments.0.gr_no', { required: 'GR No. is required' })} errors={errors.enrollments?.[0]?.gr_no} placeholder="e.g., GR12345" required icon={Tag} />
        <FormField label="Date Enrolled" type="date" register={register('enrollments.0.date_enrolled', { required: 'Date enrolled is required' })} errors={errors.enrollments?.[0]?.date_enrolled} required icon={Calendar} />
        <SegmentedControl label="Admission Type" options={[{ value: 'Transport', label: 'Transport' }, { value: 'Hostel', label: 'Hostel' }, { value: 'Self', label: 'Self' }, { value: 'Tuition Only', label: 'Tuition Only' }]} value={getValues('enrollments.0.admission_type')} onChange={(value) => setValue('enrollments.0.admission_type', value, { shouldValidate: true })} icon={Tag} />
      </div>
    </section>
  </div>
);

const DocumentsStep = ({ skipDocuments, onSkipToggle }) => (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-800 mb-2">Document Uploads</h4>
      <p className="text-sm text-gray-600 mb-4">You can upload student documents now or skip this step and add them later.</p>
      
      <div className="flex items-center mb-4">
        <input type="checkbox" id="skipDocuments" checked={skipDocuments} onChange={(e) => onSkipToggle(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
        <label htmlFor="skipDocuments" className="text-sm font-medium text-gray-700">Skip document uploads for now</label>
        {skipDocuments && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Documents will be skipped</span>}
      </div>

      {skipDocuments && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Documents Skipped</h4>
              <p className="mt-1 text-sm text-yellow-700">You can add documents later by editing the student record.</p>
            </div>
          </div>
        </div>
      )}
    </div>
    
    {!skipDocuments && <div className="text-gray-500">Document upload functionality can be implemented here</div>}
  </div>
);

const ExamResultsStep = ({ watchedExamResults, onAddExamResult, onEditExamResult, onDeleteExamResult, onApproveNextStage, onRejectStudent, localStudentId, isExamResultFormModalOpen, onCloseExamResultModal, editingExamResult, academicYears, classes, control, register, errors }) => (
  <div className="space-y-6">
    <h4 className="text-md font-semibold text-gray-800 mb-4">Exam Results Screening</h4>
    <p className="text-gray-600">This section allows you to manage exam results for the student. Add new results or edit/delete existing ones.</p>
    
    <button type="button" onClick={onAddExamResult} className="btn btn-primary-outline mb-4">
      <PlusCircle className="h-5 w-5 mr-2" /> Add New Exam Result
    </button>

    <ExamResultList examResults={watchedExamResults} onEdit={onEditExamResult} onDelete={onDeleteExamResult} />

    <Modal isOpen={isExamResultFormModalOpen} onClose={() => onCloseExamResultModal(false)} title={editingExamResult ? 'Edit Exam Result' : 'Add New Exam Result'}>
      <ExamResultForm academicYears={academicYears} classes={classes} control={control} register={register} errors={errors} studentId={localStudentId} initialExamResult={editingExamResult} onSaveSuccess={() => onCloseExamResultModal(true)} onCancel={() => onCloseExamResultModal(false)} />
    </Modal>

    <div className="flex justify-end mt-6 space-x-4">
      <button type="button" onClick={() => onApproveNextStage(localStudentId)} className="btn btn-primary">Approve for Next Stage</button>
      <button type="button" onClick={onRejectStudent} className="btn btn-danger-outline">Reject Student</button>
    </div>
  </div>
);

const AdministrationStep = ({ isStudentRejected, classCapacityData, busStops, register, errors, pickupStopRoutes, dropStopRoutes,pickupStopId, dropStopId }) => {
  console.log('AdministrationStep - received pickupStopRoutes:', pickupStopRoutes);
  console.log('AdministrationStep - received dropStopRoutes:', dropStopRoutes);
  
  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-gray-800 mb-4">Administration Details</h4>
      <p className="text-gray-600">This section is for administration-related information.</p>
      
      {isStudentRejected && (
        <Alert type="error" message="This student has been rejected. The workflow has ended." />
      )}
      
      {!isStudentRejected && busStops && busStops.length > 0 && (
        <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
          <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Bus Allocation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Remove the onChange props - let useEffect handle the fetching */}
            <FormField 
              label="Pickup Stop" 
              type="select" 
              register={register('enrollments.0.administration.seat_allocations.0.pickup_stop')} 
              errors={errors.enrollments?.[0]?.administration?.seat_allocations?.[0]?.pickup_stop} 
              options={busStops.map(stop => ({ value: String(stop.id), label: `${stop.stop_name} - ${stop.location}` }))} 
              placeholder="Select Pickup Stop" 
              icon={Tag}
            />
            <FormField 
              label="Drop Stop" 
              type="select" 
              register={register('enrollments.0.administration.seat_allocations.0.drop_stop')} 
              errors={errors.enrollments?.[0]?.administration?.seat_allocations?.[0]?.drop_stop} 
              options={busStops.map(stop => ({ value: String(stop.id), label: `${stop.stop_name} - ${stop.location}` }))} 
              placeholder="Select Drop Stop" 
              icon={Tag}
            />
          </div>
        </section>
      )}
      
   <SideBySideRoutes
  pickupRoutes={pickupStopRoutes}
  dropRoutes={dropStopRoutes}
  selectedPickupStopId={pickupStopId}
  selectedDropStopId={dropStopId}
/>


      
      {classCapacityData?.summary && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-bold text-indigo-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-indigo-600" />
              Class Capacity: {classCapacityData.class?.classname}
            </h4>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              classCapacityData.summary.overallUtilization < 50 
                ? 'bg-green-100 text-green-800' 
                : classCapacityData.summary.overallUtilization < 80 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {classCapacityData.summary.overallUtilization}% Utilized
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-indigo-700">Overall Utilization</span>
              <span className="text-sm text-indigo-600">{classCapacityData.summary.totalEnrolled} / {classCapacityData.summary.totalCapacity} seats</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-4 relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  classCapacityData.summary.overallUtilization < 50 
                    ? 'bg-gradient-to-r from-green-400 to-green-500' 
                    : classCapacityData.summary.overallUtilization < 80 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                    : 'bg-red-400 to-red-500'
                }`}
                style={{ width: `${classCapacityData.summary.overallUtilization}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {classCapacityData.summary.overallUtilization}%
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Capacity</p>
                  <p className="text-2xl font-bold text-indigo-900">{classCapacityData.summary.totalCapacity}</p>
                </div>
                <div className="bg-indigo-100 rounded-full p-2">
                  <Gauge className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Enrolled</p>
                  <p className="text-2xl font-bold text-green-700">{classCapacityData.summary.totalEnrolled}</p>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Available</p>
                  <p className="text-2xl font-bold text-blue-700">{classCapacityData.summary.totalAvailable}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Utilization</p>
                  <p className="text-2xl font-bold text-purple-700">{classCapacityData.summary.overallUtilization}%</p>
                </div>
                <div className="bg-purple-100 rounded-full p-2">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Division Breakdown */}
          {classCapacityData.divisions && classCapacityData.divisions.length > 0 && (
            <div>
              <h5 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Division Breakdown
              </h5>
              <div className="grid gap-4">
                {classCapacityData.divisions.map((div, index) => {
                  const utilizationColor = div.utilizationPercent < 50 ? 'green' : 
                                         div.utilizationPercent < 80 ? 'yellow' : 'red';
                  return (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            utilizationColor === 'green' ? 'bg-green-500' :
                            utilizationColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {div.division.name}
                          </div>
                          <div className="ml-3">
                            <h6 className="font-semibold text-gray-900">Division {div.division.name}</h6>
                            <p className="text-sm text-gray-600">{div.enrolled} of {div.capacity} students</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          utilizationColor === 'green' ? 'bg-green-100 text-green-800' :
                          utilizationColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {div.utilizationPercent}%
                        </div>
                      </div>
                      
                      {/* Division progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            utilizationColor === 'green' ? 'bg-green-400' :
                            utilizationColor === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${div.utilizationPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{div.available} seats available</span>
                        <span>{div.utilizationPercent < 50 ? 'Low' : div.utilizationPercent < 80 ? 'Moderate' : 'High'} utilization</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Timeline Component
const StepTimeline = ({ currentStep, stepNames, skipDocuments }) => (
  <div className="flex items-center justify-center space-x-4 mb-8">
    {stepNames.map((name, index) => (
      <div key={index} className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold ${
          currentStep === index ? 'bg-indigo-600 text-white border-indigo-600' : 
          currentStep > index ? 'bg-green-500 text-white border-green-500' : 
          'bg-white text-gray-500 border-gray-300'
        }`}>
          {currentStep > index ? '✓' : index + 1}
        </div>
        <div className="ml-2">
          <div className={`text-sm font-medium ${
            currentStep === index ? 'text-indigo-600' : 
            currentStep > index ? 'text-green-600' : 'text-gray-500'
          }`}>
            {name}
            {index === 1 && skipDocuments && currentStep > 1 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Skipped</span>
            )}
          </div>
        </div>
        {index < stepNames.length - 1 && (
          <div className={`mx-4 h-0.5 w-8 ${currentStep > index ? 'bg-green-500' : 'bg-gray-300'}`}/>
        )}
      </div>
    ))}
  </div>
);

// Route visualization component
const RouteVisualization = ({ route, selectedStopId, routeType = "pickup" }) => {
  if (!route || !route.bus_stops) return null;

  const getStopStatus = (stop) => {
    if (stop.id === parseInt(selectedStopId)) return 'selected';
    if (!stop.is_active) return 'inactive';
    return 'active';
  };

  const getStopColor = (status) => {
    switch (status) {
      case 'selected': return 'bg-blue-500 border-blue-600';
      case 'inactive': return 'bg-gray-300 border-gray-400';
      default: return 'bg-green-500 border-green-600';
    }
  };

  const getConnectorColor = (fromStop, toStop) => {
    const fromStatus = getStopStatus(fromStop);
    const toStatus = getStopStatus(toStop);
    
    if (fromStatus === 'selected' || toStatus === 'selected') {
      return 'bg-blue-400';
    }
    if (fromStatus === 'inactive' && toStatus === 'inactive') {
      return 'bg-gray-300';
    }
    return 'bg-green-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${routeType === 'pickup' ? 'bg-blue-100' : 'bg-purple-100'}`}>
            <Activity className={`h-6 w-6 ${routeType === 'pickup' ? 'text-blue-600' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{route.route_name}</h3>
            <p className="text-sm text-gray-600">{routeType.charAt(0).toUpperCase() + routeType.slice(1)} Route • {route.route_code}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          routeType === 'pickup' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {route.route_type}
        </div>
      </div>

      {/* Bus Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Bus #{route.bus.bus_number}</p>
              <p className="text-sm text-gray-600">{route.bus.license_plate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{route.bus.total_seats} seats</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Driver: {route.bus.driver_name}</p>
          </div>
        </div>
        
        {/* Timing Information */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Departure:</span>
              <span className="font-semibold text-gray-800">{route.departure_time}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Calendar className="h-4 w-4 text-red-600" />
              <span className="text-gray-600">Arrival:</span>
              <span className="font-semibold text-gray-800">{route.arrival_time}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <Gauge className="h-4 w-4 inline mr-1" />
            {route.total_distance} km
          </div>
        </div>
      </div>

      {/* Route Visualization */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-gray-600" />
          Route Stops
        </h4>
        
        <div className="relative">
          {route.bus_stops.map((stop, index) => {
            const status = getStopStatus(stop);
            const isLast = index === route.bus_stops.length - 1;
            
            return (
              <div key={stop.id} className="relative flex items-start">
                {/* Stop Circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${getStopColor(status)} relative z-10`}>
                    {status === 'selected' && (
                      <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Connector Line */}
                  {!isLast && (
                    <div 
                      className={`absolute left-2 top-4 w-0.5 h-12 -ml-px ${
                        index < route.bus_stops.length - 1 
                          ? getConnectorColor(stop, route.bus_stops[index + 1])
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Stop Information */}
                <div className="ml-4 pb-8 flex-1">
                  <div className={`p-3 rounded-lg border-l-4 ${
                    status === 'selected' 
                      ? 'bg-blue-50 border-blue-500' 
                      : status === 'inactive'
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-green-50 border-green-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`font-semibold ${
                          status === 'selected' ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                          {stop.stop_name}
                        </h5>
                        <p className={`text-sm ${
                          status === 'selected' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {stop.location}
                        </p>
                        {stop.landmark && (
                          <p className="text-xs text-gray-500 mt-1">
                            Near: {stop.landmark}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'selected'
                            ? 'bg-blue-200 text-blue-800'
                            : status === 'inactive'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {status === 'selected' ? 'Selected' : status === 'inactive' ? 'Inactive' : 'Active'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Stop #{index + 1}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600">Total Stops</p>
            <p className="font-semibold text-gray-800">{route.bus_stops.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Active Stops</p>
            <p className="font-semibold text-green-600">
              {route.bus_stops.filter(stop => stop.is_active).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your Stop</p>
            <p className="font-semibold text-blue-600">
              #{route.bus_stops.findIndex(stop => stop.id === parseInt(selectedStopId)) + 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Side-by-side routes component
const SideBySideRoutes = ({ pickupRoutes, dropRoutes, selectedPickupStopId, selectedDropStopId }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pickup Routes */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              Pickup Routes
            </h3>
            <p className="text-sm text-gray-600 ml-11">Routes available for your selected pickup stop</p>
          </div>
          
          <div className="space-y-4">
            {pickupRoutes && pickupRoutes.length > 0 ? (
              pickupRoutes.map(route => (
                <RouteVisualization
                  key={`pickup-${route.id}`}
                  route={route}
                  selectedStopId={selectedPickupStopId}
                  routeType="pickup"
                />
              ))
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pickup routes available</p>
                <p className="text-sm text-gray-500 mt-2">Please select a pickup stop to see available routes</p>
              </div>
            )}
          </div>
        </div>

        {/* Drop Routes */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              Drop Routes
            </h3>
            <p className="text-sm text-gray-600 ml-11">Routes available for your selected drop stop</p>
          </div>
          
          <div className="space-y-4">
            {dropRoutes && dropRoutes.length > 0 ? (
              dropRoutes.map(route => (
                <RouteVisualization
                  key={`drop-${route.id}`}
                  route={route}
                  selectedStopId={selectedDropStopId}
                  routeType="drop"
                />
              ))
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No drop routes available</p>
                <p className="text-sm text-gray-500 mt-2">Please select a drop stop to see available routes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




// Main Component
const StudentPage = ({ mode = 'create', initialData = null }) => {
  const { createStudent, updateStudent, loading, approveNextStage, fetchStudentById, setLoading, saveExamResults, fetchExamResultsForStudent, rejectStudent, fetchClassCapacity } = useStudentStore();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.COMBINED_INFO);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [skipDocuments, setSkipDocuments] = useState(false);
  const [isExamResultFormModalOpen, setIsExamResultFormModalOpen] = useState(false);
  const [editingExamResult, setEditingExamResult] = useState(null);
  const { id } = useParams();
  const [localStudentId, setLocalStudentId] = useState(id);
  const { selectedStudent } = useStudentStore();
  const [isStudentRejected, setIsStudentRejected] = useState(false);
  const [classCapacityData, setClassCapacityData] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [pickupStopRoutes, setPickupStopRoutes] = useState([]);
  const [dropStopRoutes, setDropStopRoutes] = useState([]);

  const { register, control, formState: { errors }, reset, setError, trigger, getValues, setValue, watch } = useForm({
    defaultValues: formatInitialData(null, 'create'),
  });

  const watchedExamResults = watch('exam_results', []);
  const pickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
  const dropStopId = watch('enrollments.0.administration.seat_allocations.0.drop_stop');


  // Effects
  useEffect(() => {
    setLocalStudentId(id);
  }, [id]);

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
        setApiError("Failed to load data.");
      }
    };
    fetchData();
  }, []);

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

  // Effect to fetch class capacity data when navigating to the Administration step
  useEffect(() => {
    if (currentStep === STEPS.ADMINISTRATION && localStudentId && selectedStudent) {
      const fetchAndSetClassCapacity = async () => {
        setLoading(true);
        const classId = selectedStudent.enrollments?.[0]?.class?.id;
        if (classId) {
          const result = await fetchClassCapacity(classId);
          if (result.success) {
            setClassCapacityData(result.data);
          } else {
            setApiError(result.error || 'Failed to fetch class capacity data.');
          }
        } else {
          setApiError('Class ID not found for fetching capacity data.');
        }
        setLoading(false);
      };
      fetchAndSetClassCapacity();
    }
  }, [currentStep, localStudentId, selectedStudent, fetchClassCapacity, setLoading]);

  useEffect(() => {
    if (currentStep === STEPS.ADMINISTRATION && !isStudentRejected) {
      const fetchBusStops = async () => {
        const result = await BusStopRepository.findAll();
        if (result) setBusStops(result);
      };
      fetchBusStops();
    }
  }, [currentStep, isStudentRejected]);

  // Simplified useEffect for pickup stop
  useEffect(() => {
    console.log('Pickup stop effect triggered with ID:', pickupStopId);
    
    if (pickupStopId && currentStep === STEPS.ADMINISTRATION) {
      const fetchPickupRoutes = async () => {
        try {
          console.log('Fetching routes for pickup stop:', pickupStopId);
          setLoading(true);
          const routes = await BusRouteRepository.findByStop(pickupStopId);
          console.log('Received pickup routes:', routes);
          console.log('Setting pickup routes state...');
          setPickupStopRoutes(routes || []);
          console.log('Pickup routes state should now be updated');
        } catch (error) {
          console.error('Error fetching routes for pickup stop:', error);
          setApiError('Failed to load routes for pickup stop.');
          setPickupStopRoutes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchPickupRoutes();
    } else {
      console.log('Clearing pickup routes - pickupStopId:', pickupStopId, 'currentStep:', currentStep);
      setPickupStopRoutes([]);
    }
  }, [pickupStopId, currentStep, setLoading]);


// Simplified useEffect for drop stop
  useEffect(() => {
    console.log('Drop stop effect triggered with ID:', dropStopId);
    
    if (dropStopId && currentStep === STEPS.ADMINISTRATION) {
      const fetchDropRoutes = async () => {
        try {
          console.log('Fetching routes for drop stop:', dropStopId);
          setLoading(true);
          const routes = await BusRouteRepository.findByStop(dropStopId);
          console.log('Received drop routes:', routes);
          setDropStopRoutes(routes || []);
        } catch (error) {
          console.error('Error fetching routes for drop stop:', error);
          setApiError('Failed to load routes for drop stop.');
          setDropStopRoutes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchDropRoutes();
    } else {
      console.log('Clearing drop routes - dropStopId:', dropStopId, 'currentStep:', currentStep);
      setDropStopRoutes([]);
    }
  }, [dropStopId, currentStep, setLoading]);

  // Handlers
  const handleNextStep = async () => {
    const isValid = (currentStep === STEPS.DOCUMENTS && skipDocuments) ? true : await trigger();
    
    if (isValid && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (!isValid) {
      setApiError('Please correct the highlighted errors before proceeding.');
    }
  };

    const handlePickupStopChange = async (stopId) => {
    if (stopId) {
      try {
        setLoading(true);
        const routes = await BusRouteRepository.findByStop(stopId);
        setPickupStopRoutes(routes);
      } catch (error) {
        console.error('Error fetching routes for pickup stop:', error);
        setApiError('Failed to load routes for pickup stop.');
      } finally {
        setLoading(false);
      }
    } else {
      setPickupStopRoutes([]);
    }
  };

  const handleDropStopChange = async (stopId) => {
    if (stopId) {
      try {
        setLoading(true);
        const routes = await BusRouteRepository.findByStop(stopId);
        setDropStopRoutes(routes);
      } catch (error) {
        console.error('Error fetching routes for drop stop:', error);
        setApiError('Failed to load routes for drop stop.');
      } finally {
        setLoading(false);
      }
    } else {
      setDropStopRoutes([]);
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
      setApiError('Please correct the highlighted errors before proceeding.');
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

  const examResultHandlers = {
    onAddExamResult: () => {
      setEditingExamResult(null);
      setIsExamResultFormModalOpen(true);
    },
    onEditExamResult: (examResult) => {
      setEditingExamResult(examResult);
      setIsExamResultFormModalOpen(true);
    },
    onDeleteExamResult: async (examResultId) => {
      // Implement delete logic
    },
    onApproveNextStage: async (studentId) => {
      const result = await approveNextStage(studentId);
      if (result.success) {
        setIsSuccess(true);
        await fetchStudentById(studentId);
        setCurrentStep(STEPS.ADMINISTRATION);
      }
    },
    onRejectStudent: async () => {
      if (window.confirm('Are you sure you want to reject this student?')) {
        const result = await rejectStudent(localStudentId);
        if (result.success) {
          setIsSuccess(true);
          setCurrentStep(STEPS.ADMINISTRATION);
          setIsStudentRejected(true);
        }
      }
    },
    onCloseExamResultModal: (shouldRefresh = false) => {
      setIsExamResultFormModalOpen(false);
      setEditingExamResult(null);
      if (shouldRefresh && localStudentId) {
        // Refresh exam results
        fetchExamResultsForStudent(localStudentId).then(result => {
          if (result.success) {
            const formattedExamResults = extractExamResultsData(result.data);
            setValue('exam_results', formattedExamResults);
          }
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.COMBINED_INFO:
        return (
          <>
            <StudentInfoStep register={register} errors={errors} academicYears={academicYears} classes={classes} getValues={getValues} setValue={setValue} />
            <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
              <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Guardian Details</h4>
              <GuardianSection control={control} register={register} errors={errors} />
            </section>
          </>
        );
      case STEPS.DOCUMENTS:
        return <DocumentsStep skipDocuments={skipDocuments} onSkipToggle={setSkipDocuments} />;
      case STEPS.EXAM_RESULTS:
        return <ExamResultsStep watchedExamResults={watchedExamResults} localStudentId={localStudentId} isExamResultFormModalOpen={isExamResultFormModalOpen} editingExamResult={editingExamResult} academicYears={academicYears} classes={classes} control={control} register={register} errors={errors} {...examResultHandlers} />;
      case STEPS.ADMINISTRATION:
        return <AdministrationStep 
          isStudentRejected={isStudentRejected} 
          classCapacityData={classCapacityData} 
          busStops={busStops} 
          pickupStopRoutes={pickupStopRoutes || []}
          dropStopRoutes={dropStopRoutes || []}
          pickupStopId={pickupStopId}  // This was missing
          dropStopId={dropStopId} 
          register={register} 
          errors={errors}
        />;
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (currentStep < TOTAL_STEPS - 1) return 'Next';
    if (currentStep === STEPS.EXAM_RESULTS) return 'Finish';
    if (loading) return mode === 'edit' ? 'Updating...' : 'Creating...';
    if (isSuccess) return mode === 'edit' ? 'Updated!' : 'Created!';
    return mode === 'edit' ? 'Update Student' : 'Create Student';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button onClick={() => {
            setApiError('');
            setIsSuccess(false);
            setSkipDocuments(false);
            reset(formatInitialData(null, 'create'));
          }} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <StepTimeline 
            currentStep={currentStep}
            stepNames={['Student Info', 'Documents', 'Exam Results', 'Administration']}
            skipDocuments={skipDocuments}
          />
        </div>

        <form className="space-y-6 p-6">
          {isSuccess && <Alert type="success" message="Operation completed successfully!" />}
          {apiError && <Alert type="error" message={apiError} />}
          
          {renderStepContent()}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            {currentStep > 0 && (
              <button type="button" onClick={handlePreviousStep} className="btn btn-secondary" disabled={loading || isSuccess}>
                Previous
              </button>
            )}
            <button type="button" onClick={() => {
              setApiError('');
              setIsSuccess(false);
              setSkipDocuments(false);
              reset(formatInitialData(null, 'create'));
            }} className="btn btn-secondary" disabled={loading || isSuccess}>
              Cancel
            </button>
            <button type="button" onClick={currentStep === STEPS.EXAM_RESULTS ? () => {} : handleSubmit} className="btn btn-primary" disabled={loading || isSuccess}>
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