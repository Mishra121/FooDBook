var mongoose = require('mongoose');
var ingredientSchema = require('./ingredient');
// Recipe Schema
var recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ingredients: [ingredientSchema],
    user: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Recipe", recipeSchema);
