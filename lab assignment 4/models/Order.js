const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrder: { type: Number, required: true }   // snapshot of price at time of order
});

const orderSchema = new mongoose.Schema({
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:      { type: [orderItemSchema], required: true },
    totalPrice: { type: Number, required: true },
    status:     { type: String, default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
