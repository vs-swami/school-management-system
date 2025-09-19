import React from 'react';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const SimpleFeeOverview = ({ classInfo, totalStudents }) => {
  if (!classInfo?.fees) {
    return null;
  }

  const { yearly, term1, term2 } = classInfo.fees;
  const potentialRevenue = totalStudents * yearly;

  return (
    <div className="space-y-4">
      {/* Fee Structure Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fee Structure
          </h3>
        </div>

        <div className="p-4 space-y-3">
          {/* Annual Fee */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Annual Fee</p>
              <p className="text-xs text-gray-500 mt-1">Full year payment</p>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{yearly?.toLocaleString() || 0}</p>
          </div>

          {/* Term-wise Fees */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-700">Term 1</p>
                  <p className="text-xs text-gray-500">First semester</p>
                </div>
                <p className="text-lg font-semibold text-blue-700">₹{term1?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-700">Term 2</p>
                  <p className="text-xs text-gray-500">Second semester</p>
                </div>
                <p className="text-lg font-semibold text-green-700">₹{term2?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Revenue Projection */}
          {totalStudents > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Potential Revenue
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Based on {totalStudents} enrolled students</p>
                </div>
                <p className="text-xl font-bold text-purple-700">₹{potentialRevenue?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Update Fees
            </button>
            <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Payment Options Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Payment Options Available</p>
            <p className="text-blue-700 text-xs mt-1">
              Students can pay either the full annual fee or opt for term-wise payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFeeOverview;