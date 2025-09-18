import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { PlusCircle, MinusCircle, User, Users, Phone, Briefcase } from 'lucide-react';
import FormField from './FormField';

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

export default GuardianSection;