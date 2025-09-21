export class FeeDefinition {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.name = data.name || '';
    this.type = data.type || null;
    this.base_amount = data.base_amount || 0;
    this.currency = data.currency || 'INR';
    this.frequency = data.frequency || null;
    this.calculation_method = data.calculation_method || 'flat';
    this.metadata = data.metadata || {};
    this.installments = data.installments || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static FREQUENCIES = {
    YEARLY: 'yearly',
    TERM: 'term',
    MONTHLY: 'monthly',
    ONE_TIME: 'one_time'
  };

  static CALCULATION_METHODS = {
    FLAT: 'flat',
    PER_UNIT: 'per_unit',
    FORMULA: 'formula'
  };

  get typeName() {
    return this.type?.name || '';
  }

  get totalAmount() {
    if (this.installments && this.installments.length > 0) {
      return this.installments.reduce((total, inst) => total + (inst.amount || 0), 0);
    }
    return this.base_amount;
  }

  isRecurring() {
    return this.frequency !== 'one_time';
  }

  getFrequencyLabel() {
    const labels = {
      yearly: 'Yearly',
      term: 'Per Term',
      monthly: 'Monthly',
      one_time: 'One Time'
    };
    return labels[this.frequency] || this.frequency;
  }

  getCalculationMethodLabel() {
    const labels = {
      flat: 'Flat Rate',
      per_unit: 'Per Unit',
      formula: 'Formula Based'
    };
    return labels[this.calculation_method] || this.calculation_method;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      name: this.name,
      type: this.type,
      base_amount: this.base_amount,
      currency: this.currency,
      frequency: this.frequency,
      calculation_method: this.calculation_method,
      metadata: this.metadata,
      installments: this.installments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new FeeDefinition({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      type: json.type,
      base_amount: parseFloat(json.base_amount || 0),
      currency: json.currency,
      frequency: json.frequency,
      calculation_method: json.calculation_method,
      metadata: json.metadata,
      installments: json.installments,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}