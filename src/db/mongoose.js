const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://yd_77:Draze915@spacebois.7lk7f0b.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useCreateIndex: true },
  (e, r) => {
    if (e) {
      return console.log("error", e);
    }
    console.log("connected");
  }
);
