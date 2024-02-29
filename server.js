/*
    The EXPRESS SERVER
    Written by Jericho Sharman 2024
*/
//  ==========================================  CONSTANTS   =================================================================
//const dotenv = require('dotenv').config()
// const { Cloudinary } = require("@cloudinary/url-gen");
// const cloudinary = require('cloudinary').v2; // Use CommonJS syntax to import the v2 object
// cloudinary.config({
//     cloud_name: 'dc7oti3kw',
//     api_key: '983499594215616',
//     api_secret: 'Z-EsHRo7dEY_TWMpyjUynO8Lg8Q'
// });
// const App = () => {
//     const cld = new Cloudinary({ cloud: { cloudName: 'dc7oti3kw' } });
//     cloudinary.uploader.upload("C:/Users/User/Dropbox/INVENTORY PHOTOS/IMG_1725.jpg",
//         {
//             folder: "HOME_HARMONY", // Specify the folder path,
//             public_id: "olympic_flag"
//         },
//     function (error, result) { console.log(result); });
// };
// App()

let NUMBER_OF_CONNECTIONS = 0 // This var is used to track the number of attempts to the API. TODO: ok to remove this in prod

const logFilename = './logs/requestLog.txt'
const express = require('express');
const moment = require('moment-timezone');
const session = require('express-session');
const fs = require('fs');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
// Import routes
const securedRoutes = require('./routes/securedRoutes');
const testRouter = require('./routes/testroutes.js')
const systemroutes = require('./routes/systemroutes.js')
const port = process.env.PORT || 3001;
const MAX_REQUESTS_PER_MINUTE = 25; // Adjust this threshold as needed
const RESET_TIME_INTERVAL = 60000; // 1 minute in milliseconds

const app = express();

// Server configuration
// Configure HTTPS server with the self-signed certificate
// const https = require('https');
// const path = require('path');
// const httpsOptions = {
//     key: fs.readFileSync(path.join(__dirname, 'server.key')),
//     cert: fs.readFileSync(path.join(__dirname, 'server.cer'))
// };
// const server = https.createServer(httpsOptions, app);
const server = app

const HOST = '0.0.0.0'; // Bind to all IP addresses

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGINS_DEV.split(',') : process.env.CORS_ORIGINS_PROD.split(',');
const corsOptions = {
    origin: function (origin, callback) {
        if (corsOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log(corsOrigins, origin)
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure PUT is allowed
    credentials: true, // Allow credentials (cookies) to be sent
};
app.use(cors(corsOptions));

const { login, register } = require('./routes/Authenticator.js');
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
const { userInfo } = require('os');

//  Configure Mysql 
const sessionStore = new MySQLStore({
    host: 'localhost', // Replace with your MySQL server host
    port: 3306, // Replace with your MySQL server port
    user: process.env.DB_ADMIN, // Replace with your MySQL username
    password: process.env.DB_PASS, // Replace with your MySQL password
    database: process.env.DB_NAME // Replace with your database name where sessions will be stored
});
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 36000000, // Session expires after 1 hour (in milliseconds)
        httpOnly: false, // Prevent JavaScript access to the cookie
        secure: false, // Set to true in a production environment if using HTTPS
        sameSite: 'lax', // Required for cross-origin cookies        
    },
}));
//  =======================================================================================================================================
// Serve static files from the 'public' directory // TODO: CONSIDER REMOVE THIS ABILITY
app.use(express.static('public'));
// Error handling middleware
app.set('trust proxy', true); // Or a more specific configuration depending on your setup

