const axios = require('axios');

const API_URL = 'http://localhost:1337/api';

async function testDivisionUniqueness() {
  console.log('Testing Division Uniqueness Constraint...\n');

  try {
    // Step 1: Get existing classes
    console.log('Step 1: Fetching existing classes...');
    const classesResponse = await axios.get(`${API_URL}/classes`);
    const classes = classesResponse.data.data;

    if (classes.length < 2) {
      console.log('Need at least 2 classes to test. Creating test classes...');

      // Create Class 1
      const class1Response = await axios.post(`${API_URL}/classes`, {
        data: {
          name: 'Class 1',
          description: 'First Grade'
        }
      });

      // Create Class 2
      const class2Response = await axios.post(`${API_URL}/classes`, {
        data: {
          name: 'Class 2',
          description: 'Second Grade'
        }
      });

      classes.push(class1Response.data.data);
      classes.push(class2Response.data.data);
    }

    const class1 = classes[0];
    const class2 = classes[1];

    console.log(`Using Class 1: ${class1.name} (ID: ${class1.id})`);
    console.log(`Using Class 2: ${class2.name} (ID: ${class2.id})\n`);

    // Step 2: Create a division in Class 1
    console.log('Step 2: Creating division "1A" in Class 1...');
    try {
      const division1Response = await axios.post(`${API_URL}/divisions`, {
        data: {
          name: '1A',
          class: class1.id
        }
      });
      console.log('✅ Successfully created division "1A" in Class 1');
      console.log(`Division ID: ${division1Response.data.data.id}\n`);
    } catch (error) {
      if (error.response?.data?.error?.message?.includes('already in use') ||
          error.response?.data?.error?.message?.includes('already exists') ||
          error.response?.data?.error?.message?.includes('must be unique')) {
        console.log('⚠️  Division "1A" already exists. Continuing with test...\n');
      } else {
        throw error;
      }
    }

    // Step 3: Try to create the same division name in Class 2 (should fail)
    console.log('Step 3: Attempting to create division "1A" in Class 2...');
    console.log('This should fail due to uniqueness constraint...');

    try {
      await axios.post(`${API_URL}/divisions`, {
        data: {
          name: '1A',
          class: class2.id
        }
      });

      console.log('❌ ERROR: Division was created! Uniqueness constraint is NOT working!');
      return false;
    } catch (error) {
      if (error.response?.data?.error?.message?.includes('already in use') ||
          error.response?.data?.error?.message?.includes('already exists') ||
          error.response?.data?.error?.message?.includes('must be unique')) {
        console.log('✅ SUCCESS: Division creation failed as expected!');
        console.log(`Error message: "${error.response.data.error.message}"\n`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }

    // Step 4: Create a different division name in Class 2 (should succeed)
    console.log('Step 4: Creating division "2A" in Class 2...');
    console.log('This should succeed as the name is unique...');

    try {
      const division2Response = await axios.post(`${API_URL}/divisions`, {
        data: {
          name: '2A',
          class: class2.id
        }
      });
      console.log('✅ Successfully created division "2A" in Class 2');
      console.log(`Division ID: ${division2Response.data.data.id}\n`);
    } catch (error) {
      if (error.response?.data?.error?.message?.includes('already in use')) {
        console.log('⚠️  Division "2A" already exists. Test still passed.\n');
      } else {
        console.log('❌ Failed to create unique division:', error.response?.data || error.message);
        return false;
      }
    }

    // Step 5: Test updating a division to a name that already exists
    console.log('Step 5: Testing update validation...');

    // Get all divisions
    const divisionsResponse = await axios.get(`${API_URL}/divisions?populate=class`);
    const divisions = divisionsResponse.data.data;

    const division2A = divisions.find(d => d.attributes?.name === '2A' || d.name === '2A');

    if (division2A) {
      console.log(`Attempting to update division "2A" to "1A" (should fail)...`);

      try {
        await axios.put(`${API_URL}/divisions/${division2A.id}`, {
          data: {
            name: '1A'
          }
        });

        console.log('❌ ERROR: Division was updated! Uniqueness constraint is NOT working on updates!');
        return false;
      } catch (error) {
        if (error.response?.data?.error?.message?.includes('already in use') ||
            error.response?.data?.error?.message?.includes('already exists') ||
            error.response?.data?.error?.message?.includes('must be unique')) {
          console.log('✅ SUCCESS: Division update failed as expected!');
          console.log(`Error message: "${error.response.data.error.message}"\n`);
        } else {
          console.log('❌ Unexpected error:', error.response?.data || error.message);
          return false;
        }
      }
    }

    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('Division name uniqueness is properly enforced across all classes.');
    console.log('========================================');

    return true;

  } catch (error) {
    console.error('Test failed with error:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testDivisionUniqueness()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });