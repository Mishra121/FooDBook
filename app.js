var express = require('express');
var ejs = require('ejs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require("passport");
var LocalStrategy = require("passport-local");
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
app.use(flash());

var ingredientSchema = require('./models/ingredient');
var Recipe = require('./models/recipe');
var User = require('./models/user');

//========================
//   Passport Config
//========================

app.use(require("express-session")({
    secret: "FooDBooK",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware formed to pass user on all the routes
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

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


//==============
//ROUTES(RECIPE)
//==============

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX
app.get("/recipes",isLoggedIn ,function(req, res){
    Recipe.find({}, function(err, allRecipes){
        if(err){
            console.log(err);
        }else{
            res.render("index",{recipes: allRecipes});
        }
    })
});

//NEW Recipe
app.get("/recipes/new",isLoggedIn ,function(req, res){
    res.render("new");
});

// Add Recipe
app.post("/recipes", isLoggedIn, function(req, res){
    upload(req, res, (err) => {
        if(err){
            console.log('image not uploaded');
        }else{
            var title = req.body.title;
            var description = req.body.description;  
            var image = req.file.filename;

            var newRecipe = {title: title, description: description, image: image};
            Recipe.create(newRecipe ,function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    // Adding User ID to respective recipe
                    var userid = req.user._id;
                    newlyCreated.user.id = userid;
                    newlyCreated.save();
                    res.redirect('/recipes');
                }
            });
        }
    });
});

//Show a specific recipe
app.get("/recipes/:id" , checkRecipeOwnership,function(req, res){
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
app.get("/recipes/:id/edit", checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe){
        if(err){
            res.redirect("/recipes");
        }else{
            res.render("edit", {recipe: foundRecipe});
        }
    });
});

// Update Recipe
app.put("/recipes/:id", checkRecipeOwnership, function(req, res){
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
app.delete("/recipes/:id", checkRecipeOwnership, function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/recipes');
        }else{
            res.redirect('/recipes');
        }
    });
});

//==========
//ROUTES(INGREDIENT)
//==========

// Form for adding ingredient
app.get("/recipes/:id/ingredients/new", checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            console.log(err);
        }else{
            res.render("ingnew", {recipe: recipe});
        }
    });
});

// Adding Ingredients
app.post("/recipes/:id/ingredients", function(req, res){
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            console.log(err);
            res.redirect("/recipes");
        }else{
            var newingredients = req.body.text;
            //console.log(newingredients);
            recipe.ingredients.push({text: newingredients});
            recipe.save();
           
            res.redirect('/recipes/'+ recipe._id);
        }
    });
});


//================
//    AUTH
//================

//show registration form
app.get("/register", function(req, res){
    res.render('register');
});

//handle signup logic
app.post("/register", function(req, res){
    var newUser = { username: req.body.username};
    User.register(new User(newUser), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/recipes");
        });
    })
});

// show login form
app.get("/login", function(req, res){
    res.render('login', {message: req.flash("error")});
});

//login route
app.post("/login", passport.authenticate("local", {
    successRedirect: "/recipes",
    failureRedirect: "/login"
}), function(req, res){
});

// logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect('/');
});

// Authorization middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
}

//Recipe Ownership middleware
function checkRecipeOwnership(req, res, next){
    if(req.isAuthenticated()){
        Recipe.findById(req.params.id, function(err, foundRecipe){
            if(err){
                res.redirect("back");
            }else{
                if(foundRecipe.user.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect("/login");
                }
            }
        });
    }else{
        res.redirect("back");
    }
}

//==================================
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("app started");
});