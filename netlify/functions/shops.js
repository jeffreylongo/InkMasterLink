
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

exports.handler = async function(event, context) {
  const filePath = path.resolve(__dirname, '../../data/tattoo_shops.csv');
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(results)
        });
      })
      .on('error', (err) => {
        reject({
          statusCode: 500,
          body: JSON.stringify({ error: err.message })
        });
      });
  });
};
