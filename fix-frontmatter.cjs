const fs = require("fs");
const path = require("path");

function getFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((acc, res) => {
    const p = path.join(dir, res.name);
    return res.isDirectory() ? [...acc, ...getFiles(p)] : [...acc, p];
  }, []).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));
}

const nameMap = {
  "Stanleyho Kubricka": "Stanley Kubrick",
  "Fritze Langa": "Fritz Lang",
  "Geralda Kargla": "Gerald Kargl",
  "Roberta Wiena": "Robert Wien",
  "Todda Browninga": "Tod Browning",
  "Lexa Ortegy": "Lex Ortega",
  "Terryho Gilliama": "Terry Gilliam",
  "Henriho-Georga Clouzota": "Henri-Georges Clouzot",
  "Piersa Haggarda": "Piers Haggard",
  "Michała Waszyńskiego": "Michał Waszyński",
  "Kijoši Kurosawy": "Kijoši Kurosawa",
  "Michael Hanekeho": "Michael Haneke",
  "René Lalouxe": "René Laloux",
  "Oskara Fischingera": "Oskar Fischinger",
  "Alfreda Hitchcocka": "Alfred Hitchcock",
  "Mario Bavy": "Mario Bava"
};

const files = getFiles("src/content");
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!match) return;

  let frontmatter = match[2];
  let originalFm = frontmatter;

  frontmatter = frontmatter.replace(/^director:\s*["']?(.*?)["']?$/gm, (m, dir) => {
    let clean = dir.replace(/\s+(představuje|patří|je|má|byl|byla).*$/i, "").trim();
    for (const [declined, fixed] of Object.entries(nameMap)) {
      clean = clean.replace(new RegExp(declined, "g"), fixed);
    }
    return `director: "${clean}"`;
  });

  frontmatter = frontmatter.replace(/^film:\s*["']?Prvotní záblesk: Městský zrak, Hitchcock a zrod gialla v Bavově Dívce, která věděla příliš mnoho["']?$/gm, 'film: "Dívka, která věděla příliš mnoho (1963)"');
  frontmatter = frontmatter.replace(/^film:\s*["']?Anatomie viny a past vlastní lži: Pohled do hlubin filmu Ďábelské ženy["']?$/gm, 'film: "Ďábelské ženy (1955)"');

  if (frontmatter !== originalFm) {
    const newContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${frontmatter}\n---`);
    fs.writeFileSync(file, newContent, "utf8");
    updatedCount++;
  }
});

console.log(`\nÚspěšně zkontrolováno a opraveno ${updatedCount} souborů.\n`);
