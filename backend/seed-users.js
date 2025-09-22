/**
 * Standalone script to create test users
 * Run with: node seed-users.js
 */

const { createStrapi } = require('@strapi/strapi');

const createTestUsers = async () => {
  // Start Strapi programmatically
  const appStrapi = await createStrapi().load();

  console.log('🌱 Creating test users...\n');

  try {
    // Get role service
    const roleService = appStrapi.plugin('users-permissions').service('role');

    // Get all existing roles
    const roles = await appStrapi.query('plugin::users-permissions.role').findMany();
    console.log('Available roles:', roles.map(r => `${r.name} (type: ${r.type})`).join(', '));

    // Find or create custom roles
    let clerkRole = roles.find(r =>
      r.name === 'Clerk' ||
      r.type === 'clerk' ||
      r.name === 'Admission Clerk'
    );

    let principalRole = roles.find(r =>
      r.name === 'Principal' ||
      r.type === 'principal' ||
      r.name === 'Administrator'
    );

    // If custom roles don't exist, use authenticated role
    const authenticatedRole = roles.find(r => r.type === 'authenticated');

    if (!clerkRole) {
      console.log('⚠️  Clerk role not found, creating...');
      clerkRole = await appStrapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Clerk',
          description: 'Admission clerk role',
          type: 'clerk'
        }
      });
    }

    if (!principalRole) {
      console.log('⚠️  Principal role not found, creating...');
      principalRole = await appStrapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Principal',
          description: 'Principal/Administrator role',
          type: 'principal'
        }
      });
    }

    // Test users data
    const testUsers = [
      {
        username: 'clerk.test',
        email: 'clerk@test.com',
        password: 'ClerkTest123!',
        role: clerkRole?.id || authenticatedRole.id,
        confirmed: true,
        blocked: false,
        provider: 'local'
      },
      {
        username: 'principal.test',
        email: 'principal@test.com',
        password: 'PrincipalTest123!',
        role: principalRole?.id || authenticatedRole.id,
        confirmed: true,
        blocked: false,
        provider: 'local'
      },
      {
        username: 'student.test',
        email: 'student@test.com',
        password: 'StudentTest123!',
        role: authenticatedRole.id,
        confirmed: true,
        blocked: false,
        provider: 'local'
      }
    ];

    // Create users
    for (const userData of testUsers) {
      try {
        // Check if user exists
        const existingUser = await appStrapi.query('plugin::users-permissions.user').findOne({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`✅ User already exists: ${userData.email}`);

          // Update role if different
          if (existingUser.role?.id !== userData.role) {
            await appStrapi.query('plugin::users-permissions.user').update({
              where: { id: existingUser.id },
              data: { role: userData.role }
            });
            console.log(`   Updated role for ${userData.email}`);
          }
        } else {
          // Create new user
          const newUser = await appStrapi.plugin('users-permissions').service('user').add({
            ...userData,
            role: userData.role
          });
          console.log(`✅ Created user: ${userData.email} with role ID: ${userData.role}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Test Users Created Successfully!');
    console.log('='.repeat(50));
    console.log('\n📝 Login Credentials:\n');
    console.log('CLERK USER:');
    console.log('  Email: clerk@test.com');
    console.log('  Password: ClerkTest123!');
    console.log('  Role: Admission Clerk (can process applications)');
    console.log('\nPRINCIPAL USER:');
    console.log('  Email: principal@test.com');
    console.log('  Password: PrincipalTest123!');
    console.log('  Role: Principal (can approve/reject enrollments)');
    console.log('\nSTUDENT/PARENT USER:');
    console.log('  Email: student@test.com');
    console.log('  Password: StudentTest123!');
    console.log('  Role: Authenticated (view-only access)');
    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close Strapi
    await appStrapi.destroy();
    process.exit(0);
  }
};

// Run the script
createTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});