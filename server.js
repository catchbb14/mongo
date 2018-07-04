var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var app = express();
var PORT = process.env.PORT || 3000;

// Require all models
var db = require("./models");

// Use morgan logger for logging requests
app.use(logger("dev"));
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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);


//Routes
// require('./routes/api-routes.js')(app);
// require('./routes/html-routes.js')(app);
app.get('/', function(req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            res.render("index", { articles: dbArticle });
        })
        .catch( function(err) {
            res.json(err);
        })
})

app.get('/saved', function(req, res) {
    db.Article.find({saved: true})
        .sort( { _id: -1 })
        .then(function(dbArticle) {
            res.render("saved", { articles: dbArticle });
        })
        .catch( function(err) {
            res.json(err);
        })
})

app.get('/scrape', function(req, res) {

    var currentTitles = [];
    //prevent duplications
    db.Article.find({}, { title: 1 })
        .then(function(currentArticles) {
            currentTitles = currentArticles.map( a => a.title);
        });

    axios.get("http://www.newsweek.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        $("article h3").each(function(i, element) {

            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = "http://www.newsweek.com" + $(this)
                .children("a")
                .attr("href");
            result.summary = $(this)
                .parent()
                .children(".summary")
                .text();
            result.image = $(this)
                .children(".image picture img")
                .attr("src")

            if(currentTitles.indexOf(result.title) == -1) {
                db.Article.create(result)
                .then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch( (err) => res.json.err )
            }
        });
    });

    res.send("Scrape complete")

})

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});