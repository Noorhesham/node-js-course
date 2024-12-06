import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct,
} from "../controller/productsController.js";
/*
بدل ما تكتب كل المسارات في ملف واحد، تقدر تستخدم الـ  لتقسيمها في ملفات متعددة.
 */
const router = express.Router();

router.route("/").get(getAllProducts);
// router.route("/").get((req, res) => {
//   res.send("products");
// }); //get all products

router.route("/").post(createProduct);
// router.route("/").post((req, res) => {
//   res.send("create a product");
// }); //create a product

router.route("/:id").get(getProductById);
// router.route("/:id").get((req, res) => {
//   const { id } = req.params;
//   res.json({ message: "get a single product", id });
// }); //get a single product

router.route("/:id").delete(deleteProduct);
// router.route("/:id").delete((req, res) => {
//   res.send("delete a product");
// }); //delete a product

router.route("/:id").patch(updateProduct);
// router.route("/:id").patch((req, res) => {
//   res.send("update a product");
// }); //update a product

export const productsRouter = router;
