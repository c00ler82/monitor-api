const dotenv = require('dotenv');
const sqlanywhere = require('sqlanywhere');
const conn = sqlanywhere.createConnection();

dotenv.config();

const connectionParams = {
  Host: process.env.DB_HOST,
  UserId: process.env.DB_USER,
  Password: process.env.DB_PASSWORD,
  Server: process.env.DB_SERVER,
  DatabaseFile: process.env.DB_FILE
};
const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    conn.connect(connectionParams, function (err) {
      if (err) {
        conn.disconnect();
        return reject(err);
      }
      conn.exec(
        `SELECT t1.*, t2.M3 as "volume" from
      (SELECT DISTINCT CustomerRoot.CustomerCode AS "customerId",
      CustomerOrder.OrderNumber AS "id",
      monitor.Address.Addressee AS "deliveryName",
      monitor.Address.Field5 AS "city",
      monitor.Country.Code as "countryCode",
      (SELECT CommunicationAddressValue FROM monitor.BussinessContactReferenceCommunicationAddress inner join monitor.CommunicationAddress on CommunicationAddress.Id = BussinessContactReferenceCommunicationAddress.CommunicationAddressId where ReferenceId =  CustomerOrder.BusinessContactReferenceId and CommunicationAddress.Type = 2) as "referenceEmail",
      GoodsLabel as "referenceMobile"
      FROM monitor.CustomerOrder
      INNER JOIN monitor.Customer ON CustomerOrder.BusinessContactId = Customer.Id
      INNER JOIN monitor.CustomerRoot ON CustomerRoot.Id = Customer.RootId
      INNER JOIN monitor.Address ON Address.Id = CustomerOrder.DeliveryAddressId
      INNER JOIN monitor.Country ON monitor.Country.Id = monitor.Address.CountryId
      INNER JOIN monitor.CustomerOrderRow ON CustomerOrderRow.ParentOrderId = CustomerOrder.Id
      WHERE CustomerOrder.Status BETWEEN 1 AND 4
      AND CustomerOrder.LifeCycleState <> 99 AND CustomerOrderRow.LifeCycleState <> 99) as t1
      inner join
      (select CustomerOrder.OrderNumber as "id", sum(CustomerOrderRow.OrderedQuantity * isnull(Part.VolumePerUnit, 1)) as M3
      from monitor.CustomerOrderRow
      INNER JOIN monitor.Part on CustomerOrderRow.PartId = Part.Id AND CustomerOrderRow.OrderRowType = 1 INNER JOIN monitor.CustomerOrder ON CustomerOrderRow.ParentOrderId = CustomerOrder.Id
      group by CustomerOrder.OrderNumber) as t2
      on t1.id = t2.id;`,
        [],
        function (queryError, orders) {
          if (queryError) {
            conn.disconnect();
            return reject(queryError);
          }
          conn.disconnect();
          resolve(orders);
        }
      );
    });
  });
};

module.exports = getAllOrders;
