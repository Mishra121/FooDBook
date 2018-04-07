var mongoose = require('mongoose');

// Recipe Schema
var recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ingredients:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient"
        }
    ]
});

module.exports = mongoose.model("Recipe", recipeSchema);
