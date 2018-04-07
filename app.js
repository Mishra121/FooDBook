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
app.use(express.static(__dirname + "/public"));


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
    Reciepe.find({}, function(err, allReciepes){
        if(err){
            console.log(err);
        }else{
            res.render("index",{reciepes: allReciepes});
        }
    })
});

//NEW Reciepe
app.get("/reciepes/new", function(req, res){
    res.render("new");
});

// Add Reciepe
app.post("/reciepes", function(req, res){
    upload(req, res, (err) => {
        if(err){
            console.log('image not uploaded');
        }else{
            var title = req.body.title;
            var description = req.body.description;  
            var image = req.file.filename;

            var newReciepe = {title: title, description: description, image: image};
            Reciepe.create(newReciepe, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/reciepes');
                }
            });
        }
    });
});


//==================================
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("app started");
});