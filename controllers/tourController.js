// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// route handlers or controller methods
exports.getAllTours = async (req, res) => {
  try {
    // also filtering tours based on req.query object
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    // another way of filtering
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // creating a new copy of the query string object because we don't
    // want to mutate the original object
    const queryObj = { ...req.query };

    // BASIC FILTERING
    // we remove the below fields from the query stirng
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING WHERE WE NEED TO ADD $ SIGN TO THE MONGO QUERY
    // stringifying to add $ sign.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // building a query
    // converting and passing the queryStr as object
    // Tour.find() returns a mongodb query object if we don't await.(similar to returning promise)
    // so we can chain filters on it below.
    let query = Tour.find(JSON.parse(queryStr));

    // chaining sort functionality on mongodb query
    // using original query string on req
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // selecting (also called projecting) only some or important fields for a document if we have huge data
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // if user asks for more documents than exists in DB we throw error.
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // executing a query at the end after all filters and sortings
    // const features = new APIFeatures(Tour.find(), req.query)
    //   .filter()
    //   .sort()
    //   .limitFields()
    //   .paginate();
    // const tours = await features.query;
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      // if we don't use return it will again try to send response below.
      return next(
        new AppError(`No tour exists with that ${req.params.id} id`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

// using  catchAsync
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this will return the updated doc back
      runValidators: true,
    });

    if (!updatedTour) {
      // if we don't use return it will again try to send response below.
      return next(
        new AppError(`No tour exists with that ${req.params.id} id`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      // if we don't use return it will again try to send response below.
      return next(
        new AppError(`No tour exists with that ${req.params.id} id`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    // here performing aggregate functions on tour collection
    const stats = await Tour.aggregate([
      // if u use only $match it will give u tours.
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        // similar to group by in sql
        // we are grouping below so all the calculations are on the matched tours only.
        // if we group we dont get the tours output, we get the calculated results only.
        $group: {
          //  _id: '$difficulty', // on what column we want to group by, null means consider all tours.
          // _id: '$ratingsAverage', // on what column we want to group by, null means consider all tours.
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 }, // 1 will be added to each tour, used to find number of tours.
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        // now we can perform operations only on the above returned results.
        // with the above field names only. similar to sql.
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: { $gte: new Date(`${year}-01-01`) },
          startDates: { $lte: new Date(`${year}-12-31`) },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      total: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
