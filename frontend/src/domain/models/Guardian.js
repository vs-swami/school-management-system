export class Guardian {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.fullName = data.fullName || '';
    this.relation = data.relation || ''; // 'father', 'mother', or 'guardian'
    this.source = data.source || 'system';
    this.primaryContact = data.primaryContact || false;
    this.occupation = data.occupation || '';
    this.student = data.student || null; // Single student relation (manyToOne)
    this.documents = data.documents || [];
    this.contactNumbers = data.contactNumbers || [];
    this.addresses = data.addresses || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;

    // Keep some old properties for backward compatibility
    this.firstName = data.firstName || this.extractFirstName();
    this.lastName = data.lastName || this.extractLastName();
    this.relationship = data.relationship || this.relation;
    this.isPrimary = data.isPrimary !== undefined ? data.isPrimary : this.primaryContact;
  }

  extractFirstName() {
    if (!this.fullName) return '';
    return this.fullName.split(' ')[0] || '';
  }

  extractLastName() {
    if (!this.fullName) return '';
    const parts = this.fullName.split(' ');
    return parts.slice(1).join(' ') || '';
  }

  get name() {
    return this.fullName;
  }

  get primaryPhone() {
    const primary = this.contactNumbers.find(c => c.isPrimary);
    return primary?.value || this.contactNumbers[0]?.value || '';
  }

  get primaryAddress() {
    const primary = this.addresses.find(a => a.isPrimary);
    return primary || this.addresses[0] || null;
  }

  hasContactNumbers() {
    return this.contactNumbers && this.contactNumbers.length > 0;
  }

  hasAddresses() {
    return this.addresses && this.addresses.length > 0;
  }

  isPrimaryContact() {
    return this.primaryContact === true;
  }

  hasDocuments() {
    return this.documents && this.documents.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      fullName: this.fullName,
      relation: this.relation,
      source: this.source,
      primaryContact: this.primaryContact,
      occupation: this.occupation,
      student: this.student,
      documents: this.documents,
      contactNumbers: this.contactNumbers,
      addresses: this.addresses,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Include backward compatibility fields
      firstName: this.firstName,
      lastName: this.lastName,
      relationship: this.relationship,
      isPrimary: this.isPrimary,
      primaryPhone: this.primaryPhone,
      primaryAddress: this.primaryAddress
    };
  }
}