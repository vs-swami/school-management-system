import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
  PlusCircle,
  MinusCircle,
  User,
  Users,
  Phone,
  Briefcase,
  MapPin,
  Home,
  Mail,
  Smartphone,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import FormField from './FormField';

// Separate component for each guardian to avoid hooks in loops
const GuardianItem = ({ guardianIndex, control, register, errors, onRemove, showRemove }) => {
  const [showContacts, setShowContacts] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact
  } = useFieldArray({
    control,
    name: `guardians.${guardianIndex}.contact_numbers`
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress
  } = useFieldArray({
    control,
    name: `guardians.${guardianIndex}.addresses`
  });

  return (
    <div className="relative border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <h5 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Guardian #{guardianIndex + 1}
        </h5>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remove Guardian"
          >
            <MinusCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h6 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Basic Information
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            label="Full Name"
            register={register(`guardians.${guardianIndex}.full_name`, {
              required: 'Guardian full name is required'
            })}
            errors={errors.guardians?.[guardianIndex]?.full_name}
            required
            icon={User}
          />
          <FormField
            label="Relation"
            type="select"
            register={register(`guardians.${guardianIndex}.relation`, {
              required: 'Relation is required'
            })}
            errors={errors.guardians?.[guardianIndex]?.relation}
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
            label="Occupation"
            register={register(`guardians.${guardianIndex}.occupation`)}
            errors={errors.guardians?.[guardianIndex]?.occupation}
            icon={Briefcase}
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              {...register(`guardians.${guardianIndex}.primary_contact`)}
              id={`primary_contact_${guardianIndex}`}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor={`primary_contact_${guardianIndex}`} className="text-sm font-medium text-gray-700">
              Primary Contact Person
            </label>
          </div>
        </div>
      </div>

      {/* Contact Numbers Component */}
      <div className="mb-6">
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowContacts(!showContacts)}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
          >
            <h6 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" />
              Contact Numbers
              {contactFields && contactFields.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {contactFields.length}
                </span>
              )}
            </h6>
            {showContacts ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showContacts && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-end mb-4">
                {(!contactFields || contactFields.length < 4) && (
                  <button
                    type="button"
                    onClick={() => appendContact({
                      contact_type: 'mobile',
                      number: '',
                      is_primary: false,
                      is_whatsapp_enabled: false,
                      label: ''
                    })}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Add Contact
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {contactFields && contactFields.length > 0 ? (
            contactFields.map((contactField, contactIndex) => (
              <div key={contactField.id} className="bg-gray-50 rounded-lg p-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    label="Contact Type"
                    type="select"
                    register={register(`guardians.${guardianIndex}.contact_numbers.${contactIndex}.contact_type`, {
                      required: 'Contact type is required'
                    })}
                    errors={errors.guardians?.[guardianIndex]?.contact_numbers?.[contactIndex]?.contact_type}
                    options={[
                      { value: 'mobile', label: 'Mobile' },
                      { value: 'landline', label: 'Landline' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'emergency', label: 'Emergency' }
                    ]}
                    required
                    icon={PhoneCall}
                  />

                  <FormField
                    label="Phone Number"
                    type="tel"
                    register={register(`guardians.${guardianIndex}.contact_numbers.${contactIndex}.number`, {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[+]?[0-9]{10,15}$/,
                        message: 'Phone number must be 10-15 digits (optional + prefix)'
                      }
                    })}
                    errors={errors.guardians?.[guardianIndex]?.contact_numbers?.[contactIndex]?.number}
                    required
                    icon={Smartphone}
                    placeholder="+919876543210 or 9876543210"
                  />

                  <FormField
                    label="Label (Optional)"
                    register={register(`guardians.${guardianIndex}.contact_numbers.${contactIndex}.label`)}
                    errors={errors.guardians?.[guardianIndex]?.contact_numbers?.[contactIndex]?.label}
                    placeholder="e.g., Work, Home"
                    icon={Mail}
                  />

                  <div className="flex items-start gap-4 mt-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`guardians.${guardianIndex}.contact_numbers.${contactIndex}.is_primary`)}
                        id={`contact_primary_${guardianIndex}_${contactIndex}`}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`contact_primary_${guardianIndex}_${contactIndex}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        Primary
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`guardians.${guardianIndex}.contact_numbers.${contactIndex}.is_whatsapp_enabled`)}
                        id={`contact_whatsapp_${guardianIndex}_${contactIndex}`}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`contact_whatsapp_${guardianIndex}_${contactIndex}`}
                        className="ml-2 text-sm text-gray-700 flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3 text-green-600" />
                        WhatsApp
                      </label>
                    </div>
                  </div>
                </div>

                {contactFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(contactIndex)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    title="Remove Contact"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
                ) : (
                  <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
                    No contact numbers added. Click "Add Contact" to add one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Addresses Component */}
      <div>
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowAddresses(!showAddresses)}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
          >
            <h6 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Home className="h-4 w-4 text-indigo-600" />
              Addresses
              {addressFields && addressFields.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {addressFields.length}
                </span>
              )}
            </h6>
            {showAddresses ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showAddresses && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-end mb-4">
                {(!addressFields || addressFields.length < 2) && (
                  <button
                    type="button"
                    onClick={() => appendAddress({
                      address_type: 'permanent',
                      address_line1: '',
                      address_line2: '',
                      city: '',
                      state: '',
                      pincode: '',
                      landmark: '',
                      is_primary: false
                    })}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Add Address
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {addressFields && addressFields.length > 0 ? (
            addressFields.map((addressField, addressIndex) => (
              <div key={addressField.id} className="bg-gray-50 rounded-lg p-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    label="Address Type"
                    type="select"
                    register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.address_type`, {
                      required: 'Address type is required'
                    })}
                    errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.address_type}
                    options={[
                      { value: 'current', label: 'Current' },
                      { value: 'permanent', label: 'Permanent' },
                      { value: 'postal', label: 'Postal' },
                      { value: 'office', label: 'Office' }
                    ]}
                    required
                    icon={MapPin}
                  />

                  <div className="lg:col-span-2">
                    <FormField
                      label="Address Line 1"
                      register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.address_line1`, {
                        required: 'Address line 1 is required'
                      })}
                      errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.address_line1}
                      required
                      placeholder="House/Flat No, Building Name, Street"
                      icon={Home}
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <FormField
                      label="Address Line 2"
                      register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.address_line2`)}
                      errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.address_line2}
                      placeholder="Area, Colony (Optional)"
                      icon={Home}
                    />
                  </div>

                  <FormField
                    label="City"
                    register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.city`, {
                      required: 'City is required'
                    })}
                    errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.city}
                    required
                    icon={MapPin}
                  />

                  <FormField
                    label="State"
                    register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.state`, {
                      required: 'State is required'
                    })}
                    errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.state}
                    required
                    icon={MapPin}
                  />

                  <FormField
                    label="Pincode"
                    register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.pincode`, {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Pincode must be 6 digits'
                      }
                    })}
                    errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.pincode}
                    required
                    placeholder="000000"
                    icon={Mail}
                  />

                  <div className="lg:col-span-2">
                    <FormField
                      label="Landmark"
                      register={register(`guardians.${guardianIndex}.addresses.${addressIndex}.landmark`)}
                      errors={errors.guardians?.[guardianIndex]?.addresses?.[addressIndex]?.landmark}
                      placeholder="Near... (Optional)"
                      icon={MapPin}
                    />
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      {...register(`guardians.${guardianIndex}.addresses.${addressIndex}.is_primary`)}
                      id={`address_primary_${guardianIndex}_${addressIndex}`}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`address_primary_${guardianIndex}_${addressIndex}`}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Primary Address
                    </label>
                  </div>
                </div>

                {addressFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(addressIndex)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    title="Remove Address"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
                ) : (
                  <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
                    No addresses added. Click "Add Address" to add one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GuardianSection = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'guardians' });

  const addNewGuardian = () => {
    append({
      full_name: '',
      relation: '',
      occupation: '',
      primary_contact: false,
      contact_numbers: [
        {
          contact_type: 'mobile',
          number: '',
          is_primary: true,
          is_whatsapp_enabled: false,
          label: 'Primary Mobile'
        }
      ],
      addresses: [
        {
          address_type: 'current',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          is_primary: true
        }
      ]
    });
  };

  React.useEffect(() => {
    // Initialize with at least one guardian if empty
    if (fields.length === 0) {
      addNewGuardian();
    }
  }, []);

  return (
    <div className="space-y-8">
      {fields.map((field, index) => (
        <GuardianItem
          key={field.id}
          guardianIndex={index}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => remove(index)}
          showRemove={index > 0}
        />
      ))}

      <button
        type="button"
        onClick={addNewGuardian}
        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-lg"
      >
        <PlusCircle className="h-6 w-6 mr-2" /> Add Guardian
      </button>
    </div>
  );
};

export default GuardianSection;