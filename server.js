var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var app = express();
var PORT = process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

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
    helpers: {
        saveArticle: function(id) {
            return `/articles/${id}`;
        }
    }
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
        .sort({ _id: -1 })
        .then(function(dbArticle) {
            res.render("index", { articles: dbArticle });
        })
        .catch( function(err) {
            res.json(err);
        })
})

app.get('/saved', function(req, res) {
    db.Article.find({saved: true})
        .populate("comments")
        .sort( { _id: -1 })
        .then(function(dbArticle) {
            res.render("saved", { articles: dbArticle });
        })
        .catch( function(err) {
            res.json(err);
        })
})

app.put("/articles/:id", function(req, res) {
    db.Article.update({ _id: req.params.id }, { $set: req.body }, function(err, result) {
      if (err) throw err;
      console.log(result);
      res.sendStatus(200);
    });
  });

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
                .parent()
                .find("img")
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

    res.redirect("/");

})

app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body).then(function(data) {
            return db.Article.findOneAndUpdate({ _id: req.params.id },
                 { $push: { comments: data._id } }, { new: true });
    }).then(function(article) {
        res.json(article);
    })
    .catch(function(err) {
        res.json(err);
    })
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});