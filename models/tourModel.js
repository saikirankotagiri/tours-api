const mongoose = require('mongoose');

// mongodb schema==========================================
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a NAME'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal to 40 characters'],
      minLength: [10, 'A tour name must have 10 or more characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a PRICE'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount must be less than or equal to price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  // options object to configure the output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// we used normal function because arrow function don't have this keyword.
// we CANNOT use virtual properties in queries like, sort, group etc.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// call back will run before saving(.save(), .create()) the document, but wont work on .createMany().
// since this is a document middle ware this means current document.
tourSchema.pre('save', function (next) {
  // console.log(this);
  next();
});
// will have access to the saved document in the database.
tourSchema.post('save', function (document, next) {
  // console.log(document);
  next();
});

// QUERY MIDDLWARE
// this will point to current query.
tourSchema.pre(/^find/, function (next) {
  next();
});
// AGGREGATION MIDDLEWARE

// mongodb Model out of the above schema
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
