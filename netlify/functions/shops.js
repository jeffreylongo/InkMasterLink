const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const filePath = path.resolve(__dirname, "tattoo_shops.json");

    if (!fs.existsSync(filePath)) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "tattoo_shops.json not found" }),
      };
    }

    const data = fs.readFileSync(filePath, "utf-8");
    const shops = JSON.parse(data);

    if (!Array.isArray(shops)) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "tattoo_shops.json is not an array" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shops),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
