const fs = require("fs");
const path = require("path");

try {
  const baseDir = path.resolve(__dirname, ".."); // one level up from /public
  const dataPath = path.join(baseDir, "netlify/functions/tattoo_shops.json");

  const shops = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const publicDir = path.join(baseDir, "public");
  const cityDir = path.join(publicDir, "city");
  const partialsDir = path.join(publicDir, "partials");
  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const locationsListPath = path.join(partialsDir, "locations.html");

  fs.mkdirSync(cityDir, { recursive: true });
  fs.mkdirSync(partialsDir, { recursive: true });

  const locationSet = new Set();
  const sitemapUrls = [];
  const listItems = [];

  shops.forEach(shop => {
    if (!shop.city || !shop.state) return;

    const citySlug = shop.city.trim().toLowerCase().replace(/\s+/g, "-");
    const stateSlug = shop.state.trim().toLowerCase();
    const slug = `${citySlug}-${stateSlug}`;
    const fileName = `${slug}.html`;
    const filePath = path.join(cityDir, fileName);

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
  <main>
    <p>${description}</p>
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

  // Write sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>`;
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log("✅ Sitemap generated");

  // Write locations.html
  const locationsHtml = `<ul>\n${listItems.sort().join("\n")}\n</ul>`;
  fs.writeFileSync(locationsListPath, locationsHtml, "utf-8");
  console.log("✅ locations.html generated");

} catch (err) {
  console.error("❌ Failed in generate-pages.js:", err);
  process.exit(1);
}
