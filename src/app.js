const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlanywhere = require('sqlanywhere');
// QUERIES
const queries = require('./queries');

const conn = sqlanywhere.createConnection();

const connectionParams = {
  Host: process.env.DB_HOST,
  UserId: process.env.DB_USER,
  Password: process.env.DB_PASSWORD,
  Server: process.env.DB_SERVER,
  DatabaseFile: process.env.DB_FILE
};

dotenv.config();

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

app.post('/orders', (req, res) => {
  const body = req.body;
  console.log('body:', body);
  conn.connect(connectionParams, function (err) {
    if (err) {
      res.send(err);
      conn.disconnect();
      return;
    }
    conn.exec(queries.orders, [], function (err, orders) {
      if (err) {
        res.send(err);
        conn.disconnect();
        return;
      }

      console.log('orders: ', orders[0]);
      // output --> Name: Tee Shirt, Description: V-neck
      conn.disconnect();
      res.send(orders);
    });
  });
});

app.listen(process.env.PORT).on('listening', () => {
  console.log(`Server is live on ${process.env.PORT}`);
  console.log(`http://localhost:${process.env.PORT}`);
});
