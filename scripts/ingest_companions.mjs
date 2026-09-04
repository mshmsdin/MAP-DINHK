import fs from 'fs';
import path from 'path';

const BAKRI_URL = 'https://raw.githubusercontent.com/OpenITI/0500AH/master/data/0487AbuCubaydBakri/0487AbuCubaydBakri.MucjamMaIstacjama/0487AbuCubaydBakri.MucjamMaIstacjama.Shamela0011802-ara1';
const LUBAB_URL = 'https://raw.githubusercontent.com/OpenITI/0650AH/master/data/0630IbnAthirCizzDin/0630IbnAthirCizzDin.LubabFiTahdhibAnsab/0630IbnAthirCizzDin.LubabFiTahdhibAnsab.Shamela0005793-ara1.mARkdown';
const MARASID_URL = 'https://raw.githubusercontent.com/OpenITI/0750AH/master/data/0739SafiDinHanbali/0739SafiDinHanbali.Marasid/0739SafiDinHanbali.Marasid.Shamela0011484-ara1';

const PUBLIC_DIR = 'e:/موقع البلدان/public';
const CORPUS_DIR = path.join(PUBLIC_DIR, 'corpus');
const BAKRI_DIR = path.join(CORPUS_DIR, 'bakri');
const LUBAB_DIR = path.join(CORPUS_DIR, 'lubab');
const MARASID_DIR = path.join(CORPUS_DIR, 'marasid');

