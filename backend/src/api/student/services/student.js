'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student.student', ({ strapi }) => ({
  // Repository Pattern Implementation
  async findWithRelations(params = {}) {
    const { filters, ...otherParams } = params;
    
    return await strapi.entityService.findMany('api::student.student', {
      ...otherParams,
      filters,
      populate: {
        place: true,
        caste: true,
        house: true,
        guardians: true,
        enrollments: {
          populate: {
            academic_year: true,
            division: true
          }
        }
      }
    });
  },

  async findOneWithRelations(id) {
    return await strapi.entityService.findOne('api::student.student', id, {
      populate: {
        place: true,
        caste: true,
        house: true,
        guardians: true,
        enrollments: {
          populate: {
            academic_year: true,
            division: true
          }
        },
        documents: true
      }
    });
  },

  async createWithGuardians(data) {
    const { guardians, ...studentData } = data;
    console.log('Creating student with data:', studentData);
    // Create student first
    const student = await strapi.entityService.create('api::student.student', {
      data: studentData
    });

    // Create guardians
    if (guardians && guardians.length > 0) {
      for (const guardianData of guardians) {
        await strapi.entityService.create('api::guardian.guardian', {
          data: {
            ...guardianData,
            student: student.id
          }
        });
      }
    }

    return await this.findOneWithRelations(student.id);
  },

  async getStatistics() {
    const totalStudents = await strapi.entityService.count('api::student.student');
    
    const genderStats = await strapi.db.connection.raw(`
      SELECT gender, COUNT(*) as count 
      FROM students 
      GROUP BY gender
    `);

    const houseStats = await strapi.db.connection.raw(`
      SELECT h.name, COUNT(s.id) as count
      FROM houses h
      LEFT JOIN students s ON h.id = s.house
      GROUP BY h.id, h.name
    `);

    return {
      total: totalStudents,
      byGender: genderStats.rows || [],
      byHouse: houseStats.rows || []
    };
  }
}));