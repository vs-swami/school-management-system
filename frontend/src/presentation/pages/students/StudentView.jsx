import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  BookOpen,
  Users,
  FileText,
  ChevronRight,
  Download,
  Edit,
  ArrowLeft,
  School,
  Bus,
  Home,
  Award,
  Clock,
  IndianRupee
} from 'lucide-react';
import { useServices } from '../../../application/hooks/useServices';

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student: studentService, paymentSchedule: paymentScheduleService } = useServices();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [paymentSchedule, setPaymentSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch student details
      const studentResult = await studentService.getStudentById(id);
      if (studentResult.success) {
        setStudent(studentResult.data);

        // Extract enrollments from student data if available
        if (studentResult.data.enrollments) {
          setEnrollments(studentResult.data.enrollments);
        }
      } else {
        setError(studentResult.error || 'Failed to load student data');
      }

      // Fetch payment schedule
      const scheduleResult = await paymentScheduleService.getStudentPaymentSchedule(id);
      if (scheduleResult.success && scheduleResult.data?.length > 0) {
        setPaymentSchedule(scheduleResult.data[0]);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Student not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/students/edit/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Student
            </button>
            <button
              onClick={() => navigate(`/students/${id}/finance`)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Finances
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {student.first_name} {student.middle_name} {student.last_name}
              </h1>
              {getStatusBadge(student.status || 'active')}
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <School className="h-4 w-4 mr-2" />
                Student ID: {student.id}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                DOB: {formatDate(student.dob)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Gender: {student.gender}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {student.guardians?.[0]?.contact_numbers?.[0]?.number || 'No contact'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-3 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Full Name:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.first_name} {student.middle_name} {student.last_name}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Date of Birth:</dt>
                      <dd className="text-sm text-gray-900">{formatDate(student.dob)}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Gender:</dt>
                      <dd className="text-sm text-gray-900">{student.gender}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Blood Group:</dt>
                      <dd className="text-sm text-gray-900">{student.blood_group || 'N/A'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Religion:</dt>
                      <dd className="text-sm text-gray-900">{student.religion || 'N/A'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Caste:</dt>
                      <dd className="text-sm text-gray-900">{student.caste?.name || student.caste || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Parent/Guardian Information</h3>
                  <dl className="space-y-3">
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Father's Name:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.find(g => g.relation === 'father')?.full_name || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Mother's Name:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.find(g => g.relation === 'mother')?.full_name || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Guardian:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.find(g => g.primary_contact)?.full_name ||
                         student.guardians?.[0]?.full_name || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-sm font-medium text-gray-500">Relationship:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.find(g => g.primary_contact)?.relation ||
                         student.guardians?.[0]?.relation || 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Enrollment</h3>
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment, index) => (
                      <div key={enrollment.id || index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Academic Year</span>
                            <p className="font-medium">
                              {enrollment.academicYear?.year || enrollment.academic_year?.year || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Class</span>
                            <p className="font-medium">
                              {enrollment.administration?.division?.class?.name ||
                               enrollment.class?.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Division</span>
                            <p className="font-medium">
                              {enrollment.administration?.division?.name ||
                               enrollment.division?.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Admission Type</span>
                            <p className="font-medium">
                              {enrollment.admission_type || 'Regular'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Enrollment Date</span>
                            <p className="font-medium">{formatDate(enrollment.date_enrolled || enrollment.createdAt)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Status</span>
                            <div className="mt-1">
                              {getStatusBadge(enrollment.enrollment_status || enrollment.status || 'active')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No enrollment records found</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Previous Education</h3>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-40 text-sm font-medium text-gray-500">Previous School:</dt>
                    <dd className="text-sm text-gray-900">{student.previous_school || 'N/A'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-40 text-sm font-medium text-gray-500">Previous Class:</dt>
                    <dd className="text-sm text-gray-900">{student.previous_class || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <dl className="space-y-3">
                    <div className="flex items-start">
                      <dt className="w-32 text-sm font-medium text-gray-500">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone:
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.[0]?.contact_numbers?.[0]?.number ||
                         student.contacts?.[0]?.number || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-32 text-sm font-medium text-gray-500">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email:
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.[0]?.email ||
                         student.contacts?.find(c => c.type === 'email')?.value || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-32 text-sm font-medium text-gray-500">Emergency:</dt>
                      <dd className="text-sm text-gray-900">
                        {student.guardians?.find(g => g.primary_contact)?.contact_numbers?.[0]?.number ||
                         student.emergency_contact || 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <dl className="space-y-3">
                    <div className="flex items-start">
                      <dt className="w-32 text-sm font-medium text-gray-500">
                        <Home className="h-4 w-4 inline mr-2" />
                        Address:
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {(() => {
                          const address = student.addresses?.[0] ||
                                        student.guardians?.[0]?.addresses?.[0];
                          if (address) {
                            return (
                              <div>
                                {address.street && <div>{address.street}</div>}
                                {address.area && <div>{address.area}</div>}
                                {(address.city || address.state) && (
                                  <div>
                                    {address.city}
                                    {address.city && address.state && ', '}
                                    {address.state}
                                  </div>
                                )}
                                {address.pincode && <div>PIN: {address.pincode}</div>}
                              </div>
                            );
                          }
                          return 'N/A';
                        })()}
                      </dd>
                    </div>
                    {enrollments[0]?.administration?.seat_allocations?.[0]?.pickup_stop && (
                      <div className="flex items-start">
                        <dt className="w-32 text-sm font-medium text-gray-500">
                          <Bus className="h-4 w-4 inline mr-2" />
                          Bus Stop:
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {enrollments[0].administration.seat_allocations[0].pickup_stop.stop_name ||
                           enrollments[0].administration.seat_allocations[0].pickup_stop.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Fees</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(paymentSchedule?.totalAmount || 0)}
                      </p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(paymentSchedule?.paidAmount || 0)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Pending Amount</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatCurrency(
                          (paymentSchedule?.total_amount || 0) -
                          (paymentSchedule?.paid_amount || 0)
                        )}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {paymentSchedule && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Payment Schedule</h3>
                    <button
                      onClick={() => navigate(`/students/${id}/finance`)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Schedule Number</span>
                        <p className="font-medium">{paymentSchedule.scheduleNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Payment Preference</span>
                        <p className="font-medium capitalize">
                          {enrollments[0]?.payment_preference || 'Full'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="mt-1">
                          {getStatusBadge(paymentSchedule.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No documents uploaded yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentView;