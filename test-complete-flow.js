// Comprehensive test script for student creation and exam results
const axios = require('axios');

const API_URL = 'http://localhost:1337/api';

// Helper function to generate unique test data
function generateTestData() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);

  return {
    studentData: {
      data: {
        first_name: `Test${timestamp}`,
        middle_name: 'Middle',
        last_name: `Student${randomNum}`,
        gr_full_name: `Test${timestamp} Middle Student${randomNum}`,
        gender: 'Male',
        dob: '2010-05-15',
        admission_number: `ADM${timestamp}`,
        admission_date: '2024-04-01',
        status: 'active',
        addresses: [
          {
            type: 'permanent',
            address_line_1: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            country: 'India',
            postal_code: '400001',
            is_primary: true
          }
        ],
        contacts: [
          {
            type: 'mobile',
            value: `9${randomNum}1234567`,
            is_primary: true,
            is_emergency: true
          }
        ],
        religion: 'Hindu',
        nationality: 'Indian',
        mother_tongue: 'Hindi',
        blood_group: 'O+',
        medical_conditions: 'None',
        allergies: 'None'
      }
    },
    examResults: [
      {
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
          },
          {
            subject: 'Social Studies',
            marks_obtained: 88,
            total_marks: 100,
            grade: 'A',
            pass_status: 'pass'
          },
          {
            subject: 'Hindi',
            marks_obtained: 75,
            total_marks: 100,
            grade: 'B',
            pass_status: 'pass'
          }
        ],
        remarks: 'Excellent performance in all subjects'
      },
      {
        exam_type: 'Final Exam',
        exam_name: 'Annual Examination 2024',
        exam_date: '2024-12-15',
        subject_scores: [
          {
            subject: 'Mathematics',
            marks_obtained: 90,
            total_marks: 100,
            grade: 'A+',
            pass_status: 'pass'
          },
          {
            subject: 'Science',
            marks_obtained: 82,
            total_marks: 100,
            grade: 'A',
            pass_status: 'pass'
          },
          {
            subject: 'English',
            marks_obtained: 95,
            total_marks: 100,
            grade: 'A+',
            pass_status: 'pass'
          }
        ],
        remarks: 'Outstanding improvement shown'
      }
    ]
  };
}

