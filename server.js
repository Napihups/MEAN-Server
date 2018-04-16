const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');

const appContext = require('./appContext');

//--------MONGO DB API ----------------//
mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
	console.log("Connected to database " + config.database);
});

mongoose.connection.on('error', (eer) => {
	console.log("Database error " + err);
});

//--------------------------------------//





// --------Express Server inits-----------
const app = express();

const users = require('./routes/users');

const port = 3000;

app.listen(port, () => {
	console.log('Server listening on port : ' + port);
})

// CORS Middleware
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));

//Body parser MiddleWare
app.use(bodyParser.json());




// Users Router
app.use('/users', users);


// Index Route
app.get('/', function(res, req){
	res.send("Invalid endpoint");
})


//-----------------------------------------//