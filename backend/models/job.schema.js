const { Schema, model } = require("mongoose");

const JobSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    msmeId: { type: Schema.Types.ObjectId, ref: "MSME", required: true },
    title: { type: String, required: true },
    description: { type: String },
    detailsFileId: { type: Schema.Types.ObjectId, ref: "File" },
    currentStatus: {
      type: String,
      enum: ["DRAFT", "UNDER_TESTING", "ASSIGNED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "DRAFT",
      required: true,
    },
    statusUpdatedAt: { type: Date, default: Date.now },
    assignedAgencyId: { type: Schema.Types.ObjectId, ref: "TestingAgency" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

JobSchema.virtual("id").get(function () {
  return this._id.toString();
});

JobSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const JobModel = model("Job", JobSchema);

module.exports = { JobModel };

