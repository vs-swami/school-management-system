'use strict';

/**
 * exam-result service
 * Best Practice Implementation
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::exam-result.exam-result', ({ strapi }) => ({
  
  /**
   * Create or update exam results in bulk for a student
   */
  async createOrUpdateBulk(studentId, examResults) {
    const results = [];
    
    try {
      // Validate student exists
      const student = await strapi.entityService.findOne('api::student.student', studentId);
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found`);
      }

      for (const examData of examResults) {
        // Validate required fields
        this.validateExamData(examData);

        // Process exam data with auto-calculations
        const processedData = this.processExamData(studentId, examData);

        // Check if exam result already exists
        const existingResult = await this.findExistingResult(studentId, examData);

        let result;
        if (existingResult) {
          // Update existing record
          result = await strapi.entityService.update('api::exam-result.exam-result', existingResult.id, {
            data: processedData
          });
          result.action = 'updated';
        } else {
          // Create new record
          result = await strapi.entityService.create('api::exam-result.exam-result', {
            data: processedData
          });
          result.action = 'created';
        }

        results.push(result);
      }

      return results;
    } catch (error) {
      strapi.log.error(`Error in createOrUpdateBulk: ${error.message}`);
      throw error;
    }
  },

  /**
   * Validate exam data
   */
  validateExamData(examData) {
    const requiredFields = ['exam_type', 'subject', 'marks_obtained', 'total_marks'];
    const missingFields = requiredFields.filter(field => 
      examData[field] === undefined || examData[field] === null
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (examData.marks_obtained < 0 || examData.total_marks <= 0) {
      throw new Error('Invalid marks: marks_obtained cannot be negative and total_marks must be positive');
    }

    if (examData.marks_obtained > examData.total_marks) {
      throw new Error('marks_obtained cannot be greater than total_marks');
    }
  },

  /**
   * Process and calculate derived fields for exam data
   */
  processExamData(studentId, examData) {
    const percentage = (examData.marks_obtained / examData.total_marks) * 100;
    const passingPercentage = 40; // Default passing percentage
    
    // Calculate grade if not provided
    let grade = examData.grade;
    if (!grade) {
      grade = this.calculateGrade(percentage);
    }

    // Calculate pass/fail if not provided
    let passFail = examData.pass_fail;
    if (passFail === undefined) {
      passFail = percentage >= passingPercentage;
    }

    return {
      student: studentId,
      exam_type: examData.exam_type,
      subject: examData.subject,
      marks_obtained: examData.marks_obtained,
      total_marks: examData.total_marks,
      grade,
      pass_fail: passFail,
      academic_year: examData.academic_year || null,
      class: examData.class || null
    };
  },

  /**
   * Calculate grade based on percentage
   */
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  },

  /**
   * Find existing exam result for the same student, exam type, and subject
   */
  async findExistingResult(studentId, examData) {
    const filters = {
      student: studentId,
      exam_type: examData.exam_type,
      subject: examData.subject
    };

    // Add optional filters if provided
    if (examData.academic_year) {
      filters.academic_year = examData.academic_year;
    }
    if (examData.class) {
      filters.class = examData.class;
    }

    const existingResults = await strapi.entityService.findMany('api::exam-result.exam-result', {
      filters,
      limit: 1
    });

    return existingResults && existingResults.length > 0 ? existingResults[0] : null;
  },

  /**
   * Get exam results for a student with optional filters
   */
  async getStudentResults(studentId, filters = {}) {
    try {
      const examResults = await strapi.entityService.findMany('api::exam-result.exam-result', {
        filters: {
          student: studentId,
          ...filters
        },
        populate: ['academic_year', 'class'],
        sort: { createdAt: 'desc' }
      });

      return examResults;
    } catch (error) {
      strapi.log.error(`Error getting student results: ${error.message}`);
      throw error;
    }
  },

  /**
   * Calculate overall performance for a student
   */
  async calculateOverallPerformance(studentId, academicYearId = null, classId = null) {
    try {
      const filters = {};
      if (academicYearId) filters.academic_year = academicYearId;
      if (classId) filters.class = classId;

      const results = await this.getStudentResults(studentId, filters);

      if (results.length === 0) {
        return {
          totalSubjects: 0,
          passedSubjects: 0,
          failedSubjects: 0,
          overallPercentage: 0,
          overallGrade: null,
          results: []
        };
      }

      // Calculate basic stats
      const passedSubjects = results.filter(result => result.pass_fail === true).length;
      const totalMarksObtained = results.reduce((sum, result) => sum + result.marks_obtained, 0);
      const totalMaxMarks = results.reduce((sum, result) => sum + result.total_marks, 0);
      const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

      // Calculate overall grade
      const overallGrade = this.calculateGrade(overallPercentage);

      // Group by subject for detailed analysis
      const subjectAnalysis = this.groupResultsBySubject(results);

      return {
        totalSubjects: results.length,
        passedSubjects,
        failedSubjects: results.length - passedSubjects,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        overallGrade,
        totalMarksObtained,
        totalMaxMarks,
        subjectAnalysis,
        results
      };
    } catch (error) {
      strapi.log.error(`Error calculating overall performance: ${error.message}`);
      throw error;
    }
  },

  /**
   * Group results by subject for analysis
   */
  groupResultsBySubject(results) {
    const grouped = results.reduce((acc, result) => {
      const subject = result.subject;
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          totalMarks: 0,
          totalMaxMarks: 0,
          examCount: 0,
          passedExams: 0,
          results: []
        };
      }
      
      acc[subject].totalMarks += result.marks_obtained;
      acc[subject].totalMaxMarks += result.total_marks;
      acc[subject].examCount += 1;
      if (result.pass_fail) acc[subject].passedExams += 1;
      acc[subject].results.push(result);
      
      return acc;
    }, {});

    // Calculate averages and grades for each subject
    return Object.values(grouped).map(group => ({
      ...group,
      averagePercentage: group.totalMaxMarks > 0 ? 
        Math.round((group.totalMarks / group.totalMaxMarks) * 10000) / 100 : 0,
      grade: group.totalMaxMarks > 0 ? 
        this.calculateGrade((group.totalMarks / group.totalMaxMarks) * 100) : 'N/A'
    }));
  }

}));