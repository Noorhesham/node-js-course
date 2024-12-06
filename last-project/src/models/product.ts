import { Schema, model, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    images: [String],
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
