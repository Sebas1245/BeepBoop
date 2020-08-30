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
const { Sequelize, Model, DataTypes } = require('sequelize');
const { QueryTypes } = require('sequelize');
const database = process.env['DATABASE_NAME']
const username = process.env['SQL_USERNAME']
const password = process.env['SQL_PASSWORD']

var sequelize = new Sequelize(database, username, password, {
    host: "localhost",
    dialect: "mysql",
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    // dialectOptions: {
    //     socketPath: "/var/run/mysqld/mysqld.sock"
    // },
    define: {
        paranoid: true
    }
});
PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
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

function computerVision(imageUrl) {
    let data;
    async.series([
        async function () {
            data = await detectBrand(imageUrl);
        },
        function () {
            return new Promise((resolve) => {
                resolve(data);
            })
        }
    ], (err) => {
    throw (err);
  });
}

app.get("/", (req,res) => {
    res.sendFile(path.resolve('../client/index.html'));
})
app.post("/detect_brand", async (req,res) => {
    console.log(req.body.imageUrl);
    let data = await detectBrand(req.body.imageUrl);
    res.send(data);
})

async function detectBrand(imageUrl) {

    //Check connection with database
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // const brandson = await sequelize.query("SELECT * FROM `SampleDatabase`", { type: QueryTypes.SELECT });

    const brandURLImage = imageUrl;
    // Analyze URL image
    console.log('Analyzing brands in image...', brandURLImage.split('/').pop());
    const brands = (await computerVisionClient.analyzeImage(brandURLImage, { visualFeatures: ['Brands'] })).brands;
    let brandson = [];
    // Print the brands found
    if (brands.length) {
      console.log(`${brands.length} brand${brands.length != 1 ? 's' : ''} found:`);
      for (const brand of brands) {
        brandson = await sequelize.query(`SELECT * FROM SampleDatabase WHERE Short_company_name = "${brand.name}"`, { type: QueryTypes.SELECT });
        console.log(`${brand.name} (${brand.confidence.toFixed(2)} confidence)`);
        console.log(brandson);
        console.log(brandson[0]['Overall_Score'] + brandson[0]['ETHIC_SCORE']);
        break;
      }
    }
    else { 
        console.log(`No brands found.`); 
    }

    return brandson;
}
app.listen(PORT, () => {
    console.log("App is working on port " + PORT);
})