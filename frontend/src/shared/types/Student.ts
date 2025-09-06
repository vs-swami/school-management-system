export interface Student {
  id: string;
  gr_full_name: string;
  aadhaar_full_name?: string;
  legal_name_source: 'gr' | 'aadhaar' | 'manual';
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  aadhaar_no?: string;
  ssa_uid?: string;
  apaar_id?: string;
  place?: Place;
  caste?: Caste;
  house?: House;
  guardians: Guardian[];
  enrollments: Enrollment[];
  documents: StudentDocument[];
  createdAt: string;
  updatedAt: string;
}
export interface Guardian {
  id: string;
  student: string;
  full_name: string;
  relation: 'father' | 'mother' | 'guardian';
  source: string;
  primary_contact: boolean;
  occupation?: string;
  mobile: string;
  alt_mobile?: string;
  whatsapp_number?: string;
}

export interface Enrollment {
  id: string;
  student: Student;
  academic_year: AcademicYear;
  class_standard: number;
  division?: Division;
  section?: string;
  gr_no: string;
  date_enrolled: string;
  lc_received: boolean;
  date_of_admission: string;
  doa_backdated: boolean;
  admission_type: 'new' | 'transfer' | 'readmission';
  previous_school_name?: string;
  previous_class?: number;
  status: 'active' | 'transferred' | 'graduated' | 'dropped';
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}