/**
 * Middleware to sanitize user input against NoSQL Injection attacks.
 * It recursively checks req.body, req.query, and req.params and removes
 * any object keys starting with '$' (Mongo query operators).
 */

function sanitize(obj) {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith("$")) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      }
    }
  }
}

const nosqlSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

module.exports = nosqlSanitize;
