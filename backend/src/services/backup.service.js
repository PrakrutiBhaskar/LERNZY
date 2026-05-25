const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const BACKUPS_DIR = path.join(__dirname, "../../backups");

// Ensure backups directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

/**
 * Generates a full database backup in compressed JSON.gz format
 * @returns {Promise<string>} Path to the created backup file
 */
async function createBackup() {
  try {
    const backupData = {};
    const models = mongoose.modelNames();

    for (const modelName of models) {
      const model = mongoose.model(modelName);
      // Fetch all documents bypassing query filters (e.g. soft deletes)
      const docs = await model.find({}).lean();
      backupData[modelName] = docs;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(BACKUPS_DIR, `lernzy_backup_${timestamp}.json.gz`);
    
    // Gzip compress the backup payload
    const jsonString = JSON.stringify(backupData);
    const compressed = zlib.gzipSync(jsonString);

    fs.writeFileSync(backupFilePath, compressed);
    logger.info(`Compressed database backup created successfully: ${backupFilePath}`);
    return backupFilePath;
  } catch (error) {
    logger.error("Failed to create database backup:", error);
    throw error;
  }
}

/**
 * Restores a database backup and verifies data counts match
 * @param {string} backupFilePath - Path to the JSON.gz backup file
 * @returns {Promise<boolean>} True if verification succeeds
 */
async function verifyRestore(backupFilePath) {
  try {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found at ${backupFilePath}`);
    }

    const compressedData = fs.readFileSync(backupFilePath);
    // Decompress gzip payload
    const jsonString = zlib.gunzipSync(compressedData).toString("utf8");
    const backupData = JSON.parse(jsonString);

    // Run verification inside session if possible
    for (const modelName of Object.keys(backupData)) {
      const model = mongoose.model(modelName);
      const backupDocs = backupData[modelName];

      // Clean current collection
      await model.deleteMany({});

      // Insert backup docs
      if (backupDocs.length > 0) {
        await model.insertMany(backupDocs);
      }

      // Assert count matches
      const currentCount = await model.countDocuments({});
      if (currentCount !== backupDocs.length) {
        throw new Error(`Integrity Verification Failed for ${modelName}: expected ${backupDocs.length} docs, got ${currentCount}`);
      }
    }

    logger.info("Database backup restore verification completed successfully.");
    return true;
  } catch (error) {
    logger.error("Database restore verification failed:", error);
    throw error;
  }
}

// Scheduled backups: trigger backup every 24 hours if enabled
if (process.env.AUTO_BACKUP_ENABLED === "true") {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(async () => {
    logger.info("Triggering scheduled database backup...");
    try {
      const filePath = await createBackup();
      // Verify immediately to confirm integrity
      await verifyRestore(filePath);
    } catch (e) {
      logger.error("Scheduled backup flow failed:", e);
    }
  }, BACKUP_INTERVAL);
}

module.exports = { createBackup, verifyRestore };
