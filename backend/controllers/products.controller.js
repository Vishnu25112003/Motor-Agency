const { storage } = require("../storage");

async function getProducts(req, res) {
  const products = await storage.getAllProducts();
  return res.json(products);
}

async function createProduct(req, res) {
  // Skip schema validation for now since it requires @shared/schema
  // In a real implementation, you would add validation here
  const data = {
    ...req.body,
    addedById: req.user.id,
  };

  const product = await storage.createProduct(data);
  return res.status(201).json(product);
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const product = await storage.updateProduct(id, req.body);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  await storage.deleteProduct(id);
  return res.status(204).send();
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

