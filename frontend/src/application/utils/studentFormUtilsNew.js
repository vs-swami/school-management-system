import {
  getPrimaryContact,
  getPrimaryAddress
} from '../../data/transformers/componentTransformers';

// Helper to extract guardian data with new component structure
export const extractGuardianData = (guardians) => {
  if (!guardians) return [];

  if (Array.isArray(guardians) && guardians.length > 0) {
    return guardians.map(guardian => ({
      id: guardian.id,
      full_name: guardian.full_name || '',
      relation: guardian.relation || '',
      occupation: guardian.occupation || '',
      primary_contact: guardian.primary_contact || false,
      // Transform contact_numbers and addresses from components
      contact_numbers: guardian.contact_numbers || [],
      addresses: guardian.addresses || []
    }));
  }

  if (guardians.data && Array.isArray(guardians.data) && guardians.data.length > 0) {
    return guardians.data.map(rawGuardian => {
      const guardianData = rawGuardian.attributes ?
        { id: rawGuardian.id, ...rawGuardian.attributes } :
        rawGuardian;

      return {
        ...guardianData,
        contact_numbers: guardianData.contact_numbers || [],
        addresses: guardianData.addresses || []
      };
    });
  }

  return [];
};

// Helper to get guardian's primary phone number for display
export const getGuardianPrimaryPhone = (guardian) => {
  if (!guardian) return '';

  // Check new component structure
  if (guardian.contact_numbers && guardian.contact_numbers.length > 0) {
    const primary = getPrimaryContact(guardian.contact_numbers, 'mobile');
    if (primary) return primary.number;
  }

  // Fallback to old structure if still exists
  if (guardian.mobile) return guardian.mobile;

  return '';
};

// Helper to get guardian's WhatsApp number
export const getGuardianWhatsAppNumber = (guardian) => {
  if (!guardian) return '';

  // Check new component structure
  if (guardian.contact_numbers && guardian.contact_numbers.length > 0) {
    const whatsapp = getPrimaryContact(guardian.contact_numbers, 'whatsapp');
    if (whatsapp) return whatsapp.number;

    // Check for any number with WhatsApp enabled
    const whatsappEnabled = guardian.contact_numbers.find(c => c.is_whatsapp_enabled);
    if (whatsappEnabled) return whatsappEnabled.number;
  }

  // Fallback to old structure if still exists
  if (guardian.whatsapp_number) return guardian.whatsapp_number;

  return '';
};

// Helper to get student's primary address
export const getStudentPrimaryAddress = (student) => {
  if (!student) return null;

  // Check new component structure
  if (student.addresses && student.addresses.length > 0) {
    return getPrimaryAddress(student.addresses, 'current');
  }

  // Fallback to village/place for old structure
  if (student.village || student.place) {
    return {
      city: student.village?.name || student.place?.name || '',
      state: student.village?.state || student.place?.state || ''
    };
  }

  return null;
};

// Helper to format guardian for submission
export const formatGuardianForSubmission = (guardian) => {
  const formatted = {
    full_name: guardian.full_name,
    relation: guardian.relation,
    occupation: guardian.occupation,
    primary_contact: guardian.primary_contact || false
  };

  // Include contact_numbers if present
  if (guardian.contact_numbers && guardian.contact_numbers.length > 0) {
    formatted.contact_numbers = guardian.contact_numbers.map(contact => ({
      contact_type: contact.contact_type || 'mobile',
      number: contact.number,
      is_primary: contact.is_primary || false,
      is_whatsapp_enabled: contact.is_whatsapp_enabled || false,
      label: contact.label || ''
    }));
  }

  // Include addresses if present
  if (guardian.addresses && guardian.addresses.length > 0) {
    formatted.addresses = guardian.addresses.map(address => ({
      address_type: address.address_type || 'current',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      is_primary: address.is_primary || false
    }));
  }

  return formatted;
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

  // Handle array of enrollments
  if (Array.isArray(enrollments) && enrollments.length > 0) {
    const enrollment = enrollments[0];
    console.log('Processing enrollment from array:', enrollment);
    return {
      id: enrollment.id,
      gr_no: enrollment.gr_no || '',
      date_enrolled: enrollment.date_enrolled || '',
      lc_received: enrollment.lc_received || false,
      status: enrollment.enrollment_status || '',
      academic_year: String(enrollment.academic_year?.id || ''),
      class: String(enrollment.class?.id || ''),
      admission_type: enrollment.admission_type || '',
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }

  return null;
};

// Updated submission data formatter
export const formatStudentDataForSubmission = (formData) => {
  const submissionData = {
    // Student personal details
    gr_full_name: formData.gr_full_name,
    aadhaar_full_name: formData.aadhaar_full_name,
    legal_name_source: formData.legal_name_source,
    first_name: formData.first_name,
    middle_name: formData.middle_name,
    last_name: formData.last_name,
    gender: formData.gender,
    dob: formData.dob,
    aadhaar_no: formData.aadhaar_no,
    ssa_uid: formData.ssa_uid,
    apaar_id: formData.apaar_id,

    // Relations
    place: formData.place ? String(formData.place) : undefined,
    caste: formData.caste ? String(formData.caste) : undefined,
    house: formData.house ? String(formData.house) : undefined,
    village: formData.village ? String(formData.village) : undefined,

    // Include new component fields if present
    addresses: formData.addresses?.map(addr => ({
      address_type: addr.address_type || 'current',
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      is_primary: addr.is_primary || false
    })),

    contacts: formData.contacts?.map(contact => ({
      contact_type: contact.contact_type || 'mobile',
      number: contact.number,
      is_primary: contact.is_primary || false,
      is_whatsapp_enabled: contact.is_whatsapp_enabled || false,
      label: contact.label || ''
    })),

    // Format guardians with new structure
    guardians: formData.guardians?.filter(g => g.full_name && g.full_name !== '')
      .map(g => formatGuardianForSubmission(g))
  };

  // Remove undefined values
  Object.keys(submissionData).forEach(key => {
    if (submissionData[key] === undefined) {
      delete submissionData[key];
    }
  });

  return submissionData;
};