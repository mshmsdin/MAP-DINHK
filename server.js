/**
 * خادم الإنتاج عالي الأداء والموثوقية لمنصة الأنساب والبلدان (Node.js 24 LTS)
 * مصمم للنشر المباشر عبر Docker + Coolify + Traefik + Cloudflare Tunnel
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const startTime = Date.now();

  // تعيين الترويسات الأمنية القياسية
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // معالجة نقطة فحص الصحة (Healthcheck) لـ Docker و Coolify
  if (req.url === '/health' || req.url === '/ready' || req.url === '/map/health' || req.url === '/map/ready') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'production'
    }));
    logRequest(req, 200, startTime);
    return;
  }

  // السماح بطلبات GET و HEAD فقط
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    logRequest(req, 405, startTime);
    return;
  }

  // فك ترميز المسار والتأكد من عدم وجود Path Traversal
  let decodedPath;
  try {
    const rawUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    decodedPath = decodeURIComponent(rawUrl.pathname);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    logRequest(req, 400, startTime);
    return;
  }

  // دعم العمل تحت المسار الفرعي /map وتجريد البادئة عند البحث في مجلد dist
  let cleanPath = decodedPath;
  if (cleanPath.startsWith('/map/')) {
    cleanPath = cleanPath.slice(4); // إزالة بادئة /map ليبقى /...
  } else if (cleanPath === '/map') {
    cleanPath = '/';
  }

  // حماية من Path Traversal
  const safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // إذا كان المسار مجلداً، ابحث عن index.html داخله
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // إذا لم يكن الملف موجوداً، ارجع index.html لدعم SPA
  let isFallback = false;
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
    isFallback = true;
  }

  // إذا تعذر العثور على index.html
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found - Application not built yet');
    logRequest(req, 404, startTime);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const relativePath = safePath.replace(/\\/g, '/');

  // ضبط الكاش بحسب نوع الملف
  if (isFallback || ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (relativePath.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (relativePath.startsWith('/corpus/')) {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  res.writeHead(200, { 'Content-Type': contentType });

  if (req.method === 'HEAD') {
    res.end();
    logRequest(req, 200, startTime);
    return;
  }

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
  readStream.on('end', () => logRequest(req, 200, startTime));
  readStream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
    logRequest(req, 500, startTime);
  });
});

function logRequest(req, statusCode, startTime) {
  const duration = Date.now() - startTime;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} ${statusCode} - ${duration}ms`);
}

// بدء تشغيل الخادم
server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Production Server running at http://${HOST}:${PORT}`);
  console.log(`📡 Healthcheck available at http://${HOST}:${PORT}/health`);
  console.log(`📦 Serving static assets from: ${DIST_DIR}`);
  console.log(`⚙️  Node.js: ${process.version} | PID: ${process.pid}`);
  console.log(`=======================================================`);
});

// إدارة الإغلاق الآمن (Graceful Shutdown)
function handleShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed. Process terminating safely.');
    process.exit(0);
  });

  // إغلاق إجباري بعد 10 ثوانٍ إذا علقت أي اتصالات
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating after shutdown timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
