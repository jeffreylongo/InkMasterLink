// netlify/functions/shops.js

const shopsData = require("./tattoo_shops.json");

exports.handler = async function () {
  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(shopsData)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not load shop data",
        details: err.message
      })
    };
  }
};
