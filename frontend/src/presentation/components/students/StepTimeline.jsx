import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const StepTimeline = ({
  currentStep,
  stepNames,
  skipDocuments,
  onStepClick,
  allowNavigation = true,
  completedSteps = [],
  hasErrors = {}
}) => {
  const getStepStatus = (index) => {
    if (hasErrors[index]) return 'error';
    if (currentStep > index || completedSteps.includes(index)) return 'completed';
    if (currentStep === index) return 'current';
    return 'pending';
  };

  const getStepIcon = (index, status) => {
    if (index === 1 && skipDocuments && currentStep > 1) {
      return <AlertCircle className="w-5 h-5" />;
    }

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'current':
        return <Circle className="w-5 h-5 fill-current" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <span className="text-sm font-bold">{index + 1}</span>;
    }
  };

  const getStepColors = (status, index) => {
    if (index === 1 && skipDocuments && currentStep > 1) {
      return {
        circle: 'bg-yellow-500 text-white border-yellow-500 shadow-lg',
        text: 'text-yellow-600',
        connector: 'bg-yellow-400'
      };
    }

    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white border-green-500 shadow-lg transform scale-105',
          text: 'text-green-600',
          connector: 'bg-green-400'
        };
      case 'current':
        return {
          circle: 'bg-indigo-600 text-white border-indigo-600 shadow-lg ring-4 ring-indigo-200 transform scale-110',
          text: 'text-indigo-600 font-semibold',
          connector: 'bg-gray-300'
        };
      case 'error':
        return {
          circle: 'bg-red-500 text-white border-red-500 shadow-lg ring-4 ring-red-200',
          text: 'text-red-600',
          connector: 'bg-gray-300'
        };
      default:
        return {
          circle: 'bg-white text-gray-500 border-gray-300 hover:border-indigo-300 hover:text-indigo-500',
          text: 'text-gray-500 hover:text-indigo-500',
          connector: 'bg-gray-300'
        };
    }
  };

  const canNavigateToStep = (index) => {
    if (!allowNavigation || !onStepClick) return false;
    // Allow navigation to completed steps and current step
    return index <= currentStep || completedSteps.includes(index);
  };

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {stepNames.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / stepNames.length) * 100)}% Complete
          </div>
          <div className="hidden sm:flex items-center text-xs text-gray-400">
            {completedSteps.length > 0 && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {completedSteps.length} completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / stepNames.length) * 100}%` }}
        ></div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Background connector line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0 hidden sm:block"></div>

        {/* Desktop Timeline */}
        <div className="hidden sm:flex items-center justify-between relative z-10">
          {stepNames.map((name, index) => {
            const status = getStepStatus(index);
            const colors = getStepColors(status, index);
            const isClickable = canNavigateToStep(index);

            return (
              <div key={index} className="flex flex-col items-center flex-1 relative">
                {/* Step Circle Container */}
                <div className="relative">
                  <button
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2
                      transition-all duration-300 ease-out z-10 bg-white
                      ${colors.circle}
                      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                      ${status === 'current' ? 'animate-pulse' : ''}
                    `}
                    title={isClickable ? `Go to ${name}` : name}
                  >
                    {getStepIcon(index, status)}
                  </button>

                  {/* Navigation arrows for current step - Outside main button */}
                  {status === 'current' && allowNavigation && (
                    <>
                      {index > 0 && canNavigateToStep(index - 1) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStepClick?.(index - 1);
                          }}
                          className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                          title="Previous step"
                        >
                          <ChevronLeft className="w-4 h-4 text-indigo-600" />
                        </button>
                      )}
                      {index < stepNames.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStepClick?.(index + 1);
                          }}
                          className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                          title="Next step"
                        >
                          <ChevronRight className="w-4 h-4 text-indigo-600" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Connector to next step */}
                {index < stepNames.length - 1 && (
                  <div
                    className={`
                      absolute top-6 left-1/2 w-full h-0.5 transition-all duration-500
                      ${status === 'completed' ? colors.connector : 'bg-gray-300'}
                    `}
                    style={{ transform: 'translateX(25%)' }}
                  ></div>
                )}

                {/* Step Label */}
                <div className="mt-3 text-center max-w-24">
                  <div className={`text-sm font-medium transition-colors duration-300 ${colors.text}`}>
                    {name}
                  </div>

                  {/* Status badges */}
                  <div className="mt-1 flex flex-col items-center space-y-1">
                    {index === 1 && skipDocuments && currentStep > 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Skipped
                      </span>
                    )}
                    {hasErrors[index] && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Error
                      </span>
                    )}
                    {status === 'completed' && !hasErrors[index] && !(index === 1 && skipDocuments) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Timeline */}
        <div className="sm:hidden space-y-4">
          {stepNames.map((name, index) => {
            const status = getStepStatus(index);
            const colors = getStepColors(status, index);
            const isClickable = canNavigateToStep(index);

            return (
              <button
                key={index}
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300
                  ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}
                  ${status === 'current' ? 'border-indigo-500 bg-indigo-50 shadow-lg' :
                    status === 'completed' ? 'border-green-500 bg-green-50' :
                    hasErrors[index] ? 'border-red-500 bg-red-50' :
                    'border-gray-300 bg-white'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${colors.circle}
                  `}>
                    {getStepIcon(index, status)}
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${colors.text}`}>
                      {name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Step {index + 1} of {stepNames.length}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {index === 1 && skipDocuments && currentStep > 1 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Skipped
                    </span>
                  )}
                  {hasErrors[index] && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Error
                    </span>
                  )}
                  {status === 'completed' && !hasErrors[index] && !(index === 1 && skipDocuments) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Complete
                    </span>
                  )}
                  {isClickable && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Description */}
      <div className="mt-6 text-center">
        <div className="text-lg font-semibold text-gray-800 mb-1">
          {stepNames[currentStep]}
        </div>
        <div className="text-sm text-gray-600">
          {currentStep === 0 && "Enter student and guardian information"}
          {currentStep === 1 && !skipDocuments && "Upload required documents"}
          {currentStep === 1 && skipDocuments && "Documents skipped - proceeding to exam results"}
          {currentStep === 2 && "Add exam results and academic history"}
          {currentStep === 3 && "Complete administration and enrollment"}
          {currentStep === 4 && "Review all information before finalizing registration"}
        </div>
      </div>
    </div>
  );
};

export default StepTimeline;