const { Schema, model } = require("mongoose");

const AssociationSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

AssociationSchema.virtual("id").get(function () {
  return this._id.toString();
});

AssociationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const AssociationModel = model("Association", AssociationSchema);

module.exports = { AssociationModel };

