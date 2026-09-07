import fs from 'node:fs';
import path from 'node:path';

const ESSAYS_DIR = path.join(process.cwd(), 'src/content/essays');

function getCleanSlug(filePath) {
  const fileName = path.basename(filePath);
  return fileName
    .replace(/\.(md|mdx)$/i, '')
    .replace(/^(cz|en)[_-]/i, '')
    .toLowerCase()
    .trim();
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Složka neexistuje: ${dirPath}`);
    return arrayOfFiles;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(md|mdx)$/i.test(file.name)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function processFiles() {
  console.log(`🔍 Prohledávám složku: ${ESSAYS_DIR}`);
  const allFiles = getAllFiles(ESSAYS_DIR);
  console.log(`📄 Nalezeno celkem ${allFiles.length} Markdown/MDX souborů.\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  allFiles.forEach((fullPath) => {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Odstranění UTF-8 BOM (Byte Order Mark) pokud existuje
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    // Pokud už translationSlug ve frontmatteru je, přeskočit
    if (/^translationSlug:/m.test(content)) {
      skippedCount++;
      return;
    }

    const fileName = path.basename(fullPath);
    const cleanSlug = getCleanSlug(fileName);

    if (content.trimStart().startsWith('---')) {
      content = content.replace(/^---\r?\n/, `---\ntranslationSlug: "${cleanSlug}"\n`);
      fs.writeFileSync(fullPath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Doplněn translationSlug: "${cleanSlug}" -> ${fileName}`);
    } else {
      console.warn(`⚠️ Soubor nemá platný hlavičkový blok (---): ${fileName}`);
    }
  });

  console.log(`\n🎉 Hotovo! Upraveno: ${updatedCount}, Již mělo klíč: ${skippedCount}, Celkem: ${allFiles.length}`);
}

processFiles();