// Request logging and rate limiting middleware
let isServerPaused = false;
let requestCount = 0;
let lastResetTime = Date.now();
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        // Skip logging and just call next middleware if it's a preflight request
        next();
    }
    else {
        const currentTime = Date.now();
        if (currentTime - lastResetTime >= RESET_TIME_INTERVAL) {
            // Reset request count if a minute has passed
            requestCount = 0;
            lastResetTime = currentTime;
        }
        // Increment request count
        requestCount++;
        // Check if request count exceeds the threshold
        if (requestCount > MAX_REQUESTS_PER_MINUTE) {
            isServerPaused = true; // Set server paused flag to true
            console.log('Server paused due to excessive API calls. Please try again later.')
            res.status(429).send('Server paused due to excessive API calls. Please try again later.');
            setTimeout(() => {
                isServerPaused = false; // Reset server paused flag after 1 minute
                console.log('Server resumed.');
            }, RESET_TIME_INTERVAL); // Reset after 1 minute
            return; // Stop further processing of the request
        }
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
        const startTime = process.hrtime();
        const durationInMilliseconds = getDurationInMilliseconds(startTime);
        const now = moment().tz("Australia/Sydney").format('YYYY-MM-DD HH:mm:ss');
        const logEntry = `${now} - IP: ${clientIp} // Path: ${req.originalUrl} // CONNECTIONS: ${NUMBER_OF_CONNECTIONS} // STATUS: ${res.statusCode} // DURATION: ${durationInMilliseconds} // USER AGENT: ${req.get('User-Agent')} // Authenticated: ${req.session && req.session.isAuthenticated ? 'Yes' : 'No'}\n`;
        fs.appendFile(logFilename, logEntry, (err) => {
            if (err) {
                console.error('Failed to write to log:', err);
            }
        });
        if (process.env.NODE_ENV === 'development') {
            // Code that should only run in development
            NUMBER_OF_CONNECTIONS++
            if (isServerPaused) {
                // Pause the server for 1 minute
                res.status(429).send('Server paused due to excessive API calls. Please try again later.');
                setTimeout(() => {
                    isServerPaused = false; // Resume the server after 1 minute
                    console.log('Server resumed.');
                }, 60000); // 1 minute in milliseconds
                return; // Stop further processing of the request
            }
            res.on('finish', () => { // Log after response has been sent 
                console.log("*************************************************************************************************");
                console.log(`* TIMESTAMP:\t ${new Date().toISOString()}`);
                console.log(`* CONNECTIONS: ${NUMBER_OF_CONNECTIONS}`)
                console.log(`* METHOD:\t ${req.method}`);
                console.log(`* PATH:\t\t ${req.url}`);
                console.log(`* STATUS:\t ${res.statusCode}`);
                console.log(`* DURATION:\t ${durationInMilliseconds} ms`);
                console.log(`* USER IP:\t ${clientIp}`);
                console.log(`* USER AGENT:\t ${req.get('User-Agent')}`);
                console.log(`* Authenticated: ${req.session && req.session.isAuthenticated ? 'Yes' : 'No'}`)
                console.log("*************************************************************************************************");
            });
        }
        next();
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!', req.data, userInfo);
});
// Route setup
app.use('/secure', securedRoutes);
if (process.env.NODE_ENV = 'development') {
    app.use('/test', testRouter)
}
app.use('/system', systemroutes);
app.post('/login', login);
app.post('/register', register) // get the registration page


/*
    ============    PUBLIC ROUTES  ---------------------------------------------------------------------------------------------
*/
// Landing default route message for the root route // TODO: Consider removing
app.get('/', (req, res) => {
    if (req.session.user) {  // If it is TRUE then this user is authenticated 
        res.redirect('/test');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});
app.get('/login', (req, res) => { // TODO: Consider removing
    console.log("I am from the /app.get login")
})
app.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Session could not be destroyed' })
        } else {
            //console.log("SUCCESSFUL LOGOUT")
            res.json({ success: true, message: 'Logout successfull' })
        }
    });
});

//  ======================================  FUNCTIONS   ====================================================================================
function getDurationInMilliseconds(start) {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}
//  ========================================================================================================================================



server.listen(port, HOST, () => {
    console.log(`Server is running on port ${port}`);
    const logEntry = `-- SERVER RESTARTED : - ${moment().tz("Australia/Sydney").format('YYYY-MM-DD HH:mm:ss')} \n`;
    fs.appendFile(logFilename, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log:', err);
        }
    });
});
