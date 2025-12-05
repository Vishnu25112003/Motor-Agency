const { Router } = require("express");
const multer = require("multer");
const { uploadFile } = require("../controllers/files.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const router = Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

module.exports = router;

