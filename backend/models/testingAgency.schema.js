const { Schema, model } = require("mongoose");

const TestingAgencySchema = new Schema(
  {
    name: { type: String, required: true },
    approvalId: { type: String, required: true, unique: true },
    approvalCertificateFileId: { type: Schema.Types.ObjectId, ref: "File" },
    location: { type: String },
    agencyType: { type: String },
    addedById: { type: Schema.Types.ObjectId, ref: "Admin" },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

TestingAgencySchema.virtual("id").get(function () {
  return this._id.toString();
});

TestingAgencySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const TestingAgencyModel = model("TestingAgency", TestingAgencySchema);

module.exports = { TestingAgencyModel };

