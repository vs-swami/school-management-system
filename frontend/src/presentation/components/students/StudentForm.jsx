import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

const schema = yup.object({
  gr_full_name: yup.string().required('Full name is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.date().required('Date of birth is required'),
  guardians: yup.array().of(
    yup.object({
      full_name: yup.string().required('Guardian name is required'),
      relation: yup.string().required('Relation is required'),
      mobile: yup.string().required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    })
  ).min(1, 'At least one guardian is required'),
});

export const StudentForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      guardians: [{ full_name: '', relation: '', mobile: '', occupation: '' }]
    }
  });

  const watchedGuardians = watch('guardians');

  const addGuardian = () => {
    const newGuardians = [...watchedGuardians, { 
      full_name: '', 
      relation: '', 
      mobile: '', 
      occupation: '' 
    }];
    setValue('guardians', newGuardians);
  };

  const removeGuardian = (index) => {
    const newGuardians = watchedGuardians.filter((_, i) => i !== index);
    setValue('guardians', newGuardians);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Student Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Full Name (as per GR)"
            {...register('gr_full_name')}
            error={errors.gr_full_name?.message}
          />
          
          <Input
            label="First Name"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          
          <Input
            label="Middle Name"
            {...register('middle_name')}
            error={errors.middle_name?.message}
          />
          
          <Input
            label="Last Name"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
          
          <Select
            label="Gender"
            {...register('gender')}
            error={errors.gender?.message}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
          />
          
          <Input
            label="Date of Birth"
            type="date"
            {...register('dob')}
            error={errors.dob?.message}
          />
          
          <Select
            label="House"
            {...register('house')}
            error={errors.house?.message}
            options={[
              { value: '1', label: 'Red House' },
              { value: '2', label: 'Blue House' },
              { value: '3', label: 'Green House' },
              { value: '4', label: 'Yellow House' }
            ]}
          />
          
          <Select
            label="Place"
            {...register('place')}
            error={errors.place?.message}
            options={[
              { value: '1', label: 'Mumbai' },
              { value: '2', label: 'Delhi' },
              { value: '3', label: 'Bangalore' }
            ]}
          />
        </div>
      </div>

      {/* Guardian Information */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Guardian Information</h3>
          <Button 
            type="button" 
            onClick={addGuardian}
            variant="secondary"
            size="sm"
          >
            Add Guardian
          </Button>
        </div>
        
        {watchedGuardians.map((guardian, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Guardian {index + 1}</h4>
              {watchedGuardians.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeGuardian(index)}
                  variant="danger"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register(`guardians.${index}.full_name`)}
                error={errors.guardians?.[index]?.full_name?.message}
              />
              
              <Select
                label="Relation"
                {...register(`guardians.${index}.relation`)}
                error={errors.guardians?.[index]?.relation?.message}
                options={[
                  { value: 'father', label: 'Father' },
                  { value: 'mother', label: 'Mother' },
                  { value: 'guardian', label: 'Guardian' }
                ]}
              />
              
              <Input
                label="Mobile Number"
                {...register(`guardians.${index}.mobile`)}
                error={errors.guardians?.[index]?.mobile?.message}
              />
              
              <Input
                label="Occupation"
                {...register(`guardians.${index}.occupation`)}
                error={errors.guardians?.[index]?.occupation?.message}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {initialData ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  );
};