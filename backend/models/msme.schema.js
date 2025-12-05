const { Schema, model } = require("mongoose");

const MSMESchema = new Schema(
  {
    associationId: { type: Schema.Types.ObjectId, ref: "Association" },
    name: { type: String, required: true },
    governmentApprovalId: { type: String, unique: true, sparse: true },
    productCategory: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    addedById: { type: Schema.Types.ObjectId, ref: "Admin" },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

MSMESchema.virtual("id").get(function () {
  return this._id.toString();
});

MSMESchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const MSMEModel = model("MSME", MSMESchema);

module.exports = { MSMEModel };

