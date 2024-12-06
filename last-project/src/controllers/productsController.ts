import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { Product } from "../models/product";

// Create Product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const product = await Product.create(req.body);
    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    console.error("Error creating product:", err);
    next(err); // Pass the error to the error handler
  }
};

// Get All Products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", results: products.length, data: { products } });
  } catch (err) {
    next(err);
  }
};

// Get Product by ID
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("No product found with that ID", 404));

    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(new AppError("No product found with that ID", 404));

    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("No product found with that ID", 404));

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

// import Product from '../models/productModel';
// import {
//   createOne,
//   getAll,
//   getOne,
//   updateOne,
//   deleteOne,
// } from './factoryHandler'; // Reuse factory handlers

// export const createProduct = createOne(Product);
// export const getAllProducts = getAll(Product);
// export const getProduct = getOne(Product);
// export const updateProduct = updateOne(Product);
// export const deleteProduct = deleteOne(Product);
