// The formatInitialData function has been moved to StudentPage.jsx to resolve a circular dependency.
// It is no longer exported from this file.

// Helper to extract guardian data from various formats
export const extractGuardianData = (guardians) => {
  if (!guardians) return [];
  
  if (Array.isArray(guardians) && guardians.length > 0) {
    return guardians.map(guardian => ({
      id: guardian.id,
      full_name: guardian.full_name || '',
      relation: guardian.relation || '',
      mobile: guardian.mobile || '',
      occupation: guardian.occupation || '',
      primary_contact: guardian.primary_contact || false,
    }));
  }
  
  if (guardians.data && Array.isArray(guardians.data) && guardians.data.length > 0) {
    return guardians.data.map(rawGuardian => 
      rawGuardian.attributes ? 
        { id: rawGuardian.id, ...rawGuardian.attributes } : 
        rawGuardian
    );
  }
  
  return [];
};

// Updated helper to extract enrollment data from various formats
export const extractEnrollmentData = (enrollments) => {
  if (!enrollments) return null;
  
  // Handle single enrollment object (current API structure)
  if (enrollments.id && !Array.isArray(enrollments)) {
    console.log('Processing single enrollment object:', enrollments);
    return {
      id: enrollments.id,
      gr_no: enrollments.gr_no || '',
      date_enrolled: enrollments.date_enrolled || '',
      lc_received: enrollments.lc_received || false,
      status: enrollments.enrollment_status || '',
      // CRITICAL FIX: Ensure these are strings/numbers, not objects
      academic_year: String(enrollments.academic_year?.id || ''),
      class: String(enrollments.class?.id || ''),
      admission_type: enrollments.admission_type || '',
      // Include other enrollment fields as needed
      createdAt: enrollments.createdAt,
      updatedAt: enrollments.updatedAt,
    };
  }
  
  // Handle array format (legacy support)
  if (Array.isArray(enrollments) && enrollments.length > 0) {
    const rawEnrollment = enrollments[0];
    return {
      ...rawEnrollment,
      academic_year: String(rawEnrollment.academic_year?.data?.id || rawEnrollment.academic_year?.id || ''),
      class: String(rawEnrollment.class?.data?.id || rawEnrollment.class?.id || ''),
      division: String(rawEnrollment.division?.data?.id || rawEnrollment.division?.id || ''),
      admission_type: rawEnrollment.admission_type || '',
    };
  }
  
  // Handle Strapi 4 format with .data wrapper
  if (enrollments.data && Array.isArray(enrollments.data) && enrollments.data.length > 0) {
    const rawEnrollment = enrollments.data[0];
    if (rawEnrollment.attributes) {
      return {
        id: rawEnrollment.id,
        ...rawEnrollment.attributes,
        academic_year: String(rawEnrollment.attributes.academic_year?.data?.id || 
                      rawEnrollment.attributes.academic_year?.id || ''),
        class: String(rawEnrollment.attributes.class?.data?.id || 
               rawEnrollment.attributes.class?.id || ''),
        division: String(rawEnrollment.attributes.division?.data?.id || 
                 rawEnrollment.attributes.division?.id || ''),
        admission_type: rawEnrollment.attributes.admission_type || '',
      };
    }
    return rawEnrollment;
  }
  
  return null;
};

// Helper to extract exam results data
export const extractExamResultsData = (examResults) => {
  if (!examResults) return [];

  if (Array.isArray(examResults)) {
    return examResults.map(result => ({
      id: result.id,
      academic_year: String(result.academic_year?.id || ''),
      class: String(result.class?.id || ''),
      exam_type: result.exam_type || '',
      subject: result.subject || '',
      marks_obtained: result.marks_obtained || '',
      total_marks: result.total_marks || '',
      grade: result.grade || '',
      pass_fail: result.pass_fail || false,
    }));
  }

  // Handle Strapi 4 format with .data wrapper
  if (examResults.data && Array.isArray(examResults.data) && examResults.data.length > 0) {
    return examResults.data.map(rawResult => 
      rawResult.attributes ? 
        { 
          id: rawResult.id, 
          ...rawResult.attributes,
          academic_year: String(rawResult.attributes.academic_year?.data?.id || rawResult.attributes.academic_year?.id || ''),
          class: String(rawResult.attributes.class?.data?.id || rawResult.attributes.class?.id || ''),
        } : 
        rawResult
    );
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
