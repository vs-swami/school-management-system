import type { Struct, Schema } from '@strapi/strapi';

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    width: Schema.Attribute.Integer;
    height: Schema.Attribute.Integer;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    ext: Schema.Attribute.String;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    related: Schema.Attribute.Relation<'morphToMany'>;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    >;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    >;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    >;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    timezone: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    >;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    entryDocumentId: Schema.Attribute.String;
    locale: Schema.Attribute.String;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Schema.Attribute.Boolean;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    name: 'Workflow';
    description: '';
    singularName: 'workflow';
    pluralName: 'workflows';
    displayName: 'Workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    name: 'Workflow Stage';
    description: '';
    singularName: 'workflow-stage';
    pluralName: 'workflow-stages';
    displayName: 'Stages';
  };
  options: {
    version: '1.1.0';
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String;
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Schema.Attribute.String;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    timestamps: true;
    draftAndPublish: false;
  };
  attributes: {
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiAcademicYearAcademicYear
  extends Struct.CollectionTypeSchema {
  collectionName: 'academic_years';
  info: {
    singularName: 'academic-year';
    pluralName: 'academic-years';
    displayName: 'Academic Year';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    starts_on: Schema.Attribute.Date & Schema.Attribute.Required;
    ends_on: Schema.Attribute.Date & Schema.Attribute.Required;
    is_current: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    enrollments: Schema.Attribute.Relation<
      'oneToMany',
      'api::enrollment.enrollment'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::academic-year.academic-year'
    >;
  };
}

export interface ApiBusBus extends Struct.CollectionTypeSchema {
  collectionName: 'buses';
  info: {
    singularName: 'bus';
    pluralName: 'buses';
    displayName: 'Bus';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bus_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    license_plate: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    driver_name: Schema.Attribute.String & Schema.Attribute.Required;
    total_seats: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
          max: 100;
        },
        number
      >;
    bus_routes: Schema.Attribute.Relation<
      'oneToMany',
      'api::bus-route.bus-route'
    >;
    seat_allocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::seat-allocation.seat-allocation'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::bus.bus'>;
  };
}

export interface ApiBusRouteBusRoute extends Struct.CollectionTypeSchema {
  collectionName: 'bus_routes';
  info: {
    singularName: 'bus-route';
    pluralName: 'bus-routes';
    displayName: 'Bus Route';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    route_name: Schema.Attribute.String & Schema.Attribute.Required;
    route_code: Schema.Attribute.String & Schema.Attribute.Unique;
    bus: Schema.Attribute.Relation<'manyToOne', 'api::bus.bus'>;
    bus_stops: Schema.Attribute.Relation<
      'manyToMany',
      'api::bus-stop.bus-stop'
    >;
    departure_time: Schema.Attribute.Time & Schema.Attribute.Required;
    arrival_time: Schema.Attribute.Time;
    route_type: Schema.Attribute.Enumeration<['morning', 'evening', 'both']> &
      Schema.Attribute.DefaultTo<'both'>;
    total_distance: Schema.Attribute.Decimal;
    estimated_duration: Schema.Attribute.Integer;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    stop_schedules: Schema.Attribute.Component<
      'transport.bus-stop-schedule',
      true
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::bus-route.bus-route'
    >;
  };
}

export interface ApiBusStopBusStop extends Struct.CollectionTypeSchema {
  collectionName: 'bus_stops';
  info: {
    singularName: 'bus-stop';
    pluralName: 'bus-stops';
    displayName: 'Bus Stop';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    stop_name: Schema.Attribute.String & Schema.Attribute.Required;
    coordinates: Schema.Attribute.JSON;
    location: Schema.Attribute.Relation<'manyToOne', 'api::location.location'>;
    notes: Schema.Attribute.Text;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    bus_routes: Schema.Attribute.Relation<
      'manyToMany',
      'api::bus-route.bus-route'
    >;
    pickup_allocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::seat-allocation.seat-allocation'
    >;
    fee_assignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-assignment.fee-assignment'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::bus-stop.bus-stop'
    >;
  };
}

export interface ApiCasteCaste extends Struct.CollectionTypeSchema {
  collectionName: 'castes';
  info: {
    singularName: 'caste';
    pluralName: 'castes';
    displayName: 'Caste';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::caste.caste'>;
  };
}

