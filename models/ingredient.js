var mongoose = require('mongoose');

var ingredientSchema = new mongoose.Schema({
    text: String
});

module.exports = ingredientSchema;