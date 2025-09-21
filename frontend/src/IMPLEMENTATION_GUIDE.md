# 🚀 Implementation Guide: Using the Decoupled Architecture

## 1. Setup ServiceProvider in App.jsx

```jsx
// App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ServiceProvider } from './application/contexts/ServiceContext';
import { LoadingProvider } from './application/contexts/LoadingContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceProvider>
        <LoadingProvider>
          <Router>
            {/* Your routes */}
          </Router>
        </LoadingProvider>
      </ServiceProvider>
    </QueryClientProvider>
  );
}
```

## 2. Using Services in Components

### Example 1: Class List Component

```jsx
// ClassListComponent.jsx
import React, { useState, useEffect } from 'react';
import { useClassService } from '../../application/contexts/ServiceContext';

function ClassListComponent() {
  const classService = useClassService();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const result = await classService.getAllClasses();

    if (result.success) {
      // result.data contains Class domain models with properties like:
      // className, studentCount, occupancyRate, availableSeats
      setClasses(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCreateClass = async (formData) => {
    const classData = {
      className: formData.name,
      classCode: formData.code,
      capacity: formData.capacity,
      isActive: true
    };

    const result = await classService.createClass(classData);

    if (result.success) {
      // result.data is a Class domain model
      setClasses([...classes, result.data]);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <div className="grid grid-cols-3 gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="p-4 border rounded">
            <h3>{cls.className}</h3>
            <p>Students: {cls.studentCount}/{cls.capacity}</p>
            <p>Available: {cls.availableSeats} seats</p>
            <p>Occupancy: {cls.occupancyRate.toFixed(1)}%</p>
            {cls.isFull() && <span className="text-red-500">Full</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 2: Student Form Component

```jsx
// StudentFormComponent.jsx
import React, { useState } from 'react';
import { useStudentService, useEnrollmentService } from '../../application/contexts/ServiceContext';