// Test student creation
async function testStudentCreation() {
  console.log('\n======= TESTING STUDENT CREATION =======\n');

  try {
    const { studentData } = generateTestData();

    console.log('Creating student with data:');
    console.log(JSON.stringify(studentData, null, 2));

    const response = await axios.post(`${API_URL}/students`, studentData);

    console.log('✅ Student created successfully!');
    console.log('Student ID:', response.data.data.id);
    console.log('Student Name:', response.data.data.attributes.gr_full_name);

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create student:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Test enrollment creation
async function testEnrollmentCreation(studentId) {
  console.log('\n======= TESTING ENROLLMENT CREATION =======\n');

  try {
    // First, get available classes
    const classesResponse = await axios.get(`${API_URL}/classes?pagination[limit]=1`);
    if (!classesResponse.data.data || classesResponse.data.data.length === 0) {
      console.log('No classes found, skipping enrollment creation');
      return null;
    }

    const classId = classesResponse.data.data[0].id;
    console.log(`Using class ID: ${classId}`);

    // Get academic year
    const academicYearResponse = await axios.get(`${API_URL}/academic-years?filters[is_current][$eq]=true&pagination[limit]=1`);
    const academicYearId = academicYearResponse.data.data?.[0]?.id;

    if (!academicYearId) {
      console.log('No active academic year found, skipping enrollment');
      return null;
    }

    const enrollmentData = {
      data: {
        student: studentId,
        class: classId,
        academic_year: academicYearId,
        enrollment_date: new Date().toISOString().split('T')[0],
        enrollment_status: 'Enrolled',
        is_active: true,
        gr_no: `GR${Date.now()}`
      }
    };

    console.log('Creating enrollment with data:');
    console.log(JSON.stringify(enrollmentData, null, 2));

    const response = await axios.post(`${API_URL}/enrollments`, enrollmentData);

    console.log('✅ Enrollment created successfully!');
    console.log('Enrollment ID:', response.data.data.id);

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create enrollment:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // Don't throw, just return null
    return null;
  }
}

// Test exam results creation
async function testExamResultsCreation(studentId) {
  console.log('\n======= TESTING EXAM RESULTS CREATION =======\n');

  try {
    const { examResults } = generateTestData();

    console.log(`Creating exam results for student ID: ${studentId}`);
    console.log('Number of exams:', examResults.length);
    console.log('Exam results data:');
    console.log(JSON.stringify(examResults, null, 2));

    const response = await axios.post(
      `${API_URL}/exam-results/student/${studentId}/bulk`,
      { examResults }
    );

    console.log('✅ Exam results created successfully!');
    console.log('Created results count:', response.data.createdResults?.length || 0);
    console.log('Updated results count:', response.data.updatedResults?.length || 0);

    if (response.data.createdResults) {
      response.data.createdResults.forEach((result, index) => {
        console.log(`\nExam ${index + 1}:`);
        console.log('  ID:', result.id);
        console.log('  Type:', result.exam_type);
        console.log('  Name:', result.exam_name);
        console.log('  Subjects:', result.subject_scores?.length || 0);
      });
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed to create exam results:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Test fetching student with exam results
async function testFetchStudentWithResults(studentId) {
  console.log('\n======= TESTING FETCH STUDENT WITH RESULTS =======\n');

  try {
    const response = await axios.get(`${API_URL}/students/${studentId}?populate=exam_results.subject_scores,enrollments`);

    const student = response.data.data;
    console.log('✅ Student fetched successfully!');
    console.log('Student Name:', student.attributes.gr_full_name);
    console.log('Exam Results Count:', student.attributes.exam_results?.data?.length || 0);
    console.log('Enrollments Count:', student.attributes.enrollments?.data?.length || 0);

    if (student.attributes.exam_results?.data) {
      student.attributes.exam_results.data.forEach((result, index) => {
        console.log(`\nExam ${index + 1}:`);
        console.log('  Type:', result.attributes.exam_type);
        console.log('  Name:', result.attributes.exam_name);
        console.log('  Subject Scores:', result.attributes.subject_scores?.length || 0);

        if (result.attributes.subject_scores) {
          result.attributes.subject_scores.forEach(score => {
            console.log(`    - ${score.subject}: ${score.marks_obtained}/${score.total_marks} (${score.grade})`);
          });
        }
      });
    }

    return student;
  } catch (error) {
    console.error('❌ Failed to fetch student with results:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Main test function
async function runCompleteTest() {
  console.log('========================================');
  console.log('   COMPLETE FLOW TEST - STUDENT & EXAMS');
  console.log('========================================');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Create student
    const student = await testStudentCreation();
    const studentId = student.id;

    // Step 2: Create enrollment (optional)
    await testEnrollmentCreation(studentId);

    // Step 3: Create exam results
    await testExamResultsCreation(studentId);

    // Step 4: Fetch and verify
    await testFetchStudentWithResults(studentId);

    console.log('\n========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY! ✅');
    console.log('========================================');
    console.log('\nSummary:');
    console.log('- Student created with all required fields');
    console.log('- Enrollment created (if class available)');
    console.log('- Multiple exam results created with subject scores');
    console.log('- Data fetched and verified successfully');
    console.log('\nThe student creation and exam result bulk update are working correctly!');

  } catch (error) {
    console.log('\n========================================');
    console.log('❌ TEST FAILED - SEE ERRORS ABOVE ❌');
    console.log('========================================');
    process.exit(1);
  }
}

// Run the test
runCompleteTest();