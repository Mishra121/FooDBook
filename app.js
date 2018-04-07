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

var Recipe = require('./models/recipe');
var Ingredient = require('./models/ingredient');

//==========
//ROUTES(RECIPE)
//==========

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX
app.get("/recipes", function(req, res){
    Recipe.find({}, function(err, allRecipes){
        if(err){
            console.log(err);
        }else{
            res.render("index",{recipes: allRecipes});
        }
    })
});

//NEW Recipe
app.get("/recipes/new", function(req, res){
    res.render("new");
});

// Add Recipe
app.post("/recipes", function(req, res){
    upload(req, res, (err) => {
        if(err){
            console.log('image not uploaded');
        }else{
            var title = req.body.title;
            var description = req.body.description;  
            var image = req.file.filename;

            var newRecipe = {title: title, description: description, image: image};
            Recipe.create(newRecipe, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/recipes');
                }
            });
        }
    });
});

//Show a specific recipe
app.get("/recipes/:id", function(req, res){
    var id = req.params.id;
    Recipe.findById(id, function(err, foundRecipe){
        if(err){
            console.log(err);
            res.redirect('/recipes');
        }
        else{
            res.render("show", {recipe: foundRecipe});
        }
    });
});

//Edit form for the particular recipe
app.get("/recipes/:id/edit", function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe){
        if(err){
            res.redirect("/recipes");
        }else{
            res.render("edit", {recipe: foundRecipe});
        }
    });
});

// Update Recipe
app.put("/recipes/:id", function(req, res){
    upload(req, res, (err) => {
        if(err){
            console.log('Error in updating..');
        }else{
            var title = req.body.title;
            var description = req.body.description;  

            var newRecipe = {title: title, description: description};
            Recipe.findByIdAndUpdate(req.params.id, newRecipe, function(err, updatedRecipe){
                if(err){
                    res.redirect("/recipes");
                }else{
                    res.redirect('/recipes/'+ req.params.id);
                }
            });
        }
    });
});

//DELETE RECIPE
app.delete("/recipes/:id", function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/recipes');
        }else{
            res.redirect('/recipes');
        }
    });
});

//==================================
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("app started");
});