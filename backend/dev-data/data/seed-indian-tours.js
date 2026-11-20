const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: path.resolve(__dirname, '../../config.env') });

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'indian-tours.json'), 'utf8')
);

const seedIndianTours = async () => {
  const database = process.env.DATABASE;
  if (!database) {
    throw new Error('DATABASE must be configured before seeding tours.');
  }

  const connectionString = database.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD || ''
  );
  await mongoose.connect(connectionString);

  const result = await Tour.bulkWrite(
    tours.map((tour) => ({
      updateOne: {
        filter: { slug: tour.slug },
        update: { $set: tour },
        upsert: true
      }
    }))
  );

  console.log(
    `Indian tour seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated. Existing unrelated tours were preserved.`
  );
};

seedIndianTours()
  .catch((error) => {
    console.error('Indian tour seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