export interface ApiClassClass extends Struct.CollectionTypeSchema {
  collectionName: 'classes';
  info: {
    singularName: 'class';
    pluralName: 'classes';
    displayName: 'Class';
    description: 'Class can have multiple divisions';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    classname: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    divisions: Schema.Attribute.Relation<'oneToMany', 'api::division.division'>;
    enrollments: Schema.Attribute.Relation<
      'oneToMany',
      'api::enrollment.enrollment'
    >;
    fee_assignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-assignment.fee-assignment'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::class.class'>;
  };
}

export interface ApiDivisionDivision extends Struct.CollectionTypeSchema {
  collectionName: 'divisions';
  info: {
    singularName: 'division';
    pluralName: 'divisions';
    displayName: 'Division';
    description: 'Division belongs to a single class';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    enrollments: Schema.Attribute.Relation<
      'oneToMany',
      'api::enrollment.enrollment'
    >;
    student_limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
          max: 100;
        },
        number
      > &
      Schema.Attribute.DefaultTo<30>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::division.division'
    >;
  };
}

export interface ApiEnrollmentEnrollment extends Struct.CollectionTypeSchema {
  collectionName: 'enrollments';
  info: {
    singularName: 'enrollment';
    pluralName: 'enrollments';
    displayName: 'Enrollment';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    student: Schema.Attribute.Relation<'oneToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    academic_year: Schema.Attribute.Relation<
      'manyToOne',
      'api::academic-year.academic-year'
    > &
      Schema.Attribute.Required;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'> &
      Schema.Attribute.Required;
    gr_no: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    date_enrolled: Schema.Attribute.Date & Schema.Attribute.Required;
    administration: Schema.Attribute.Relation<
      'oneToOne',
      'api::enrollment-administration.enrollment-administration'
    >;
    lc_received: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    enrollment_status: Schema.Attribute.Enumeration<
      ['Enquiry', 'Waiting', 'Enrolled', 'Rejected', 'Processing']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Enquiry'>;
    admission_type: Schema.Attribute.Enumeration<
      ['Transport', 'Hostel', 'Self', 'Tuition Only']
    > &
      Schema.Attribute.Required;
    payment_preference: Schema.Attribute.Enumeration<['full', 'installments']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'installments'>;
    bus_stop: Schema.Attribute.Relation<'manyToOne', 'api::bus-stop.bus-stop'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::enrollment.enrollment'
    >;
  };
}

export interface ApiEnrollmentAdministrationEnrollmentAdministration
  extends Struct.CollectionTypeSchema {
  collectionName: 'enrollment_administrations';
  info: {
    singularName: 'enrollment-administration';
    pluralName: 'enrollment-administrations';
    displayName: 'Enrollment Administration';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    enrollment: Schema.Attribute.Relation<
      'oneToOne',
      'api::enrollment.enrollment'
    >;
    division: Schema.Attribute.Relation<'manyToOne', 'api::division.division'>;
    date_of_admission: Schema.Attribute.Date & Schema.Attribute.Required;
    seat_allocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::seat-allocation.seat-allocation'
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::enrollment-administration.enrollment-administration'
    >;
  };
}

export interface ApiExamResultExamResult extends Struct.CollectionTypeSchema {
  collectionName: 'exam_results';
  info: {
    singularName: 'exam-result';
    pluralName: 'exam-results';
    displayName: 'Exam Result';
    description: 'Stores exam results with multiple subject scores';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'>;
    exam_type: Schema.Attribute.String & Schema.Attribute.Required;
    exam_name: Schema.Attribute.String;
    exam_date: Schema.Attribute.Date;
    subject_scores: Schema.Attribute.Component<'academic.subject-score', true>;
    total_obtained: Schema.Attribute.Decimal;
    total_maximum: Schema.Attribute.Decimal;
    overall_percentage: Schema.Attribute.Decimal;
    overall_grade: Schema.Attribute.String;
    rank: Schema.Attribute.Integer;
    remarks: Schema.Attribute.Text;
    academic_year: Schema.Attribute.Relation<
      'oneToOne',
      'api::academic-year.academic-year'
    >;
    class: Schema.Attribute.Relation<'oneToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    >;
  };
}

