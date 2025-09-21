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
            data: processedData,
            populate: ['subject_scores', 'academic_year', 'class', 'student']
          });
          result.action = 'updated';
        } else {
          // Create new record
          result = await strapi.entityService.create('api::exam-result.exam-result', {
            data: processedData,
            populate: ['subject_scores', 'academic_year', 'class', 'student']
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
   * Validate exam data - handles both old and new structure
   */
  validateExamData(examData) {
    // Required for all exam results
    if (!examData.exam_type) {
      throw new Error('exam_type is required');
    }

    // Check if using new component structure
    if (examData.subject_scores && Array.isArray(examData.subject_scores)) {
      // Validate subject scores component
      if (examData.subject_scores.length === 0) {
        throw new Error('At least one subject score is required');
      }

      examData.subject_scores.forEach((score, index) => {
        if (!score.subject) {
          throw new Error(`Subject is required for score at index ${index}`);
        }
        if (score.marks_obtained === undefined || score.marks_obtained === null) {
          throw new Error(`marks_obtained is required for subject ${score.subject}`);
        }
        if (score.total_marks === undefined || score.total_marks === null || score.total_marks <= 0) {
          throw new Error(`total_marks must be positive for subject ${score.subject}`);
        }
        if (score.marks_obtained < 0) {
          throw new Error(`marks_obtained cannot be negative for subject ${score.subject}`);
        }
        if (score.marks_obtained > score.total_marks) {
          throw new Error(`marks_obtained cannot exceed total_marks for subject ${score.subject}`);
        }
      });
    } else if (examData.subject && examData.marks_obtained !== undefined && examData.total_marks !== undefined) {
      // Convert old single-subject structure to new format automatically
      strapi.log.info('Converting old single-subject format to new subject_scores component format');

      // Validate old format
      if (examData.marks_obtained < 0 || examData.total_marks <= 0) {
        throw new Error('Invalid marks: marks_obtained cannot be negative and total_marks must be positive');
      }

      if (examData.marks_obtained > examData.total_marks) {
        throw new Error('marks_obtained cannot be greater than total_marks');
      }

      // Convert to new format
      examData.subject_scores = [{
        subject: examData.subject,
        marks_obtained: examData.marks_obtained,
        total_marks: examData.total_marks,
        grade: examData.grade || null,
        pass_status: examData.pass_fail !== undefined ?
          (examData.pass_fail ? 'pass' : 'fail') : 'pending',
        remarks: ''
      }];

      // Remove old fields to prevent Strapi validation errors
      delete examData.subject;
      delete examData.marks_obtained;
      delete examData.total_marks;
      delete examData.grade;
      delete examData.pass_fail;
    } else {
      throw new Error('Either subject_scores array or subject/marks_obtained/total_marks fields are required');
    }
  },

  /**
   * Process and calculate derived fields for exam data
   */
  processExamData(studentId, examData) {
    // Note: At this point, validateExamData has already converted old format to new format
    // so examData.subject_scores should always exist

    const processedData = {
      student: studentId,
      exam_type: examData.exam_type,
      exam_name: examData.exam_name || null,
      exam_date: examData.exam_date || null,
      academic_year: examData.academic_year || null,
      class: examData.class || null,
      remarks: examData.remarks || null
    };

    // Process subject scores component (should always exist after validation)
    if (examData.subject_scores && Array.isArray(examData.subject_scores)) {
      processedData.subject_scores = examData.subject_scores.map(score => {
        const percentage = (score.marks_obtained / score.total_marks) * 100;
        const passingPercentage = 40;

        return {
          subject: score.subject,
          marks_obtained: score.marks_obtained,
          total_marks: score.total_marks,
          percentage: percentage,
          grade: score.grade || this.calculateGrade(percentage),
          pass_status: score.pass_status || (percentage >= passingPercentage ? 'pass' : 'fail'),
          remarks: score.remarks || ''
        };
      });

      // Calculate overall statistics
      const totalObtained = processedData.subject_scores.reduce((sum, s) => sum + s.marks_obtained, 0);
      const totalMaximum = processedData.subject_scores.reduce((sum, s) => sum + s.total_marks, 0);
      const overallPercentage = totalMaximum > 0 ? (totalObtained / totalMaximum * 100) : 0;

      processedData.total_obtained = totalObtained;
      processedData.total_maximum = totalMaximum;
      processedData.overall_percentage = overallPercentage;
      processedData.overall_grade = this.calculateGrade(overallPercentage);
      processedData.rank = examData.rank || null;
    } else {
      // This should not happen if validateExamData was called first
      throw new Error('subject_scores array is missing after validation');
    }

    return processedData;
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
   * Find existing exam result for the same student, exam type, and exam name/date
   */
  async findExistingResult(studentId, examData) {
    const filters = {
      student: studentId,
      exam_type: examData.exam_type
    };

    // For new structure, match by exam_name or exam_date if provided
    if (examData.exam_name) {
      filters.exam_name = examData.exam_name;
    } else if (examData.exam_date) {
      filters.exam_date = examData.exam_date;
    }

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
        populate: ['academic_year', 'class', 'subject_scores'],
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