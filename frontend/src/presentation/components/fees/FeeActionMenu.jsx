import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, X, Trash2, Edit2, Copy, Info } from 'lucide-react';

const FeeActionMenu = ({
  assignment,
  onRemoveAssignment,
  onDeleteFee,
  onEditFee,
  onDuplicateFee
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action, e) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Fee Info Section */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500">Fee Actions</p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {assignment.fee?.name}
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            {onEditFee && (
              <button
                onClick={(e) => handleAction(() => onEditFee(assignment), e)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Fee Details</span>
              </button>
            )}

            {onDuplicateFee && (
              <button
                onClick={(e) => handleAction(() => onDuplicateFee(assignment.fee), e)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate Fee</span>
              </button>
            )}

            <div className="my-1 border-t border-gray-200"></div>

            <button
              onClick={(e) => handleAction(() => onRemoveAssignment(assignment.id), e)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-3 text-yellow-700"
            >
              <X className="w-4 h-4" />
              <div>
                <span>Remove from Class</span>
                <p className="text-xs text-yellow-600 mt-0.5">
                  Unlinks fee from this class only
                </p>
              </div>
            </button>

            <button
              onClick={(e) => handleAction(() => onDeleteFee(assignment.fee?.id, assignment.fee?.name), e)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <div>
                <span>Delete Fee Permanently</span>
                <p className="text-xs text-red-500 mt-0.5">
                  Removes from all classes
                </p>
              </div>
            </button>
          </div>

          {/* Warning Footer */}
          <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                Deleting a fee permanently affects all classes using it
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeeActionMenu;