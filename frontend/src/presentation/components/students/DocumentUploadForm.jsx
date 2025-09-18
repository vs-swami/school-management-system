import React, { useState } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Eye, Download, Trash2 } from 'lucide-react';
import FormField from './FormField';
import './DocumentUpload.css';

const DOCUMENT_TYPES = [
  { value: 'student_photo', label: 'Student Photo' },
  { value: 'guardian_photo', label: 'Guardian Photo' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'aadhaar_card', label: 'Aadhaar Card' },
  { value: 'other', label: 'Other' },
];

const ALLOWED_FILE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DocumentUploadForm = ({
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  existingDocuments = [],
  studentId,
  loading = false
}) => {
  const [newDocument, setNewDocument] = useState({
    document_type: '',
    description: '',
    file: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const validateFile = (file) => {
    const errors = {};

    if (!file) {
      errors.file = 'Please select a file';
      return errors;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.file = 'File size must be less than 5MB';
      return errors;
    }

    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      errors.file = 'File type not supported. Please upload PDF, DOC, DOCX, or image files.';
      return errors;
    }

    return errors;
  };

  const handleFileSelect = (file) => {
    const fileErrors = validateFile(file);
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      return;
    }

    setNewDocument(prev => ({ ...prev, file }));
    setErrors({});

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    console.log('DocumentUploadForm - handleSubmit: START');
    e.preventDefault();
    e.stopPropagation();

    const validationErrors = {};
    if (!newDocument.document_type) {
      validationErrors.document_type = 'Please select a document type';
    }
    if (!newDocument.file) {
      validationErrors.file = 'Please select a file';
    }

    if (Object.keys(validationErrors).length > 0) {
      console.log('DocumentUploadForm - handleSubmit: Validation errors:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    console.log('DocumentUploadForm - handleSubmit: Calling onAddDocument with:', {
      studentId,
      documentType: newDocument.document_type,
      fileName: newDocument.file?.name,
      description: newDocument.description
    });

    try {
      const result = await onAddDocument(
        studentId,
        newDocument.document_type,
        newDocument.file,
        newDocument.description
      );

      console.log('DocumentUploadForm - handleSubmit: Result from onAddDocument:', result);

      if (result && result.success) {
        console.log('DocumentUploadForm - handleSubmit: Upload successful, resetting form');
        // Reset form
        setNewDocument({
          document_type: '',
          description: '',
          file: null,
        });
        setPreviewUrl(null);
        setErrors({});
      } else {
        console.log('DocumentUploadForm - handleSubmit: Upload failed:', result);
        setErrors({ submit: result?.error || 'Failed to upload document. Please try again.' });
      }
    } catch (error) {
      console.error('DocumentUploadForm - handleSubmit: Upload error:', error);
      setErrors({ submit: 'Failed to upload document. Please try again.' });
    }

    console.log('DocumentUploadForm - handleSubmit: END');
  };

  const handleRemoveFile = () => {
    setNewDocument(prev => ({ ...prev, file: null }));
    setPreviewUrl(null);
    setErrors(prev => ({ ...prev, file: null }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return '🖼️';
    } else if (extension === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    }
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Add New Document Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-4">Add New Document</h5>

        <div className="space-y-4" data-upload-form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Document Type"
              type="select"
              register={{
                onChange: (e) => setNewDocument(prev => ({ ...prev, document_type: e.target.value })),
                value: newDocument.document_type
              }}
              errors={errors.document_type ? { message: errors.document_type } : null}
              options={DOCUMENT_TYPES}
              placeholder="Select Document Type"
              required
            />

            <FormField
              label="Description (Optional)"
              register={{
                onChange: (e) => setNewDocument(prev => ({ ...prev, description: e.target.value })),
                value: newDocument.description
              }}
              placeholder="Brief description of the document"
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload File <span className="text-red-500">*</span>
            </label>

            {!newDocument.file ? (
              <div
                className={`document-upload-area relative border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive
                    ? 'drag-active border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Drag and drop your file here, or{' '}
                    <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
                        onChange={handleFileInputChange}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, DOC, DOCX, JPG, PNG (Max: 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(newDocument.file.name)}</div>
                    <div>
                      <p className="font-medium text-gray-800">{newDocument.file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(newDocument.file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="document-preview-image max-w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {errors.file && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.file}
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button" onClick={handleSubmit}
              disabled={loading || !newDocument.file || !newDocument.document_type}
              className={`btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'upload-loading' : ''
              }`}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Documents List */}
      {existingDocuments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h5>

          <div className="space-y-3">
            {existingDocuments.map((doc) => (
              <div key={doc.id} className="document-item flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="file-type-icon">{getFileIcon(doc.url || '')}</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {DOCUMENT_TYPES.find(type => type.value === doc.document_type)?.label || doc.document_type}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    )}
                  </div>
                </div>

                <div className="document-actions flex items-center space-x-2">
                  {doc.url && (
                    <>
                      <button
                        type="button"
                        onClick={() => window.open(doc.url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.document_type;
                          link.click();
                        }}
                        className="text-green-600 hover:text-green-800 p-2 rounded"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteDocument && onDeleteDocument(doc.id, studentId)}
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;

