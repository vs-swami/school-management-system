// The formatInitialData function has been moved to StudentPage.jsx to resolve a circular dependency.
// It is no longer exported from this file.

// Helper to extract guardian data for Strapi 5 and domain models
export const extractGuardianData = (guardians) => {
  if (!guardians) return [];

  // Strapi 5 returns direct arrays without .data wrapper
  if (Array.isArray(guardians) && guardians.length > 0) {
    return guardians.map(guardian => ({
      id: guardian.id,
      // Handle both domain model (firstName/lastName) and API fields (full_name)
      full_name: guardian.fullName || guardian.full_name ||
                 `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || '',
      relation: guardian.relationship || guardian.relation || '',
      mobile: guardian.phone || guardian.mobile || '',
      occupation: guardian.occupation || '',
      primary_contact: guardian.isPrimary || guardian.primary_contact || false,
    }));
  }

  return [];
};

// Helper to extract enrollment data for Strapi 5
export const extractEnrollmentData = (enrollments) => {
  if (!enrollments) return null;

  // Strapi 5: Handle single enrollment object
  if (enrollments.id && !Array.isArray(enrollments)) {
    console.log('Processing enrollment object:', enrollments);

    // Handle both domain model properties and API fields
    return {
      id: enrollments.id,
      gr_no: enrollments.grNo || enrollments.gr_no || '',  // Domain model uses grNo
      date_enrolled: enrollments.dateEnrolled || enrollments.date_enrolled || '',  // Domain model uses dateEnrolled
      lc_received: enrollments.lcReceived !== undefined ? enrollments.lcReceived : (enrollments.lc_received || false),
      // CRITICAL: Preserve enrollment_status, never default to enquiry for existing students
      enrollment_status: enrollments.enrollmentStatus || enrollments.enrollment_status || '',  // Domain model uses enrollmentStatus
      // Handle both nested objects and direct IDs
      academic_year: String(
        enrollments.academicYear?.id ||
        enrollments.academic_year?.id ||
        enrollments.academicYear ||
        enrollments.academic_year ||
        ''
      ),
      class: String(
        enrollments.class?.id ||
        enrollments.class ||
        ''
      ),
      admission_type: enrollments.admissionType || enrollments.admission_type || '',
      administration: enrollments.administration || null,
      createdAt: enrollments.createdAt,
      updatedAt: enrollments.updatedAt,
    };
  }

  // Strapi 5: Handle array format
  if (Array.isArray(enrollments) && enrollments.length > 0) {
    const rawEnrollment = enrollments[0];
    return {
      ...rawEnrollment,
      // Map domain model properties to form fields
      gr_no: rawEnrollment.grNo || rawEnrollment.gr_no || '',  // Domain model uses grNo
      date_enrolled: rawEnrollment.dateEnrolled || rawEnrollment.date_enrolled || '',  // Domain model uses dateEnrolled
      lc_received: rawEnrollment.lcReceived !== undefined ? rawEnrollment.lcReceived : (rawEnrollment.lc_received || false),
      enrollment_status: rawEnrollment.enrollmentStatus || rawEnrollment.enrollment_status || '',  // Domain model uses enrollmentStatus
      // Handle both nested objects and direct IDs
      academic_year: String(
        rawEnrollment.academicYear?.id ||
        rawEnrollment.academic_year?.id ||
        rawEnrollment.academicYear ||
        rawEnrollment.academic_year ||
        ''
      ),
      class: String(
        rawEnrollment.class?.id ||
        rawEnrollment.class ||
        ''
      ),
      administration: rawEnrollment.administration || null,
      admission_type: rawEnrollment.admissionType || rawEnrollment.admission_type || '',
    };
  }

  return null;
};

// Helper to extract exam results data for Strapi 5
export const extractExamResultsData = (examResults) => {
  if (!examResults) return [];

  // Strapi 5 returns direct arrays
  if (Array.isArray(examResults)) {
    return examResults.map(result => ({
      id: result.id,
      documentId: result.documentId,
      // Handle both domain model properties and API fields
      exam_type: result.examType || result.exam_type || '',
      exam_name: result.examName || result.exam_name || '',
      exam_date: result.examDate || result.exam_date || '',
      // Use new field names from Strapi 5
      total_obtained: result.totalObtained || result.total_obtained || 0,
      total_maximum: result.totalMaximum || result.total_maximum || 100,
      overall_percentage: result.overallPercentage || result.overall_percentage || 0,
      overall_grade: result.overallGrade || result.overall_grade || '',
      rank: result.rank || null,
      remarks: result.remarks || '',
      // Keep old field names for backward compatibility
      marks_obtained: result.totalObtained || result.marks_obtained || result.total_obtained || 0,
      total_marks: result.totalMaximum || result.total_marks || result.total_maximum || 100,
      grade: result.overallGrade || result.grade || result.overall_grade || '',
      pass_fail: result.passStatus === 'pass' || (result.pass_fail !== undefined ? result.pass_fail : (result.overall_percentage >= 40)),
      // Academic year and class if needed
      academic_year: result.academicYear ?
        (typeof result.academicYear === 'object' ? result.academicYear.id : result.academicYear) :
        (result.academic_year ? (typeof result.academic_year === 'object' ? result.academic_year.id : result.academic_year) : ''),
      class: result.class ?
        (typeof result.class === 'object' ? result.class.id : result.class) : '',
      subject: result.subject || '',
      // Include subject scores for domain models
      subject_scores: result.subjectScores || result.subject_scores || [],
    }));
  }

  return [];
};

// Helper function to format combined info data for API submission (Step 1)
export const formatCombinedInfoSubmissionData = (formData) => {
  return {
    gr_full_name: formData.gr_full_name,
    first_name: formData.first_name,
    middle_name: formData.middle_name,
    last_name: formData.last_name,
    gender: formData.gender,
    dob: formData.dob,
    guardians: formData.guardians.filter(guardian => guardian.full_name !== '' || guardian.mobile !== ''), // Only submit guardians with data
    enrollments: formData.enrollments.map(enrollment => ({
      academic_year: parseInt(enrollment.academic_year),
      class: parseInt(enrollment.class),
      gr_no: enrollment.gr_no,
      date_enrolled: enrollment.date_enrolled,
      admission_type: enrollment.admission_type,
    })),
  };
};
