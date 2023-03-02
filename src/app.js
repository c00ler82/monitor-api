const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const getAllOrders = require('./queries/orders');

const app = express();

// Config
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.enable('trust proxy');

// Routes
app.get('/', (req, res) => {
  res.send('The server is up!');
});

app.get('/orders', async (req, res) => {
  try {
    const test = await getAllOrders();
    res.send(test);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(process.env.PORT).on('listening', () => {
  console.log(`Server is live on ${process.env.PORT}`);
  console.log(`http://localhost:${process.env.PORT}`);
});
