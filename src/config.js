const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://jesse:jesse@stocktrading.tnr0quk.mongodb.net/")

//check database connection or not
connect.then(() => {
    console.log("Database connection established");
})
.catch(() => {
    console.log("Database connection error");
});

// Create a schema
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true
    }
});

const stockSchema = new mongoose.Schema({
  ticker: String,
  companyName: String,
  price: Number,
  volume: Number,
  // Add other fields as necessary
});

//collection Part
const collection = new mongoose.model("users", LoginSchema);
const Stock = mongoose.model('stock', stockSchema);

module.exports = collection;
    







/*Use where models are needed LEAVE A COMMENT

const Stock = require('./models/Stock'); // Adjust path as necessary

// Fetching all stocks:

async function getStocks() {
  try {
    const stocks = await Stock.find({});
    return stocks;
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    throw error;
  }
}
*/