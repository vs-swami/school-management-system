import React from 'react';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Bus,
  CheckCircle,
  AlertCircle,
  Edit3,
  Download,
  Eye,
  Users,
  BookOpen,
  Clock,
  Navigation,
  Award,
  Building
} from 'lucide-react';

const SummaryStep = ({
  formData,
  onEditStep,
  skipDocuments,
  busStops = [],
  locations = [],
  classes = [],
  divisions = [],
  academicYears = [],
  classCapacityData = null,
  pickupStopRoutes = [],
  selectedStudent = null
}) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get display name from ID or object
  const getDisplayName = (idOrObject, array, field = 'name') => {
    if (!idOrObject) return 'Not selected';

    // If it's an object with an id (Strapi 5 populated relation)
    if (typeof idOrObject === 'object') {
      // Try to get the field directly from the object
      if (idOrObject[field]) {
        return idOrObject[field];
      }
      // If field not found, try to find it in the array by id
      if (idOrObject.id && array) {
        const item = array.find(item => String(item.id) === String(idOrObject.id));
        return item ? item[field] : idOrObject[field] || 'Not found';
      }
      return 'Not found';
    }

    // If it's just an ID
    if (!array) return 'Not selected';
    const item = array.find(item => String(item.id) === String(idOrObject));
    return item ? item[field] : 'Not found';
  };

  // Get enrollment data - prioritize selectedStudent over form data for saved information
  const enrollment = selectedStudent?.enrollments?.[0] || formData.enrollments?.[0] || {};
  const administration = enrollment.administration || formData.enrollments?.[0]?.administration || {};
  const seatAllocation = administration.seat_allocations?.[0] || formData.enrollments?.[0]?.administration?.seat_allocations?.[0] || {};

  console.log('SummaryStep - Enrollment data:', {
    enrollment,
    hasAcademicYear: !!enrollment.academic_year,
    hasClass: !!enrollment.class,
    academicYearValue: enrollment.academic_year,
    classValue: enrollment.class,
    academicYears,
    classes
  });

  // Get transport information - check both selectedStudent and form data
  const pickupStopId = seatAllocation.pickup_stop || formData.enrollments?.[0]?.administration?.seat_allocations?.[0]?.pickup_stop;
  const busRouteId = seatAllocation.bus_route || formData.enrollments?.[0]?.administration?.seat_allocations?.[0]?.bus_route;

  // Find the actual stop and route from the provided arrays
  const pickupStop = pickupStopId ? busStops.find(stop => String(stop.id) === String(pickupStopId)) : null;
  const pickupRoute = busRouteId ? pickupStopRoutes.find(route => String(route.id) === String(busRouteId)) : null;
  const assignedBus = seatAllocation.bus || pickupRoute?.bus || null;

  // Get division information - check both sources
  const divisionId = administration.division || formData.enrollments?.[0]?.administration?.division;
  const division = divisionId ? divisions.find(div => String(div.id) === String(divisionId)) : null;

  // Debug logging for transport and division data
  console.log('🔍 SUMMARY - Transport Data:', {
    pickupStop,
    pickupRoute,
    assignedBus,
    seatAllocation,
  });

  console.log('🔍 SUMMARY - Division Data:', {
    division,
    divisionId,
    administration,
  });

  const SectionCard = ({ title, icon: Icon, children, onEdit, stepIndex, gradient = "from-indigo-500 to-indigo-600" }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(stepIndex)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white text-sm font-medium backdrop-blur-sm hover:scale-105"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon, highlight = false }) => (
    <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${highlight ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Icon className="h-4 w-4 text-indigo-600" />
          </div>
        )}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <span className={`text-sm font-medium ${value && value !== 'Not provided' ? 'text-gray-900' : 'text-gray-400 italic'}`}>
        {value || 'Not provided'}
      </span>
    </div>
  );

  const StatusBadge = ({ status, icon: Icon, color = 'green' }) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Registration Summary</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review all information below and make any necessary changes before finalizing the registration
          </p>
        </div>

        {/* Student Information */}
        <SectionCard
          title="Student Information"
          icon={User}
          onEdit={onEditStep}
          stepIndex={0}
          gradient="from-blue-500 to-blue-600"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <InfoRow
                label="Full Name"
                value={`${formData.first_name || ''} ${formData.middle_name || ''} ${formData.last_name || ''}`.trim()}
                icon={User}
                highlight={true}
              />
              <InfoRow label="Gender" value={formData.gender} icon={Users} />
              <InfoRow label="Date of Birth" value={formatDate(formData.dob)} icon={Calendar} />
              <InfoRow label="GR Number" value={enrollment.gr_no || formData.gr_no || formData.enrollments?.[0]?.gr_no} icon={BookOpen} />
            </div>
            <div className="space-y-2">
              <InfoRow label="Academic Year" value={getDisplayName(enrollment.academic_year || formData.enrollments?.[0]?.academic_year, academicYears, 'code')} icon={Calendar} />
              <InfoRow label="Class" value={getDisplayName(enrollment.class || formData.enrollments?.[0]?.class, classes, 'classname')} icon={GraduationCap} />
              <InfoRow label="Admission Type" value={enrollment.admission_type || formData.enrollments?.[0]?.admission_type || formData.admission_type} icon={Building} />
              <InfoRow label="Enrollment Status" value={enrollment.enrollment_status || formData.enrollments?.[0]?.enrollment_status || 'Pending'} icon={Award} />
            </div>
          </div>
        </SectionCard>

      {/* Guardian Information */}
      <SectionCard
        title="Guardian Information"
        icon={User}
        onEdit={onEditStep}
        stepIndex={0}
      >
        {formData.guardians && formData.guardians.length > 0 ? (
          <div className="space-y-4">
            {formData.guardians.map((guardian, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Guardian {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Name" value={guardian.full_name} />
                  <InfoRow label="Relation" value={guardian.relation} />
                  <InfoRow label="Mobile" value={guardian.contacts?.[0]?.mobile || guardian.mobile} icon={Phone} />
                  <InfoRow label="Occupation" value={guardian.occupation} />
                </div>
                {guardian.primary_contact && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Primary Contact
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No guardian information provided</p>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard
        title="Documents"
        icon={FileText}
        onEdit={onEditStep}
        stepIndex={1}
      >
        {skipDocuments ? (
          <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 rounded-lg p-4">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Documents step was skipped</span>
          </div>
        ) : formData.documents && formData.documents.length > 0 ? (
          <div className="space-y-3">
            {formData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.document_type}</p>
                    {doc.description && (
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </span>
                  {doc.file && (
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No documents uploaded</p>
        )}
      </SectionCard>

      {/* Exam Results */}
      <SectionCard
        title="Academic History"
        icon={GraduationCap}
        onEdit={onEditStep}
        stepIndex={2}
      >
        {formData.exam_results && formData.exam_results.length > 0 ? (
          <div className="space-y-4">
            {formData.exam_results.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {result.exam_type || `Exam Result ${index + 1}`}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoRow label="Exam Type" value={result.exam_type || 'Not specified'} />
                  <InfoRow label="Marks Obtained" value={`${result.total_obtained || 0}/${result.total_maximum || 100}`} />
                  <InfoRow label="Percentage" value={result.overall_percentage ? `${result.overall_percentage}%` : 'N/A'} />
                  <InfoRow label="Grade" value={result.overall_grade || 'N/A'} />
                  {result.rank && <InfoRow label="Rank" value={result.rank} />}
                  {result.exam_date && <InfoRow label="Exam Date" value={formatDate(result.exam_date)} />}
                </div>
                {result.remarks && (
                  <div className="mt-2">
                    <InfoRow label="Remarks" value={result.remarks} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No exam results added</p>
        )}
      </SectionCard>

        {/* Administration & Transport */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Division Assignment */}
          <SectionCard
            title="Division Assignment"
            icon={GraduationCap}
            onEdit={onEditStep}
            stepIndex={3}
            gradient="from-purple-500 to-purple-600"
          >
            <div className="space-y-4">
              {divisionId && division ? (
                <>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {division.divisionName || division.divisionCode || 'N/A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900">Division {division.divisionName || division.divisionCode || 'N/A'}</h4>
                        <p className="text-sm text-purple-700">Student Division Assignment</p>
                      </div>
                    </div>
                    <StatusBadge status="Assigned" icon={CheckCircle} color="green" />
                  </div>
                  <InfoRow
                    label="Date of Admission"
                    value={formatDate(administration.date_of_admission)}
                    icon={Calendar}
                  />
                </>
              ) : divisionId && !division ? (
                <div className="bg-orange-50 rounded-xl p-6 text-center border-2 border-dashed border-orange-300">
                  <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                  <p className="text-orange-600 font-medium">Division Data Loading...</p>
                  <p className="text-sm text-orange-500">Selected division ID: {divisionId}</p>
                  <p className="text-sm text-orange-500">Division data not found in available divisions</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No division assigned yet</p>
                  <p className="text-sm text-gray-500">Complete the administration step to assign a division</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Transport Allocation */}
          <SectionCard
            title="Transport Allocation"
            icon={Bus}
            onEdit={onEditStep}
            stepIndex={3}
            gradient="from-green-500 to-green-600"
          >
            <div className="space-y-4">
              {pickupStop ? (
                <>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-3 bg-green-500 rounded-full">
                        <Bus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900">{pickupStop.stop_name}</h4>
                        <p className="text-sm text-green-700">Pickup Location</p>
                      </div>
                    </div>
                    <StatusBadge status="Allocated" icon={CheckCircle} color="green" />
                  </div>

                  <div className="space-y-2">
                    <InfoRow
                      label="Route Name"
                      value={pickupRoute?.route_name || 'Route information not available'}
                      icon={Navigation}
                    />
                    <InfoRow
                      label="Bus Number"
                      value={
                        assignedBus?.bus_number ||
                        pickupRoute?.bus?.bus_number ||
                        'Bus assignment pending'
                      }
                      icon={Bus}
                    />
                    <InfoRow
                      label="Seat Number"
                      value={seatAllocation.seat_number || 'Seat not assigned'}
                      icon={Award}
                    />
                    {pickupStop.location && (
                      <InfoRow
                        label="Area"
                        value={pickupStop.location.name}
                        icon={MapPin}
                      />
                    )}
                    <InfoRow
                      label="Valid From"
                      value={formatDate(seatAllocation.valid_from)}
                      icon={Calendar}
                    />
                    {seatAllocation.monthly_fee && (
                      <InfoRow
                        label="Monthly Fee"
                        value={`₹${seatAllocation.monthly_fee}`}
                        icon={Building}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No transport allocation</p>
                  <p className="text-sm text-gray-500">Complete the administration step to select transport</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Action Summary */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Registration Complete!</h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              All information has been collected successfully. Review the details above and proceed to finalize the registration.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onEditStep && onEditStep(0)}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white font-medium backdrop-blur-sm hover:scale-105 border border-white/30"
              >
                <Edit3 className="h-5 w-5" />
                <span>Make Changes</span>
              </button>
              <button className="flex items-center space-x-2 px-8 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold shadow-lg hover:scale-105">
                <Download className="h-5 w-5" />
                <span>Generate Summary Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;