const fs = require("fs");
const path = require("path");

try {
  const dataPath = path.resolve(__dirname, "../netlify/functions/tattoo_shops.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const shops = JSON.parse(raw);

  const publicCityDir = path.resolve(__dirname, "public", "city");
  const sitemapPath = path.resolve(__dirname, "public", "sitemap.xml");
  const locationsListPath = path.resolve(__dirname, "public", "partials", "locations.html");

  if (!fs.existsSync(publicCityDir)) fs.mkdirSync(publicCityDir, { recursive: true });
  if (!fs.existsSync(path.dirname(locationsListPath))) fs.mkdirSync(path.dirname(locationsListPath), { recursive: true });

  const locationSet = new Set();
  const sitemapUrls = [];
  const listItems = [];

  shops.forEach(shop => {
    if (!shop.city || !shop.state) return;

    const city = shop.city.trim();
    const state = shop.state.trim();
    const slug = `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
    const fileName = `${slug}.html`;
    const filePath = path.join(publicCityDir, fileName);

    if (!locationSet.has(slug)) {
      locationSet.add(slug);

      const title = `Top Tattoo Shops in ${city}, ${state}`;
      const description = `Browse verified tattoo artists in ${city}, ${state}. Filter by rating, reviews, and location.`;
      const fullUrl = `https://inkmasterlink.netlify.app/city/${fileName}`;
      const previewImage = `https://inkmasterlink.netlify.app/preview.jpg`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="stylesheet" href="/style.css" />

  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${previewImage}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${previewImage}" />
</head>
<body>
  <header><h1>${title}</h1></header>
  <main id="city-shop-list" data-city="${city}" data-state="${state}">
    <p>${description}</p>
    <p><a href="/">Back to main directory</a></p>
  </main>
  <script src="/script.js"></script>
</body>
</html>`;

      fs.writeFileSync(filePath, html, "utf-8");
      console.log(`✅ Created ${fileName}`);

      sitemapUrls.push(`<url><loc>${fullUrl}</loc></url>`);
      listItems.push(`<li><a href="/city/${fileName}">Tattoo Shops in ${city}, ${state}</a></li>`);
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>`;
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log("✅ Sitemap generated");

  const locationsListHtml = `<ul>\n${listItems.sort().join("\n")}\n</ul>`;
  fs.writeFileSync(locationsListPath, locationsListHtml, "utf-8");
  console.log("✅ locations.html generated");

} catch (err) {
  console.error("❌ Failed in generate-pages.js:", err);
  process.exit(1);
}
