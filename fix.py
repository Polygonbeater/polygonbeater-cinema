import glob
import os
import re
import shutil

# 1. Odstranění mezipaměti Astro
if os.path.exists(".astro"):
    shutil.rmtree(".astro")
    print("Astro mezipaměť (.astro) byla smazána.")

# 2. Oprava YAML hlaviček ve všech Markdown souborech
count = 0
for filepath in glob.glob("src/content/**/*.md", recursive=True):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    if content.lstrip().startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm = parts[1]
            body = parts[2]

            new_fm_lines = []
            for line in fm.splitlines():
                line_clean = line.replace("*", "")
                if ":" in line_clean:
                    key, val = line_clean.split(":", 1)
                    
                    # Získání čistého názvu klíče (např. "title")
                    key_words = key.strip().split()
                    valid_key = key_words[0] if key_words else key.strip()
                    valid_key = re.sub(r"[^a-zA-Z0-9_]", "", valid_key)

                    # Vyčištění hodnoty od duplicitních klíčů
                    clean_val = val.strip()
                    clean_val = re.sub(r"^\s*\*?\*?[a-zA-Z0-9_]+\*?\*?:\s*", "", clean_val)

                    if valid_key:
                        new_fm_lines.append(f"{valid_key}: {clean_val}")
                else:
                    new_fm_lines.append(line_clean)

            new_content = "---\n" + "\n".join(new_fm_lines) + "\n---" + body
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1

print(f"Opraveno {count} Markdown souborů.")

# Náhled opraveného souboru
target = "src/content/essays/cz/the-straight-story-1999.md"
if os.path.exists(target):
    print("\n=== Náhled opravené hlavičky ===")
    with open(target, "r", encoding="utf-8") as f:
        for line in f.readlines()[:10]:
            print(line, end="")
    print("================================")
