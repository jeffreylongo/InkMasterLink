const shops = require("./tattoo_shops.json");

exports.handler = async (event) => {
  const {
    page = 1,
    limit = 20,
    name = "",
    zip = "",
    city = "",
    state = "",
    rating = 0
  } = event.queryStringParameters || {};

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const minRating = parseFloat(rating);

  if (isNaN(pageNum) || isNaN(limitNum) || limitNum <= 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid page or limit" }),
    };
  }

  const filtered = shops.filter(shop =>
    (!name || shop.name.toLowerCase().includes(name.toLowerCase())) &&
    (!zip || shop.zip.startsWith(zip)) &&
    (!city || shop.city === city) &&
    (!state || shop.state === state) &&
    (!rating || parseFloat(shop.rating) >= minRating)
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const pagedData = filtered.slice(start, start + limitNum);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: pagedData,
      page: pageNum,
      total,
      totalPages
    }),
  };
};


// netlify/functions/shops.js

//const shopsData = require("./tattoo_shops.json");

//exports.handler = async function () {
  //try {
    //return {
      //statusCode: 200,
      //headers: {
        //"Content-Type": "application/json"
      //},
      //body: JSON.stringify(shopsData)
    //};
  //} catch (err) {
    //return {
      //statusCode: 500,
      //body: JSON.stringify({
        //error: "Could not load shop data",
        //details: err.message
      //})
    //};
  //}
//};
