# Postup přidávání esejů – Polygon Beater Cinema

1. Markdown soubory (CZ i EN):
   - `src/content/essays/cz/<slug>.md`
   - `src/content/essays/en/<slug>.md`
   - Povinný Frontmatter:
     ---
     title: "..."
     film: "..."
     date: "YYYY-MM-DD"
     description: "..."
     image: "/images/<slug>.webp"
     ---

2. Plakát / Obrázek:
   - Složka: `public/images/`
   - Konverze na WebP: `cd public/images && cwebp -q 85 <slug>.jpg -o <slug>.webp && rm <slug>.jpg`

3. Lokální test:
   - `npm run dev`

4. Nasazení:
   - `git add .`
   - `git commit -m "Add <film> essay"`
   - `git push`
