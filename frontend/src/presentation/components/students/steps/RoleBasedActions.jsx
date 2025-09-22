import React from 'react';
import { Check, X, Clock, AlertCircle, UserCheck, Shield, Activity } from 'lucide-react';
import { useAuthStore } from '../../../../application/stores/useAuthStore';

const RoleBasedActions = ({
  student,
  onStatusChange,
  currentStatus,
  onEnrollStudent,
  onUpdateToWaiting,
  loading
}) => {
  const { user } = useAuthStore();

  // Get user role - check different possible role structures from Strapi
  const userRole = user?.role?.type || user?.role?.name || user?.role || 'public';
  const username = user?.username || user?.email || 'User';

  // Define roles
  const isPrincipal = ['principal', 'administrator', 'admin'].includes(userRole.toLowerCase());
  const isClerk = ['admission-clerk', 'admission_clerk', 'clerk', 'admissions'].includes(userRole.toLowerCase());

  // Current enrollment status
  const enrollmentStatus = currentStatus || student?.enrollments?.[0]?.enrollmentStatus || 'Enquiry';

  // Define what actions are available based on role and status
  const canMoveToWaiting = isClerk && ['Enquiry', 'Processing'].includes(enrollmentStatus);
  const canMoveToProcessing = isClerk && ['Enquiry', 'Waiting'].includes(enrollmentStatus);
  const canApprove = isPrincipal && ['Processing', 'Waiting'].includes(enrollmentStatus);
  const canReject = isPrincipal && ['Processing', 'Waiting', 'Enquiry'].includes(enrollmentStatus);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header with Role Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${
            isPrincipal ? 'bg-purple-100' : isClerk ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Shield className={`h-5 w-5 ${
              isPrincipal ? 'text-purple-600' : isClerk ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Actions</h3>
            <p className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{username}</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                isPrincipal ? 'bg-purple-100 text-purple-700' :
                isClerk ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {userRole}
              </span>
            </p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Current Status</p>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            enrollmentStatus === 'Enrolled' ? 'bg-green-100 text-green-700' :
            enrollmentStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
            enrollmentStatus === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
            enrollmentStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {enrollmentStatus}
          </span>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <div className={`flex flex-col items-center ${
            ['Enquiry'].includes(enrollmentStatus) ? 'text-blue-600 font-semibold' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              ['Enquiry'].includes(enrollmentStatus) ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}>1</div>
            <span>Enquiry</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-300 mx-2" />

          <div className={`flex flex-col items-center ${
            ['Waiting', 'Processing'].includes(enrollmentStatus) ? 'text-yellow-600 font-semibold' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              ['Waiting', 'Processing'].includes(enrollmentStatus) ? 'bg-yellow-600 text-white' : 'bg-gray-300'
            }`}>2</div>
            <span>Review</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-300 mx-2" />

          <div className={`flex flex-col items-center ${
            enrollmentStatus === 'Enrolled' ? 'text-green-600 font-semibold' :
            enrollmentStatus === 'Rejected' ? 'text-red-600 font-semibold' :
            'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              enrollmentStatus === 'Enrolled' ? 'bg-green-600 text-white' :
              enrollmentStatus === 'Rejected' ? 'bg-red-600 text-white' :
              'bg-gray-300'
            }`}>3</div>
            <span>Decision</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Clerk Actions */}
        {isClerk && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Admission Clerk Actions</h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {canMoveToWaiting && (
                <button
                  onClick={onUpdateToWaiting}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  Move to Waiting List
                </button>
              )}

              {canMoveToProcessing && (
                <button
                  onClick={() => onStatusChange && onStatusChange('Processing')}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  Start Processing
                </button>
              )}

              {!canMoveToWaiting && !canMoveToProcessing && (
                <p className="text-sm text-blue-700">
                  {enrollmentStatus === 'Processing' || enrollmentStatus === 'Waiting'
                    ? 'Application ready for Principal review'
                    : 'No actions available at this stage'}
                </p>
              )}
            </div>

            <p className="text-xs text-blue-600 mt-3">
              You can process applications and prepare them for Principal approval
            </p>
          </div>
        )}

        {/* Principal Actions */}
        {isPrincipal && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-purple-600" />
              <h4 className="font-medium text-purple-900">Principal Approval</h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {canApprove && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to approve this enrollment?')) {
                      onEnrollStudent && onEnrollStudent();
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve Enrollment
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reject this application?')) {
                      onStatusChange && onStatusChange('Rejected');
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reject Application
                </button>
              )}

              {!canApprove && !canReject && (
                <p className="text-sm text-purple-700">
                  {enrollmentStatus === 'Enrolled'
                    ? 'Student is already enrolled'
                    : enrollmentStatus === 'Rejected'
                    ? 'Application has been rejected'
                    : 'Application not ready for approval'}
                </p>
              )}
            </div>

            <p className="text-xs text-purple-600 mt-3">
              Your approval decision is final and will immediately update the student's enrollment status
            </p>
          </div>
        )}

        {/* View-Only Message */}
        {!isClerk && !isPrincipal && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-600">
                You have read-only access. Contact an Admission Clerk or Principal for changes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-medium mb-2">Status Guide:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-600">Enquiry - Initial application</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-gray-600">Waiting - In queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-gray-600">Processing - Under review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-600">Enrolled - Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedActions;