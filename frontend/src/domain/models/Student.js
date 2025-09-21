export class Student {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;

    // Name fields (using schema field names)
    this.gr_full_name = data.gr_full_name || '';
    this.aadhaar_full_name = data.aadhaar_full_name || '';
    this.legal_name_source = data.legal_name_source || 'gr';
    this.first_name = data.first_name || '';
    this.middle_name = data.middle_name || '';
    this.last_name = data.last_name || '';

    // Basic info
    this.gender = data.gender || '';
    this.dob = data.dob || null;

    // IDs (using schema field names)
    this.aadhaar_no = data.aadhaar_no || '';
    this.ssa_uid = data.ssa_uid || '';
    this.apaar_id = data.apaar_id || '';

    // Relations
    this.place = data.place || null;
    this.caste = data.caste || null;
    this.house = data.house || null;
    this.village = data.village || null;
    this.guardians = data.guardians || [];
    // Schema has 'enrollments' as one-to-one, but we store as array for consistency with codebase
    this.enrollments = data.enrollments || [];
    this.documents = data.documents || [];
    this.exam_results = data.exam_results || [];

    // Components
    this.addresses = data.addresses || [];
    this.contacts = data.contacts || [];
  }

  get fullName() {
    // Use gr_full_name if available, otherwise construct from parts
    if (this.gr_full_name) return this.gr_full_name;
    const parts = [this.first_name, this.middle_name, this.last_name].filter(Boolean);
    return parts.join(' ');
  }

  get primaryAddress() {
    return this.addresses.find(addr => addr.isPrimary) || this.addresses[0] || null;
  }

  get primaryContact() {
    return this.contacts.find(contact => contact.isPrimary) || this.contacts[0] || null;
  }


  get age() {
    if (!this.dob) return null;
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  isActive() {
    // Check enrollment status
    return this.enrollments?.enrollmentStatus === 'Enrolled';
  }

  hasGuardian() {
    return this.guardians && this.guardians.length > 0;
  }

  hasDocuments() {
    return this.documents && this.documents.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      gr_full_name: this.gr_full_name,
      aadhaar_full_name: this.aadhaar_full_name,
      legal_name_source: this.legal_name_source,
      first_name: this.first_name,
      middle_name: this.middle_name,
      last_name: this.last_name,
      fullName: this.fullName,  // Computed property
      gender: this.gender,
      dob: this.dob,
      aadhaar_no: this.aadhaar_no,
      ssa_uid: this.ssa_uid,
      apaar_id: this.apaar_id,
      place: this.place,
      caste: this.caste,
      house: this.house,
      village: this.village,
      guardians: this.guardians,
      enrollments: this.enrollments,
      documents: this.documents,
      exam_results: this.exam_results,
      addresses: this.addresses,
      contacts: this.contacts
    };
  }
}