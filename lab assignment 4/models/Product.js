const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    category: { type: String, required: true },
    price:    { type: Number, required: true },
    rating:   { type: Number, default: 0 },
    stock:    { type: Number, required: true },
    image:    { type: String, default: '' }  
});

module.exports = mongoose.model('product', productSchema);
