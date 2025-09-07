const strapi = require('@strapi/strapi');

async function seed() {
  console.log('Starting seeding process...');

  try {
    // Initialize Strapi application (necessary to access entityService)
    const app = await strapi().start();

    // 1. Seed Academic Years
    const academicYearsData = require('./src/seed/academic-years');
    for (const yearData of academicYearsData) {
      const existingYear = await app.db.query('api::academic-year.academic-year').findOne({ where: { code: yearData.code } });
      if (!existingYear) {
        await app.entityService.create('api::academic-year.academic-year', { data: yearData });
        console.log(`Academic Year ${yearData.code} created.`);
      } else {
        console.log(`Academic Year ${yearData.code} already exists.`);
      }
    }

    // 2. Seed Divisions
    const divisionsData = require('./src/seed/divisions');
    for (const divisionData of divisionsData) {
      const existingDivision = await app.db.query('api::division.division').findOne({ where: { name: divisionData.name } });
      if (!existingDivision) {
        await app.entityService.create('api::division.division', { data: divisionData });
        console.log(`Division ${divisionData.name} created.`);
      } else {
        console.log(`Division ${divisionData.name} already exists.`);
      }
    }

    // 3. Seed Houses
    const housesData = require('./src/seed/houses');
    for (const houseData of housesData) {
      const existingHouse = await app.db.query('api::house.house').findOne({ where: { name: houseData.name } });
      if (!existingHouse) {
        await app.entityService.create('api::house.house', { data: houseData });
        console.log(`House ${houseData.name} created.`);
      } else {
        console.log(`House ${houseData.name} already exists.`);
      }
    }

    console.log('Seeding process completed!');
  } catch (error) {
    console.error('Error during seeding process:', error);
  }

  process.exit(0);
}

seed();
