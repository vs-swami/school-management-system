/**
 * Script to set up permissions for different roles
 * Run with: node setup-permissions.js
 */

const { createStrapi } = require('@strapi/strapi');

const setupPermissions = async () => {
  const appStrapi = await createStrapi().load();

  console.log('🔐 Setting up role permissions...\n');

  try {
    // Get all API controllers
    const apiControllers = [
      'api::student.student',
      'api::enrollment.enrollment',
      'api::guardian.guardian',
      'api::class.class',
      'api::division.division',
      'api::academic-year.academic-year',
      'api::student-document.student-document',
      'api::exam-result.exam-result',
      'api::enrollment-administration.enrollment-administration',
      'api::bus.bus',
      'api::bus-route.bus-route',
      'api::bus-stop.bus-stop',
      'api::caste.caste',
      'api::fee-assignment.fee-assignment',
      'api::fee-definition.fee-definition',
      'api::fee-type.fee-type',
      'api::house.house',
      'api::location.location',
      'api::place.place',
      'api::seat-allocation.seat-allocation'
    ];

    // Define permissions for each role
    const rolePermissions = {
      'Clerk': {
        actions: ['find', 'findOne', 'create', 'update'],
        description: 'Can view, create and update student records'
      },
      'admission-clerk': {
        actions: ['find', 'findOne', 'create', 'update'],
        description: 'Can view, create and update student records'
      },
      'Principal': {
        actions: ['find', 'findOne', 'create', 'update', 'delete'],
        description: 'Full access to all student records'
      },
      'principal': {
        actions: ['find', 'findOne', 'create', 'update', 'delete'],
        description: 'Full access to all student records'
      },
      'Authenticated': {
        actions: ['find', 'findOne'],
        description: 'Read-only access'
      }
    };

    // Get all roles
    const roles = await appStrapi.query('plugin::users-permissions.role').findMany({
      populate: ['permissions']
    });

    console.log('Found roles:', roles.map(r => r.name).join(', '));

    for (const role of roles) {
      const permissionConfig = rolePermissions[role.name] || rolePermissions[role.type];

      if (!permissionConfig) {
        console.log(`⏭️  Skipping role: ${role.name} (no configuration defined)`);
        continue;
      }

      console.log(`\n📋 Configuring ${role.name} role...`);
      console.log(`   ${permissionConfig.description}`);

      // Get existing permissions for this role
      const existingPermissions = await appStrapi.query('plugin::users-permissions.permission').findMany({
        where: { role: role.id }
      });

      // Create/update permissions for each API controller
      for (const controller of apiControllers) {
        for (const action of permissionConfig.actions) {
          // Check if permission already exists
          const existingPerm = existingPermissions.find(p =>
            p.action === `${controller}.${action}`
          );

          if (!existingPerm) {
            // Create new permission
            await appStrapi.query('plugin::users-permissions.permission').create({
              data: {
                action: `${controller}.${action}`,
                role: role.id,
                enabled: true
              }
            });
            console.log(`   ✅ Added: ${controller}.${action}`);
          } else if (!existingPerm.enabled) {
            // Enable existing permission
            await appStrapi.query('plugin::users-permissions.permission').update({
              where: { id: existingPerm.id },
              data: { enabled: true }
            });
            console.log(`   ✅ Enabled: ${controller}.${action}`);
          } else {
            console.log(`   ✓ Already enabled: ${controller}.${action}`);
          }
        }
      }

      // Also enable upload permissions for clerk and principal
      if (['Clerk', 'admission-clerk', 'Principal', 'principal'].includes(role.name) ||
          ['clerk', 'admission_clerk', 'principal'].includes(role.type)) {
        const uploadActions = [
          'plugin::upload.content-api.find',
          'plugin::upload.content-api.findOne',
          'plugin::upload.content-api.upload',
          'plugin::upload.content-api.destroy'
        ];

        for (const action of uploadActions) {
          const existingPerm = existingPermissions.find(p => p.action === action);

          if (!existingPerm) {
            await appStrapi.query('plugin::users-permissions.permission').create({
              data: {
                action: action,
                role: role.id,
                enabled: true
              }
            });
            console.log(`   ✅ Added upload permission: ${action}`);
          } else if (!existingPerm.enabled) {
            await appStrapi.query('plugin::users-permissions.permission').update({
              where: { id: existingPerm.id },
              data: { enabled: true }
            });
            console.log(`   ✅ Enabled upload permission: ${action}`);
          }
        }
      }

      // Enable user permissions for all authenticated users
      if (role.type === 'authenticated' || ['Clerk', 'Principal', 'admission-clerk', 'principal'].includes(role.name)) {
        const userActions = [
          'plugin::users-permissions.user.me',
          'plugin::users-permissions.auth.changePassword'
        ];

        for (const action of userActions) {
          const existingPerm = existingPermissions.find(p => p.action === action);

          if (!existingPerm) {
            await appStrapi.query('plugin::users-permissions.permission').create({
              data: {
                action: action,
                role: role.id,
                enabled: true
              }
            });
            console.log(`   ✅ Added user permission: ${action}`);
          } else if (!existingPerm.enabled) {
            await appStrapi.query('plugin::users-permissions.permission').update({
              where: { id: existingPerm.id },
              data: { enabled: true }
            });
            console.log(`   ✅ Enabled user permission: ${action}`);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Permissions Setup Complete!');
    console.log('='.repeat(50));
    console.log('\n📊 Permission Summary:');
    console.log('  • Clerk: Can view, create, and update records');
    console.log('  • Principal: Full access (view, create, update, delete)');
    console.log('  • Authenticated: Read-only access');
    console.log('\n🔄 Please restart Strapi for changes to take effect:');
    console.log('  npm run develop');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error setting up permissions:', error);
  } finally {
    await appStrapi.destroy();
    process.exit(0);
  }
};

// Run the script
setupPermissions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});