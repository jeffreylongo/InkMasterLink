const fs = require("fs");
const path = require("path");

try {
  const dataPath = path.resolve(__dirname, "../netlify/functions/tattoo_shops.json");
  const shops = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const publicCityDir = path.resolve(__dirname, "city");
  const sitemapPath = path.resolve(__dirname, "sitemap.xml");
  const locationsListPath = path.resolve(__dirname, "partials", "locations.html");

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
      const siteRoot = "https://www.inkmasterlink.com";
      const pageUrl = `${siteRoot}/city/${fileName}`;


      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="stylesheet" href="/style.css" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2496536067852316" crossorigin="anonymous"></script>
</head>
<body>
  <header><h1>${title}</h1></header>

  <main>
    <p>${description}</p>
    <p><a href="/">← Back to main directory</a></p>

    <div id="filters">
      <input type="text" id="filter-name" placeholder="Shop Name"/>
      <input type="text" id="filter-zip" placeholder="ZIP Code"/>
      <select id="filter-city"><option value="">All Cities</option></select>
      <select id="filter-state"><option value="">All States</option></select>
      <select id="filter-rating">
        <option value="">Any Rating</option>
        <option value="4.5">4.5+</option>
        <option value="4.0">4.0+</option>
        <option value="3.5">3.5+</option>
        <option value="3.0">3.0+</option>
      </select>
      <button id="clear-filters">Clear Filters</button>
    </div>

    <div id="shop-list" data-city="${shop.city}" data-state="${shop.state}">
      <div style="display: flex; justify-content: center; width: 100%; grid-column: 1 / -1;">
        <p>Use the filters above to find a tattoo shop.</p>
      </div>
    </div>

    <div id="pagination" class="pagination">
      <button id="prev-page">Previous</button>
      <span id="page-info"></span>
      <button id="next-page">Next</button>
    </div>
  </main>

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

      sitemapUrls.push(`<url><loc>${pageUrl}</loc></url>`);
      listItems.push(`<li><a href="/city/${fileName}">Tattoo Shops in ${shop.city}, ${shop.state}</a></li>`);
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://inkmasterlink.com</loc></url>
<url><loc>https://inkmasterlink.com/blog.html</loc></url>
<url><loc>https://inkmasterlink.com/about.html</loc></url>
<url><loc>https://inkmasterlink.com/contact.html</loc></url>
<url><loc>https://inkmasterlink.com/privacy-policy.html</loc></url>
${sitemapUrls.join("\n")}
</urlset>`;
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");

  const locationsListHtml = `<ul>\n${listItems.sort().join("\n")}\n</ul>`;
  fs.writeFileSync(locationsListPath, locationsListHtml, "utf-8");

} catch (err) {
  process.exit(1);
}
//done
