var mongoose = require('mongoose');

var ingredientSchema = new mongoose.Schema({
    text: String
});

module.exports = mongoose.model("Ingredient", ingredientSchema);