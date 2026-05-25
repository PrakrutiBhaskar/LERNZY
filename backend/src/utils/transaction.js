const mongoose = require("mongoose");
const logger = require("./logger");

/**
 * Runs a set of database actions inside a transaction session.
 * If transactions are not supported by the MongoDB deployment (e.g. standalone local instances
 * or memory-based test servers), it falls back gracefully to executing sequential operations.
 *
 * @param {Function} actions - A function taking (session) and returning a promise.
 * @returns {Promise<any>}
 */
async function runWithTransaction(actions) {
  // If not connected to MongoDB, bypass transaction creation to prevent timeouts
  if (mongoose.connection?.readyState !== 1) {
    logger.warn("Database not connected. Running operations sequentially without isolation.");
    return actions(null);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await actions(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    // If command is not supported (standalone MongoDB instances), degrade gracefully to sequential writes.
    const isUnsupported =
      error.message?.includes("transaction") ||
      error.message?.includes("replica set") ||
      error.codeName === "CommandNotSupported" ||
      error.code === 20; // Code for CommandNotSupported

    if (isUnsupported) {
      logger.warn("Transactions not supported by deployment. Running operations sequentially without isolation.");
      return actions(null);
    }

    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { runWithTransaction };