export interface ApiExpenseExpense extends Struct.CollectionTypeSchema {
  collectionName: 'expenses';
  info: {
    singularName: 'expense';
    pluralName: 'expenses';
    displayName: 'Expense';
    description: 'School operational expenses';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    expense_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    category: Schema.Attribute.Relation<
      'manyToOne',
      'api::expense-category.expense-category'
    > &
      Schema.Attribute.Required;
    vendor: Schema.Attribute.Relation<'manyToOne', 'api::vendor.vendor'>;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    invoice_number: Schema.Attribute.String;
    invoice_date: Schema.Attribute.Date;
    due_date: Schema.Attribute.Date;
    status: Schema.Attribute.Enumeration<
      ['draft', 'pending_approval', 'approved', 'paid', 'cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'draft'>;
    expense_payments: Schema.Attribute.Relation<
      'oneToMany',
      'api::expense-payment.expense-payment'
    >;
    approved_by: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    created_by_user: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::expense.expense'
    >;
  };
}

export interface ApiExpenseCategoryExpenseCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'expense_categories';
  info: {
    singularName: 'expense-category';
    pluralName: 'expense-categories';
    displayName: 'Expense Category';
    description: 'Categories for school operational expenses';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    description: Schema.Attribute.Text;
    parent_category: Schema.Attribute.Relation<
      'manyToOne',
      'api::expense-category.expense-category'
    >;
    budget_allocated: Schema.Attribute.Decimal;
    fiscal_year: Schema.Attribute.String & Schema.Attribute.Required;
    expense_type: Schema.Attribute.Enumeration<
      [
        'infrastructure',
        'maintenance',
        'salaries',
        'utilities',
        'supplies',
        'transport',
        'events',
        'academic',
        'administrative',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    expenses: Schema.Attribute.Relation<'oneToMany', 'api::expense.expense'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::expense-category.expense-category'
    >;
  };
}

export interface ApiExpensePaymentExpensePayment
  extends Struct.CollectionTypeSchema {
  collectionName: 'expense_payments';
  info: {
    singularName: 'expense-payment';
    pluralName: 'expense-payments';
    displayName: 'Expense Payment';
    description: 'Payments made against school expenses';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    expense: Schema.Attribute.Relation<'manyToOne', 'api::expense.expense'> &
      Schema.Attribute.Required;
    transaction: Schema.Attribute.Relation<
      'oneToOne',
      'api::transaction.transaction'
    > &
      Schema.Attribute.Required;
    amount_paid: Schema.Attribute.Decimal & Schema.Attribute.Required;
    payment_date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    payment_method: Schema.Attribute.Enumeration<
      ['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card', 'debit_card']
    > &
      Schema.Attribute.Required;
    reference_number: Schema.Attribute.String;
    approved_by: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::expense-payment.expense-payment'
    >;
  };
}

export interface ApiFeeAssignmentFeeAssignment
  extends Struct.CollectionTypeSchema {
  collectionName: 'fee_assignments';
  info: {
    singularName: 'fee-assignment';
    pluralName: 'fee-assignments';
    displayName: 'Fee Assignment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    fee: Schema.Attribute.Relation<
      'manyToOne',
      'api::fee-definition.fee-definition'
    > &
      Schema.Attribute.Required;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    bus_route: Schema.Attribute.Relation<
      'manyToOne',
      'api::bus-route.bus-route'
    >;
    bus_stop: Schema.Attribute.Relation<'manyToOne', 'api::bus-stop.bus-stop'>;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'>;
    start_date: Schema.Attribute.Date;
    end_date: Schema.Attribute.Date;
    priority: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    conditions: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-assignment.fee-assignment'
    >;
  };
}

export interface ApiFeeDefinitionFeeDefinition
  extends Struct.CollectionTypeSchema {
  collectionName: 'fee_definitions';
  info: {
    singularName: 'fee-definition';
    pluralName: 'fee-definitions';
    displayName: 'Fee Definition';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Relation<'manyToOne', 'api::fee-type.fee-type'> &
      Schema.Attribute.Required;
    base_amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'INR'>;
    frequency: Schema.Attribute.Enumeration<
      ['yearly', 'term', 'monthly', 'one_time']
    > &
      Schema.Attribute.Required;
    calculation_method: Schema.Attribute.Enumeration<
      ['flat', 'per_unit', 'formula']
    > &
      Schema.Attribute.DefaultTo<'flat'>;
    metadata: Schema.Attribute.JSON;
    installments: Schema.Attribute.Component<'fee.installment', true>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-definition.fee-definition'
    >;
  };
}

export interface ApiFeeTypeFeeType extends Struct.CollectionTypeSchema {
  collectionName: 'fee_types';
  info: {
    singularName: 'fee-type';
    pluralName: 'fee-types';
    displayName: 'Fee Type';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-type.fee-type'
    >;
  };
}

export interface ApiGuardianGuardian extends Struct.CollectionTypeSchema {
  collectionName: 'guardians';
  info: {
    singularName: 'guardian';
    pluralName: 'guardians';
    displayName: 'Guardian';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'>;
    full_name: Schema.Attribute.String & Schema.Attribute.Required;
    relation: Schema.Attribute.Enumeration<['father', 'mother', 'guardian']> &
      Schema.Attribute.Required;
    source: Schema.Attribute.String & Schema.Attribute.DefaultTo<'system'>;
    primary_contact: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    occupation: Schema.Attribute.String;
    documents: Schema.Attribute.Relation<
      'oneToMany',
      'api::student-document.student-document'
    >;
    contact_numbers: Schema.Attribute.Component<'common.contact', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
        },
        number
      >;
    addresses: Schema.Attribute.Component<'common.address', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::guardian.guardian'
    >;
  };
}

