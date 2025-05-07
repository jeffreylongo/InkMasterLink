const shops = require("./tattoo_shops.json");

exports.handler = async (event) => {
  const { state } = event.queryStringParameters || {};

  const result = {};

  if (!state) {
    // Return all unique states
    const states = new Set();
    for (const shop of shops) {
      if (shop.state) states.add(shop.state.trim().toUpperCase());
    }
    result.states = [...states].sort();
  } else {
    // Return all unique cities for that state
    const cities = new Set();
    for (const shop of shops) {
      if (shop.state?.trim().toUpperCase() === state.toUpperCase() && shop.city) {
        cities.add(shop.city.trim());
      }
    }
    result.cities = [...cities].sort();
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  };
};
