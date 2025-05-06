const fs = require("fs");
const path = require("path");

try {
  const dataPath = path.resolve(__dirname, "../netlify/functions/tattoo_shops.json");
  const shops = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const publicCityDir = path.resolve(__dirname, "city");
  const sitemapPath = path.resolve(__dirname, "sitemap.xml");
  const locationsListPath = path.resolve(__dirname, "partials", "locations.html");

  // Ensure necessary folders exist
  if (!fs.existsSync(publicCityDir)) fs.mkdirSync(publicCityDir, { recursive: true });
  if (!fs.existsSync(path.dirname(locationsListPath))) fs.mkdirSync(path.dirname(locationsListPath), { recursive: true });

  const locationSet = new Set();
  const sitemapUrls = [];
  const listItems = [];

  shops.forEach(shop => {
    if (!shop.city || !shop.state) return;

    const citySlug = shop.city.trim().toLowerCase().replace(/\s+/g, "-");
    const stateSlug = shop.state.trim().toLowerCase();
    const slug = `${citySlug}-${stateSlug}`;
    const fileName = `${slug}.html`;
    const filePath = path.join(publicCityDir, fileName);

    if (!locationSet.has(slug)) {
      locationSet.add(slug);

      const title = `Top Tattoo Shops in ${shop.city}, ${shop.state}`;
      const description = `Browse verified tattoo artists in ${shop.city}, ${shop.state}. Filter by rating, reviews, and location.`;
      const pageUrl = `https://inkmasterlink.netlify.app/city/${fileName}`;

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
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <header><h1>${title}</h1></header>

  <main id="city-shop-list" data-city="${shop.city}" data-state="${shop.state}">
    <p>${description}</p>
    <p><a href="/">Back to main directory</a></p>
  </main>

  <!-- Modal -->
  <div id="modal-overlay" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <div id="modal-details"></div>
    </div>
  </div>

  <script src="/script.js" defer></script>
</body>
</html>`;

      fs.writeFileSync(filePath, html, "utf-8");
      console.log(`✅ Created ${fileName}`);

      sitemapUrls.push(`<url><loc>${pageUrl}</loc></url>`);
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
