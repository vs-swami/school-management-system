'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student-document.student-document', ({ strapi }) => ({
  // Custom create method to handle file uploads
  async create(ctx) {
    const { data } = ctx.request.body;
    const { files } = ctx.request;
    
    console.log('StudentDocument Controller - create: START');
    console.log('StudentDocument Controller - create: Raw ctx.request.body:', JSON.stringify(ctx.request.body, null, 2));
    console.log('StudentDocument Controller - create: Raw ctx.request.files:', JSON.stringify(ctx.request.files, null, 2));

    try {
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('StudentDocument Controller - create: Parsed Data:', JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.error('StudentDocument Controller - create: JSON Parse Error:', parseError);
        return ctx.badRequest('Invalid JSON in data field', { error: parseError.message });
      }

      // Handle file upload first if files exist
      let fileId = null;
      if (files && Object.keys(files).length > 0) {
        // Try different file field names that might be sent
        const fileToUpload = files.files || files.file || files['files.file'] || Object.values(files)[0];
        console.log('StudentDocument Controller - create: File to upload:', JSON.stringify(fileToUpload, null, 2));

        if (fileToUpload) {
          try {
            const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
              data: {},
              files: fileToUpload,
            });
            console.log('StudentDocument Controller - create: Uploaded Files:', JSON.stringify(uploadedFiles, null, 2));

            if (uploadedFiles && uploadedFiles.length > 0) {
              fileId = uploadedFiles[0].id;
              console.log('StudentDocument Controller - create: File uploaded with ID:', fileId);
            }
          } catch (uploadError) {
            console.error('StudentDocument Controller - create: File upload error:', uploadError);
            return ctx.badRequest('Error uploading file', { error: uploadError.message });
          }
        } else {
          console.log('StudentDocument Controller - create: No valid file found in request');
        }
      } else {
        console.log('StudentDocument Controller - create: No files in request');
      }

      // Create student document with file ID
      const documentData = {
        ...parsedData,
        ...(fileId && { file: fileId }),
      };
      console.log('StudentDocument Controller - create: Document Data before creation:', JSON.stringify(documentData, null, 2));

      const studentDocument = await strapi.entityService.create('api::student-document.student-document', {
        data: documentData,
      });
      console.log('StudentDocument Controller - create: Created Document:', JSON.stringify(studentDocument, null, 2));
      
      return this.transformResponse(studentDocument);
    } catch (error) {
      console.error('StudentDocument Controller - create: Error:', error);
      return ctx.badRequest('Error creating document', { error: error.message });
    } finally {
      console.log('StudentDocument Controller - create: END');
    }
  },

  // Custom update method to handle file uploads
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const { files } = ctx.request;
    
    console.log('StudentDocument Controller - update: START');
    console.log('StudentDocument Controller - update: ID:', id);
    console.log('StudentDocument Controller - update: Raw ctx.request.body:', JSON.stringify(ctx.request.body, null, 2));
    console.log('StudentDocument Controller - update: Raw ctx.request.files:', JSON.stringify(ctx.request.files, null, 2));

    try {
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('StudentDocument Controller - update: Parsed Data:', JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.error('StudentDocument Controller - update: JSON Parse Error:', parseError);
        return ctx.badRequest('Invalid JSON in data field', { error: parseError.message });
      }

      // Handle file upload if new file provided
      let fileId = null;
      if (files && Object.keys(files).length > 0) {
        const fileToUpload = files.files || files.file || Object.values(files)[0];
        console.log('StudentDocument Controller - update: File to upload:', JSON.stringify(fileToUpload, null, 2));
        
        if (fileToUpload) {
          const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
            data: {},
            files: fileToUpload,
          });
          console.log('StudentDocument Controller - update: Uploaded Files:', JSON.stringify(uploadedFiles, null, 2));
          
          if (uploadedFiles && uploadedFiles.length > 0) {
            fileId = uploadedFiles[0].id;
          }
        }
      }

      const documentData = {
        ...parsedData,
        ...(fileId && { file: fileId }),
      };
      console.log('StudentDocument Controller - update: Document Data before update:', JSON.stringify(documentData, null, 2));

      const updatedDocument = await strapi.entityService.update('api::student-document.student-document', id, {
        data: documentData,
      });
      console.log('StudentDocument Controller - update: Updated Document:', JSON.stringify(updatedDocument, null, 2));
      
      return this.transformResponse(updatedDocument);
    } catch (error) {
      console.error('StudentDocument Controller - update: Error:', error);
      return ctx.badRequest('Error updating document', { error: error.message });
    } finally {
      console.log('StudentDocument Controller - update: END');
    }
  },

  // FIXED: Delete method with proper file cleanup
  async delete(ctx) {
    const { id } = ctx.params;
    console.log('StudentDocument Controller - delete: START');
    console.log('StudentDocument Controller - delete: ID from params:', id);
    console.log('StudentDocument Controller - delete: ID type:', typeof id);
    
    try {
      // Convert to integer if it's a string number
      let documentId = id;
      if (typeof id === 'string' && !isNaN(id)) {
        documentId = parseInt(id);
      }
      
      // DEBUG: Show recent documents to verify ID format
      const recentDocs = await strapi.entityService.findMany('api::student-document.student-document', {
        sort: { createdAt: 'desc' },
        limit: 5,
      });
      console.log('StudentDocument Controller - delete: Recent documents:', recentDocs.map(doc => ({ id: doc.id, type: typeof doc.id, document_type: doc.document_type })));

      // Try to find the document first
      let documentToDelete;
      try {
        documentToDelete = await strapi.entityService.findOne('api::student-document.student-document', documentId, {
          populate: ['file'],
        });
      } catch (findError) {
        console.error('StudentDocument Controller - delete: Error finding document:', findError);
        // Try with string ID if number failed
        if (typeof documentId === 'number') {
          try {
            documentToDelete = await strapi.entityService.findOne('api::student-document.student-document', String(documentId), {
              populate: ['file'],
            });
          } catch (stringFindError) {
            console.error('StudentDocument Controller - delete: Error with string ID:', stringFindError);
          }
        }
      }

      if (!documentToDelete) {
        console.log('StudentDocument Controller - delete: Document not found for ID:', documentId);
        return ctx.notFound('Student document not found.');
      }

      console.log('StudentDocument Controller - delete: Found document:', JSON.stringify(documentToDelete, null, 2));

      // Delete file if exists
      if (documentToDelete.file && documentToDelete.file.id) {
        try {
          await strapi.plugins.upload.services.upload.remove(documentToDelete.file.id);
          console.log('StudentDocument Controller - delete: Associated file deleted.');
        } catch (fileError) {
          console.error('StudentDocument Controller - delete: Error deleting file:', fileError);
        }
      }

      // Delete the document using the same ID that worked for findOne
      let result;
      try {
        result = await strapi.entityService.delete('api::student-document.student-document', documentToDelete.id);
      } catch (deleteError) {
        console.error('StudentDocument Controller - delete: Error with delete:', deleteError);
        // Try alternative delete approach
        try {
          result = await strapi.entityService.delete('api::student-document.student-document', documentToDelete.documentId || documentToDelete.id);
        } catch (altDeleteError) {
          console.error('StudentDocument Controller - delete: Alternative delete failed:', altDeleteError);
          throw deleteError;
        }
      }
      console.log('StudentDocument Controller - delete: Document deleted successfully');
      
      return this.transformResponse(result || { id: documentId, deleted: true });
    } catch (error) {
      console.error('StudentDocument Controller - delete: Error:', error);
      return ctx.badRequest('Error deleting document', { error: error.message });
    } finally {
      console.log('StudentDocument Controller - delete: END');
    }
  },

  // Use default implementations for find methods
  async find(ctx) {
    console.log('StudentDocument Controller - find: START');
    try {
      return await super.find(ctx);
    } finally {
      console.log('StudentDocument Controller - find: END');
    }
  },

  async findOne(ctx) {
    console.log('StudentDocument Controller - findOne: START');
    console.log('StudentDocument Controller - findOne: ID from params:', ctx.params.id);
    try {
      return await super.findOne(ctx);
    } finally {
      console.log('StudentDocument Controller - findOne: END');
    }
  },
}));