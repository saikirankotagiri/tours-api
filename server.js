const dotenv = require('dotenv');
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://0.0.0.0:27017/natours', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('database connection successful');
  });

dotenv.config({ path: './config.env' });

// we need to place app after config because the app uses variables from the config file (config.env).
const app = require('./app');

// after parsing .env file the variables are available on process object.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('App running on port', port);
});

// handling unhandled rejections which are out of the scope of express.
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // force shutdown of server.
  server.close(() => {
    process.exit(1);
  });
});
