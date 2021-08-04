const mongoose = require("mongoose");
mongoose
	.connect("mongodb://localhost:27017/mystock", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then((data) => {
		console.log("db connected");
	})
	.catch((err) => {
		console.log(err);
	});
