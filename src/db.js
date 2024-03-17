const mongoose = require('mongoose');

// Define the Stock schema directly in db.js
const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  companyName: { type: String, required: true },
  price: { type: Number, required: true },
  volume: { type: Number, required: true },
  // Add other fields as necessary
});

// Create the Stock model from the schema
const Stock = mongoose.model('Stock', stockSchema);

// Define the Portfolio schema
const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  stocks: [{
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true }, // if you want to track purchase price
  }]
});

// Create the Portfolio model from the schema
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Function to get all stocks
async function getStocks() {
  try {
    // Use the Stock model to query all stock documents
    const stocks = await Stock.find({});
    return stocks;
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

module.exports = { Stock,  Portfolio, getStocks }; // Export both the Stock model and getStocks function


