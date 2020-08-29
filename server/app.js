require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const async = require('async');
const fs = require('fs');
const https = require('https');
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
PORT = process.env.PORT || 5000;


app.use(bodyParser.json());

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = process.env['COMPUTER_VISION_SUBSCRIPTION_KEY'];
const endpoint = process.env['COMPUTER_VISION_ENDPOINT']
if (!key) { throw new Error('Set your environment variables for your subscription key in COMPUTER_VISION_SUBSCRIPTION_KEY and endpoint in COMPUTER_VISION_ENDPOINT.'); }

// Instantiate client with endpoint and key
const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);
console.log(computerVisionClient);

function computerVision(imageUrl) {
    async.series([
        async function (cb) {
            detectBrand(imageUrl);
            cb(err,result);
        },
        function () {
            return new Promise((resolve) => {
                resolve();
            })
        }
    ], (err) => {
    throw (err);
  });
}

app.get("/", (req,res) => {
    res.sendFile(path.resolve('../client/index.html'));
})

app.post("/detect_brand", (req,res) => {
    const { imageUrl } = req.body
    computerVision(imageUrl);
})

function detectBrand(imageUrl) {
    const brandURLImage = imageUrl;
    // Analyze URL image
    console.log('Analyzing brands in image...', brandURLImage.split('/').pop());
    const brands = (await computerVisionClient.analyzeImage(brandURLImage, { visualFeatures: ['Brands'] })).brands;

    // Print the brands found
    if (brands.length) {
      console.log(`${brands.length} brand${brands.length != 1 ? 's' : ''} found:`);
      for (const brand of brands) {
        console.log(`    ${brand.name} (${brand.confidence.toFixed(2)} confidence)`);
      }
    } 
    else { 
        console.log(`No brands found.`); 
    }
}
app.listen(PORT, () => {
    console.log("App is working on port " + PORT);
})