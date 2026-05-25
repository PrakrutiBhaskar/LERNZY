const User = require("../models/User.model");

async function up() {
  // Add defaults to existing users using raw update (bypass soft-delete find query filter)
  await User.updateMany(
    { isDeleted: { $exists: false } },
    { $set: { isDeleted: false } },
    { strict: false }
  );
}

async function down() {
  // Remove fields on rollback
  await User.updateMany(
    {},
    { $unset: { isDeleted: "", deletedAt: "" } },
    { strict: false }
  );
}

module.exports = { up, down };
