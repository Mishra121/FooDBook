var express = require('express');
var ejs = require('ejs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');

var app = express();

mongoose.connect("mongodb://localhost/reciepedb");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));


//Multer Initialization
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000}
}).single('image');


// Reciepe Schema
var reciepeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String
});

var Reciepe = mongoose.model("Reciepe", reciepeSchema);


//==========
//ROUTES
//==========

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX
app.get("/reciepes", function(req, res){
    res.render("index");
});

//NEW Reciepe
app.get("/reciepes/new", function(req, res){
    res.render("new");
});


//==================================
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("app started");
});