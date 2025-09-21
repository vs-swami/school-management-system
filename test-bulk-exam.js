// Test script for bulk exam results with new component structure

const testData = {
  studentId: 1, // Replace with actual student ID
  examResults: [
    {
      exam_type: "Unit Test 1",
      exam_name: "Mathematics Unit Test",
      exam_date: "2024-01-15",
      academic_year: 1, // Replace with actual academic year ID
      class: 1, // Replace with actual class ID
      subject_scores: [
        {
          subject: "Mathematics",
          marks_obtained: 85,
          total_marks: 100,
          remarks: "Good performance"
        },
        {
          subject: "Science",
          marks_obtained: 78,
          total_marks: 100,
          remarks: "Can improve"
        },
        {
          subject: "English",
          marks_obtained: 92,
          total_marks: 100,
          remarks: "Excellent"
        }
      ],
      remarks: "Overall good performance in Unit Test 1"
    },
    {
      exam_type: "Mid Term",
      exam_name: "Mid Term Examination",
      exam_date: "2024-03-10",
      academic_year: 1,
      class: 1,
      subject_scores: [
        {
          subject: "Mathematics",
          marks_obtained: 88,
          total_marks: 100
        },
        {
          subject: "Science",
          marks_obtained: 82,
          total_marks: 100
        },
        {
          subject: "English",
          marks_obtained: 95,
          total_marks: 100
        },
        {
          subject: "History",
          marks_obtained: 76,
          total_marks: 100
        },
        {
          subject: "Geography",
          marks_obtained: 80,
          total_marks: 100
        }
      ],
      remarks: "Excellent improvement in Mid Term"
    }
  ]
};

console.log("Test data for bulk exam results API:");
console.log(JSON.stringify(testData, null, 2));

console.log("\n\nTo test the API, run:");
console.log(`curl -X POST http://localhost:1337/api/exam-results/student/${testData.studentId}/bulk \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
console.log(`  -d '${JSON.stringify({ examResults: testData.examResults })}'`);

console.log("\n\nAlternatively, test with old single-subject format:");
const oldFormatData = {
  studentId: 1,
  examResults: [
    {
      exam_type: "Unit Test",
      subject: "Mathematics",
      marks_obtained: 85,
      total_marks: 100,
      academic_year: 1,
      class: 1
    }
  ]
};

console.log("\nOld format (backward compatible):");
console.log(JSON.stringify(oldFormatData, null, 2));