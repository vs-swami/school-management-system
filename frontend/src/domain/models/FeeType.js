export class FeeType {
  constructor(data = {}) {
    // Core fields from Strapi schema
    this.id = data.id || '';
    this.documentId = data.documentId || '';
    this.code = data.code || '';
    this.name = data.name || '';
    this.active = data.active !== undefined ? data.active : true;

    // Timestamps (standard Strapi fields)
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Computed properties
  get displayName() {
    return this.name || this.code || `Fee Type ${this.id}`;
  }

  get isActive() {
    return this.active;
  }

  // Methods
  canBeAssigned() {
    return this.active;
  }

  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  }
}