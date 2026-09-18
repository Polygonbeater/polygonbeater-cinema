import fs from 'node:fs';
import path from 'node:path';

const essaysDir = path.resolve('src/content/essays');
const czDir = path.join(essaysDir, 'cz');
const enDir = path.join(essaysDir, 'en');

function readEssay(filePath) {
  const source = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`Missing frontmatter: ${filePath}`);
  }

  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (field) fields.set(field[1], field[2].trim());
  }

  return { source, frontmatter: match[1], body: source.slice(match[0].length), fields };
}

function unquote(value = '') {
  return value.replace(/^(['"])(.*)\1$/, '$2');
}

function cleanFirstParagraph(body) {
  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.replace(/^#{1,6}\s+/gm, '').replace(/[*_`]/g, '').trim())
    .find(Boolean);

  if (!paragraph) return '';
  const shortened = paragraph.length > 240
    ? `${paragraph.slice(0, 237).replace(/\s+\S*$/, '')}…`
    : paragraph;
  return JSON.stringify(shortened);
}

function getTranslationSlug(essay) {
  const fromFrontmatter = essay.fields.get('translationSlug');
  if (fromFrontmatter) return unquote(fromFrontmatter);
  return path.basename(essay.filePath)
    .replace(/\.(md|mdx)$/i, '')
    .replace(/^(?:cz|en)[_-]/i, '');
}

const CzechBySlug = new Map();
for (const fileName of fs.readdirSync(czDir)) {
  if (!fileName.endsWith('.md')) continue;
  const filePath = path.join(czDir, fileName);
  const essay = readEssay(filePath);
  essay.filePath = filePath;
  CzechBySlug.set(getTranslationSlug(essay), essay);
}

let updated = 0;
for (const fileName of fs.readdirSync(enDir)) {
  if (!fileName.endsWith('.md')) continue;

  const filePath = path.join(enDir, fileName);
  const essay = readEssay(filePath);
  essay.filePath = filePath;
  const CzechEssay = CzechBySlug.get(getTranslationSlug(essay));
  if (!CzechEssay) {
    throw new Error(`Missing Czech counterpart for ${filePath}`);
  }

  let frontmatter = essay.frontmatter;
  if (!essay.fields.has('director') && CzechEssay.fields.has('director')) {
    frontmatter += `\ndirector: ${CzechEssay.fields.get('director')}`;
  }
  if (!essay.fields.has('description')) {
    const description = cleanFirstParagraph(essay.body);
    if (description) frontmatter += `\ndescription: ${description}`;
  }

  if (frontmatter !== essay.frontmatter) {
    const updatedSource = essay.source.replace(
      /^---\r?\n[\s\S]*?\r?\n---/,
      `---\n${frontmatter}\n---`,
    );
    fs.writeFileSync(filePath, updatedSource, 'utf8');
    updated++;
    console.log(`Updated ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log(`Metadata repair complete: ${updated} file(s) updated.`);
