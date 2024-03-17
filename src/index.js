const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const { getStocks } = require('./db');
const session = require('express-session'); // Import express-session
const MongoStore = require('connect-mongo'); // Import connect-mongo
const Portfolio = require('./db');

//const startPriceUpdater = require('./stockpriceupdater');
//startPriceUpdater();


// Initialize Express app here
const app = express();
// convert data into json format so data base can hold
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//use EJS as the view engine
app.set('view engine', 'ejs');

// Static folder path
app.use(express.static("public"));

// Session configuration here
app.use(session({
  secret: 'yourSecretKey', // Replace 'yourSecretKey' with a real secret key REMEMBER
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://jesse:jesse@stocktrading.tnr0quk.mongodb.net/' }), // MongoDB connection string
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // session expiration MODIIFY
}));


// Require login middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}


// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/portfolio", (req, res) => {
    res.render("portfolio");
    
})


// Adjusted route for /stocks to use getStocks from db.js
app.get('/stocks', async (req, res) => {
  try {
    const stocks = await getStocks();
    res.render('stocks', { stocks });
  } catch (err) {
    console.error("Detailed error: ", err);
    res.status(500).send("Error fetching stocks");
  }
});

// Process signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await collection.findOne({ name: username });
    if (existingUser) {
        res.send("User already exists. Please choose a different username.");
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await collection.insertOne({ name: username, password: hashedPassword });
        res.redirect("/login"); // Redirect to login after successful signup
    }
});


// Process login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await collection.findOne({ name: username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id; // Set user session
        res.redirect("/stocks"); // Redirect to user-specific stocks page
    } else {
        res.send("Invalid username or password.");
    }
});


// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
      res.redirect('/login');
  });
});


app.post('/buy', requireLogin, async (req, res) => {
    const { ticker, price, quantity } = req.body;
    const userId = req.session.userId;
    // Implement logic to add the stock to the user's portfolio
    // NEEDS WORK
    await Portfolio.updateOne(
        { userId: userId },
        { $push: { stocks: { ticker, price, quantity } } },
        { upsert: true }
    );
    res.redirect('/stocks');
});

app.post('/sell', requireLogin, async (req, res) => {
    const { ticker, quantity } = req.body;
    const userId = req.session.userId;
    // Implement logic to remove the stock from the user's portfolio
    // NEEDS WORK
    await Portfolio.findOneAndUpdate(
        { userId: userId, "stocks.ticker": ticker },
        { $pull: { stocks: { quantity: { $gte: quantity } } } }
    );
    res.redirect('/stocks');
});


app.get('/portfolio', requireLogin, async (req, res) => {
    const userId = req.session.userId;
    try {
        // Fetching the user's portfolio from the database NEEDS WORK
        // Adjust this according to actual data models and structure NEEDS WORK
        const userPortfolio = await Portfolio.findOne({ userId: userId }).populate('stocks.stockId');
        
        // Make sure to pass the fetched portfolio to the view NEEDS WORK
        res.render('portfolio', { portfolio: userPortfolio });
    } catch (error) {
        console.error("Error fetching portfolio:", error);
        // Handle the error appropriately
        res.status(500).send("Unable to load portfolio");
    }
});


const port = 5000; // CAN change if wanted to 
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
})





// ALL OLD AND EXTRA CODE! LEAVE AS A COMMENT

/*app.get('/transactions', async (req, res) => {
    // Replace with your method to get the transaction data for the logged-in user
    const transactionsData = await getTransactionsForUser(req.user);

    res.render('transaction_history', { transactions: transactionsData });
});

async function getTransactionsForUser(user) {
    // This should interact with your database to get the transactions
    // Here's a placeholder for the structure you might return
    const transactions = [
        // ... populate with actual transaction data from the database
    ];

    return transactions;
} 
*/



/*Stock viewing
app.get("/stocks", async (req, res) => {
    try {
        const stocks = await collection.stocks.find({}).toArray();
        res.render("stocks", { stocks });
    } catch (error) {
        console.error("Failed to fetch stocks:", error);
        res.sendStatus(500); // Internal Server Error
    }
});
*/


// register user old code that didnt have redirect
/*app.post("/signup", async (req, res) => {
    
    const data = {
        name: req.body.username,
        password: req.body.password
    }

//check if user already exists
const existingUser = await collection.findOne({name: data.name});
if(existingUser)    {
    res.send("User already exists. Please choose a different username. ");
}else   {
   /// hash the password
    const saltRounds = 10 // number of salt round of bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword; //replace the has password with original password


    const userdata = await collection.insertMany(data);
    console.log(userdata);

}

});
*/


/*app.get('/transactions', async (req, res) => {
    // Replace with your method to get the transaction data for the logged-in user
    const transactionsData = await getTransactionsForUser(req.user);

    res.render('transaction_history', { transactions: transactionsData });
});

async function getTransactionsForUser(user) {
    // This should interact with your database to get the transactions
    // Here's a placeholder for the structure you might return
    const transactions = [
        // ... populate with actual transaction data from the database
    ];

    return transactions;
} 
*/



/*
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    // Check if user already exists
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser) {
        // If user exists
        // 
        // rendering the page with an error message.
        res.send("User already exists. Please choose a different username.");
    } else {
        // Hash the password
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword; // Replace the original password with the hashed password

        // Insert the new user data into the database
        const userdata = await collection.insertMany(data); // Use insertOne for a single document
        console.log(userdata);

        // Redirect to the home page after successful signup
        res.redirect("/");
    }
});
*/

/*// login user
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check) {
            res.send("user name cannot be found");
        }
    
    //compare the hash password from the database with the plain test
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch) {
        res.render("home")
    }else {
        req.send("wrong password");
    }
}catch{
    res.send("wrong details");
}
});
*/