// التأكد من وجود المجلدات الثلاثة
[BAKRI_DIR, LUBAB_DIR, MARASID_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export function getArabicLetterGroup(str) {
  if (!str) return 'ا';
  let clean = str.trim()
    .replace(/ms\d+/g, '')
    .replace(/^[\s\(\)\[\]"«»\d\-\.\/:؟#\?\|\+]+/g, '') // إزالة الرموز والأقواس والوسوم المتقدمة
    .replace(/^ال(?=[\u0621-\u064A])/, '')             // إزالة "الـ" التعريف
    .trim();

  const m = clean.match(/[\u0621-\u064A]/);
  if (!m) return 'ا';

  let ch = m[0];
  if (['أ', 'إ', 'آ', 'ا', 'ء'].includes(ch)) return 'ا';
  if (['ة', 'ه', 'هـ'].includes(ch)) return 'ه';
  if (['ى', 'ي', 'ئ'].includes(ch)) return 'ي';
  return ch;
}

function cleanTitle(raw) {
  return raw
    .replace(/ms\d+/g, '')
    .replace(/^#+\s*\|?\s*/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/«\d+»/g, '')
    .replace(/[\(\)\[\]«»؟\?#]/g, '')
    .replace(/^[\s\d\-\.\/:]+/g, '')
    .replace(/[\s\d\-\.\/:]+$/g, '')
    .trim();
}

function cleanText(txt) {
  return txt
    .replace(/^#+\s+/gm, '')        // إزالة وسوم العناوين
    .replace(/~~/g, ' ')            // وسوم اتصال السطور
    .replace(/PageV\d+P\d+/g, '')   // أرقام صفحات الشاملة
    .replace(/ms\d+/g, '')          // وسوم المخطوطات
    .replace(/\[\d+\]/g, '')        // أرقام الحواشي
    .replace(/«\d+»/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 1. معجم ما استعجم لأبي عبيد البكري (ت 487هـ)
 */
async function ingestBakri() {
  console.log('Downloading Mu jam ma Ista jam (Al-Bakri)...');
  const res = await fetch(BAKRI_URL);
  if (!res.ok) throw new Error(`Failed to download Bakri: ${res.status}`);
  const rawText = (await res.text()).replace(/\r\n/g, '\n');
  console.log(`Downloaded Bakri raw text: ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);

  const entryRegex = /###\s*\|\s*([^\n\:]+)/g;
  const matches = [...rawText.matchAll(entryRegex)];
  console.log(`Found ${matches.length} initial Bakri header matches.`);

  const bakriEntries = [];
  let entryNum = 0;

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    let rawTitle = cleanTitle(currentMatch[1]);

    // استبعاد العناوين التمهيدية والأبواب
    if (
      !rawTitle ||
      rawTitle.length < 2 ||
      rawTitle.startsWith('كتاب') ||
      rawTitle.startsWith('باب') ||
      rawTitle.startsWith('تفرق') ||
      rawTitle.startsWith('.') ||
      rawTitle.startsWith('مقدمة') ||
      /^\d+-/.test(rawTitle)
    ) {
      continue;
    }

    let title = rawTitle;
    if (title.startsWith('و') && !['واسط', 'واد', 'وادي', 'ورجلان', 'ورس', 'ورشفانة', 'ورقلة', 'وبير', 'ودان'].some(w => title.startsWith(w))) {
      title = title.substring(1).trim();
    }

    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;
    let body = cleanText(rawText.substring(startIndex, endIndex));

    // تجاهل المواد الفارغة تماماً
    if (!body || body.length < 5) continue;

    entryNum++;
    const letter = getArabicLetterGroup(title);
    const entryId = `b_${entryNum}`;

    bakriEntries.push({
      id: entryId,
      t: title,
      l: letter,
      txt: body
    });
  }

  // تجزئة حسب الحروف
  const byLetter = {};
  for (const entry of bakriEntries) {
    if (!byLetter[entry.l]) byLetter[entry.l] = [];
    byLetter[entry.l].push({
      id: entry.id,
      t: entry.t,
      txt: entry.txt
    });
  }

  // تنظيف المجلد القديم وحفظ الملفات الجديدة
  fs.readdirSync(BAKRI_DIR).forEach(f => fs.unlinkSync(path.join(BAKRI_DIR, f)));
  for (const [letter, entries] of Object.entries(byLetter)) {
    const letterFile = path.join(BAKRI_DIR, `bakri_${Buffer.from(letter).toString('hex')}.json`);
    fs.writeFileSync(letterFile, JSON.stringify(entries), 'utf8');
  }
  console.log(`Saved Bakri chunked files (${bakriEntries.length} entries) for ${Object.keys(byLetter).length} letters.`);

  return bakriEntries.map(e => ({ id: e.id, t: e.t, b: 'b', l: Buffer.from(e.l).toString('hex') }));
}

/**
 * 2. اللباب في تهذيب الأنساب لابن الأثير الجزري (ت 630هـ)
 */
async function ingestLubab() {
  console.log('Downloading Al-Lubab fi Tahdhib al-Ansab (Ibn al-Athir)...');
  const res = await fetch(LUBAB_URL);
  if (!res.ok) throw new Error(`Failed to download Lubab: ${res.status}`);
  const rawText = (await res.text()).replace(/\r\n/g, '\n');
  console.log(`Downloaded Lubab raw text: ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);

  const entryRegex = /###\s*\$DIC_NIS\$\s*([^\n]+)/g;
  const matches = [...rawText.matchAll(entryRegex)];
  console.log(`Found ${matches.length} Lubab matches.`);

  const lubabEntries = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    let title = cleanTitle(currentMatch[1]);
    if (!title || title.length < 2) continue;

    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;
    let body = cleanText(rawText.substring(startIndex, endIndex));

    const letter = getArabicLetterGroup(title);
    const entryId = `l_${i + 1}`;

    lubabEntries.push({
      id: entryId,
      t: title,
      l: letter,
      txt: body
    });
  }

  // تجزئة حسب الحروف
  const byLetter = {};
  for (const entry of lubabEntries) {
    if (!byLetter[entry.l]) byLetter[entry.l] = [];
    byLetter[entry.l].push({
      id: entry.id,
      t: entry.t,
      txt: entry.txt
    });
  }

  fs.readdirSync(LUBAB_DIR).forEach(f => fs.unlinkSync(path.join(LUBAB_DIR, f)));
  for (const [letter, entries] of Object.entries(byLetter)) {
    const letterFile = path.join(LUBAB_DIR, `lubab_${Buffer.from(letter).toString('hex')}.json`);
    fs.writeFileSync(letterFile, JSON.stringify(entries), 'utf8');
  }
  console.log(`Saved Lubab chunked files (${lubabEntries.length} entries) for ${Object.keys(byLetter).length} letters.`);

  return lubabEntries.map(e => ({ id: e.id, t: e.t, b: 'l', l: Buffer.from(e.l).toString('hex') }));
}

/**
 * 3. مراصد الاطلاع للبغدادي (ت 739هـ)
 */
async function ingestMarasid() {
  console.log('Downloading Marasid al-Ittila  (Al-Baghdadi)...');
  const res = await fetch(MARASID_URL);
  if (!res.ok) throw new Error(`Failed to download Marasid: ${res.status}`);
  const rawText = (await res.text()).replace(/\r\n/g, '\n');
  console.log(`Downloaded Marasid raw text: ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);

  const entryRegex = /###\s*\|\s*(?:\(?([^\n\)\:]+)\)?)/g;
  const matches = [...rawText.matchAll(entryRegex)];
  console.log(`Found ${matches.length} initial Marasid matches.`);

  const marasidEntries = [];
  let entryNum = 0;

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    let rawTitle = cleanTitle(currentMatch[1]);

    if (
      !rawTitle ||
      rawTitle.length < 2 ||
      rawTitle.startsWith('كتاب') ||
      rawTitle.startsWith('باب') ||
      rawTitle.startsWith('الهمزة') ||
      rawTitle.startsWith('حرف') ||
      rawTitle.startsWith('.')
    ) {
      continue;
    }

    let title = rawTitle;
    if (title.startsWith('و') && !['واسط', 'واد', 'وادي', 'ورجلان', 'ورس', 'ورشفانة', 'ورقلة', 'وبير', 'ودان'].some(w => title.startsWith(w))) {
      title = title.substring(1).trim();
    }

    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;
    let body = cleanText(rawText.substring(startIndex, endIndex));

    if (!body || body.length < 5) continue;

    entryNum++;
    const letter = getArabicLetterGroup(title);
    const entryId = `m_${entryNum}`;

    marasidEntries.push({
      id: entryId,
      t: title,
      l: letter,
      txt: body
    });
  }

  // تجزئة حسب الحروف
  const byLetter = {};
  for (const entry of marasidEntries) {
    if (!byLetter[entry.l]) byLetter[entry.l] = [];
    byLetter[entry.l].push({
      id: entry.id,
      t: entry.t,
      txt: entry.txt
    });
  }

  fs.readdirSync(MARASID_DIR).forEach(f => fs.unlinkSync(path.join(MARASID_DIR, f)));
  for (const [letter, entries] of Object.entries(byLetter)) {
    const letterFile = path.join(MARASID_DIR, `marasid_${Buffer.from(letter).toString('hex')}.json`);
    fs.writeFileSync(letterFile, JSON.stringify(entries), 'utf8');
  }
  console.log(`Saved Marasid chunked files (${marasidEntries.length} entries) for ${Object.keys(byLetter).length} letters.`);

  return marasidEntries.map(e => ({ id: e.id, t: e.t, b: 'm', l: Buffer.from(e.l).toString('hex') }));
}

async function main() {
  const startTime = Date.now();
  console.log('=== STARTING 100% INGESTION OF BAKRI, LUBAB, AND MARASID ===');

  const bakriIndex = await ingestBakri();
  const lubabIndex = await ingestLubab();
  const marasidIndex = await ingestMarasid();

  console.log('Loading existing master_index.json...');
  const masterIndexPath = path.join(CORPUS_DIR, 'master_index.json');
  let currentMaster = [];
  if (fs.existsSync(masterIndexPath)) {
    currentMaster = JSON.parse(fs.readFileSync(masterIndexPath, 'utf8'));
  }

  // الاحتفاظ بالمواد القديمة لياقوت والسمعاني فقط واستبدال مواد الكتب الثلاثة إن وُجدت
  const existingYaqutAndSamani = currentMaster.filter(item => item.b === 'y' || item.b === 's');

  const newMasterIndex = [
    ...existingYaqutAndSamani,
    ...bakriIndex,
    ...lubabIndex,
    ...marasidIndex
  ];

  fs.writeFileSync(masterIndexPath, JSON.stringify(newMasterIndex), 'utf8');

  console.log(`=== FINISHED COMPANIONS INGESTION IN ${((Date.now() - startTime) / 1000).toFixed(1)}s ===`);
  console.log(`Total master index entries: ${newMasterIndex.length}`);
  console.log(`- Yaqut (y): ${existingYaqutAndSamani.filter(i => i.b === 'y').length}`);
  console.log(`- Samani (s): ${existingYaqutAndSamani.filter(i => i.b === 's').length}`);
  console.log(`- Bakri (b): ${bakriIndex.length}`);
  console.log(`- Lubab (l): ${lubabIndex.length}`);
  console.log(`- Marasid (m): ${marasidIndex.length}`);
  console.log(`Master index file size: ${(fs.statSync(masterIndexPath).size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('INGESTION ERROR:', err);
  process.exit(1);
});