export interface ApiHouseHouse extends Struct.CollectionTypeSchema {
  collectionName: 'houses';
  info: {
    singularName: 'house';
    pluralName: 'houses';
    displayName: 'House';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::house.house'>;
  };
}

export interface ApiIncomeIncome extends Struct.CollectionTypeSchema {
  collectionName: 'incomes';
  info: {
    singularName: 'income';
    pluralName: 'incomes';
    displayName: 'Income';
    description: 'All non-fee income sources (donations, grants, rentals, etc.)';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    income_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    category: Schema.Attribute.Relation<
      'manyToOne',
      'api::income-category.income-category'
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    source_name: Schema.Attribute.String & Schema.Attribute.Required;
    source_type: Schema.Attribute.Enumeration<
      ['individual', 'organization', 'government', 'trust', 'corporate']
    > &
      Schema.Attribute.Required;
    received_date: Schema.Attribute.Date & Schema.Attribute.Required;
    transaction: Schema.Attribute.Relation<
      'oneToOne',
      'api::transaction.transaction'
    >;
    receipt_issued: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    receipt_number: Schema.Attribute.String;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::income.income'>;
  };
}

export interface ApiIncomeCategoryIncomeCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'income_categories';
  info: {
    singularName: 'income-category';
    pluralName: 'income-categories';
    displayName: 'Income Category';
    description: 'Categories for non-fee income sources';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    income_type: Schema.Attribute.Enumeration<
      [
        'donation',
        'grant',
        'rental',
        'event',
        'sale',
        'interest',
        'sponsorship',
        'fundraising',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    is_tax_deductible: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::income-category.income-category'
    >;
  };
}

export interface ApiLocationLocation extends Struct.CollectionTypeSchema {
  collectionName: 'locations';
  info: {
    singularName: 'location';
    pluralName: 'locations';
    displayName: 'Location';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    address: Schema.Attribute.Text;
    coordinates: Schema.Attribute.JSON;
    landmark: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    bus_stops: Schema.Attribute.Relation<'oneToMany', 'api::bus-stop.bus-stop'>;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::location.location'
    >;
  };
}

