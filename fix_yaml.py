import glob
import os
import re
import shutil

# 1. Smazání mezipaměti Astro
shutil.rmtree(".astro", ignore_errors=True)

# 2. Funkce pro opravu YAML hlavičky
def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    parts = content.split("---", 2)
    if len(parts) < 3:
        return False

    fm_raw = parts[1]
    body = parts[2]

    new_fm_lines = []
    for line in fm_raw.splitlines():
        clean_line = line.replace("*", "").strip()
        if not clean_line:
            continue

        if ":" in clean_line:
            key_part, val_part = clean_line.split(":", 1)
            key = key_part.strip()

            # Odstranění zdvojeného klíče z hodnoty (např. title: "...")
            clean_val = val_part.strip()
            clean_val = re.sub(r"^[a-zA-Z0-9_]+\s*:\s*", "", clean_val).strip()

            # Ošetření uvozovek kolem hodnoty
            clean_val_unquoted = clean_val.strip('"\'')
            new_fm_lines.append(f'{key}: "{clean_val_unquoted}"')
        else:
            new_fm_lines.append(clean_line)

    new_content = "---\n" + "\n".join(new_fm_lines) + "\n---" + body
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

fixed_count = sum(1 for path in glob.glob("src/content/**/*.md", recursive=True) if fix_file(path))
print(f"Úspěšně opraveno {fixed_count} Markdown souborů.")

target = "src/content/essays/cz/the-straight-story-1999.md"
if os.path.exists(target):
    print("\n--- Náhled opravené hlavičky ---")
    with open(target, "r", encoding="utf-8") as f:
        print("".join(f.readlines()[:8]))
    print("--------------------------------")
