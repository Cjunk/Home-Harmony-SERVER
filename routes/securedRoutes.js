const express = require('express');
const securedRouter = express.Router();
const db = require('../db/db.js'); // Adjust the path according to your file structure
const { isAuthenticated } = require('./Authenticator.js');
/*
  all routes here are to be accessed via '/secure/'
*/
securedRouter.use(isAuthenticated);
/*================================================= SOH related routes */
securedRouter.get('/inventory/soh', (req, res) => {
  const userID = req.session.user.userID
  const queryStatement = `
    SELECT
    soh.soh_ID,
      soh.soh_item,
      soh.soh_locationID,
      item.item_name,
      locations.location_name,
      item.item_descr,
      item.item_prime_photo,
      item.photo_key,
      item.item_barcode,
      soh.soh_qty,
      soh.soh_date_added,
      soh.soh_last_updated,
      itypes.type_name,
      catts.cat_name
    FROM
      SOH soh
    LEFT JOIN 
      ITEM_MASTER item ON soh.soh_item = item.item_number AND (item.userID = ${userID})
    LEFT JOIN
      LOCATION_MASTER locations ON soh.soh_locationID = locations.location_id AND (locations.userID = ${userID})
    LEFT JOIN
      item_types itypes ON item.item_type = itypes.type_id AND (itypes.type_user_id = ${userID})
    LEFT JOIN 
      categories catts ON catts.catID = item.item_cat AND (catts.userid = ${userID})
    WHERE soh.userID = ${userID}
  `;
  db.executeQuery(queryStatement, [userID, userID]).then(results => {
    res.status(200).json(results)
  }).catch(error => {
    console.error(error);
    res.status(444)
  });
})
securedRouter.post('/inventory/inbound', (req, res) => {
  //  add stock
})
securedRouter.post('/inventory/outbound', (req, res) => {
  //  remove stock
})
/*================================================= MASTER LISTS related routes */
securedRouter.post('/inventory/masterItem/add', (req, res) => {
  //  Update pre existing item details
})
securedRouter.patch('/inventory/masterItem/update', (req, res) => {
  //  Update pre existing item details
})
securedRouter.delete('/inventory/masterItem/delete', (req, res) => {
  //  Update pre existing item details
})
securedRouter.get('/inventory/masterItem/list', (req, res) => {
  const queryStatement = 'SELECT * FROM item_master WHERE userID = ?';
  db.executeQuery(queryStatement, [req.session.user.userID]).then(results => {
    res.status(200).json(results)
  }).catch(error => {
    console.error(error);
    res.status(444)
  });
})
securedRouter.get('/inventory/masterlocation/list', (req, res) => {
  const queryStatement = 'SELECT * FROM location_master WHERE userID = ?';
  db.executeQuery(queryStatement, [req.session.user.userID]).then(results => {
    res.status(200).json(results)
  }).catch(error => {
    console.error(error);
    res.status(444)
  });

  //  Update pre existing item details
})
securedRouter.put('/inventory/masterlocation/add', (req, res) => {
  const { location_id, location_name, location_prime_location, location_desc, pickpath, capacity, IsAvailable } = req.body;
  const userID = req.session.user.userID; // Assuming the userID is stored in the session
  const location_date_last_used = new Date(); // Assuming you want to set the current date/time as the last used date

  const queryStatement = 'INSERT INTO location_master (userID,location_id,location_name,location_prime_location,location_desc,location_date_last_used,pickpath,capacity,IsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.executeQuery(queryStatement, [userID, location_id, location_name, location_prime_location, location_desc, location_date_last_used, pickpath, capacity, IsAvailable])
    .then(results => {
      res.status(200).json({ success: true, message: "Location added successfully", results });
    }).catch(error => {
      console.error(error);
      res.status(500).send({ success: false, message: "Error adding location", error: error.message });
    });
})
securedRouter.get('/inventory/masterlocation/add', (req, res) => {
  const { location_id, location_name, location_prime_location, location_desc, pickpath, capacity, IsAvailable } = req.body;
  const userID = req.session.user.userID; // Assuming the userID is stored in the session
  const location_date_last_used = new Date(); // Assuming you want to set the current date/time as the last used date

  const queryStatement = 'INSERT INTO location_master (userID,location_id,location_name,location_prime_location,location_desc,location_date_last_used,pickpath,capacity,IsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.executeQuery(queryStatement, [userID, location_id, location_name, location_prime_location, location_desc, location_date_last_used, pickpath, capacity, IsAvailable])
    .then(results => {
      res.status(200).json({ success: true, message: "Location added successfully", results });
    }).catch(error => {
      console.error(error);
      res.status(500).send({ success: false, message: "Error adding location", error: error.message });
    });
})
securedRouter.patch('/inventory/masterlocation/update', (req, res) => {
  //  Update pre existing item details
})
securedRouter.delete('/inventory/masterlocation/delete', (req, res) => {
  //  Update pre existing item details
})

/*================================================= User related routes */
securedRouter.get('/userInfo', (req, res) => {
  const userDetailsQuery = `SELECT user_username,user_first_name, user_last_name,user_email,user_mailing_list,user_last_login,user_type,user_status,user_creation_date FROM users WHERE userID = ? && user_status != ${0}`;

  db.executeQuery(userDetailsQuery, [req.session.user.userID]).then(results => {
    console.log(results[0])
    res.status(200).json(results)
  }).catch(error => {
    console.error(error);
    res.status(444)
  });

  //res.status(200).json({data: "here is the data"});
})
securedRouter.patch('/userInfo/edit', (req, res) => {
  //  Update user details

})

securedRouter.get('/getLoggedInInfo', (req, res) => {
  const userDetailsQuery = `SELECT userID,user_username,user_first_name, user_last_name,user_email,user_mailing_list,user_last_login,user_type,user_status FROM users WHERE userID = ?`;

  db.executeQuery(userDetailsQuery, [req.session.user.userID, 1]).then(results => {

    console.log(results[0])
    res.status(200).json(results[0])
  }).catch(error => {
    console.error(error);
    res.status(444)
  });

  //res.status(200).json({data: "here is the data"});
});


module.exports = securedRouter;