const { Schema, model } = require("mongoose");

const FileSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["cloudinary", "local"],
      default: "local",
      required: true,
    },
    providerPublicId: { type: String },
    secureUrl: { type: String },
    filename: { type: String },
    mimeType: { type: String },
    filesizeBytes: { type: Number },
    folder: { type: String },
    version: { type: String },
    metadata: { type: String },
    uploadedByType: {
      type: String,
      enum: ["MSME", "ADMIN", "AGENCY"],
      required: true,
    },
    uploadedById: { type: Schema.Types.Mixed, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

FileSchema.virtual("id").get(function () {
  return this._id.toString();
});

FileSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const FileModel = model("File", FileSchema);

module.exports = { FileModel };

