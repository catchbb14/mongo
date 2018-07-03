var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");


var PORT = 3000;

// Require all models
var db = require("./models");

var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Setting up handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));

app.set('view engine', 'handlebars');

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongoHeadlines");

db.User.create({ name: "Admin" })
  .then(function(dbUser) {
    console.log(dbUser);
  })
  .catch(function(err) {
    console.log(err.message);
});

//Routes
// require('./routes/api-routes.js')(app);
// require('./routes/html-routes.js')(app);
app.get('/', function(req, res) {
    res.render("index");
})

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});