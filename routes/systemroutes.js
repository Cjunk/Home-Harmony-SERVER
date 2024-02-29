/*
  System Routes.  

  These routes are pertaining to system information . such as version number
  All users can get access to these routes. consider moving to secured routes. 
*/
const express = require('express');
const systemRouter = express.Router();
const db = require('../db/db.js'); // Adjust the path according to your file structure
const { isAuthenticated } = require('./Authenticator.js');


systemRouter.get('/version', isAuthenticated, (req, res) => {
    // Provide the latest version number and its details 
    const queryStatement = 'SELECT v.versNum, v.versName, vd.versionDet FROM versionManagement v JOIN versionDetails vd ON v.versNum = vd.versionDet_versNum WHERE v.versDate = ( SELECT MAX(versDate) FROM versionManagement);'
    db.executeQuery(queryStatement).then(results => {
        res.status(200).json(results)
    }).catch(error => {
        console.error(error);
        res.status(444)
    });
});
module.exports = systemRouter;