import React, { useEffect, useState } from 'react';
import useStudentStore from '../../../application/stores/useStudentStore';
import { StudentTable } from '../../components/students/StudentTable';
import { StudentFilters } from '../../components/students/StudentFilters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useNavigate } from 'react-router-dom';

export const StudentList = () => {
  const {
    students,
    loading,
    error,
    filters,
    fetchStudents,
    searchStudents,
    setFilters,
    updateStudent,
    deleteStudent
  } = useStudentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents(filters);
  }, [fetchStudents, filters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      searchStudents(query);
    } else if (query.length === 0) {
      fetchStudents(filters);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  const handleEditStudent = (student) => {
    console.log('Editing student:', student);
    navigate(`/students/edit/${student.id}`);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.gr_full_name}?`)) {
      const result = await deleteStudent(student.id);
      if (result.success) {
        fetchStudents(filters); // Refresh list after deletion
      } else {
        console.error('Error deleting student:', result.error);
        // Potentially show an error message to the user
      }
    }
  };

  if (loading && students.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Student Management
        </h1>
        <Button onClick={handleAddStudent} variant="primary">
          Add New Student
        </Button>
      </div>

      {/* Error Display */}
      {error && <ErrorAlert message={error} />}

      {/* Filters */}
      <StudentFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
      />

      {/* Student Table */}
      <StudentTable 
        students={students} 
        loading={loading}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onView={(student) => console.log('View student:', student.id)} // Placeholder for view action
      />
    </div>
  );
};