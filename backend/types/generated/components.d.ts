import type { Struct, Schema } from '@strapi/strapi';

export interface TransportBusStopSchedule extends Struct.ComponentSchema {
  collectionName: 'components_transport_bus_stop_schedules';
  info: {
    displayName: 'Bus Stop Schedule';
    icon: 'bus';
    description: 'Schedule information for each bus stop in a route';
  };
  attributes: {
    bus_stop: Schema.Attribute.Relation<'oneToOne', 'api::bus-stop.bus-stop'> &
      Schema.Attribute.Required;
    stop_order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pickup_time: Schema.Attribute.Time;
    drop_time: Schema.Attribute.Time;
    waiting_time: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    distance_from_previous: Schema.Attribute.Decimal;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface CommonContact extends Struct.ComponentSchema {
  collectionName: 'components_common_contacts';
  info: {
    displayName: 'Contact';
    icon: 'phone';
    description: 'Reusable contact information component';
  };
  attributes: {
    contact_type: Schema.Attribute.Enumeration<
      ['mobile', 'landline', 'whatsapp', 'emergency']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'mobile'>;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    is_primary: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    is_whatsapp_enabled: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
  };
}

export interface CommonAddress extends Struct.ComponentSchema {
  collectionName: 'components_common_addresses';
  info: {
    displayName: 'Address';
    icon: 'map-marker-alt';
    description: 'Reusable address component for students, guardians, and staff';
  };
  attributes: {
    address_type: Schema.Attribute.Enumeration<
      ['current', 'permanent', 'postal', 'office']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'current'>;
    address_line1: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    address_line2: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    city: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    state: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    pincode: Schema.Attribute.String & Schema.Attribute.Required;
    landmark: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    is_primary: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface FeeInstallment extends Struct.ComponentSchema {
  collectionName: 'components_fee_installments';
  info: {
    displayName: 'installment';
    icon: 'money-check-alt';
    description: 'Fee installment with amount and due date';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    due_date: Schema.Attribute.Date;
    index: Schema.Attribute.Integer;
  };
}

export interface AcademicSubjectScore extends Struct.ComponentSchema {
  collectionName: 'components_academic_subject_scores';
  info: {
    displayName: 'Subject Score';
    icon: 'graduation-cap';
    description: 'Individual subject scores for exam results';
  };
  attributes: {
    subject: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    marks_obtained: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    total_marks: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    grade: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 5;
      }>;
    pass_status: Schema.Attribute.Enumeration<
      ['pass', 'fail', 'absent', 'pending']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    percentage: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      >;
    remarks: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'transport.bus-stop-schedule': TransportBusStopSchedule;
      'common.contact': CommonContact;
      'common.address': CommonAddress;
      'fee.installment': FeeInstallment;
      'academic.subject-score': AcademicSubjectScore;
    }
  }
}
