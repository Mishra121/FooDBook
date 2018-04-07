var express = require('express');
var ejs = require('ejs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var methodOverride = require("method-override");

var app = express();

mongoose.connect("mongodb://localhost/reciepedb");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


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

//Show a specific reciepe
app.get("/reciepes/:id", function(req, res){
    var id = req.params.id;
    Reciepe.findById(id, function(err, foundReciepe){
        if(err){
            console.log(err);
            res.redirect('/reciepes');
        }
        else{
            res.render("show", {reciepe: foundReciepe});
        }
    });
});

//Edit form for the particular reciepe
app.get("/reciepes/:id/edit", function(req, res){
    Reciepe.findById(req.params.id, function(err, foundReciepe){
        if(err){
            res.redirect("/reciepes");
        }else{
            res.render("edit", {reciepe: foundReciepe});
        }
    });
});

// Update Reciepe
app.put("/reciepes/:id", function(req, res){
    upload(req, res, (err) => {
        if(err){
            console.log('Error in updating..');
        }else{
            var title = req.body.title;
            var description = req.body.description;  

            var newReciepe = {title: title, description: description};
            Reciepe.findByIdAndUpdate(req.params.id, newReciepe, function(err, updatedReciepe){
                if(err){
                    res.redirect("/reciepes");
                }else{
                    res.redirect('/reciepes/'+ req.params.id);
                }
            });
        }
    });
});

//DELETE RECIEPE
app.delete("/reciepes/:id", function(req, res){
    Reciepe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/reciepes');
        }else{
            res.redirect('/reciepes');
        }
    });
});

//==================================
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("app started");
});