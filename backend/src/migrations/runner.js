const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Define a simple migration model to track executed migrations
const MigrationSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  executedAt: { type: Date, default: Date.now }
});

const MigrationModel = mongoose.models.Migration || mongoose.model("Migration", MigrationSchema);

async function runMigrations(direction = "up") {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith(".js") && file !== "runner.js")
    .sort();

  logger.info(`Found ${files.length} migration files. Direction: ${direction}`);

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = require(migrationPath);

    if (direction === "up") {
      const alreadyRun = await MigrationModel.exists({ name: file });
      if (alreadyRun) {
        logger.info(`Migration ${file} already applied. Skipping.`);
        continue;
      }

      logger.info(`Applying migration: ${file}`);
      try {
        await migration.up();
        await MigrationModel.create({ name: file });
        logger.info(`Successfully applied migration: ${file}`);
      } catch (err) {
        logger.error(`Migration ${file} failed:`, err);
        throw err;
      }
    } else if (direction === "down") {
      const runRecord = await MigrationModel.findOne({ name: file });
      if (!runRecord) {
        logger.info(`Migration ${file} not applied. Skipping rollback.`);
        continue;
      }

      logger.info(`Rolling back migration: ${file}`);
      try {
        await migration.down();
        await MigrationModel.deleteOne({ name: file });
        logger.info(`Successfully rolled back migration: ${file}`);
      } catch (err) {
        logger.error(`Rollback of ${file} failed:`, err);
        throw err;
      }
    }
  }
}

module.exports = { runMigrations, MigrationModel };
