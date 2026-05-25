const path = require("path");

const validateUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"]
  } = options;

  return (req, res, next) => {
    // If no files are attached (multer maps to req.file or req.files), proceed
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }

    const files = req.file ? [req.file] : Object.values(req.files).flat();

    for (const file of files) {
      // 1. Size Check
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
          data: null,
          error: { code: "UPLOAD_FILE_TOO_LARGE" }
        });
      }

      // 2. MIME Type Check
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type: ${file.mimetype}`,
          data: null,
          error: { code: "UPLOAD_UNSUPPORTED_TYPE" }
        });
      }

      // 3. Extension Check
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file extension: ${ext}`,
          data: null,
          error: { code: "UPLOAD_UNSUPPORTED_EXTENSION" }
        });
      }
    }

    next();
  };
};

module.exports = validateUpload;
