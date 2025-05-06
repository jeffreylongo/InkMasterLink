const fs = require("fs");
const path = require("path");

try {
  const dataPath = path.resolve(__dirname, "netlify", "functions", "tattoo_shops.json");
  const publicCityDir = path.resolve(__dirname, "public", "city");
  const sitemapPath = path.resolve(__dirname, "public", "sitemap.xml");
  const locationsListPath = path.resolve(__dirname, "public", "partials", "locations.html");

  // Make sure directories exist
  if (!fs.existsSync(publicCityDir)) fs.mkdirSync(publicCityDir, { recursive: true });
  if (!fs.existsSync(path.dirname(locationsListPath))) fs.mkdirSync(path.dirname(locationsListPath), { recursive: true });

  // Load data
  const raw = fs.readFileSync(dataPath, "utf-8");
  const shops = JSON.parse(raw);

  // Track unique city/state combos
  const locationSet = new Set();
  const sitemapUrls = [];
  const listItems = [];

  shops.forEach(shop => {
    if (!shop.city || !shop.state) return;

    const city = shop.city.trim().toLowerCase().replace(/\s+/g, "-");
    const state = shop.state.trim().toLowerCase();
    const slug = `${city}-${state}`;
    const fileName = `${slug}.html`;
    const filePath = path.join(publicCityDir, fileName);

    if (!locationSet.has(slug)) {
      locationSet.add(slug);

      const title = `Top Tattoo Shops in ${shop.city}, ${shop.state}`;
      const description = `Browse verified tattoo artists in ${shop.city}, ${shop.state}. Filter by rating, reviews, and location.`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header><h1>${title}</h1></header>
  <main><p>${description}</p>
    <p><a href="/">Back to main directory</a></p>
  </main>
</body>
</html>`;

      fs.writeFileSync(filePath, html, "utf-8");
      console.log(`✅ Created ${fileName}`);

      sitemapUrls.push(`<url><loc>https://inkmasterlink.netlify.app/city/${fileName}</loc></url>`);
      listItems.push(`<li><a href="/city/${fileName}">Tattoo Shops in ${shop.city}, ${shop.state}</a></li>`);
    }
  });

  // Write sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>`;
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log("✅ Sitemap generated");

  // Write location list fragment
  const locationsListHtml = `<ul>\n${listItems.sort().join("\n")}\n</ul>`;
  fs.writeFileSync(locationsListPath, locationsListHtml, "utf-8");
  console.log("✅ locations.html generated");

} catch (err) {
  console.error("❌ Failed in generate-pages.js:", err);
  process.exit(1);
}
