const { Schema, model } = require("mongoose");

const TestResultSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: "TestingAgency", required: true },
    score: { type: Number },
    resultFileId: { type: Schema.Types.ObjectId, ref: "File" },
    comments: { type: String },
    verified: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

TestResultSchema.virtual("id").get(function () {
  return this._id.toString();
});

TestResultSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const TestResultModel = model("TestResult", TestResultSchema);

module.exports = { TestResultModel };

