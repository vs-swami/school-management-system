import React from 'react';

/**
 * Reusable form field component with validation and error handling
 * Memoized to prevent unnecessary re-renders when parent components update
 *
 * @param {string} label - Field label text
 * @param {string} type - Input type (text, select, etc.)
 * @param {object} register - React Hook Form register object
 * @param {object} errors - Validation errors
 * @param {boolean} required - Whether field is required
 * @param {React.Component} Icon - Lucide icon component
 * @param {Array} options - Select options array
 * @param {string} placeholder - Placeholder text
 * @param {React.Node} children - Custom input element
 * @param {Function} onChange - Custom change handler
 */
const FormField = React.memo(({
  label,
  type = "text",
  register,
  errors,
  required = false,
  icon: Icon,
  options,
  placeholder,
  children,
  onChange,
  ...props
}) => (
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
));

FormField.displayName = 'FormField';

export default FormField;