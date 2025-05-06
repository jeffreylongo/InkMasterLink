const fs = require("fs");
const path = require("path");
const shops = require("./netlify/functions/data/tattoo_shops.json");

const outputDir = path.join(__dirname, "public", "city");
const sitemapEntries = [];

function slugifyCityState(city, state) {
  return `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
}

function generateHTML(city, state) {
  const title = `Top Tattoo Shops in ${city}, ${state}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="Find the best rated tattoo artists in ${city}, ${state}. Browse shops by ratings, reviews, and location." />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header><h1>${title}</h1></header>
  <main>
    <p>Browse verified tattoo artists in ${city}, ${state}.</p>
    <a href="/">← Back to Main Directory</a>
  </main>
</body>
</html>`;
}

function generatePages() {
  const seen = new Set();

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  shops.forEach(({ city, state }) => {
    if (!city || !state) return;

    const key = `${city}|${state}`;
    if (seen.has(key)) return;

    seen.add(key);
    const slug = slugifyCityState(city, state);
    const filename = path.join(outputDir, `${slug}.html`);
    const html = generateHTML(city, state);
    fs.writeFileSync(filename, html);

    sitemapEntries.push(`/city/${slug}.html`);
  });
}

function generateSitemap() {
  const sitemapPath = path.join(__dirname, "public", "sitemap.xml");
  const urls = sitemapEntries.map(url => `<url><loc>https://inkmasterlink.netlify.app${url}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  fs.writeFileSync(sitemapPath, xml);
}

function generateLocationListFragment() {
  const listItems = sitemapEntries.map(url => {
    const [, citySlug] = url.match(/\/city\/(.+)\.html/);
    const [cityPart, statePart] = citySlug.split("-");
    const city = cityPart.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const state = statePart.toUpperCase();

    return `<li><a href="${url}">Tattoo Shops in ${city}, ${state}</a></li>`;
  });

  const html = `<ul>\n${listItems.join("\n")}\n</ul>`;
  fs.writeFileSync(path.join(__dirname, "public", "partials", "locations.html"), html);
}

generatePages();
generateSitemap();
generateLocationListFragment();
