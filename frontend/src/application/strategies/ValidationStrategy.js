export class ValidationStrategy {
  constructor() {
    // Define validation rules and patterns
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/,
      studentId: /^[A-Z0-9]{6,12}$/,
      name: /^[a-zA-Z\s\-'\.]+$/,
      postalCode: /^[A-Z0-9\s\-]{3,10}$/i,
      emergencyPhone: /^[\+]?[1-9][\d]{9,15}$/
    };

    // Define valid values for certain fields
    this.validValues = {
      grades: ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      genders: ['male', 'female', 'other', 'prefer_not_to_say'],
      bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      relationships: ['parent', 'guardian', 'grandparent', 'sibling', 'aunt', 'uncle', 'family_friend', 'other']
    };

    // Field requirements
    this.requiredFields = [
      'first_name',
      'last_name',
      'dob',
      'guardians',
      // Enrollment fields
      'enrollments.0.academic_year',
      'enrollments.0.class',
      'enrollments.0.gr_no',
      'enrollments.0.date_enrolled',
      'enrollments.0.admission_type',
      // 'grade',
      // 'student_id',
      // 'emergency_contact_name',
      // 'emergency_contact_phone',
      // 'emergency_contact_relationship',
      //'Guardians.0.full_name',
      //'Guardians.0.relation',
      //'Guardians.0.mobile'
    ];
  }

  /**
   * Main validation method for student data
   * @param {Object} studentData - The student data to validate
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validateStudent(studentData) {
    const errors = [];

    // Check required fields
    this.validateRequiredFields(studentData, errors);

    // Validate individual fields
    this.validatePersonalInfo(studentData, errors);
    this.validateContactInfo(studentData, errors);
    this.validateAcademicInfo(studentData, errors);
    this.validateEmergencyContact(studentData, errors);
    this.validateMedicalInfo(studentData, errors);
    this.validateAddress(studentData, errors);
    this.validateDates(studentData, errors);

    // Custom business rules
    this.validateBusinessRules(studentData, errors);

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Helper function to get a nested value from an object using a dot-separated path.
   * @param {Object} obj - The object to search within.
   * @param {string} path - The dot-separated path to the desired value (e.g., 'guardians.0.full_name').
   * @returns {*} The nested value, or undefined if not found.
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Validate required fields are present and not empty
   */
  validateRequiredFields(data, errors) {
    console.log('Validating required fields:', data);
    this.requiredFields.forEach(field => {
      const value = field.includes('.') ? this.getNestedValue(data, field) : data[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          field: field,
          message: `${this.formatFieldName(field)} is required`,
          code: 'REQUIRED_FIELD_MISSING'
        });
      }
    });
  }

  /**
   * Validate personal information fields
   */
  validatePersonalInfo(data, errors) {
    // First name validation
    if (data.first_name) {
      if (!this.patterns.name.test(data.first_name)) {
        errors.push({
          field: 'first_name',
          message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods',
          code: 'INVALID_NAME_FORMAT'
        });
      }
      if (data.first_name.length < 2 || data.first_name.length > 50) {
        errors.push({
          field: 'first_name',
          message: 'First name must be between 2 and 50 characters',
          code: 'INVALID_NAME_LENGTH'
        });
      }
    }

    // Last name validation
    if (data.last_name) {
      if (!this.patterns.name.test(data.last_name)) {
        errors.push({
          field: 'last_name',
          message: 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods',
          code: 'INVALID_NAME_FORMAT'
        });
      }
      if (data.last_name.length < 2 || data.last_name.length > 50) {
        errors.push({
          field: 'last_name',
          message: 'Last name must be between 2 and 50 characters',
          code: 'INVALID_NAME_LENGTH'
        });
      }
    }

    // Middle name validation (optional)
    if (data.middle_name && data.middle_name.trim() !== '') {
      if (!this.patterns.name.test(data.middle_name)) {
        errors.push({
          field: 'middle_name',
          message: 'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods',
          code: 'INVALID_NAME_FORMAT'
        });
      }
      if (data.middle_name.length > 50) {
        errors.push({
          field: 'middle_name',
          message: 'Middle name cannot exceed 50 characters',
          code: 'INVALID_NAME_LENGTH'
        });
      }
    }

    // Generate full name for audit logs
    if (data.first_name && data.last_name) {
      data.gr_full_name = `${data.first_name} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name}`.trim();
    }

    // Gender validation
    if (data.gender && !this.validValues.genders.includes(data.gender.toLowerCase())) {
      errors.push({
        field: 'gender',
        message: `Gender must be one of: ${this.validValues.genders.join(', ')}`,
        code: 'INVALID_GENDER'
      });
    }

    // Student ID validation
    if (data.student_id) {
      if (!this.patterns.studentId.test(data.student_id)) {
        errors.push({
          field: 'student_id',
          message: 'Student ID must be 6-12 characters containing only letters and numbers',
          code: 'INVALID_STUDENT_ID_FORMAT'
        });
      }
    }
  }

  /**
   * Validate contact information
   */
  validateContactInfo(data, errors) {
    // Email validation (optional)
    if (data.email && data.email.trim() !== '') {
      if (!this.patterns.email.test(data.email)) {
        errors.push({
          field: 'email',
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL_FORMAT'
        });
      }
    }

    // Phone validation (optional)
    if (data.phone && data.phone.trim() !== '') {
      const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
      if (!this.patterns.phone.test(cleanPhone)) {
        errors.push({
          field: 'phone',
          message: 'Please enter a valid phone number',
          code: 'INVALID_PHONE_FORMAT'
        });
      }
    }
  }

  /**
   * Validate academic information
   */
  validateAcademicInfo(data, errors) {
    // Grade validation
    if (data.grade && !this.validValues.grades.includes(data.grade)) {
      errors.push({
        field: 'grade',
        message: `Grade must be one of: ${this.validValues.grades.join(', ')}`,
        code: 'INVALID_GRADE'
      });
    }

    // Class/Section validation (optional)
    if (data.section && data.section.trim() !== '') {
      if (data.section.length > 10) {
        errors.push({
          field: 'section',
          message: 'Section cannot exceed 10 characters',
          code: 'INVALID_SECTION_LENGTH'
        });
      }
    }

    // Roll number validation (optional)
    if (data.roll_number) {
      if (typeof data.roll_number !== 'number' || data.roll_number < 1 || data.roll_number > 999) {
        errors.push({
          field: 'roll_number',
          message: 'Roll number must be a number between 1 and 999',
          code: 'INVALID_ROLL_NUMBER'
        });
      }
    }
  }

  /**
   * Validate emergency contact information
   */
  validateEmergencyContact(data, errors) {
    // Emergency contact name
    if (data.emergency_contact_name) {
      if (!this.patterns.name.test(data.emergency_contact_name)) {
        errors.push({
          field: 'emergency_contact_name',
          message: 'Emergency contact name can only contain letters, spaces, hyphens, apostrophes, and periods',
          code: 'INVALID_EMERGENCY_NAME_FORMAT'
        });
      }
      if (data.emergency_contact_name.length < 2 || data.emergency_contact_name.length > 100) {
        errors.push({
          field: 'emergency_contact_name',
          message: 'Emergency contact name must be between 2 and 100 characters',
          code: 'INVALID_EMERGENCY_NAME_LENGTH'
        });
      }
    }

    // Emergency contact phone
    if (data.emergency_contact_phone) {
      const cleanPhone = data.emergency_contact_phone.replace(/[\s\-\(\)]/g, '');
      if (!this.patterns.emergencyPhone.test(cleanPhone)) {
        errors.push({
          field: 'emergency_contact_phone',
          message: 'Please enter a valid emergency contact phone number',
          code: 'INVALID_EMERGENCY_PHONE_FORMAT'
        });
      }
    }

    // Emergency contact relationship
    if (data.emergency_contact_relationship && 
        !this.validValues.relationships.includes(data.emergency_contact_relationship.toLowerCase())) {
      errors.push({
        field: 'emergency_contact_relationship',
        message: `Emergency contact relationship must be one of: ${this.validValues.relationships.join(', ')}`,
        code: 'INVALID_EMERGENCY_RELATIONSHIP'
      });
    }

    // Secondary emergency contact (optional)
    if (data.secondary_emergency_contact_phone && data.secondary_emergency_contact_phone.trim() !== '') {
      const cleanSecondaryPhone = data.secondary_emergency_contact_phone.replace(/[\s\-\(\)]/g, '');
      if (!this.patterns.emergencyPhone.test(cleanSecondaryPhone)) {
        errors.push({
          field: 'secondary_emergency_contact_phone',
          message: 'Please enter a valid secondary emergency contact phone number',
          code: 'INVALID_SECONDARY_EMERGENCY_PHONE_FORMAT'
        });
      }
    }
  }

  /**
   * Validate medical information
   */
  validateMedicalInfo(data, errors) {
    // Blood type validation (optional)
    if (data.blood_type && data.blood_type.trim() !== '') {
      if (!this.validValues.bloodTypes.includes(data.blood_type)) {
        errors.push({
          field: 'blood_type',
          message: `Blood type must be one of: ${this.validValues.bloodTypes.join(', ')}`,
          code: 'INVALID_BLOOD_TYPE'
        });
      }
    }

    // Allergies validation (optional)
    if (data.allergies && data.allergies.length > 500) {
      errors.push({
        field: 'allergies',
        message: 'Allergies description cannot exceed 500 characters',
        code: 'INVALID_ALLERGIES_LENGTH'
      });
    }

    // Medical conditions validation (optional)
    if (data.medical_conditions && data.medical_conditions.length > 500) {
      errors.push({
        field: 'medical_conditions',
        message: 'Medical conditions description cannot exceed 500 characters',
        code: 'INVALID_MEDICAL_CONDITIONS_LENGTH'
      });
    }
  }

  /**
   * Validate address information
   */
  validateAddress(data, errors) {
    // Street address validation (optional)
    if (data.address && data.address.length > 200) {
      errors.push({
        field: 'address',
        message: 'Address cannot exceed 200 characters',
        code: 'INVALID_ADDRESS_LENGTH'
      });
    }

    // City validation (optional)
    if (data.city && data.city.trim() !== '') {
      if (!this.patterns.name.test(data.city)) {
        errors.push({
          field: 'city',
          message: 'City name can only contain letters, spaces, hyphens, and apostrophes',
          code: 'INVALID_CITY_FORMAT'
        });
      }
      if (data.city.length > 50) {
        errors.push({
          field: 'city',
          message: 'City name cannot exceed 50 characters',
          code: 'INVALID_CITY_LENGTH'
        });
      }
    }

    // State validation (optional)
    if (data.state && data.state.trim() !== '') {
      if (data.state.length > 50) {
        errors.push({
          field: 'state',
          message: 'State name cannot exceed 50 characters',
          code: 'INVALID_STATE_LENGTH'
        });
      }
    }

    // Postal code validation (optional)
    if (data.postal_code && data.postal_code.trim() !== '') {
      if (!this.patterns.postalCode.test(data.postal_code)) {
        errors.push({
          field: 'postal_code',
          message: 'Please enter a valid postal code',
          code: 'INVALID_POSTAL_CODE_FORMAT'
        });
      }
    }

    // Country validation (optional)
    if (data.country && data.country.length > 50) {
      errors.push({
        field: 'country',
        message: 'Country name cannot exceed 50 characters',
        code: 'INVALID_COUNTRY_LENGTH'
      });
    }
  }

  /**
   * Validate date fields
   */
  validateDates(data, errors) {
    // Date of birth validation
    if (data.dob) {
      const dob = new Date(data.dob);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate()); // Max 25 years old
      const maxDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());  // Min 3 years old

      if (isNaN(dob.getTime())) {
        errors.push({
          field: 'dob',
          message: 'Please enter a valid date of birth',
          code: 'INVALID_DATE_FORMAT'
        });
      } else if (dob < minDate) {
        errors.push({
          field: 'dob',
          message: 'Student cannot be older than 25 years',
          code: 'INVALID_AGE_TOO_OLD'
        });
      } else if (dob > maxDate) {
        errors.push({
          field: 'dob',
          message: 'Student must be at least 3 years old',
          code: 'INVALID_AGE_TOO_YOUNG'
        });
      }
    }

    // Enrollment date validation (optional)
    if (data.enrollment_date) {
      const enrollmentDate = new Date(data.enrollment_date);
      const today = new Date();
      const maxEnrollmentDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      if (isNaN(enrollmentDate.getTime())) {
        errors.push({
          field: 'enrollment_date',
          message: 'Please enter a valid enrollment date',
          code: 'INVALID_ENROLLMENT_DATE_FORMAT'
        });
      } else if (enrollmentDate > maxEnrollmentDate) {
        errors.push({
          field: 'enrollment_date',
          message: 'Enrollment date cannot be more than 1 year in the future',
          code: 'INVALID_ENROLLMENT_DATE_FUTURE'
        });
      }
    }
  }

  /**
   * Validate business rules and cross-field validations
   */
  validateBusinessRules(data, errors) {
    // Age vs Grade consistency check
    if (data.dob && data.grade) {
      const age = this.calculateAge(data.dob);
      const expectedAgeRange = this.getExpectedAgeForGrade(data.grade);
      
      if (expectedAgeRange && (age < expectedAgeRange.min || age > expectedAgeRange.max)) {
        errors.push({
          field: 'grade',
          message: `Age ${age} is not typical for grade ${data.grade}. Expected age range: ${expectedAgeRange.min}-${expectedAgeRange.max} years`,
          code: 'AGE_GRADE_MISMATCH',
          severity: 'warning'
        });
      }
    }

    // Emergency contact phone should not be the same as student phone
    if (data.phone && data.emergency_contact_phone) {
      const studentPhone = data.phone.replace(/[\s\-\(\)]/g, '');
      const emergencyPhone = data.emergency_contact_phone.replace(/[\s\-\(\)]/g, '');
      
      if (studentPhone === emergencyPhone) {
        errors.push({
          field: 'emergency_contact_phone',
          message: 'Emergency contact phone number should be different from student phone number',
          code: 'DUPLICATE_PHONE_NUMBERS',
          severity: 'warning'
        });
      }
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get expected age range for a given grade
   */
  getExpectedAgeForGrade(grade) {
    const ageRanges = {
      'Pre-K': { min: 3, max: 4 },
      'K': { min: 4, max: 6 },
      '1': { min: 5, max: 7 },
      '2': { min: 6, max: 8 },
      '3': { min: 7, max: 9 },
      '4': { min: 8, max: 10 },
      '5': { min: 9, max: 11 },
      '6': { min: 10, max: 12 },
      '7': { min: 11, max: 13 },
      '8': { min: 12, max: 14 },
      '9': { min: 13, max: 15 },
      '10': { min: 14, max: 16 },
      '11': { min: 15, max: 17 },
      '12': { min: 16, max: 18 }
    };
    
    return ageRanges[grade];
  }

  /**
   * Format field name for error messages
   */
  formatFieldName(fieldName) {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validate partial data (for progressive forms)
   */
  validatePartial(studentData, fieldsToValidate = []) {
    const errors = [];
    
    // Only validate specified fields
    fieldsToValidate.forEach(field => {
      const tempData = { [field]: studentData[field] };
      const tempErrors = [];
      
      switch (field) {
        case 'first_name':
        case 'last_name':
        case 'middle_name':
          this.validatePersonalInfo(tempData, tempErrors);
          break;
        case 'email':
        case 'phone':
          this.validateContactInfo(tempData, tempErrors);
          break;
        case 'grade':
        case 'section':
        case 'roll_number':
          this.validateAcademicInfo(tempData, tempErrors);
          break;
        // Add more cases as needed
      }
      
      errors.push(...tempErrors);
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get validation rules for frontend
   */
  getValidationRules() {
    return {
      patterns: this.patterns,
      validValues: this.validValues,
      requiredFields: this.requiredFields
    };
  }
}