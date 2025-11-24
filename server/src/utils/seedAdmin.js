const Admin = require('../models/Admin');

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'Andii0817@',
};

const seedAdmin = async () => {
  const existing = await Admin.findOne({ username: DEFAULT_ADMIN.username });
  if (existing) {
    return existing;
  }
  const admin = await Admin.create(DEFAULT_ADMIN);
  console.log(`👑 Seeded default admin "${admin.username}"`);
  return admin;
};

module.exports = seedAdmin;

