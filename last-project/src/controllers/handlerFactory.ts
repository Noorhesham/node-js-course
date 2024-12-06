import { Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatuers';

// Generic function for deleting a document by ID
export const deleteOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// Generic function for updating a document by ID
export const updateOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validators run on the update
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

// Generic function for creating a new document
export const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

// Generic function for fetching a single document by ID with optional population
export const getOne = <T extends Document>(Model: Model<T>, popOptions?: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions); // Populate if options provided

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

// Generic function for fetching all documents, with filtering, sorting, field limiting, and pagination
export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // Allow nested GET requests

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query; // Execute query
    const totalCount = await Model.countDocuments(filter); // Get total document count for pagination

    res.status(200).json({
      status: 'success',
      results: docs.length,
      totalPages: Math.ceil(totalCount / (req.query.limit ? Number(req.query.limit) : 10)),
      data: { docs },
    });
  });

// Error handling utility function for wrapping async route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); // Catch and pass errors to Express error middleware
  };
};
