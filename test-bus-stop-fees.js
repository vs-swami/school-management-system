// Test script to verify bus stop fee functionality using fetch
const API_URL = 'http://localhost:1337/api';

async function testBusStopFees() {
  try {
    console.log('Testing Bus Stop Fee Functionality...\n');

    // 1. Get first bus stop
    console.log('1. Fetching bus stops...');
    const stopsResponse = await fetch(`${API_URL}/bus-stops`);
    const stopsData = await stopsResponse.json();
    const stops = stopsData.data || stopsData;

    if (!stops || stops.length === 0) {
      console.log('No bus stops found. Please create a bus stop first.');
      return;
    }

    const firstStop = stops[0];
    console.log(`   Found ${stops.length} bus stops`);
    console.log(`   Using stop: ${firstStop.stop_name || firstStop.attributes?.stop_name} (ID: ${firstStop.id})\n`);

    // 2. Get first fee definition
    console.log('2. Fetching fee definitions...');
    const feesResponse = await fetch(`${API_URL}/fee-definitions`);
    const feesData = await feesResponse.json();
    const fees = feesData.data || feesData;

    if (!fees || fees.length === 0) {
      console.log('No fee definitions found. Creating one...');

      // Create a fee definition
      const newFeeResponse = await fetch(`${API_URL}/fee-definitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: 'Bus Stop Maintenance Fee',
            base_amount: 500,
            frequency: 'monthly',
            type: 1 // Assuming type ID 1 exists
          }
        })
      });

      const newFeeData = await newFeeResponse.json();
      const newFee = newFeeData.data || newFeeData;
      console.log(`   Created fee: ${newFee.name || newFee.attributes?.name}\n`);

      // Use the newly created fee
      fees.push(newFee);
    } else {
      console.log(`   Found ${fees.length} fee definitions`);
      console.log(`   Using fee: ${fees[0].name || fees[0].attributes?.name} (ID: ${fees[0].id})\n`);
    }

    // 3. Create fee assignment for bus stop
    console.log('3. Creating fee assignment for bus stop...');
    const assignmentData = {
      fee: fees[0].id,
      bus_stop: firstStop.id,
      priority: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null
    };

    const assignmentResponse = await fetch(`${API_URL}/fee-assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: assignmentData
      })
    });

    if (!assignmentResponse.ok) {
      const errorData = await assignmentResponse.json();
      throw new Error(JSON.stringify(errorData));
    }

    const assignmentResult = await assignmentResponse.json();
    const assignment = assignmentResult.data || assignmentResult;
    console.log(`   Successfully created fee assignment (ID: ${assignment.id})`);
    console.log(`   Fee: ${assignmentData.fee} assigned to Bus Stop: ${assignmentData.bus_stop}\n`);

    // 4. Verify the assignment
    console.log('4. Verifying fee assignments for the bus stop...');
    const params = new URLSearchParams({
      'filters[bus_stop][id][$eq]': firstStop.id,
      'populate': '*'
    });

    const verifyResponse = await fetch(`${API_URL}/fee-assignments?${params}`);
    const verifyData = await verifyResponse.json();
    const assignments = verifyData.data || verifyData;
    console.log(`   Found ${assignments.length} fee assignment(s) for the bus stop`);

    if (assignments.length > 0) {
      console.log('\n✅ SUCCESS: Bus stop fee functionality is working correctly!');
      console.log('\nYou can now:');
      console.log('1. Go to the Bus Management Dashboard');
      console.log('2. Navigate to the Stops tab');
      console.log('3. Click the "Fees" button on any bus stop');
      console.log('4. Manage fees for that specific stop');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Run the test
testBusStopFees();