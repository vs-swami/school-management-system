"use strict";

/**
 * Class Metrics Service
 * Calculates various metrics for classes using existing data
 */

module.exports = {
  /**
   * Get comprehensive metrics for all classes
   */
  async getClassMetrics(classId = null) {
    const strapi = require("@strapi/strapi").strapi;

    try {
      // Build query filters
      const filters = classId ? { id: { $eq: classId } } : {};

      // Fetch classes with all relations
      const classes = await strapi.entityService.findMany("api::class.class", {
        filters,
        populate: {
          enrollments: {
            populate: {
              student: {
                populate: ["guardian", "place", "caste"],
              },
              academic_year: true,
              administration: {
                populate: ["division", "house"],
              },
            },
          },
          fee_assignments: {
            populate: {
              fee: {
                populate: ["type", "installments"],
              },
            },
          },
          class_thresholds: true,
        },
      });

      // Process each class
      const metricsData = {};

      for (const cls of classes) {
        const enrollments = cls.enrollments || [];
        const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'Enrolled');

        // Calculate student metrics
        const totalStudents = activeEnrollments.length;
        const genderDistribution = this.calculateGenderDistribution(activeEnrollments);
        const admissionTypeDistribution = this.calculateAdmissionTypes(activeEnrollments);
        const divisionBreakdown = this.calculateDivisionBreakdown(activeEnrollments);
        const transportUsers = this.calculateTransportUsers(activeEnrollments);
        const recentAdmissions = this.getRecentAdmissions(activeEnrollments);
        const locationDistribution = this.calculateLocationDistribution(activeEnrollments);
        const casteDistribution = this.calculateCasteDistribution(activeEnrollments);

        // Calculate fee metrics
        const feeMetrics = await this.calculateFeeMetrics(cls, activeEnrollments);

        metricsData[cls.id] = {
          classInfo: {
            id: cls.id,
            name: cls.classname,
            createdAt: cls.createdAt,
            updatedAt: cls.updatedAt,
            thresholds: cls.class_thresholds || [],
          },
          enrollment: {
            total: totalStudents,
            active: activeEnrollments.length,
            pending: enrollments.filter(e => e.enrollment_status === 'Processing').length,
            rejected: enrollments.filter(e => e.enrollment_status === 'Rejected').length,
            enquiry: enrollments.filter(e => e.enrollment_status === 'Enquiry').length,
            waiting: enrollments.filter(e => e.enrollment_status === 'Waiting').length,
          },
          demographics: {
            gender: genderDistribution,
            admissionTypes: admissionTypeDistribution,
            transport: transportUsers,
            location: locationDistribution,
            caste: casteDistribution,
          },
          divisions: divisionBreakdown,
          recentActivity: {
            newAdmissions: recentAdmissions,
            lastUpdated: cls.updatedAt,
          },
          fees: feeMetrics,
        };
      }

      return classId ? metricsData[classId] : metricsData;
    } catch (error) {
      console.error("Error calculating class metrics:", error);
      throw error;
    }
  },

  /**
   * Calculate gender distribution
   */
  calculateGenderDistribution(enrollments) {
    const distribution = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0,
    };

    enrollments.forEach(enrollment => {
      const gender = enrollment.student?.gender?.toLowerCase();
      if (gender === 'male' || gender === 'm') distribution.male++;
      else if (gender === 'female' || gender === 'f') distribution.female++;
      else if (gender === 'other') distribution.other++;
      else distribution.notSpecified++;
    });

    const total = enrollments.length || 1;
    return {
      counts: distribution,
      percentages: {
        male: Math.round((distribution.male / total) * 100),
        female: Math.round((distribution.female / total) * 100),
        other: Math.round((distribution.other / total) * 100),
        notSpecified: Math.round((distribution.notSpecified / total) * 100),
      },
    };
  },

  /**
   * Calculate admission type distribution
   */
  calculateAdmissionTypes(enrollments) {
    const types = {
      Transport: 0,
      Hostel: 0,
      Self: 0,
      "Tuition Only": 0,
    };

    enrollments.forEach(enrollment => {
      const type = enrollment.admission_type;
      if (types.hasOwnProperty(type)) {
        types[type]++;
      }
    });

    return types;
  },

  /**
   * Calculate division breakdown
   */
  calculateDivisionBreakdown(enrollments) {
    const divisions = {};

    enrollments.forEach(enrollment => {
      const divisionName = enrollment.administration?.division?.name || "Unassigned";

      if (!divisions[divisionName]) {
        divisions[divisionName] = {
          count: 0,
          students: [],
          houses: {},
        };
      }

      divisions[divisionName].count++;
      divisions[divisionName].students.push({
        id: enrollment.student?.id,
        name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim(),
        grNo: enrollment.gr_no,
        gender: enrollment.student?.gender,
      });

      // Track house distribution
      const houseName = enrollment.administration?.house?.name;
      if (houseName) {
        divisions[divisionName].houses[houseName] =
          (divisions[divisionName].houses[houseName] || 0) + 1;
      }
    });

    return divisions;
  },

  /**
   * Calculate transport users
   */
  calculateTransportUsers(enrollments) {
    const transportEnrollments = enrollments.filter(e => e.admission_type === 'Transport');

    return {
      count: transportEnrollments.length,
      percentage: Math.round((transportEnrollments.length / (enrollments.length || 1)) * 100),
    };
  },

  /**
   * Get recent admissions (last 30 days)
   */
  getRecentAdmissions(enrollments) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return enrollments
      .filter(e => new Date(e.date_enrolled) >= thirtyDaysAgo)
      .map(e => ({
        studentName: `${e.student?.first_name || ''} ${e.student?.last_name || ''}`.trim(),
        grNo: e.gr_no,
        enrollmentDate: e.date_enrolled,
        daysSince: Math.floor((new Date() - new Date(e.date_enrolled)) / (1000 * 60 * 60 * 24)),
        admissionType: e.admission_type,
      }))
      .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
  },

  /**
   * Calculate location distribution
   */
  calculateLocationDistribution(enrollments) {
    const locations = {};

    enrollments.forEach(enrollment => {
      const placeName = enrollment.student?.place?.name || "Not Specified";
      locations[placeName] = (locations[placeName] || 0) + 1;
    });

    return locations;
  },

  /**
   * Calculate caste distribution
   */
  calculateCasteDistribution(enrollments) {
    const castes = {};

    enrollments.forEach(enrollment => {
      const casteName = enrollment.student?.caste?.name || "Not Specified";
      castes[casteName] = (castes[casteName] || 0) + 1;
    });

    return castes;
  },

  /**
   * Calculate fee metrics for a class
   */
  async calculateFeeMetrics(cls, enrollments) {
    const feeAssignments = cls.fee_assignments || [];

    let totalYearlyFees = 0;
    let totalMonthlyFees = 0;
    const feeTypes = {};

    feeAssignments.forEach(assignment => {
      const fee = assignment.fee;
      if (fee) {
        const baseAmount = parseFloat(fee.base_amount) || 0;
        const feeTypeName = fee.type?.name || "Other";

        // Calculate based on fee frequency
        if (fee.frequency === 'yearly') {
          totalYearlyFees += baseAmount;
        } else if (fee.frequency === 'monthly') {
          totalMonthlyFees += baseAmount;
          totalYearlyFees += baseAmount * 12;
        } else if (fee.frequency === 'quarterly') {
          totalYearlyFees += baseAmount * 4;
        }

        // Group by fee type
        if (!feeTypes[feeTypeName]) {
          feeTypes[feeTypeName] = {
            count: 0,
            totalAmount: 0,
          };
        }
        feeTypes[feeTypeName].count++;
        feeTypes[feeTypeName].totalAmount += baseAmount;
      }
    });

    return {
      assignedFees: feeAssignments.length,
      totalYearlyFees,
      totalMonthlyFees,
      potentialRevenue: totalYearlyFees * enrollments.length,
      feeTypes,
      averageFeePerStudent: enrollments.length > 0 ? Math.round(totalYearlyFees) : 0,
    };
  },

  /**
   * Get summary statistics across all classes
   */
  async getSummaryStatistics() {
    const allMetrics = await this.getClassMetrics();

    let totalStudents = 0;
    let totalClasses = Object.keys(allMetrics).length;
    let totalDivisions = new Set();
    let totalTransportUsers = 0;
    let totalPotentialRevenue = 0;

    Object.values(allMetrics).forEach(metrics => {
      totalStudents += metrics.enrollment.total;
      totalTransportUsers += metrics.demographics.transport.count;
      totalPotentialRevenue += metrics.fees.potentialRevenue;

      Object.keys(metrics.divisions).forEach(div => totalDivisions.add(div));
    });

    return {
      totalClasses,
      totalStudents,
      totalDivisions: totalDivisions.size,
      totalTransportUsers,
      totalPotentialRevenue,
      averageClassSize: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      transportUsageRate: totalStudents > 0 ? Math.round((totalTransportUsers / totalStudents) * 100) : 0,
    };
  },
};