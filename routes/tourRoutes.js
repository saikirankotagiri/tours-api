const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();

// this will only run for tour routes and NOT user routes.
// because we used param middleware on tour router and said to
// use app.use('/api/v1/tours', tourRouter);
// router.param('id', tourController.checkID);

// routing using abstraction
router // filtering using middleware
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// tour statistics route
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// new way of routing
// app.route('/api/v1/tours').get(getAllTours).post(createTour);
// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);
