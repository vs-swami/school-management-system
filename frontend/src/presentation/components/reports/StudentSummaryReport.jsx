import React, { useRef, useState } from 'react';
import { Printer, Download, X, FileText, Users, TrendingUp, Award, Calendar, Mail, Phone, MapPin, Building } from 'lucide-react';
import { Button } from '../common/Button';

export const StudentSummaryReport = ({ students, metrics, onClose }) => {
  const printRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');

    windowPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Summary Report - ${new Date().toLocaleDateString()}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

            @page {
              size: A4;
              margin: 10mm;
            }

            @media print {
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none !important; }
              .page-break { page-break-after: always; }
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #1a202c;
              line-height: 1.6;
              font-size: 14px;
              background: #ffffff;
            }

            .report-wrapper {
              max-width: 100%;
              background: linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100px);
              min-height: 100vh;
            }

            .report-container {
              max-width: 100%;
              background: white;
              padding: 30px;
            }

            /* Modern Header with School Branding */
            .header {
              position: relative;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 24px;
              margin-bottom: 40px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
            }

            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -10%;
              width: 60%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              transform: rotate(30deg);
            }

            .header-content {
              position: relative;
              z-index: 1;
              text-align: center;
              color: white;
            }

            .school-logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: white;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }

            .school-logo-text {
              font-size: 36px;
              font-weight: 800;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            .school-name {
              font-size: 36px;
              font-weight: 800;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .report-title {
              font-size: 20px;
              font-weight: 500;
              opacity: 0.95;
              margin-bottom: 12px;
            }

            .report-meta {
              display: flex;
              justify-content: center;
              gap: 30px;
              font-size: 14px;
              opacity: 0.9;
              margin-top: 20px;
            }

            .meta-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .meta-icon {
              width: 16px;
              height: 16px;
            }

            /* Enhanced Metrics Cards */
            .metrics-section {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 24px;
              margin-bottom: 40px;
            }

            .metric-card {
              position: relative;
              padding: 28px 24px;
              background: white;
              border-radius: 20px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
              border: 1px solid #f1f5f9;
              overflow: hidden;
              transition: all 0.3s ease;
            }

            .metric-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 4px;
            }

            .metric-card:nth-child(1)::before {
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }

            .metric-card:nth-child(2)::before {
              background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
            }

            .metric-card:nth-child(3)::before {
              background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
            }

            .metric-card:nth-child(4)::before {
              background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
            }

            .metric-icon {
              position: absolute;
              top: 20px;
              right: 20px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              font-size: 20px;
              opacity: 0.9;
            }

            .metric-card:nth-child(1) .metric-icon {
              background: rgba(102, 126, 234, 0.1);
              color: #667eea;
            }

            .metric-card:nth-child(2) .metric-icon {
              background: rgba(16, 185, 129, 0.1);
              color: #10b981;
            }

            .metric-card:nth-child(3) .metric-icon {
              background: rgba(245, 158, 11, 0.1);
              color: #f59e0b;
            }

            .metric-card:nth-child(4) .metric-icon {
              background: rgba(239, 68, 68, 0.1);
              color: #ef4444;
            }

            .metric-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }

            .metric-value {
              font-size: 42px;
              font-weight: 800;
              margin-bottom: 8px;
              line-height: 1;
            }

            .metric-card:nth-child(1) .metric-value { color: #667eea; }
            .metric-card:nth-child(2) .metric-value { color: #10b981; }
            .metric-card:nth-child(3) .metric-value { color: #f59e0b; }
            .metric-card:nth-child(4) .metric-value { color: #ef4444; }

            .metric-detail {
              font-size: 13px;
              color: #94a3b8;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .trend-up {
              color: #10b981;
              font-weight: 600;
            }

            .trend-down {
              color: #ef4444;
              font-weight: 600;
            }

            /* Modern Table Design */
            .table-section {
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
              margin-bottom: 40px;
              border: 1px solid #f1f5f9;
            }

            .table-header {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 24px 30px;
              border-bottom: 2px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .table-title {
              font-size: 20px;
              font-weight: 700;
              color: #1a202c;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .table-count {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              background: white;
              padding: 6px 12px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }

            .summary-table {
              width: 100%;
              border-collapse: collapse;
            }

            .summary-table th {
              background: #fafbfc;
              color: #475569;
              font-weight: 700;
              text-align: left;
              padding: 18px 16px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e2e8f0;
            }

            .summary-table td {
              padding: 16px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
              color: #334155;
            }

            .summary-table tbody tr {
              transition: background 0.2s ease;
            }

            .summary-table tbody tr:hover {
              background: #f8fafc;
            }

            .summary-table tbody tr:nth-child(even) {
              background: #fafbfc;
            }

            .student-index {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border-radius: 8px;
              font-weight: 700;
              color: #64748b;
              font-size: 13px;
            }

            .student-name {
              font-weight: 600;
              color: #1a202c;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .student-avatar {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 700;
            }

            /* Enhanced Status Badges */
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 14px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
              letter-spacing: 0.3px;
            }

            .status-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }

            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }

            .status-enrolled {
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              color: #065f46;
              border: 1px solid #6ee7b7;
            }

            .status-enrolled .status-dot {
              background: #10b981;
            }

            .status-pending {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              color: #92400e;
              border: 1px solid #fbbf24;
            }

            .status-pending .status-dot {
              background: #f59e0b;
            }

            .status-waiting {
              background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
              color: #92400e;
              border: 1px solid #fb923c;
            }

            .status-waiting .status-dot {
              background: #f97316;
            }

            .status-rejected {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              color: #991b1b;
              border: 1px solid #f87171;
            }

            .status-rejected .status-dot {
              background: #ef4444;
            }

            .status-enquiry {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              color: #1e40af;
              border: 1px solid #60a5fa;
            }

            .status-enquiry .status-dot {
              background: #3b82f6;
            }

            /* Guardian Info */
            .guardian-info {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }

            .guardian-name {
              font-weight: 600;
              color: #1a202c;
              font-size: 13px;
            }

            .guardian-contact {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: #64748b;
            }

            .contact-icon {
              width: 12px;
              height: 12px;
              color: #94a3b8;
            }

            /* Statistics Section */
            .statistics-section {
              background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
              border-radius: 20px;
              padding: 36px;
              margin-top: 40px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
              border: 1px solid #e2e8f0;
            }

            .statistics-header {
              text-align: center;
              margin-bottom: 32px;
            }

            .statistics-title {
              font-size: 24px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 8px;
            }

            .statistics-subtitle {
              font-size: 14px;
              color: #64748b;
            }

            .statistics-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
            }

            .stat-item {
              background: white;
              padding: 24px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              border: 1px solid #f1f5f9;
            }

            .stat-icon {
              width: 48px;
              height: 48px;
              margin: 0 auto 12px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            }

            .stat-label {
              color: #64748b;
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }

            .stat-value {
              font-weight: 800;
              color: #1a202c;
              font-size: 28px;
              line-height: 1;
            }

            .stat-percentage {
              display: inline-block;
              margin-top: 8px;
              padding: 4px 8px;
              background: #f0fdf4;
              color: #10b981;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            }

            /* Footer Design */
            .footer {
              margin-top: 60px;
              padding: 40px;
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
              border-radius: 20px;
              border: 2px solid #e2e8f0;
            }

            .signature-section {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 60px;
              margin-bottom: 40px;
            }

            .signature-box {
              text-align: center;
            }

            .signature-line {
              width: 100%;
              height: 60px;
              border: 2px dashed #cbd5e1;
              border-radius: 8px;
              margin-bottom: 12px;
              background: #fafbfc;
            }

            .signature-label {
              font-size: 14px;
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .footer-info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
              margin-top: 30px;
            }

            .footer-col {
              text-align: center;
            }

            .footer-label {
              font-size: 11px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }

            .footer-value {
              font-size: 13px;
              color: #475569;
              font-weight: 600;
            }

            .footer-note {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #94a3b8;
              line-height: 1.6;
            }

            .copyright {
              margin-top: 8px;
              font-weight: 500;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="report-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();

    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
      setIsPrinting(false);
    }, 250);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Enrolled': 'status-enrolled',
      'Pending': 'status-pending',
      'Waiting': 'status-waiting',
      'Rejected': 'status-rejected',
      'Enquiry': 'status-enquiry'
    };
    return statusMap[status] || 'status-enquiry';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'ST';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Summary Report</h2>
              <p className="text-sm text-gray-600 mt-1">Professional PDF Export</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              variant="primary"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              {isPrinting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Print Report
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="overflow-y-auto flex-1 bg-gradient-to-br from-gray-50 to-white">
          <div className="p-8">
            <div ref={printRef} className="report-container bg-white rounded-2xl shadow-xl">
              {/* Header Section */}
              <div className="header">
                <div className="header-content">
                  <div className="school-logo">
                    <span className="school-logo-text">SMS</span>
                  </div>
                  <h1 className="school-name">School Management System</h1>
                  <div className="report-title">Comprehensive Student Enrollment Report</div>
                  <div className="report-meta">
                    <div className="meta-item">
                      <Calendar className="meta-icon" />
                      <span>{currentDate}</span>
                    </div>
                    <div className="meta-item">
                      <Building className="meta-icon" />
                      <span>Academic Year 2024-25</span>
                    </div>
                    <div className="meta-item">
                      <Users className="meta-icon" />
                      <span>{students.length} Students</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Dashboard */}
              <div className="metrics-section">
                <div className="metric-card">
                  <div className="metric-icon">👥</div>
                  <div className="metric-label">Total Students</div>
                  <div className="metric-value">{metrics.total}</div>
                  <div className="metric-detail">
                    <span className="trend-up">↑ {metrics.growthRate}%</span>
                    <span>from last month</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-label">Enrolled</div>
                  <div className="metric-value">{metrics.enrolled}</div>
                  <div className="metric-detail">
                    <span>{metrics.enrollmentRate}% enrollment rate</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-label">Processing</div>
                  <div className="metric-value">{metrics.pending + metrics.waiting}</div>
                  <div className="metric-detail">
                    <span>{metrics.pending} pending, {metrics.waiting} waiting</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">❌</div>
                  <div className="metric-label">Rejected</div>
                  <div className="metric-value">{metrics.rejected}</div>
                  <div className="metric-detail">
                    <span>{metrics.total > 0 ? ((metrics.rejected / metrics.total) * 100).toFixed(1) : 0}% rejection rate</span>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="table-section">
                <div className="table-header">
                  <h3 className="table-title">
                    <Users />
                    Student Enrollment Details
                  </h3>
                  <span className="table-count">Total Records: {students.length}</span>
                </div>
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '24%' }}>Student Name</th>
                      <th style={{ width: '12%' }}>ID</th>
                      <th style={{ width: '8%' }}>Grade</th>
                      <th style={{ width: '8%' }}>Div</th>
                      <th style={{ width: '13%' }}>Status</th>
                      <th style={{ width: '18%' }}>Guardian</th>
                      <th style={{ width: '12%' }}>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>
                          <span className="student-index">{index + 1}</span>
                        </td>
                        <td>
                          <div className="student-name">
                            <span className="student-avatar">
                              {getInitials(student.first_name, student.last_name)}
                            </span>
                            <span>
                              {student.fullName || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {student.ssa_uid || student.apaar_id || 'N/A'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>
                          {student.enrollments?.[0]?.class?.className ||
                           student.currentEnrollment?.class?.className || '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {student.enrollments?.[0]?.division?.divisionName ||
                           student.currentEnrollment?.division?.divisionName || '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(
                            student.enrollments?.[0]?.enrollmentStatus ||
                            student.currentEnrollment?.enrollmentStatus
                          )}`}>
                            <span className="status-dot"></span>
                            {student.enrollments?.[0]?.enrollmentStatus ||
                             student.currentEnrollment?.enrollmentStatus || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="guardian-info">
                            <div className="guardian-name">
                              {student.guardians?.[0]?.fullName ||
                               (student.guardians?.[0]?.firstName && student.guardians?.[0]?.lastName ?
                                `${student.guardians?.[0]?.firstName} ${student.guardians?.[0]?.lastName}` : '-')}
                            </div>
                            {student.guardians?.[0]?.primaryPhone && (
                              <div className="guardian-contact">
                                <Phone className="contact-icon" />
                                {student.guardians?.[0]?.primaryPhone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {formatDate(
                            student.enrollments?.[0]?.dateEnrolled ||
                            student.currentEnrollment?.dateEnrolled ||
                            student.createdAt
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statistics Summary */}
              <div className="statistics-section">
                <div className="statistics-header">
                  <h3 className="statistics-title">📊 Statistical Analysis</h3>
                  <p className="statistics-subtitle">Key performance indicators and enrollment metrics</p>
                </div>
                <div className="statistics-grid">
                  <div className="stat-item">
                    <div className="stat-icon">📈</div>
                    <div className="stat-label">Total Enrollment</div>
                    <div className="stat-value">{metrics.total}</div>
                    <span className="stat-percentage">100%</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">✅</div>
                    <div className="stat-label">Active Students</div>
                    <div className="stat-value">{metrics.enrolled}</div>
                    <span className="stat-percentage">{metrics.enrollmentRate}%</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-label">Pending Review</div>
                    <div className="stat-value">{metrics.pending}</div>
                    <span className="stat-percentage" style={{ background: '#fef3c7', color: '#92400e' }}>
                      {metrics.total > 0 ? ((metrics.pending / metrics.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-label">Waitlisted</div>
                    <div className="stat-value">{metrics.waiting}</div>
                    <span className="stat-percentage" style={{ background: '#fed7aa', color: '#92400e' }}>
                      {metrics.total > 0 ? ((metrics.waiting / metrics.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📊</div>
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value">{metrics.enrollmentRate}%</div>
                    <span className="stat-percentage">{metrics.enrolled}/{metrics.total}</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📈</div>
                    <div className="stat-label">Growth Rate</div>
                    <div className="stat-value">+{metrics.growthRate}%</div>
                    <span className="stat-percentage">Monthly</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="footer">
                <div className="signature-section">
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <div className="signature-label">Principal's Signature</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <div className="signature-label">Administrator's Signature</div>
                  </div>
                </div>

                <div className="footer-info">
                  <div className="footer-col">
                    <div className="footer-label">Generated By</div>
                    <div className="footer-value">System Administrator</div>
                  </div>
                  <div className="footer-col">
                    <div className="footer-label">Report Date</div>
                    <div className="footer-value">{currentDate}</div>
                  </div>
                  <div className="footer-col">
                    <div className="footer-label">Report Time</div>
                    <div className="footer-value">{currentTime}</div>
                  </div>
                </div>

                <div className="footer-note">
                  <p>This is a computer-generated report and does not require physical signature for reference purposes.</p>
                  <p>For official use, please obtain authorized signatures from the concerned authorities.</p>
                  <p className="copyright">© 2025 School Management System. All rights reserved. | Confidential Document</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};