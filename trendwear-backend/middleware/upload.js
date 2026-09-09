const multer = require("multer");
const ApiError = require("./apiError");

// Buffer the upload in memory and stream it straight to Cloudinary in the
// controller — no need to write product images to local disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new ApiError(400, "Only image uploads are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
