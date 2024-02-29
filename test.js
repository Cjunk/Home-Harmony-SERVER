

// Function to list files in a Dropbox folder
const fetch = require('node-fetch'); // Ensure you have 'node-fetch' if you're using Node.js

const APP_TOKEN = 'sl.BvqOOpmX5l6K2ECGVLbUmxrtES5ppETchRronuJVm_Jr5tedHG8l3tEGeC3ru4fTdS0LCQTuYVeh_r3PsP0h0JBuIhR_755DjTFGfF9BZGJX3klxVStOezBNz_Ck1p0FIBvL0pz-0zEbWI_rJdW0zWw'

fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${APP_TOKEN}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        path: '/INVENTORY PHOTOS' // Specify the path
    })
})
    .then(async response => {
        // Check if the response status code indicates success
        if (!response.ok) {
            // If not, throw an error with the status text
            const errorBody = await response.text(); // Attempt to read the response body
            throw new Error(`API call failed with status ${response.status}: ${response.statusText}, body: ${errorBody}`);
        }
        return response.json(); // Parse JSON only if response is ok
    })
    .then(data => {
        //console.log('Success:', data);
        console.log('Success:');
    })
    .catch(error => {
        //console.error('Error:', error.message);
        console.error('Error:');
    });

// =-=-=-=-=-=-=-=-=- =--=-=-=-=-=-=-=-=-    
const filePath = '/INVENTORY PHOTOS/IMG_1727.jpg'; // Replace with the path to the image file in your Dropbox account

const requestOptions = {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + APP_TOKEN,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ path: filePath })
};

fetch('https://api.dropboxapi.com/2/files/get_temporary_link', requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get temporary link');
        }
        return response.json();
    })
    .then(data => {
        const imageUrl = data.link;
        console.log('Image URL:', imageUrl);
    })
    .catch(error => {
        console.error('Error:', error);
    });
// Call the function to list files
