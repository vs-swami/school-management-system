// Test script to verify bulk exam results work with both old and new formats

// Test 1: New multi-subject format
const newFormatData = {
  exam_type: "Unit Test 1",
  exam_name: "First Unit Test",
  exam_date: "2024-01-15",
  subject_scores: [
    {
      subject: "Mathematics",
      marks_obtained: 85,
      total_marks: 100
    },
    {
      subject: "Science",
      marks_obtained: 78,
      total_marks: 100
    }
  ]
};

// Test 2: Old single-subject format (should be auto-converted)
const oldFormatData = {
  exam_type: "Unit Test 2",
  subject: "English",
  marks_obtained: 92,
  total_marks: 100,
  grade: "A+"
};

// Test 3: Mixed format batch
const batchData = {
  studentId: 1, // Replace with actual student ID
  examResults: [
    // New format
    {
      exam_type: "Mid Term",
      exam_name: "Mid Term Examination",
      exam_date: "2024-03-10",
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
        }
      ]
    },
    // Old format (will be auto-converted)
    {
      exam_type: "Quiz 1",
      subject: "History",
      marks_obtained: 76,
      total_marks: 100
    }
  ]
};

console.log("=== Test Data for Fixed Bulk Exam Results ===\n");

console.log("1. New Multi-Subject Format:");
console.log(JSON.stringify(newFormatData, null, 2));

console.log("\n2. Old Single-Subject Format (auto-converted):");
console.log(JSON.stringify(oldFormatData, null, 2));

console.log("\n3. Mixed Batch (both formats):");
console.log(JSON.stringify(batchData, null, 2));

console.log("\n=== Expected Behavior ===");
console.log("- Old format will be automatically converted to new subject_scores array");
console.log("- No 'Invalid key subject' error should occur");
console.log("- All data will be saved with the new component structure");

console.log("\n=== API Call Example ===");
console.log(`curl -X POST http://localhost:1337/api/exam-results/student/1/bulk \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
console.log(`  -d '${JSON.stringify({ examResults: batchData.examResults })}'`);