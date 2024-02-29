/*
  These routes are only available during development
  For testing purposes only.
  Usually no authentication required for these routes unless specifically expressed.
  The idea being that in production this file can be completely removed and the route declaration in App.js can be removed.
*/
const express = require('express');
const testRouter = express.Router();
const db = require('../db/db.js'); // Adjust the path according to your file structure
//const { isAuthenticated } = require('./Authenticator.js');
/*
  all routes here are to be accessed via '/secure/'
*/
testRouter.get('/getLoggedInInfo2', (req, res) => {
  const userDetailsQuery = 'SELECT userID, user_first_name, user_email FROM users WHERE userID = 1'; 
  db.executeQuery(userDetailsQuery).then(results => {
    console.log(results[0])
    res.status(200).json(results[0])
  }).catch(error => {
    console.error(error);
    res.status(444)
  });
  
  //res.status(200).json({data: "here is the data"});
});
testRouter.get('/fetch-data', (req, res) => {
    db.executeQuery('SELECT * FROM users', (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
});
module.exports = testRouter;