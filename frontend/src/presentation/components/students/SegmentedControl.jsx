import React from 'react';

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

export default SegmentedControl;