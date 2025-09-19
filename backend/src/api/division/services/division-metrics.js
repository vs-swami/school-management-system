"use strict";

/**
 * Division Metrics Service
 * Calculates real metrics for divisions (Year 9A, Year 9B, etc.)
 * These are the actual class units in the school
 */

module.exports = {
  /**
   * Get comprehensive metrics for all divisions or a specific division
   */
  async getDivisionMetrics(divisionId = null) {
    try {
      // Build query filters
      const filters = divisionId ? { id: { $eq: divisionId } } : {};

      // Fetch divisions with all relations
      const divisions = await strapi.entityService.findMany("api::division.division", {
        filters,
        populate: {
          enrollments: {
            populate: {
              student: {
                populate: ["guardian", "place", "caste", "student_documents"],
              },
              academic_year: true,
              class: true,
              administration: {
                populate: ["house"],
              },
            },
          },
          class_thresholds: true,
        },
      });

      // Process each division
      const metricsData = {};

      for (const division of divisions) {
        const enrollments = division.enrollments || [];
        const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'Enrolled');

        // Extract class/year level from division name (e.g., "Year 9A" -> "Year 9")
        const yearLevel = this.extractYearLevel(division.name);

        metricsData[division.id] = {
          divisionInfo: {
            id: division.id,
            name: division.name,
            yearLevel: yearLevel,
            createdAt: division.createdAt,
            updatedAt: division.updatedAt,
            thresholds: division.class_thresholds || [],
          },
          enrollment: {
            total: activeEnrollments.length,
            all: enrollments.length,
            byStatus: this.countByStatus(enrollments),
          },
          students: this.getStudentDetails(activeEnrollments),
          demographics: {
            gender: this.calculateGenderDistribution(activeEnrollments),
            admissionTypes: this.calculateAdmissionTypes(activeEnrollments),
            transport: this.calculateTransportUsers(activeEnrollments),
            location: this.calculateLocationDistribution(activeEnrollments),
            caste: this.calculateCasteDistribution(activeEnrollments),
            age: this.calculateAgeDistribution(activeEnrollments),
          },
          academic: {
            houses: this.calculateHouseDistribution(activeEnrollments),
            academicYear: this.getAcademicYearInfo(activeEnrollments),
          },
          recentActivity: {
            newAdmissions: this.getRecentAdmissions(activeEnrollments),
            lastActivity: this.getLastActivity(enrollments),
          },
        };
      }

      return divisionId ? metricsData[divisionId] : metricsData;
    } catch (error) {
      console.error("Error calculating division metrics:", error);
      throw error;
    }
  },

  /**
   * Extract year level from division name
   */
  extractYearLevel(divisionName) {
    // Examples: "Year 9A" -> "Year 9", "Grade 10B" -> "Grade 10", "9A" -> "9"
    const match = divisionName.match(/^(.*?)([A-Z]?)$/);
    if (match) {
      return match[1].trim();
    }
    return divisionName;
  },

  /**
   * Count enrollments by status
   */
  countByStatus(enrollments) {
    return {
      Enrolled: enrollments.filter(e => e.enrollment_status === 'Enrolled').length,
      Enquiry: enrollments.filter(e => e.enrollment_status === 'Enquiry').length,
      Waiting: enrollments.filter(e => e.enrollment_status === 'Waiting').length,
      Processing: enrollments.filter(e => e.enrollment_status === 'Processing').length,
      Rejected: enrollments.filter(e => e.enrollment_status === 'Rejected').length,
    };
  },

  /**
   * Get detailed student information
   */
  getStudentDetails(enrollments) {
    return enrollments.map(enrollment => ({
      id: enrollment.student?.id,
      name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim(),
      grNo: enrollment.gr_no,
      gender: enrollment.student?.gender,
      dob: enrollment.student?.dob,
      enrollmentDate: enrollment.date_enrolled,
      admissionType: enrollment.admission_type,
      house: enrollment.administration?.house?.name,
      guardian: enrollment.student?.guardian ?
        `${enrollment.student.guardian.first_name || ''} ${enrollment.student.guardian.last_name || ''}`.trim() : null,
      contact: enrollment.student?.guardian?.phone_number,
    })).sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Calculate gender distribution with actual counts
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
      ratio: distribution.male > 0 && distribution.female > 0 ?
        `${distribution.male}:${distribution.female}` : 'N/A',
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
   * Calculate transport users
   */
  calculateTransportUsers(enrollments) {
    const transportEnrollments = enrollments.filter(e => e.admission_type === 'Transport');

    return {
      count: transportEnrollments.length,
      percentage: Math.round((transportEnrollments.length / (enrollments.length || 1)) * 100),
      students: transportEnrollments.map(e => ({
        name: `${e.student?.first_name || ''} ${e.student?.last_name || ''}`.trim(),
        grNo: e.gr_no,
      })),
    };
  },

  /**
   * Calculate house distribution
   */
  calculateHouseDistribution(enrollments) {
    const houses = {};

    enrollments.forEach(enrollment => {
      const houseName = enrollment.administration?.house?.name || "Unassigned";
      if (!houses[houseName]) {
        houses[houseName] = {
          count: 0,
          students: [],
        };
      }
      houses[houseName].count++;
      houses[houseName].students.push({
        name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim(),
        grNo: enrollment.gr_no,
      });
    });

    return houses;
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
      if (!locations[placeName]) {
        locations[placeName] = {
          count: 0,
          students: [],
        };
      }
      locations[placeName].count++;
      locations[placeName].students.push({
        name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim(),
        grNo: enrollment.gr_no,
      });
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
      if (!castes[casteName]) {
        castes[casteName] = {
          count: 0,
          percentage: 0,
        };
      }
      castes[casteName].count++;
    });

    // Calculate percentages
    const total = enrollments.length || 1;
    Object.keys(castes).forEach(caste => {
      castes[caste].percentage = Math.round((castes[caste].count / total) * 100);
    });

    return castes;
  },

  /**
   * Calculate age distribution
   */
  calculateAgeDistribution(enrollments) {
    const ageGroups = {
      'Under 5': 0,
      '5-7': 0,
      '8-10': 0,
      '11-13': 0,
      '14-16': 0,
      '17-18': 0,
      'Above 18': 0,
      'Unknown': 0,
    };

    enrollments.forEach(enrollment => {
      const dob = enrollment.student?.dob;
      if (!dob) {
        ageGroups['Unknown']++;
        return;
      }

      const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));

      if (age < 5) ageGroups['Under 5']++;
      else if (age <= 7) ageGroups['5-7']++;
      else if (age <= 10) ageGroups['8-10']++;
      else if (age <= 13) ageGroups['11-13']++;
      else if (age <= 16) ageGroups['14-16']++;
      else if (age <= 18) ageGroups['17-18']++;
      else ageGroups['Above 18']++;
    });

    return ageGroups;
  },

  /**
   * Get academic year information
   */
  getAcademicYearInfo(enrollments) {
    const academicYears = {};

    enrollments.forEach(enrollment => {
      const yearName = enrollment.academic_year?.year || "Unknown";
      if (!academicYears[yearName]) {
        academicYears[yearName] = {
          count: 0,
          startDate: enrollment.academic_year?.start_date,
          endDate: enrollment.academic_year?.end_date,
        };
      }
      academicYears[yearName].count++;
    });

    return academicYears;
  },

  /**
   * Get last activity in the division
   */
  getLastActivity(enrollments) {
    if (enrollments.length === 0) return null;

    const sorted = enrollments.sort((a, b) =>
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    const lastEnrollment = sorted[0];
    return {
      type: 'enrollment',
      status: lastEnrollment.enrollment_status,
      studentName: `${lastEnrollment.student?.first_name || ''} ${lastEnrollment.student?.last_name || ''}`.trim(),
      date: lastEnrollment.updatedAt || lastEnrollment.createdAt,
    };
  },

  /**
   * Get division comparison metrics for year groups
   */
  async getYearGroupComparison() {
    const allDivisions = await this.getDivisionMetrics();

    // Group divisions by year level
    const yearGroups = {};

    Object.values(allDivisions).forEach(division => {
      const yearLevel = division.divisionInfo.yearLevel;

      if (!yearGroups[yearLevel]) {
        yearGroups[yearLevel] = {
          yearLevel,
          divisions: [],
          totalStudents: 0,
          avgClassSize: 0,
          genderBalance: { male: 0, female: 0 },
          transportUsers: 0,
        };
      }

      yearGroups[yearLevel].divisions.push({
        name: division.divisionInfo.name,
        studentCount: division.enrollment.total,
        genderRatio: division.demographics.gender.ratio,
        transportPercentage: division.demographics.transport.percentage,
      });

      yearGroups[yearLevel].totalStudents += division.enrollment.total;
      yearGroups[yearLevel].genderBalance.male += division.demographics.gender.counts.male;
      yearGroups[yearLevel].genderBalance.female += division.demographics.gender.counts.female;
      yearGroups[yearLevel].transportUsers += division.demographics.transport.count;
    });

    // Calculate averages
    Object.values(yearGroups).forEach(group => {
      group.avgClassSize = Math.round(group.totalStudents / group.divisions.length);
      group.genderRatio = group.genderBalance.male > 0 && group.genderBalance.female > 0 ?
        `${group.genderBalance.male}:${group.genderBalance.female}` : 'N/A';
      group.transportPercentage = group.totalStudents > 0 ?
        Math.round((group.transportUsers / group.totalStudents) * 100) : 0;
    });

    return yearGroups;
  },
};