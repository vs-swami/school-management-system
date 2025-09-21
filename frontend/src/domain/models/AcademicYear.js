export class AcademicYear {
  constructor(data = {}) {
    this.id = data.id || '';
    this.year = data.year || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.isCurrent = data.isCurrent || false;
    this.isActive = data.isActive || true;
    this.description = data.description || '';
    this.totalWorkingDays = data.totalWorkingDays || 0;
    this.terms = data.terms || [];
    this.holidays = data.holidays || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Computed properties
  get displayName() {
    return this.year || `Academic Year ${this.id}`;
  }

  get dateRange() {
    if (!this.startDate || !this.endDate) return '';
    const start = new Date(this.startDate).toLocaleDateString('en-IN');
    const end = new Date(this.endDate).toLocaleDateString('en-IN');
    return `${start} - ${end}`;
  }

  get status() {
    const now = new Date();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    if (!start || !end) return 'undefined';

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'ongoing';
  }

  get isOngoing() {
    return this.status === 'ongoing';
  }

  get isCompleted() {
    return this.status === 'completed';
  }

  get isUpcoming() {
    return this.status === 'upcoming';
  }

  get duration() {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Duration in days
  }

  get progress() {
    if (!this.isOngoing) return this.isCompleted ? 100 : 0;

    const now = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const total = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  // Methods
  containsDate(date) {
    if (!this.startDate || !this.endDate) return false;
    const checkDate = new Date(date);
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return checkDate >= start && checkDate <= end;
  }

  getCurrentTerm() {
    if (!this.terms || this.terms.length === 0) return null;
    const now = new Date();

    return this.terms.find(term => {
      const termStart = new Date(term.startDate);
      const termEnd = new Date(term.endDate);
      return now >= termStart && now <= termEnd;
    });
  }

  isHoliday(date) {
    if (!this.holidays || this.holidays.length === 0) return false;
    const checkDate = new Date(date).toDateString();

    return this.holidays.some(holiday => {
      const holidayDate = new Date(holiday.date).toDateString();
      return holidayDate === checkDate;
    });
  }

  canBeSetAsCurrent() {
    return this.isActive && !this.isCompleted;
  }
}