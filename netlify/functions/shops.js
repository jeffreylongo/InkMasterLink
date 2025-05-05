const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const filePath = path.resolve(__dirname, "tattoo_shops.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const shops = JSON.parse(data);

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
        message: "Error reading tattoo_shops.json",
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
