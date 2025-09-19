import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClassStore } from '../../../application/stores/useClassStore';
import ClassFeeManager from '../../components/fees/ClassFeeManager';
import { ArrowLeft, School } from 'lucide-react';

const ClassFeeManagementPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, fetchClasses } = useClassStore();
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
  }, []);

  useEffect(() => {
    if (classes.length > 0 && classId) {
      const cls = classes.find(c => c.id === parseInt(classId));
      setCurrentClass(cls);
    }
  }, [classes, classId]);

  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/classes')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <School className="w-7 h-7" />
                  Fee Management
                </h1>
                <p className="text-blue-100 mt-1">
                  Managing fees for {currentClass.classname || currentClass.name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/fees')}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                View All Fees
              </button>
              <button
                onClick={() => navigate('/classes')}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Back to Classes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ClassFeeManager
            classId={parseInt(classId)}
            className={currentClass.classname || currentClass.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ClassFeeManagementPage;