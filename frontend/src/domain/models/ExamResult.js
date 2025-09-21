export class ExamResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.student = data.student || null;
    this.examType = data.exam_type || data.examType || '';
    this.examName = data.exam_name || data.examName || '';
    this.examDate = data.exam_date || data.examDate || null;
    this.academicYear = data.academic_year || data.academicYear || null;
    this.class = data.class || null;
    this.remarks = data.remarks || '';
    this.rank = data.rank || null;

    // Handle subject_scores component structure
    this.subjectScores = this.transformSubjectScores(data.subject_scores || data.subjectScores || []);

    // Overall stats
    this.totalObtained = data.total_obtained || data.totalObtained || 0;
    this.totalMaximum = data.total_maximum || data.totalMaximum || 0;
    this.overallPercentage = data.overall_percentage || data.overallPercentage || 0;
    this.overallGrade = data.overall_grade || data.overallGrade || '';
    this.passStatus = data.pass_status || data.passStatus || 'pending';

    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;

    // Calculate stats if subject scores are provided
    if (this.subjectScores.length > 0 && !this.totalObtained) {
      this.calculateStats();
    }
  }

  transformSubjectScores(scores) {
    if (!scores || !Array.isArray(scores)) return [];

    return scores.map(score => ({
      id: score.id,
      subject: score.subject,
      marksObtained: score.marks_obtained || score.marksObtained || 0,
      totalMarks: score.total_marks || score.totalMarks || 0,
      grade: score.grade || '',
      passStatus: score.pass_status || score.passStatus || 'pending',
      percentage: score.percentage ||
        (score.total_marks > 0 ?
          ((score.marks_obtained || 0) / score.total_marks * 100).toFixed(2) : 0),
      remarks: score.remarks || ''
    }));
  }

  calculateStats() {
    if (!this.subjectScores || this.subjectScores.length === 0) {
      this.totalObtained = 0;
      this.totalMaximum = 0;
      this.overallPercentage = 0;
      this.overallGrade = '';
      this.passStatus = 'pending';
      return;
    }

    this.totalObtained = this.subjectScores.reduce((sum, s) => sum + (s.marksObtained || 0), 0);
    this.totalMaximum = this.subjectScores.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
    this.overallPercentage = this.totalMaximum > 0 ?
      parseFloat((this.totalObtained / this.totalMaximum * 100).toFixed(2)) : 0;

    // Calculate grade
    if (this.overallPercentage >= 90) this.overallGrade = 'A+';
    else if (this.overallPercentage >= 80) this.overallGrade = 'A';
    else if (this.overallPercentage >= 70) this.overallGrade = 'B+';
    else if (this.overallPercentage >= 60) this.overallGrade = 'B';
    else if (this.overallPercentage >= 50) this.overallGrade = 'C';
    else if (this.overallPercentage >= 40) this.overallGrade = 'D';
    else this.overallGrade = 'F';

    // Determine pass status
    const failedSubjects = this.subjectScores.filter(s => s.passStatus === 'fail').length;
    const passedSubjects = this.subjectScores.filter(s => s.passStatus === 'pass').length;

    this.passStatus = failedSubjects === 0 && passedSubjects === this.subjectScores.length ? 'pass' :
                      failedSubjects > 0 ? 'fail' : 'pending';
  }

  get percentage() {
    return this.overallPercentage || 0;
  }

  get isPassing() {
    return this.passStatus === 'pass';
  }

  get gradePoint() {
    const percentage = this.overallPercentage;
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 40) return 5;
    return 0;
  }

  get status() {
    return this.passStatus;
  }

  get studentName() {
    if (this.student) {
      return `${this.student.first_name || this.student.firstName || ''} ${this.student.last_name || this.student.lastName || ''}`.trim();
    }
    return '';
  }

  get className() {
    return this.class?.class_name || this.class?.className || '';
  }

  hasGrade() {
    return this.overallGrade && this.overallGrade.length > 0;
  }

  hasRemarks() {
    return this.remarks && this.remarks.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      student: this.student,
      examType: this.examType,
      examName: this.examName,
      examDate: this.examDate,
      academicYear: this.academicYear,
      class: this.class,
      remarks: this.remarks,
      rank: this.rank,
      subjectScores: this.subjectScores,
      totalObtained: this.totalObtained,
      totalMaximum: this.totalMaximum,
      overallPercentage: this.overallPercentage,
      overallGrade: this.overallGrade,
      passStatus: this.passStatus,
      percentage: this.percentage,
      isPassing: this.isPassing,
      gradePoint: this.gradePoint,
      status: this.status,
      studentName: this.studentName,
      className: this.className,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Static factory method for API responses
  static fromApiResponse(data) {
    return new ExamResult(data);
  }

  // Convert to API format for submission
  toApiFormat() {
    const data = {
      exam_type: this.examType,
      exam_name: this.examName,
      exam_date: this.examDate,
      subject_scores: this.subjectScores.map(score => ({
        subject: score.subject,
        marks_obtained: score.marksObtained,
        total_marks: score.totalMarks,
        grade: score.grade || '',
        percentage: score.percentage || 0,
        remarks: score.remarks || ''
      })),
      total_obtained: this.totalObtained,
      total_maximum: this.totalMaximum,
      overall_percentage: this.overallPercentage,
      overall_grade: this.overallGrade,
      rank: this.rank,
      remarks: this.remarks
    };

    // Add relations if present
    if (this.student) {
      data.student = this.student?.id || this.student;
    }
    if (this.academicYear) {
      data.academic_year = this.academicYear?.id || this.academicYear;
    }
    if (this.class) {
      data.class = this.class?.id || this.class;
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }
}