require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { SuperAdmin } = require('../models/User');

const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@sanmanager.com';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'changeme123';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await SuperAdmin.findOne({ email: EMAIL });
  if (existing) {
    console.log(`Super admin already exists: ${EMAIL}`);
    process.exit(0);
  }

  await SuperAdmin.create({ email: EMAIL, password: PASSWORD, createdBy: null });
  console.log(`Super admin created: ${EMAIL}`);
  process.exit(0);
})();