function StudentFormComponent() {
  const studentService = useStudentService();
  const enrollmentService = useEnrollmentService();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    admissionNumber: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create student using domain model structure
    const studentData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      admissionNumber: formData.admissionNumber,
      status: 'active',
      addresses: [{
        type: 'home',
        addressLine1: formData.address,
        city: formData.city,
        isPrimary: true
      }],
      contacts: [{
        type: 'phone',
        value: formData.phone,
        isPrimary: true
      }]
    };

    const result = await studentService.createStudent(studentData);

    if (result.success) {
      // result.data is a Student domain model
      console.log('Created student:', result.data.fullName);
      console.log('Age:', result.data.age);
      console.log('Primary Address:', result.data.primaryAddress);

      // Create enrollment
      const enrollmentData = {
        student: result.data.id,
        class: selectedClassId,
        academicYear: currentYearId,
        isActive: true
      };

      await enrollmentService.createEnrollment(enrollmentData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Example 3: Bus Stop Management

```jsx
// BusStopListComponent.jsx
import React, { useState, useEffect } from 'react';
import { useBusStopService } from '../../application/contexts/ServiceContext';

function BusStopListComponent() {
  const busStopService = useBusStopService();
  const [busStops, setBusStops] = useState([]);

  useEffect(() => {
    loadBusStops();
  }, []);

  const loadBusStops = async () => {
    const result = await busStopService.getActiveBusStops();

    if (result.success) {
      // result.data contains BusStop domain models
      setBusStops(result.data);
    }
  };

  const handleUpdateCoordinates = async (stopId, lat, lng) => {
    const result = await busStopService.updateBusStopCoordinates(
      stopId,
      { lat, lng }
    );

    if (result.success) {
      // Refresh the list
      loadBusStops();
    }
  };

  return (
    <div>
      {busStops.map(stop => (
        <div key={stop.id} className="p-4 border rounded mb-2">
          <h4>{stop.stopName}</h4>
          <p>Students: {stop.studentCount}</p>
          <p>Routes: {stop.routeCount}</p>
          <p>Monthly Fee: ${stop.monthlyFee}</p>
          {stop.hasCoordinates() && (
            <p>Location: {stop.coordinates.lat}, {stop.coordinates.lng}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Using with React Query

```jsx
// ClassDashboard.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useClassService } from '../../application/contexts/ServiceContext';

function ClassDashboard() {
  const classService = useClassService();
  const queryClient = useQueryClient();

  // Fetch classes with React Query
  const { data: classes, isLoading, error } = useQuery(
    'classes',
    async () => {
      const result = await classService.getAllClasses();
      if (result.success) return result.data;
      throw new Error(result.error);
    }
  );

  // Create class mutation
  const createClassMutation = useMutation(
    async (classData) => {
      const result = await classService.createClass(classData);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes');
      }
    }
  );

  // Update class mutation
  const updateClassMutation = useMutation(
    async ({ id, data }) => {
      const result = await classService.updateClass(id, data);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes');
      }
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {classes?.map(cls => (
        <div key={cls.id}>
          <h3>{cls.className}</h3>
          <button
            onClick={() => updateClassMutation.mutate({
              id: cls.id,
              data: { capacity: cls.capacity + 5 }
            })}
          >
            Increase Capacity
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Example 5: Using Multiple Services Together

```jsx
// StudentEnrollmentComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  useStudentService,
  useClassService,
  useEnrollmentService,
  useDivisionService
} from '../../application/contexts/ServiceContext';

function StudentEnrollmentComponent({ studentId }) {
  const studentService = useStudentService();
  const classService = useClassService();
  const enrollmentService = useEnrollmentService();
  const divisionService = useDivisionService();

  const [student, setStudent] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    // Load student
    const studentResult = await studentService.getStudentById(studentId);
    if (studentResult.success) {
      setStudent(studentResult.data);
    }

    // Load available classes
    const classResult = await classService.getActiveClasses();
    if (classResult.success) {
      // Filter classes that have capacity
      const availableClasses = classResult.data.filter(cls => cls.hasCapacity());
      setAvailableClasses(availableClasses);
    }
  };

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);

    // Load divisions for selected class
    const result = await divisionService.getDivisionsByClass(classId);
    if (result.success) {
      // Filter divisions with capacity
      const availableDivisions = result.data.filter(div => div.hasCapacity());
      setDivisions(availableDivisions);
    }
  };

  const handleEnroll = async (divisionId) => {
    const enrollmentData = {
      student: studentId,
      class: selectedClass,
      division: divisionId,
      academicYear: currentAcademicYearId,
      enrollmentDate: new Date().toISOString(),
      isActive: true,
      status: 'active'
    };

    const result = await enrollmentService.createEnrollment(enrollmentData);

    if (result.success) {
      alert(`Successfully enrolled ${student.fullName} in ${result.data.className}`);
    }
  };

  return (
    <div>
      {student && (
        <div>
          <h2>Enrolling: {student.fullName}</h2>
          <p>Age: {student.age} years</p>
          <p>Admission Number: {student.admissionNumber}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3>Select Class</h3>
          {availableClasses.map(cls => (
            <div
              key={cls.id}
              className="p-2 border cursor-pointer"
              onClick={() => handleClassSelect(cls.id)}
            >
              <p>{cls.className}</p>
              <p>Available: {cls.availableSeats} seats</p>
            </div>
          ))}
        </div>

        <div>
          <h3>Select Division</h3>
          {divisions.map(div => (
            <div
              key={div.id}
              className="p-2 border cursor-pointer"
              onClick={() => handleEnroll(div.id)}
            >
              <p>{div.divisionName}</p>
              <p>Available: {div.availableSeats} seats</p>
              {div.hasTeacher() && <p>Teacher assigned</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 3. Using Domain Model Methods

The domain models have useful methods you can use:

```jsx
// Using Student model methods
const student = result.data;
console.log(student.fullName);        // "John Doe"
console.log(student.age);              // 15
console.log(student.primaryAddress);   // Address object
console.log(student.primaryContact);   // Contact object
console.log(student.isActive());       // true
console.log(student.hasGuardian());    // true

// Using Class model methods
const classItem = result.data;
console.log(classItem.studentCount);   // 25
console.log(classItem.availableSeats); // 5
console.log(classItem.occupancyRate);  // 83.33
console.log(classItem.isFull());       // false
console.log(classItem.hasCapacity());  // true

// Using BusStop model methods
const busStop = result.data;
console.log(busStop.hasCoordinates()); // true
console.log(busStop.hasLocation());    // true
console.log(busStop.isOnRoute(routeId)); // true

// Using Enrollment model methods
const enrollment = result.data;
console.log(enrollment.className);     // "Grade 10"
console.log(enrollment.divisionName);  // "Section A"
console.log(enrollment.isCurrentYear); // true
console.log(enrollment.isPromoted());  // false
```

## 4. Testing with Mock Services

```jsx
// In your test files
import { ServiceProvider } from './application/contexts/ServiceContext';

// Create mock services
const mockClassService = {
  getAllClasses: jest.fn().mockResolvedValue({
    success: true,
    data: [
      new Class({ id: 1, className: 'Grade 10', capacity: 30 })
    ]
  })
};

// Provide mock services to components
function renderWithServices(component) {
  return render(
    <ServiceProvider config={{ services: { class: mockClassService } }}>
      {component}
    </ServiceProvider>
  );
}

// Test component
test('displays classes', async () => {
  const { getByText } = renderWithServices(<ClassListComponent />);
  await waitFor(() => {
    expect(getByText('Grade 10')).toBeInTheDocument();
  });
});
```

## 5. Benefits of This Architecture

1. **No Strapi Dependencies in Components**: Components don't know about `documentId`, `attributes`, or Strapi structure
2. **Clean Domain Models**: Work with `student.fullName` not `student.attributes.first_name`
3. **Business Logic in Models**: Methods like `isFull()`, `hasCapacity()` are on the models
4. **Easy Testing**: Mock services instead of API calls
5. **Future-Proof**: Change from Strapi to any other backend by just changing adapters

## 6. Migration Path for Existing Components

If you have existing components using repositories directly:

```jsx
// OLD WAY - Direct repository usage
import { StudentRepository } from '../../data/repositories/StudentRepository';

function OldComponent() {
  const handleFetch = async () => {
    const data = await StudentRepository.findAll();
    // data has Strapi structure
  };
}

// NEW WAY - Using services
import { useStudentService } from '../../application/contexts/ServiceContext';

function NewComponent() {
  const studentService = useStudentService();

  const handleFetch = async () => {
    const result = await studentService.getAllStudents();
    if (result.success) {
      // result.data has domain models
    }
  };
}
```

## Summary

The key is that components now:
1. Import services from ServiceContext
2. Work with domain models that have clean properties
3. Never directly import repositories
4. Use domain model methods for business logic
5. Are completely independent of backend structure