import fs from 'fs';

async function generate() {
  const placesModule = await import('file:///e:/موقع البلدان/src/data/places.js');
  const scholarsModule = await import('file:///e:/موقع البلدان/src/data/scholars.js');

  const places = placesModule.places;
  const scholars = scholarsModule.scholars;

  const scholarMap = new Map();
  scholars.forEach(s => {
    if (!scholarMap.has(s.placeId)) scholarMap.set(s.placeId, []);
    scholarMap.get(s.placeId).push(s);
  });

  const BASE_URL = 'https://din.hk/map';
  const TODAY = new Date().toISOString().split('T')[0];

  // 1. Generate XML Sitemap
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- الصفحة الرئيسية لمنصة موسوعة أسماء البلدان والأعلام التراثية -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- دليل الباحث والزائر الشامل (/f1) -->
  <url>
    <loc>${BASE_URL}/f1</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- مستكشف الموسوعة التراثية الشاملة لكتابي معجم البلدان والأنساب -->
  <url>
    <loc>${BASE_URL}/#corpus</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>

  <!-- أطلس الأقاليم الإسلامية الكبرى وحواضرها -->
  <url>
    <loc>${BASE_URL}/#regions</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- حاسبة المسالك والفراسخ ومراحل السير التاريخية -->
  <url>
    <loc>${BASE_URL}/#calculator</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- تحدي ومسابقة الأنساب والبلدان التراثية -->
  <url>
    <loc>${BASE_URL}/#quiz</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>

  <!-- دليل المنصة وسجل التحديثات -->
  <url>
    <loc>${BASE_URL}/#guide</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- إحصائيات وتوثيق مواد المنصة ومصادرها -->
  <url>
    <loc>${BASE_URL}/#stats</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>

  <!-- فهرس روابط البلدان والحواضر التاريخية الـ 625 (برمجية وتفاعلية) -->
`;

  // Major historical capitals get priority 0.90
  const majorPlaceIds = new Set([
    'mecca', 'medina', 'jerusalem', 'damascus', 'baghdad', 'cairo_fustat', 
    'cordoba', 'seville', 'kairouan', 'fes', 'aleppo', 'samarkand', 'bukhara', 
    'nishapur', 'merv', 'balkh', 'basra', 'kufa', 'sanaa', 'tlemcen_bejaia',
    'tunis', 'granada', 'delhi', 'lahore', 'herat', 'isfahan', 'shiraz', 'rayy'
  ]);

  for (const p of places) {
    const isMajor = majorPlaceIds.has(p.id);
    const priority = isMajor ? '0.90' : '0.80';
    const changefreq = isMajor ? 'weekly' : 'monthly';

    xml += `  <url>
    <loc>${BASE_URL}/?place=${encodeURIComponent(p.id)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync('e:/موقع البلدان/public/sitemap.xml', xml, 'utf8');
  console.log(`Generated public/sitemap.xml with ${places.length} places + 8 core pages!`);

  // 2. Generate robots.txt
  const robots = `# ==============================================================================
# robots.txt for Encyclopedia of Ancient Buldan & Kunya (din.hk/map)
# ==============================================================================

User-agent: *
Allow: /
Allow: /map/
Allow: /map/*

# Comprehensive XML Sitemap including all 625 historical places
Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync('e:/موقع البلدان/public/robots.txt', robots, 'utf8');
  console.log('Updated public/robots.txt!');

  // 3. Update index.html with crawlable semantic SEO directory
  let html = fs.readFileSync('e:/موقع البلدان/index.html', 'utf8');
  
  let directoryHtml = `  <!-- فهرس برمجيات الأرشفة لمحركات البحث لجميع الـ 625 موضعاً تاريخياً (Crawlable SEO Directory) -->\n`;
  directoryHtml += `  <section id="seo-places-directory" class="sr-only" aria-label="فهرس الحواضر والبلدان والمواضع التاريخية (625 موضعاً)">\n`;
  directoryHtml += `    <h2>فهرس البلدان والحواضر التاريخية وأعلامها في موسوعة البلدان والكنى</h2>\n`;
  directoryHtml += `    <nav aria-label="روابط مواضع البلدان التاريخية">\n`;
  directoryHtml += `      <ul>\n`;

  for (const p of places) {
    const placeScholars = scholarMap.get(p.id) || [];
    const scholarText = placeScholars.map(s => s.name).slice(0, 3).join('، ');
    directoryHtml += `        <li><a href="/map/?place=${p.id}">${p.vocalized || p.name} (${p.nisbaVocalized || p.nisba}) - ${p.modernName} (${p.modernCountry})</a>: ${p.importance || p.subTitle || ''} ${scholarText ? `| الأعلام: ${scholarText}` : ''}</li>\n`;
  }

  directoryHtml += `      </ul>\n`;
  directoryHtml += `    </nav>\n`;
  directoryHtml += `  </section>\n`;

  const regex = /<!-- فهرس برمجيات الأرشفة لمحركات البحث[\s\S]*?<\/section>/;
  if (regex.test(html)) {
    html = html.replace(regex, directoryHtml.trim());
  } else {
    html = html.replace('<div id="app"></div>', `${directoryHtml}  <div id="app"></div>`);
  }

  fs.writeFileSync('e:/موقع البلدان/index.html', html, 'utf8');
  console.log('Injected crawlable semantic SEO directory into index.html!');
}

generate().catch(console.error);
