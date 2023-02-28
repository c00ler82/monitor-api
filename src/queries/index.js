const fs = require('fs');

const orders = fs.readFile(`${__dirname}/orders.sql`, (err, data) => {
  if (err) {
    console.log('err:', err);
    return;
  }
  return data.toString();
});

module.exports = {
  orders
};
