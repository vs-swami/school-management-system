/**
 * Transformers for Strapi component data structures
 */

/**
 * Transform address components array
 * @param {Array} addresses - Array of address components
 * @returns {Array} Transformed addresses
 */
export const transformAddresses = (addresses) => {
  if (!addresses || !Array.isArray(addresses)) return [];

  return addresses.map(address => ({
    id: address.id,
    type: address.address_type || 'current',
    line1: address.address_line1,
    line2: address.address_line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark,
    isPrimary: address.is_primary || false
  }));
};

/**
 * Transform contact components array
 * @param {Array} contacts - Array of contact components
 * @returns {Array} Transformed contacts
 */
export const transformContacts = (contacts) => {
  if (!contacts || !Array.isArray(contacts)) return [];

  return contacts.map(contact => ({
    id: contact.id,
    type: contact.contact_type || 'mobile',
    number: contact.number,
    isPrimary: contact.is_primary || false,
    isWhatsappEnabled: contact.is_whatsapp_enabled || false,
    label: contact.label
  }));
};

/**
 * Transform subject scores array for exam results
 * @param {Array} scores - Array of subject score components
 * @returns {Array} Transformed scores
 */
export const transformSubjectScores = (scores) => {
  if (!scores || !Array.isArray(scores)) return [];

  return scores.map(score => ({
    id: score.id,
    subject: score.subject,
    marksObtained: score.marks_obtained,
    totalMarks: score.total_marks,
    grade: score.grade,
    passStatus: score.pass_status || 'pending',
    percentage: score.percentage ||
      (score.total_marks > 0 ? (score.marks_obtained / score.total_marks * 100).toFixed(2) : 0),
    remarks: score.remarks
  }));
};

/**
 * Transform bus stop schedules array
 * @param {Array} schedules - Array of bus stop schedule components
 * @returns {Array} Transformed schedules
 */
export const transformBusStopSchedules = (schedules) => {
  if (!schedules || !Array.isArray(schedules)) return [];

  return schedules.map(schedule => ({
    id: schedule.id,
    busStop: schedule.bus_stop,
    stopOrder: schedule.stop_order,
    pickupTime: schedule.pickup_time,
    dropTime: schedule.drop_time,
    waitingTime: schedule.waiting_time || 2,
    distanceFromPrevious: schedule.distance_from_previous,
    isActive: schedule.is_active !== false
  }));
};

/**
 * Get primary contact from contacts array
 * @param {Array} contacts - Array of contacts
 * @param {string} type - Optional type filter
 * @returns {Object|null} Primary contact or first contact of type
 */
export const getPrimaryContact = (contacts, type = null) => {
  if (!contacts || !Array.isArray(contacts)) return null;

  const transformed = transformContacts(contacts);

  // Find primary contact of specified type
  if (type) {
    const primaryOfType = transformed.find(c => c.type === type && c.isPrimary);
    if (primaryOfType) return primaryOfType;

    // Return first contact of specified type
    return transformed.find(c => c.type === type) || null;
  }

  // Find any primary contact
  const primary = transformed.find(c => c.isPrimary);
  if (primary) return primary;

  // Return first contact
  return transformed[0] || null;
};

/**
 * Get primary address from addresses array
 * @param {Array} addresses - Array of addresses
 * @param {string} type - Optional type filter
 * @returns {Object|null} Primary address or first address of type
 */
export const getPrimaryAddress = (addresses, type = 'current') => {
  if (!addresses || !Array.isArray(addresses)) return null;

  const transformed = transformAddresses(addresses);

  // Find primary address of specified type
  const primaryOfType = transformed.find(a => a.type === type && a.isPrimary);
  if (primaryOfType) return primaryOfType;

  // Return first address of specified type
  const ofType = transformed.find(a => a.type === type);
  if (ofType) return ofType;

  // Return any primary address
  const primary = transformed.find(a => a.isPrimary);
  if (primary) return primary;

  // Return first address
  return transformed[0] || null;
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [];
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.landmark) parts.push(`Near ${address.landmark}`);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pincode) parts.push(address.pincode);

  return parts.join(', ');
};

/**
 * Format contact for display
 * @param {Object} contact - Contact object
 * @returns {string} Formatted contact string
 */
export const formatContact = (contact) => {
  if (!contact) return '';

  let formatted = contact.number;
  if (contact.label) {
    formatted = `${contact.label}: ${formatted}`;
  }
  if (contact.isWhatsappEnabled) {
    formatted += ' (WhatsApp)';
  }

  return formatted;
};

/**
 * Calculate overall exam statistics from subject scores
 * @param {Array} scores - Array of subject scores
 * @returns {Object} Overall statistics
 */
export const calculateExamStats = (scores) => {
  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    return {
      totalObtained: 0,
      totalMaximum: 0,
      overallPercentage: 0,
      overallGrade: '',
      passStatus: 'pending',
      subjectsPassed: 0,
      subjectsFailed: 0
    };
  }

  const transformed = transformSubjectScores(scores);

  const totalObtained = transformed.reduce((sum, s) => sum + (s.marksObtained || 0), 0);
  const totalMaximum = transformed.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  const overallPercentage = totalMaximum > 0 ? (totalObtained / totalMaximum * 100).toFixed(2) : 0;

  const subjectsPassed = transformed.filter(s => s.passStatus === 'pass').length;
  const subjectsFailed = transformed.filter(s => s.passStatus === 'fail').length;

  let overallGrade = '';
  if (overallPercentage >= 90) overallGrade = 'A+';
  else if (overallPercentage >= 80) overallGrade = 'A';
  else if (overallPercentage >= 70) overallGrade = 'B+';
  else if (overallPercentage >= 60) overallGrade = 'B';
  else if (overallPercentage >= 50) overallGrade = 'C';
  else if (overallPercentage >= 40) overallGrade = 'D';
  else overallGrade = 'F';

  const passStatus = subjectsFailed === 0 && subjectsPassed === transformed.length ? 'pass' :
                     subjectsFailed > 0 ? 'fail' : 'pending';

  return {
    totalObtained,
    totalMaximum,
    overallPercentage: parseFloat(overallPercentage),
    overallGrade,
    passStatus,
    subjectsPassed,
    subjectsFailed
  };
};