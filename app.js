const express = require("express");
const app = express();
const router = require("./router/admin/allroutes.js");
const frontEndRouter = require("./router/frontend/FrontEndRoutes.js");
require("./model/conn.js");
var path = require("path");
app.use(router);
app.use(frontEndRouter);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//setup public folder
app.use(express.static("./public"));

app.listen(3000, (err) => {
	console.log("app is listening to port 3000");
});
