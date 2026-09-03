import fs from 'fs';
import path from 'path';

const YAQUT_URL = 'https://raw.githubusercontent.com/OpenITI/0650AH/master/data/0626YaqutHamawi/0626YaqutHamawi.MucjamBuldan/0626YaqutHamawi.MucjamBuldan.Shamela0023735-ara1.mARkdown';
const SAMCANI_URL = 'https://raw.githubusercontent.com/OpenITI/0575AH/master/data/0562Samcani/0562Samcani.Ansab/0562Samcani.Ansab.Shamela0012317-ara1.completed';

const PUBLIC_DIR = 'e:/موقع البلدان/public';
const CORPUS_DIR = path.join(PUBLIC_DIR, 'corpus');
const YAQUT_DIR = path.join(CORPUS_DIR, 'yaqut');
const SAMCANI_DIR = path.join(CORPUS_DIR, 'samani');

// Ensure output directories exist
[PUBLIC_DIR, CORPUS_DIR, YAQUT_DIR, SAMCANI_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export function getArabicLetterGroup(str) {
  if (!str) return 'ا';
  let clean = str.trim()
    .replace(/^[\s\(\)\[\]"«»\d\-\.\/]+/g, '') // remove leading symbols/brackets/slashes
    .replace(/^ال(?=[\u0621-\u064A])/, '');  // remove leading 'الـ'

  clean = clean.trim();
  if (!clean) return 'ا';

  let ch = clean[0];
  if (['أ', 'إ', 'آ', 'ا', 'ء'].includes(ch)) return 'ا';
  if (['ة', 'ه', 'هـ'].includes(ch)) return 'ه';
  if (['ى', 'ي', 'ئ'].includes(ch)) return 'ي';
  return ch;
}

function cleanText(txt) {
  return txt
    .replace(/^#+\s+/gm, '') // remove markdown heading markers
    .replace(/~~/g, ' ')     // OpenITI line continuation
    .replace(/PageV\d+P\d+/g, '') // OpenITI page tags
    .replace(/ms\d+/g, '')   // manuscript tags
    .replace(/\[\d+\]/g, '')  // footnote numbers
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function ingestYaqut() {
  console.log('Downloading Mu jam al-Buldan (Yaqut al-Hamawi)...');
  const res = await fetch(YAQUT_URL);
  if (!res.ok) throw new Error(`Failed to download Yaqut: ${res.status}`);
  const rawText = await res.text();
  console.log(`Downloaded Yaqut raw text: ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);

  const entryRegex = /### \|\|\| \$ ([^\n:]+):?/g;
  const matches = [...rawText.matchAll(entryRegex)];
  console.log(`Found ${matches.length} Yaqut entries.`);

  const yaqutEntries = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;

    let title = currentMatch[1].replace(/\[\d+\]/g, '').replace(/^[\s\(\)\[\]"«»\d\-\.\/:]+/g, '').replace(/[\s\(\)\[\]"«»\d\-\.\/:]+$/g, '').trim();
    if (title.startsWith('و') && !['واسط', 'واد', 'وادي', 'ورجلان', 'ورس', 'ورشفانة', 'ورقلة'].some(w => title.startsWith(w))) {
      title = title.substring(1).trim();
    }
    let body = cleanText(rawText.substring(startIndex, endIndex));
    let snippet = body.substring(0, 160).replace(/\n/g, ' ').trim();

    const letter = getArabicLetterGroup(title);
    const entryId = `y_${i + 1}`;

    yaqutEntries.push({
      id: entryId,
      t: title,
      l: letter,
      txt: body,
      s: snippet
    });
  }

  // Save chunked by letter
  const byLetter = {};
  for (const entry of yaqutEntries) {
    if (!byLetter[entry.l]) byLetter[entry.l] = [];
    byLetter[entry.l].push({
      id: entry.id,
      t: entry.t,
      txt: entry.txt
    });
  }

  // Clean old files
  fs.readdirSync(YAQUT_DIR).forEach(f => fs.unlinkSync(path.join(YAQUT_DIR, f)));

  for (const [letter, entries] of Object.entries(byLetter)) {
    const letterFile = path.join(YAQUT_DIR, `yaqut_${Buffer.from(letter).toString('hex')}.json`);
    fs.writeFileSync(letterFile, JSON.stringify(entries), 'utf8');
  }
  console.log(`Saved Yaqut chunked files for ${Object.keys(byLetter).length} letters:`, Object.keys(byLetter).sort().join(' '));

  return yaqutEntries.map(e => ({ id: e.id, t: e.t, b: 'y', l: Buffer.from(e.l).toString('hex') }));
}

async function ingestSamcani() {
  console.log('Downloading Kitab al-Ansab (Al-Sam ani)...');
  const res = await fetch(SAMCANI_URL);
  if (!res.ok) throw new Error(`Failed to download Sam ani: ${res.status}`);
  const rawText = await res.text();
  console.log(`Downloaded Sam ani raw text: ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);

  const entryRegex = /### \$DIC_NIS\$ (\d+)-\s*(?:\[\d+\])?\s*([^\n]+)/g;
  const matches = [...rawText.matchAll(entryRegex)];
  console.log(`Found ${matches.length} Sam ani entries.`);

  const samaniEntries = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;

    const num = currentMatch[1].trim();
    let title = currentMatch[2].replace(/\[\d+\]/g, '').replace(/^[\s\(\)\[\]"«»\d\-\.\/:]+/g, '').replace(/[\s\(\)\[\]"«»\d\-\.\/:]+$/g, '').trim();
    let body = cleanText(rawText.substring(startIndex, endIndex));

    let snippet = body.substring(0, 160).replace(/\n/g, ' ').trim();
    const letter = getArabicLetterGroup(title);
    const entryId = `s_${num}`;

    samaniEntries.push({
      id: entryId,
      t: title,
      num: parseInt(num, 10),
      l: letter,
      txt: body,
      s: snippet
    });
  }

  // Save chunked by letter
  const byLetter = {};
  for (const entry of samaniEntries) {
    if (!byLetter[entry.l]) byLetter[entry.l] = [];
    byLetter[entry.l].push({
      id: entry.id,
      t: entry.t,
      num: entry.num,
      txt: entry.txt
    });
  }

  // Clean old files
  fs.readdirSync(SAMCANI_DIR).forEach(f => fs.unlinkSync(path.join(SAMCANI_DIR, f)));

  for (const [letter, entries] of Object.entries(byLetter)) {
    const letterFile = path.join(SAMCANI_DIR, `samani_${Buffer.from(letter).toString('hex')}.json`);
    fs.writeFileSync(letterFile, JSON.stringify(entries), 'utf8');
  }
  console.log(`Saved Sam ani chunked files for ${Object.keys(byLetter).length} letters:`, Object.keys(byLetter).sort().join(' '));

  return samaniEntries.map(e => ({ id: e.id, t: e.t, b: 's', l: Buffer.from(e.l).toString('hex') }));
}

async function main() {
  const startTime = Date.now();
  console.log('=== STARTING 100% INGESTION OF YAQUT AND SAMCANI ===');
  
  const yaqutIndex = await ingestYaqut();
  const samaniIndex = await ingestSamcani();

  const masterIndex = [...yaqutIndex, ...samaniIndex];
  const masterIndexPath = path.join(CORPUS_DIR, 'master_index.json');
  fs.writeFileSync(masterIndexPath, JSON.stringify(masterIndex), 'utf8');

  console.log(`=== FINISHED INGESTION IN ${((Date.now() - startTime) / 1000).toFixed(1)}s ===`);
  console.log(`Total indexed entries: ${masterIndex.length}`);
  console.log(`- Yaqut entries: ${yaqutIndex.length}`);
  console.log(`- Sam ani entries: ${samaniIndex.length}`);
  console.log(`Master index file size: ${(fs.statSync(masterIndexPath).size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('INGESTION ERROR:', err);
  process.exit(1);
});
