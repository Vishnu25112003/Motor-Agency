const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBuffer(
  buffer,
  options = {}
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "motortest/uploads",
        resource_type: options.resourceType || "auto",
        public_id: options.publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            bytes: result.bytes,
            version: result.version.toString(),
            format: result.format,
          });
        } else {
          reject(new Error("Upload failed with no result"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

async function deleteFile(publicId) {
  await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadBuffer, deleteFile, cloudinary };
