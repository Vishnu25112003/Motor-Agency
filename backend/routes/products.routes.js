const { Router } = require("express");
const {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} = require("../controllers/products.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, roleMiddleware("ADMIN"), createProduct);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteProduct);

module.exports = router;

