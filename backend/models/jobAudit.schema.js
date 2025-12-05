const { Schema, model } = require("mongoose");

const JobAuditSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    changedByType: {
      type: String,
      enum: ["MSME", "AGENCY", "ADMIN"],
      required: true,
    },
    changedById: { type: Schema.Types.ObjectId },
    notes: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  },
);

JobAuditSchema.virtual("id").get(function () {
  return this._id.toString();
});

JobAuditSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const JobAuditModel = model("JobAudit", JobAuditSchema);

module.exports = { JobAuditModel };

