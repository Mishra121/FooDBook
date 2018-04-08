var mongoose = require('mongoose');
var ingredientSchema = require('./ingredient');
// Recipe Schema
var recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ingredients: [ingredientSchema]
});

module.exports = mongoose.model("Recipe", recipeSchema);
