const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
const tourRouter = require(`${__dirname}/routes/tourRoutes`);

// MIDDLEWARE
app.use(express.static(`${__dirname}/public`));
// incoming data from the request is added to the request object (usually for post requests).
// if not req.body will be undefined.
app.use(express.json());

// VIEW ENGINE=======================================
// app.set('view engine', 'pug');
// app.set('views', `${__dirname}/views`);
// // rendering base pug
// app.get('/', (req, res) => {
//   res.status(200).render('base');
// });
//=====================================================

app.use('/api/v1/tours', tourRouter);

// UNHANDLED ROUTES OR ROUTES THAT DOESN'T EXIST
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);
module.exports = app;
