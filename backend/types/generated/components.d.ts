import type { Struct, Schema } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'fee.installment': FeeInstallment;
    }
  }
}
