/**
 * Script to create test users with different roles
 * Run this script to set up clerk and principal test users
 */

const createTestUsers = async (strapi) => {
  console.log('🌱 Starting test user creation...');

  try {
    // Get the users-permissions plugin services
    const userService = strapi.plugin('users-permissions').service('user');
    const roleService = strapi.plugin('users-permissions').service('role');

    // Find or create roles
    let clerkRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Clerk' }
    });

    if (!clerkRole) {
      console.log('Creating Clerk role...');
      clerkRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Clerk',
          description: 'Admission clerk role for processing student applications',
          type: 'clerk'
        }
      });
    }

    let principalRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Principal' }
    });

    if (!principalRole) {
      console.log('Creating Principal role...');
      principalRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Principal',
          description: 'Principal role for approving enrollments',
          type: 'principal'
        }
      });
    }

    // Create test users
    const testUsers = [
      {
        username: 'clerk.test',
        email: 'clerk@test.com',
        password: 'ClerkTest123!',
        role: clerkRole.id,
        confirmed: true,
        blocked: false,
        firstName: 'John',
        lastName: 'Clerk'
      },
      {
        username: 'principal.test',
        email: 'principal@test.com',
        password: 'PrincipalTest123!',
        role: principalRole.id,
        confirmed: true,
        blocked: false,
        firstName: 'Jane',
        lastName: 'Principal'
      },
      {
        username: 'admin.test',
        email: 'admin@test.com',
        password: 'AdminTest123!',
        role: 1, // Admin role usually has ID 1
        confirmed: true,
        blocked: false,
        firstName: 'Admin',
        lastName: 'User'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        console.log(`Creating user: ${userData.username}`);

        // Create the user
        const newUser = await strapi.query('plugin::users-permissions.user').create({
          data: userData
        });

        console.log(`✅ Created user: ${userData.username} with role ID: ${userData.role}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.username}`);

        // Optionally update the user's role if needed
        if (existingUser.role?.id !== userData.role) {
          await strapi.query('plugin::users-permissions.user').update({
            where: { id: existingUser.id },
            data: { role: userData.role }
          });
          console.log(`   Updated role for: ${userData.username}`);
        }
      }
    }

    console.log('\n✨ Test users created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('------------------------');
    console.log('Clerk User:');
    console.log('  Email: clerk@test.com');
    console.log('  Password: ClerkTest123!');
    console.log('\nPrincipal User:');
    console.log('  Email: principal@test.com');
    console.log('  Password: PrincipalTest123!');
    console.log('\nAdmin User:');
    console.log('  Email: admin@test.com');
    console.log('  Password: AdminTest123!');
    console.log('------------------------\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
};

module.exports = createTestUsers;