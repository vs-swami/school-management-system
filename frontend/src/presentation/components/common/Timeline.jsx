import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const Timeline = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="flex items-center justify-between w-full mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1">
            {currentStep >= index ? (
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            ) : (
              <Circle className="h-6 w-6 text-gray-400" />
            )}
            <span className={`text-xs mt-1 text-center ${currentStep >= index ? 'text-indigo-600 font-semibold' : 'text-gray-500'}`}>
              {stepNames[index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`flex-1 h-0.5 ${currentStep > index ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Timeline;
