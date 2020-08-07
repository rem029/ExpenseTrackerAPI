const mongoose = require("mongoose");
require("dotenv").config();

const mongoDBExtURL = process.env.MONGOURL;

mongoose
  .connect(mongoDBExtURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Successfully connected to DB.");
  })
  .catch((err) => {
    console.log(err);
  });
