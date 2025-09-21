// Test script to verify exam result creation
const axios = require('axios');

const API_URL = 'http://localhost:1337/api';

// Test data for exam result creation
async function testExamResult() {
  try {
    console.log('Testing exam result creation...');

    // Get the first student ID for testing
    const studentsResponse = await axios.get(`${API_URL}/students?pagination[limit]=1`);
    if (!studentsResponse.data.data || studentsResponse.data.data.length === 0) {
      console.error('No students found in the system');
      return;
    }

    const studentId = studentsResponse.data.data[0].id;
    console.log(`Using student ID: ${studentId}`);

    // Create test exam result with new component structure
    const examResultData = {
      exam_type: 'Unit Test',
      exam_name: 'Mid-Term Test 2024',
      exam_date: '2024-10-15',
      subject_scores: [
        {
          subject: 'Mathematics',
          marks_obtained: 85,
          total_marks: 100,
          grade: 'A',
          pass_status: 'pass'
        },
        {
          subject: 'Science',
          marks_obtained: 78,
          total_marks: 100,
          grade: 'B+',
          pass_status: 'pass'
        },
        {
          subject: 'English',
          marks_obtained: 92,
          total_marks: 100,
          grade: 'A+',
          pass_status: 'pass'
        }
      ],
      remarks: 'Good performance overall'
    };

    console.log('Sending exam result data:', JSON.stringify(examResultData, null, 2));

    // Call the bulk create endpoint
    const response = await axios.post(
      `${API_URL}/exam-results/student/${studentId}/bulk`,
      { examResults: [examResultData] }
    );

    console.log('Success! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing exam result:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testExamResult();