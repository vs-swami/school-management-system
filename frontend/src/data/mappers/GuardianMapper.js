import { Guardian } from '../../domain/models/Guardian';
import { StudentMapper } from './StudentMapper';

export class GuardianMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => GuardianMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    return new Guardian({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      fullName: data.full_name,
      relation: data.relation,
      source: data.source || 'system',
      primaryContact: data.primary_contact || false,
      occupation: data.occupation,
      student: GuardianMapper.mapStudent(data.student),
      documents: GuardianMapper.mapDocuments(data.documents),
      contactNumbers: GuardianMapper.mapContactNumbers(data.contact_numbers),
      addresses: GuardianMapper.mapAddresses(data.addresses),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;
  

    const data = {
      full_name: domainModel.fullName || domainModel.full_name,
      relation: domainModel.relation,
      source: domainModel.source || 'system',
      primary_contact: domainModel.primaryContact !== undefined ? domainModel.primaryContact : domainModel.primary_contact,
      occupation: domainModel.occupation,
      contact_numbers: domainModel.contactNumbers || domainModel.contact_numbers,
      addresses: domainModel.addresses
    };

    // Add student relation if present
    if (domainModel.student) {
      data.student = domainModel.student.id || domainModel.student;
    }

    // Add document IDs if present
    if (domainModel.documents && domainModel.documents.length > 0) {
      data.documents = domainModel.documents.map(d => d.id || d);
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  static toStrapi(domainModel) {
    return GuardianMapper.toAPI(domainModel);
  }

  static mapStudent(student) {
    if (!student) return null;
    const normalized = GuardianMapper.normalizeRelation(student);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    // Return basic student info to avoid circular dependency
    // StudentMapper.mapGuardians references GuardianMapper
    return {
      id: data.id,
      documentId: data.documentId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      grFullName: data.gr_full_name
    };
  }

  static mapDocuments(documents) {
    if (!documents) return [];
    const normalized = GuardianMapper.normalizeRelation(documents);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(doc => ({
      id: doc.id,
      documentId: doc.documentId,
      documentType: doc.document_type || doc.documentType,
      documentNumber: doc.document_number || doc.documentNumber,
      fileName: doc.file_name || doc.fileName,
      uploadDate: doc.upload_date || doc.uploadDate
    }));
  }

  static mapContactNumbers(contacts) {
    if (!contacts) return [];
    if (!Array.isArray(contacts)) return [];

    return contacts.map(contact => {
      // Handle case where contact might be an ID or unpopulated
      if (typeof contact === 'number' || typeof contact === 'string') {
        console.warn('Contact number component not populated:', contact);
        return null;
      }

      return {
        type: contact.contact_type || contact.type,
        number: contact.number || contact.value,
        isPrimary: contact.is_primary || contact.isPrimary || false,
        isWhatsappEnabled: contact.is_whatsapp_enabled || false,
        label: contact.label
      };
    }).filter(Boolean); // Remove any null values
  }

  static mapAddresses(addresses) {
    if (!addresses) return [];
    if (!Array.isArray(addresses)) return [];

    return addresses.map(addr => {
      // Handle case where address might be an ID or unpopulated
      if (typeof addr === 'number' || typeof addr === 'string') {
        console.warn('Address component not populated:', addr);
        return null;
      }

      return {
        type: addr.address_type || addr.type,
        addressLine1: addr.address_line1 || addr.address_line_1 || addr.addressLine1,
        addressLine2: addr.address_line2 || addr.address_line_2 || addr.addressLine2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode || addr.postal_code || addr.postalCode,
        landmark: addr.landmark,
        country: addr.country,
        isPrimary: addr.is_primary || addr.isPrimary || false
      };
    }).filter(Boolean); // Remove any null values
  }

  static normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return [relation];
  }
}