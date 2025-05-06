const fs = require("fs");
const path = require("path");

exports.handler = async function () {
  try {
    // __dirname is /var/task (the deployed function dir)
    const filePath = path.resolve(__dirname, "data", "tattoo_shops.json");

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(fileContent);

    if (!Array.isArray(json)) {
      throw new Error("JSON is not an array");
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        where: "shops.js",
        stack: err.stack
      })
    };
  }
};
