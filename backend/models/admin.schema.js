const { Schema, model } = require("mongoose");

const AdminSchema = new Schema(
  {
    associationId: { type: Schema.Types.ObjectId, ref: "Association" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "SUPER_ADMIN"], default: "ADMIN" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

AdminSchema.virtual("id").get(function () {
  return this._id.toString();
});

AdminSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const AdminModel = model("Admin", AdminSchema);

module.exports = { AdminModel };

