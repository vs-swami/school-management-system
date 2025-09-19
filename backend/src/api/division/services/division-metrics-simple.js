"use strict";

/**
 * Simple Division Metrics Service
 * Gets metrics based on actual database structure
 */

module.exports = {
  /**
   * Get metrics for divisions
   */
  async getMetrics(divisionId = null) {
    try {
      // Get divisions
      const divisionFilters = divisionId ? { id: { $eq: divisionId } } : {};
      const divisions = await strapi.entityService.findMany("api::division.division", {
        filters: divisionFilters,
      });

      // Get all enrollments with their administration data
      const enrollments = await strapi.entityService.findMany("api::enrollment.enrollment", {
        filters: {
          enrollment_status: "Enrolled"
        },
        populate: {
          student: true,
          administration: {
            populate: {
              division: true
            }
          },
          class: true
        }
      });

      // Build metrics for each division
      const metricsData = {};

      for (const division of divisions) {
        // Filter enrollments for this division
        const divisionEnrollments = enrollments.filter(
          e => e.administration?.division?.id === division.id
        );

        // Calculate metrics
        const totalStudents = divisionEnrollments.length;
        let maleCount = 0;
        let femaleCount = 0;
        let transportCount = 0;

        divisionEnrollments.forEach(enrollment => {
          // Gender count
          const gender = enrollment.student?.gender?.toLowerCase();
          if (gender === 'male' || gender === 'm') maleCount++;
          else if (gender === 'female' || gender === 'f') femaleCount++;

          // Transport count
          if (enrollment.admission_type === 'Transport') transportCount++;
        });

        metricsData[division.id] = {
          divisionInfo: {
            id: division.id,
            name: division.name,
            createdAt: division.createdAt,
            updatedAt: division.updatedAt
          },
          enrollment: {
            total: totalStudents
          },
          demographics: {
            gender: {
              counts: {
                male: maleCount,
                female: femaleCount
              },
              percentages: {
                male: totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0,
                female: totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 0
              },
              ratio: maleCount > 0 && femaleCount > 0 ? `${maleCount}:${femaleCount}` : 'N/A'
            },
            transport: {
              count: transportCount,
              percentage: totalStudents > 0 ? Math.round((transportCount / totalStudents) * 100) : 0
            }
          },
          recentActivity: {
            newAdmissions: []
          },
          academic: {
            houses: {}
          }
        };
      }

      return divisionId ? metricsData[divisionId] : metricsData;
    } catch (error) {
      console.error("Error calculating division metrics:", error);
      throw error;
    }
  },

  /**
   * Get year group comparison
   */
  async getYearGroupComparison() {
    try {
      const allMetrics = await this.getMetrics();

      // Group by year level (extract from division name)
      const yearGroups = {};

      Object.values(allMetrics).forEach(metrics => {
        // Extract year level from name (e.g., "9A" -> "9", "Year 9A" -> "Year 9")
        const name = metrics.divisionInfo.name;
        const match = name.match(/^(.*?)([A-Z]?)$/);
        const yearLevel = match ? match[1].trim() : name;

        if (!yearGroups[yearLevel]) {
          yearGroups[yearLevel] = {
            yearLevel,
            divisions: [],
            totalStudents: 0,
            avgClassSize: 0,
            genderBalance: { male: 0, female: 0 },
            transportUsers: 0
          };
        }

        yearGroups[yearLevel].divisions.push({
          name: metrics.divisionInfo.name,
          studentCount: metrics.enrollment.total,
          genderRatio: metrics.demographics.gender.ratio,
          transportPercentage: metrics.demographics.transport.percentage
        });

        yearGroups[yearLevel].totalStudents += metrics.enrollment.total;
        yearGroups[yearLevel].genderBalance.male += metrics.demographics.gender.counts.male;
        yearGroups[yearLevel].genderBalance.female += metrics.demographics.gender.counts.female;
        yearGroups[yearLevel].transportUsers += metrics.demographics.transport.count;
      });

      // Calculate averages
      Object.values(yearGroups).forEach(group => {
        group.avgClassSize = group.divisions.length > 0
          ? Math.round(group.totalStudents / group.divisions.length)
          : 0;
        group.genderRatio = group.genderBalance.male > 0 && group.genderBalance.female > 0
          ? `${group.genderBalance.male}:${group.genderBalance.female}`
          : 'N/A';
        group.transportPercentage = group.totalStudents > 0
          ? Math.round((group.transportUsers / group.totalStudents) * 100)
          : 0;
      });

      return yearGroups;
    } catch (error) {
      console.error("Error calculating year group comparison:", error);
      throw error;
    }
  }
};