export interface ApiPaymentItemPaymentItem extends Struct.CollectionTypeSchema {
  collectionName: 'payment_items';
  info: {
    singularName: 'payment-item';
    pluralName: 'payment-items';
    displayName: 'Payment Item';
    description: 'Individual payment line items in a schedule';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    payment_schedule: Schema.Attribute.Relation<
      'manyToOne',
      'api::payment-schedule.payment-schedule'
    > &
      Schema.Attribute.Required;
    fee_definition: Schema.Attribute.Relation<
      'manyToOne',
      'api::fee-definition.fee-definition'
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.String & Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    discount_amount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    net_amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    due_date: Schema.Attribute.Date & Schema.Attribute.Required;
    installment_number: Schema.Attribute.Integer;
    status: Schema.Attribute.Enumeration<
      ['pending', 'partially_paid', 'paid', 'overdue', 'waived', 'cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    paid_amount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    transactions: Schema.Attribute.Relation<
      'manyToMany',
      'api::transaction.transaction'
    >;
    late_fee_applied: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    waiver_reason: Schema.Attribute.Text;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::payment-item.payment-item'
    >;
  };
}

export interface ApiPaymentSchedulePaymentSchedule
  extends Struct.CollectionTypeSchema {
  collectionName: 'payment_schedules';
  info: {
    singularName: 'payment-schedule';
    pluralName: 'payment-schedules';
    displayName: 'Payment Schedule';
    description: 'Master payment schedule for each enrollment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    schedule_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    enrollment: Schema.Attribute.Relation<
      'manyToOne',
      'api::enrollment.enrollment'
    > &
      Schema.Attribute.Required;
    total_amount: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    paid_amount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    status: Schema.Attribute.Enumeration<
      ['draft', 'active', 'suspended', 'completed', 'cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'draft'>;
    payment_items: Schema.Attribute.Relation<
      'oneToMany',
      'api::payment-item.payment-item'
    >;
    generated_at: Schema.Attribute.DateTime & Schema.Attribute.Required;
    activated_at: Schema.Attribute.DateTime;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::payment-schedule.payment-schedule'
    >;
  };
}

export interface ApiPlacePlace extends Struct.CollectionTypeSchema {
  collectionName: 'places';
  info: {
    singularName: 'place';
    pluralName: 'places';
    displayName: 'Place';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::place.place'>;
  };
}

export interface ApiSeatAllocationSeatAllocation
  extends Struct.CollectionTypeSchema {
  collectionName: 'seat_allocations';
  info: {
    singularName: 'seat-allocation';
    pluralName: 'seat-allocations';
    displayName: 'Seat Allocation';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bus: Schema.Attribute.Relation<'manyToOne', 'api::bus.bus'>;
    enrollment_administration: Schema.Attribute.Relation<
      'manyToOne',
      'api::enrollment-administration.enrollment-administration'
    >;
    pickup_stop: Schema.Attribute.Relation<
      'manyToOne',
      'api::bus-stop.bus-stop'
    >;
    allocation_date: Schema.Attribute.Date & Schema.Attribute.Required;
    valid_from: Schema.Attribute.Date & Schema.Attribute.Required;
    valid_until: Schema.Attribute.Date;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    allocation_type: Schema.Attribute.Enumeration<
      ['regular', 'temporary', 'emergency']
    > &
      Schema.Attribute.DefaultTo<'regular'>;
    monthly_fee: Schema.Attribute.Decimal;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::seat-allocation.seat-allocation'
    >;
  };
}

export interface ApiStudentStudent extends Struct.CollectionTypeSchema {
  collectionName: 'students';
  info: {
    singularName: 'student';
    pluralName: 'students';
    displayName: 'Student';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    gr_full_name: Schema.Attribute.String & Schema.Attribute.Required;
    aadhaar_full_name: Schema.Attribute.String;
    legal_name_source: Schema.Attribute.Enumeration<
      ['gr', 'aadhaar', 'manual']
    > &
      Schema.Attribute.DefaultTo<'gr'>;
    first_name: Schema.Attribute.String & Schema.Attribute.Required;
    middle_name: Schema.Attribute.String;
    last_name: Schema.Attribute.String & Schema.Attribute.Required;
    gender: Schema.Attribute.Enumeration<['male', 'female', 'other']> &
      Schema.Attribute.Required;
    dob: Schema.Attribute.Date & Schema.Attribute.Required;
    aadhaar_no: Schema.Attribute.String & Schema.Attribute.Private;
    ssa_uid: Schema.Attribute.String;
    apaar_id: Schema.Attribute.String;
    place: Schema.Attribute.Relation<'manyToOne', 'api::place.place'>;
    caste: Schema.Attribute.Relation<'manyToOne', 'api::caste.caste'>;
    house: Schema.Attribute.Relation<'manyToOne', 'api::house.house'>;
    village: Schema.Attribute.Relation<'manyToOne', 'api::location.location'>;
    guardians: Schema.Attribute.Relation<'oneToMany', 'api::guardian.guardian'>;
    enrollments: Schema.Attribute.Relation<
      'oneToOne',
      'api::enrollment.enrollment'
    >;
    documents: Schema.Attribute.Relation<
      'oneToMany',
      'api::student-document.student-document'
    >;
    exam_results: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    >;
    addresses: Schema.Attribute.Component<'common.address', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
        },
        number
      >;
    contacts: Schema.Attribute.Component<'common.contact', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::student.student'
    >;
  };
}

export interface ApiStudentDocumentStudentDocument
  extends Struct.CollectionTypeSchema {
  collectionName: 'student_documents';
  info: {
    singularName: 'student-document';
    pluralName: 'student-documents';
    displayName: 'Student Document';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    document_type: Schema.Attribute.Enumeration<
      [
        'student_photo',
        'guardian_photo',
        'birth_certificate',
        'aadhaar_card',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    ocr_json: Schema.Attribute.JSON;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    uploaded_by: Schema.Attribute.String;
    uploaded_at: Schema.Attribute.DateTime;
    description: Schema.Attribute.String;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'>;
    guardian: Schema.Attribute.Relation<'manyToOne', 'api::guardian.guardian'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::student-document.student-document'
    >;
  };
}

export interface ApiStudentWalletStudentWallet
  extends Struct.CollectionTypeSchema {
  collectionName: 'student_wallets';
  info: {
    singularName: 'student-wallet';
    pluralName: 'student-wallets';
    displayName: 'Student Wallet';
    description: "Digital wallet for student's miscellaneous school expenses";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    student: Schema.Attribute.Relation<'oneToOne', 'api::student.student'> &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    wallet_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    current_balance: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    total_deposits: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    total_withdrawals: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    status: Schema.Attribute.Enumeration<['active', 'frozen', 'closed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    daily_spending_limit: Schema.Attribute.Decimal;
    low_balance_threshold: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<100>;
    wallet_transactions: Schema.Attribute.Relation<
      'oneToMany',
      'api::wallet-transaction.wallet-transaction'
    >;
    last_activity: Schema.Attribute.DateTime;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::student-wallet.student-wallet'
    >;
  };
}

export interface ApiTransactionTransaction extends Struct.CollectionTypeSchema {
  collectionName: 'transactions';
  info: {
    singularName: 'transaction';
    pluralName: 'transactions';
    displayName: 'Transaction';
    description: 'Unified transaction table for all payments and expenses';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    transaction_number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    transaction_type: Schema.Attribute.Enumeration<
      ['income', 'expense', 'transfer', 'refund']
    > &
      Schema.Attribute.Required;
    transaction_category: Schema.Attribute.Enumeration<
      [
        'student_fee',
        'transport_fee',
        'lab_fee',
        'exam_fee',
        'wallet_topup',
        'wallet_deduction',
        'maintenance',
        'salary',
        'utilities',
        'supplies',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    currency: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'INR'>;
    payment_method: Schema.Attribute.Enumeration<
      [
        'cash',
        'cheque',
        'bank_transfer',
        'upi',
        'credit_card',
        'debit_card',
        'wallet',
        'online',
      ]
    > &
      Schema.Attribute.Required;
    transaction_date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    reference_number: Schema.Attribute.String;
    bank_reference: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<
      ['pending', 'completed', 'failed', 'cancelled', 'refunded']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    payment_items: Schema.Attribute.Relation<
      'manyToMany',
      'api::payment-item.payment-item'
    >;
    expense_payment: Schema.Attribute.Relation<
      'oneToOne',
      'api::expense-payment.expense-payment'
    >;
    wallet_transaction: Schema.Attribute.Relation<
      'oneToOne',
      'api::wallet-transaction.wallet-transaction'
    >;
    payer_name: Schema.Attribute.String;
    payer_contact: Schema.Attribute.String;
    receipt_number: Schema.Attribute.String;
    processed_by: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    notes: Schema.Attribute.Text;
    metadata: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::transaction.transaction'
    >;
  };
}

export interface ApiVendorVendor extends Struct.CollectionTypeSchema {
  collectionName: 'vendors';
  info: {
    singularName: 'vendor';
    pluralName: 'vendors';
    displayName: 'Vendor';
    description: 'Suppliers and service providers for the school';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    vendor_type: Schema.Attribute.Enumeration<
      ['supplier', 'contractor', 'service_provider', 'other']
    > &
      Schema.Attribute.Required;
    contact_person: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    status: Schema.Attribute.Enumeration<['active', 'inactive']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::vendor.vendor'>;
  };
}

export interface ApiWalletTransactionWalletTransaction
  extends Struct.CollectionTypeSchema {
  collectionName: 'wallet_transactions';
  info: {
    singularName: 'wallet-transaction';
    pluralName: 'wallet-transactions';
    displayName: 'Wallet Transaction';
    description: 'Individual wallet operations (topup, spending)';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    wallet: Schema.Attribute.Relation<
      'manyToOne',
      'api::student-wallet.student-wallet'
    > &
      Schema.Attribute.Required;
    transaction_type: Schema.Attribute.Enumeration<
      ['deposit', 'withdrawal', 'purchase', 'refund']
    > &
      Schema.Attribute.Required;
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    balance_before: Schema.Attribute.Decimal & Schema.Attribute.Required;
    balance_after: Schema.Attribute.Decimal & Schema.Attribute.Required;
    description: Schema.Attribute.String & Schema.Attribute.Required;
    category: Schema.Attribute.Enumeration<
      [
        'canteen',
        'stationery',
        'uniform',
        'books',
        'field_trip',
        'event',
        'sports',
        'library',
        'topup',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    transaction: Schema.Attribute.Relation<
      'oneToOne',
      'api::transaction.transaction'
    >;
    item_details: Schema.Attribute.JSON;
    transaction_date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    performed_by: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::wallet-transaction.wallet-transaction'
    >;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Schema.Attribute.String;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    preferedLanguage: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'>;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'>;
  };
}

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Schema.Attribute.DateTime;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'>;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Schema.Attribute.DateTime;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    >;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::academic-year.academic-year': ApiAcademicYearAcademicYear;
      'api::bus.bus': ApiBusBus;
      'api::bus-route.bus-route': ApiBusRouteBusRoute;
      'api::bus-stop.bus-stop': ApiBusStopBusStop;
      'api::caste.caste': ApiCasteCaste;
      'api::class.class': ApiClassClass;
      'api::division.division': ApiDivisionDivision;
      'api::enrollment.enrollment': ApiEnrollmentEnrollment;
      'api::enrollment-administration.enrollment-administration': ApiEnrollmentAdministrationEnrollmentAdministration;
      'api::exam-result.exam-result': ApiExamResultExamResult;
      'api::expense.expense': ApiExpenseExpense;
      'api::expense-category.expense-category': ApiExpenseCategoryExpenseCategory;
      'api::expense-payment.expense-payment': ApiExpensePaymentExpensePayment;
      'api::fee-assignment.fee-assignment': ApiFeeAssignmentFeeAssignment;
      'api::fee-definition.fee-definition': ApiFeeDefinitionFeeDefinition;
      'api::fee-type.fee-type': ApiFeeTypeFeeType;
      'api::guardian.guardian': ApiGuardianGuardian;
      'api::house.house': ApiHouseHouse;
      'api::income.income': ApiIncomeIncome;
      'api::income-category.income-category': ApiIncomeCategoryIncomeCategory;
      'api::location.location': ApiLocationLocation;
      'api::payment-item.payment-item': ApiPaymentItemPaymentItem;
      'api::payment-schedule.payment-schedule': ApiPaymentSchedulePaymentSchedule;
      'api::place.place': ApiPlacePlace;
      'api::seat-allocation.seat-allocation': ApiSeatAllocationSeatAllocation;
      'api::student.student': ApiStudentStudent;
      'api::student-document.student-document': ApiStudentDocumentStudentDocument;
      'api::student-wallet.student-wallet': ApiStudentWalletStudentWallet;
      'api::transaction.transaction': ApiTransactionTransaction;
      'api::vendor.vendor': ApiVendorVendor;
      'api::wallet-transaction.wallet-transaction': ApiWalletTransactionWalletTransaction;
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
    }
  }
}
