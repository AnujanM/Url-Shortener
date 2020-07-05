'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();
const dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

var id = 0;

/** this project needs a db !! **/

mongoose.connect(process.env.COM,{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var parser = require("body-parser")
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json());

const Schema = mongoose.Schema;

const linkSchema = new Schema({
  link: { type: String, required: true },
  position: {type: Number, required: true}
});

var Link = mongoose.model("Link", linkSchema);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function(req, res){
  console.log(req.body);
  var url = req.body.url;
  dns.lookup(url, function(err, address){
    if (err) res.json({"error":"invalid URL"});
    Link.countDocuments({}, function (err, count) {
    console.log('%d entries', count);
    var l = new Link({link: url, position: count + 1});
    l.save(function(err, data) {
        if (err) return console.error(err);
        res.json({original_url: req.body.url, short_url: data.position});
      });
    });
  })
})

app.get("/api/shorturl/:id", function(req, res){
  var id = req.params['id'];
  Link.findOne({position: id}, function(err, data){
    if (err) return console.error(err);
    res.redirect(data.link);
  });
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});