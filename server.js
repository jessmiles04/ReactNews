// Dependencies
var express= require('express');
var app = express();
var bodyParser = require('body-parser');
var logger= require('morgan');
var mongoose = require('mongoose');
var cheerio = require('cheerio');
var request = require('request');



var PORT = process.env.PORT || 3000;

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

// Database configuration with mongoose
mongoose.connect('mongodb://localhost/newsscrapper');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

var Article = require ('./models/Article.js');

// Simple route
app.get('/', function(req, res) {
  res.sendFile('./public/index.html');
});

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://bookriot.com/", function(error, response, html) {
      console.log(html);
    var $ = cheerio.load(html);
    var result = [];
    $("a.trackable").each(function(i, element) {
        var title = $(this).text();
        var link = $(element).attr("href");
        result.push({
            title: title,
            link: link
        });
			});
		});
	});

app.get('/api/saved', function(req, res){

	Article.find({})
		.exec(function(err, doc){
			if(err){
				console.log(err);
			}else{
				res.send(doc);
			}

		});
});

app.post('/api/saved', function(req, res){
	var newArticle= new Article(req.body);


	var title = req.body.title;
	var date = req.body.date;
	var link = req.body.link;

	newArticle.save(function(err, doc){
		if(err){

			console.log(err);
		}else{
			res.send(doc._id);

		}

	});

});

// Listen on port 3000
app.listen(3000, function(){
  console.log("App running on port 3000!");
});