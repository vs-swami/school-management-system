import { FeeDefinition, FeeAssignment } from '../../domain/models';

export class FeeMapper {
  // List conversion methods
  static definitionToDomainList(strapiDataArray) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => FeeMapper.definitionToDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => FeeMapper.definitionToDomain(item));
  }

  static assignmentToDomainList(strapiDataArray) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => FeeMapper.assignmentToDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => FeeMapper.assignmentToDomain(item));
  }
  static definitionToDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => FeeMapper.definitionToDomain(item));
    }

    // Handle both Strapi v4 (with attributes) and v5 (direct properties) response formats
    const data = strapiData.attributes || strapiData;

    // Map type - could be a relation object or just an ID
    let mappedType = null;
    if (data.type) {
      if (typeof data.type === 'object') {
        mappedType = FeeMapper.normalizeRelation(data.type);
      } else {
        // If it's just an ID, we'll need to fetch the type separately or use it as-is
        mappedType = data.type;
      }
    }

    return new FeeDefinition({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      name: data.name,
      type: mappedType,  // Use the mapped type
      base_amount: data.base_amount || data.baseAmount || 0,
      currency: data.currency || 'INR',
      frequency: data.frequency,
      calculation_method: data.calculation_method || data.calculationMethod || 'flat',
      metadata: data.metadata || {},
      installments: data.installments || [],
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static assignmentToDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => FeeMapper.assignmentToDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    // Map the fee object directly for easier access
    const feeData = FeeMapper.mapFeeDefinition(data.fee || data.feeDefinition);

    return {
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      fee: feeData,  // Store the fee object directly for UnifiedFeeManager
      feeDefinition: feeData,  // Keep for backward compatibility
      class: FeeMapper.mapClass(data.class),
      bus_stop: data.bus_stop ? FeeMapper.normalizeRelation(data.bus_stop) : null,
      bus_route: FeeMapper.mapBusRoute(data.bus_route || data.busRoute),
      student: FeeMapper.mapStudent(data.student),
      start_date: data.start_date || data.startDate,
      end_date: data.end_date || data.endDate,
      priority: data.priority || 10,
      conditions: data.conditions,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    };
  }

  static definitionToAPI(domainModel) {
    if (!domainModel) return null;

    console.log('FeeMapper.definitionToAPI - Input:', domainModel);

    // Extract and convert values
    let baseAmount = domainModel.base_amount || domainModel.baseAmount || 0;
    if (typeof baseAmount === 'string' && baseAmount !== '') {
      baseAmount = parseFloat(baseAmount) || 0;
    }

    let typeId = domainModel.type || domainModel.feeType?.id || domainModel.feeType;
    if (typeof typeId === 'string' && typeId !== '') {
      typeId = parseInt(typeId, 10);
    }

    // Build the API data object matching Strapi's fee-definition schema exactly
    const apiData = {
      name: domainModel.name || '',
      type: typeId || null, // relation to fee-type
      base_amount: baseAmount,
      currency: domainModel.currency || 'INR',
      frequency: domainModel.frequency || 'monthly',
      calculation_method: domainModel.calculation_method || 'flat',
      metadata: domainModel.metadata || {},
      installments: domainModel.installments || []
    };

    // Validate required fields
    if (!apiData.name) {
      console.error('FeeMapper.definitionToAPI - Missing required field: name');
    }
    if (!apiData.type) {
      console.error('FeeMapper.definitionToAPI - Missing required field: type (fee-type relation)');
    }

    // Ensure frequency is valid
    const validFrequencies = ['yearly', 'term', 'monthly', 'one_time'];
    if (!validFrequencies.includes(apiData.frequency)) {
      console.warn(`Invalid frequency "${apiData.frequency}", using "monthly"`);
      apiData.frequency = 'monthly';
    }

    // Ensure calculation_method is valid
    const validMethods = ['flat', 'per_unit', 'formula'];
    if (!validMethods.includes(apiData.calculation_method)) {
      apiData.calculation_method = 'flat';
    }

    console.log('FeeMapper.definitionToAPI - Output:', apiData);
    return apiData;
  }

  static assignmentToAPI(domainModel) {
    if (!domainModel) return null;

    console.log('FeeMapper.assignmentToAPI - Input:', domainModel);

    // Map to match actual Strapi fee-assignment schema
    const apiData = {
      fee: domainModel.fee || domainModel.feeDefinition?.id || domainModel.feeDefinition,
      class: domainModel.class?.id || domainModel.class || null,
      bus_route: domainModel.bus_route || domainModel.busRoute?.id || domainModel.busRoute || null,
      bus_stop: domainModel.bus_stop || domainModel.busStop?.id || domainModel.busStop || null,
      student: domainModel.student?.id || domainModel.student || null,
      start_date: domainModel.start_date || domainModel.startDate || null,
      end_date: domainModel.end_date || domainModel.endDate || null,
      priority: domainModel.priority !== undefined ? domainModel.priority : 10,
      conditions: domainModel.conditions || null
    };

    // Clean up null values except for required fields
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === null && key !== 'fee') {
        delete apiData[key];
      }
    });

    console.log('FeeMapper.assignmentToAPI - Output:', apiData);
    return apiData;
  }

  // Alias methods for backward compatibility
  static definitionToStrapi(domainModel) {
    return FeeMapper.definitionToAPI(domainModel);
  }

  static assignmentToStrapi(domainModel) {
    return FeeMapper.assignmentToAPI(domainModel);
  }

  static mapFeeType(feeType) {
    if (!feeType) return null;
    const normalized = FeeMapper.normalizeRelation(feeType);
    const type = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!type) return null;

    return {
      id: type.id,
      documentId: type.documentId,
      name: type.name,
      code: type.code,
      active: type.active !== undefined ? type.active : true
    };
  }

  static mapFeeDefinition(feeDefinition) {
    if (!feeDefinition) return null;
    const normalized = FeeMapper.normalizeRelation(feeDefinition);
    const def = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!def) return null;

    // Map fee type properly
    let feeType = null;
    if (def.type) {
      feeType = FeeMapper.normalizeRelation(def.type);
    } else if (def.fee_type) {
      feeType = FeeMapper.normalizeRelation(def.fee_type);
    } else if (def.feeType) {
      feeType = FeeMapper.normalizeRelation(def.feeType);
    }

    return {
      id: def.id,
      documentId: def.documentId,
      name: def.name,
      code: def.code,
      type: feeType,  // Include the full type object
      base_amount: def.base_amount || def.baseAmount || 0,  // Use snake_case for consistency
      frequency: def.frequency,
      calculation_method: def.calculation_method || def.calculationMethod,
      currency: def.currency || 'INR',
      metadata: def.metadata || {},
      installments: def.installments || []
    };
  }

  static mapClass(classData) {
    if (!classData) return null;
    const normalized = FeeMapper.normalizeRelation(classData);
    const cls = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!cls) return null;

    return {
      id: cls.id,
      documentId: cls.documentId,
      className: cls.classname || cls.className || cls.class_name
    };
  }

  static mapAcademicYear(academicYear) {
    if (!academicYear) return null;
    const normalized = FeeMapper.normalizeRelation(academicYear);
    const year = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!year) return null;

    return {
      id: year.id,
      documentId: year.documentId,
      year: year.year,
      startDate: year.start_date || year.startDate,
      endDate: year.end_date || year.endDate
    };
  }

  static mapClasses(classes) {
    if (!classes) return [];
    const normalized = FeeMapper.normalizeRelation(classes);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(cls => ({
      id: cls.id,
      documentId: cls.documentId,
      className: cls.classname || cls.className || cls.class_name
    }));
  }

  static mapStudent(student) {
    if (!student) return null;
    const normalized = FeeMapper.normalizeRelation(student);
    const s = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!s) return null;

    return {
      id: s.id,
      documentId: s.documentId,
      firstName: s.first_name || s.firstName,
      lastName: s.last_name || s.lastName,
      admissionNumber: s.admission_number || s.admissionNumber
    };
  }

  static mapBusRoute(busRoute) {
    if (!busRoute) return null;
    const normalized = FeeMapper.normalizeRelation(busRoute);
    const route = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!route) return null;

    return {
      id: route.id,
      documentId: route.documentId,
      name: route.name,
      routeNumber: route.route_number || route.routeNumber
    };
  }

  static mapStudents(students) {
    if (!students) return [];
    const normalized = FeeMapper.normalizeRelation(students);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(student => ({
      id: student.id,
      documentId: student.documentId,
      firstName: student.first_name || student.firstName,
      lastName: student.last_name || student.lastName,
      admissionNumber: student.admission_number || student.admissionNumber
    }));
  }

  static mapAssignments(assignments) {
    if (!assignments) return [];
    const normalized = FeeMapper.normalizeRelation(assignments);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(assignment => ({
      id: assignment.id,
      documentId: assignment.documentId,
      amount: assignment.amount,
      dueDate: assignment.due_date || assignment.dueDate
    }));
  }

  static mapExemptions(exemptions) {
    if (!exemptions) return [];
    if (!Array.isArray(exemptions)) return [];

    return exemptions.map(exemption => ({
      studentId: exemption.student_id || exemption.studentId,
      reason: exemption.reason,
      approvedBy: exemption.approved_by || exemption.approvedBy,
      approvedDate: exemption.approved_date || exemption.approvedDate
    }));
  }

  static normalizeRelation(relation) {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return relation;
  }
}