const { uploadBuffer } = require("../cloudinary");
const { storage } = require("../storage");

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const uploadResult = await uploadBuffer(req.file.buffer, {
    folder: `motortest/${req.user.type.toLowerCase()}/${req.user.id}`,
    resourceType: "raw",
  });

  const file = await storage.createFile({
    provider: "cloudinary",
    providerPublicId: uploadResult.publicId,
    secureUrl: uploadResult.secureUrl,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    filesizeBytes: uploadResult.bytes,
    folder: `motortest/${req.user.type.toLowerCase()}/${req.user.id}`,
    version: uploadResult.version,
    metadata: null,
    uploadedByType: req.user.type,
    uploadedById: req.user.id,
  });

  return res.status(201).json(file);
}

module.exports = { uploadFile };

