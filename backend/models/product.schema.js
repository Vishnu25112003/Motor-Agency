const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    addedById: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

ProductSchema.virtual("id").get(function () {
  return this._id.toString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const ProductModel = model("Product", ProductSchema);

module.exports = { ProductModel };

