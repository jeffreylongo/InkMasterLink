const shops = require("./tattoo_shops.json");

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shops),
  };
};
