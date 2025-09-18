import React from 'react';
import { User, Calendar, Tag, BookOpen, Droplets } from 'lucide-react';
import FormField from '../FormField';
import SegmentedControl from '../SegmentedControl';

const StudentInfoStep = ({ register, errors, academicYears, classes, getValues, setValue }) => (
  <div className="space-y-8">
    <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Student Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <FormField
          label="Full Name (as per GR)"
          register={register('gr_full_name', { required: 'Full name is required' })}
          errors={errors.gr_full_name}
          required
          icon={User}
        />
        <FormField
          label="First Name"
          register={register('first_name', { required: 'First name is required' })}
          errors={errors.first_name}
          required
          icon={User}
        />
        <FormField
          label="Middle Name"
          register={register('middle_name')}
          errors={errors.middle_name}
          icon={User}
        />
        <FormField
          label="Last Name"
          register={register('last_name', { required: 'Last name is required' })}
          errors={errors.last_name}
          required
          icon={User}
        />
        <FormField
          label="Gender"
          type="select"
          register={register('gender', { required: 'Gender is required' })}
          errors={errors.gender}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          placeholder="Select Gender"
          required
          icon={Droplets}
        />
        <FormField
          label="Date of Birth"
          type="date"
          register={register('dob', { required: 'Date of birth is required' })}
          errors={errors.dob}
          required
          icon={Calendar}
        />
      </div>
    </section>

    <section className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h4 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-600">Enrollment Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <FormField
          label="Academic Year"
          type="select"
          register={register('enrollments.0.academic_year', { required: 'Academic year is required' })}
          errors={errors.enrollments?.[0]?.academic_year}
          options={academicYears.map(year => ({ value: String(year.id), label: year.code }))}
          placeholder="Select Academic Year"
          required
          icon={BookOpen}
        />
        <FormField
          label="Class"
          type="select"
          register={register('enrollments.0.class', { required: 'Class is required' })}
          errors={errors.enrollments?.[0]?.class}
          options={classes.map(cls => ({ value: String(cls.id), label: cls.classname }))}
          placeholder="Select Class"
          required
          icon={Tag}
        />
        <FormField
          label="GR No."
          register={register('enrollments.0.gr_no', { required: 'GR No. is required' })}
          errors={errors.enrollments?.[0]?.gr_no}
          placeholder="e.g., GR12345"
          required
          icon={Tag}
        />
        <FormField
          label="Date Enrolled"
          type="date"
          register={register('enrollments.0.date_enrolled', { required: 'Date enrolled is required' })}
          errors={errors.enrollments?.[0]?.date_enrolled}
          required
          icon={Calendar}
        />
        <SegmentedControl
          label="Admission Type"
          options={[
            { value: 'Transport', label: 'Transport' },
            { value: 'Hostel', label: 'Hostel' },
            { value: 'Self', label: 'Self' },
            { value: 'Tuition Only', label: 'Tuition Only' }
          ]}
          value={getValues('enrollments.0.admission_type')}
          onChange={(value) => setValue('enrollments.0.admission_type', value, { shouldValidate: true })}
          icon={Tag}
        />
      </div>
    </section>
  </div>
);

export default StudentInfoStep;