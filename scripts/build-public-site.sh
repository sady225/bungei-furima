#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# GitHub Pagesへ渡すファイルは、ここで明示した公開用ファイルだけに限定する。
rm -rf ./_site
mkdir -p ./_site/ai-editor/assets/audio ./_site/photo/251213

cp ./index.html ./CNAME ./_site/
cp ./ai-editor/index.html ./ai-editor/style.css ./ai-editor/app.js ./_site/ai-editor/
cp ./ai-editor/assets/office-background.png ./_site/ai-editor/assets/
cp \
  ./ai-editor/assets/audio/child.mp3 \
  ./ai-editor/assets/audio/parent.mp3 \
  ./ai-editor/assets/audio/school.mp3 \
  ./ai-editor/assets/audio/highschool.mp3 \
  ./ai-editor/assets/audio/welfare.mp3 \
  ./ai-editor/assets/audio/government.mp3 \
  ./ai-editor/assets/audio/resident.mp3 \
  ./ai-editor/assets/audio/nature.mp3 \
  ./ai-editor/assets/audio/unknown.mp3 \
  ./_site/ai-editor/assets/audio/
cp ./photo/250920-thanks.png ./photo/fukusima.png ./_site/photo/
cp ./photo/251213/*.jpg ./_site/photo/251213/

# Jekyll処理を使わないことを、生成物側でも明示する。
: > ./_site/.nojekyll

unexpected=0
while IFS= read -r file; do
  case "$file" in
    ./_site/index.html|./_site/CNAME|./_site/.nojekyll|\
    ./_site/ai-editor/index.html|./_site/ai-editor/style.css|./_site/ai-editor/app.js|\
    ./_site/ai-editor/assets/office-background.png|\
    ./_site/ai-editor/assets/audio/child.mp3|\
    ./_site/ai-editor/assets/audio/parent.mp3|\
    ./_site/ai-editor/assets/audio/school.mp3|\
    ./_site/ai-editor/assets/audio/highschool.mp3|\
    ./_site/ai-editor/assets/audio/welfare.mp3|\
    ./_site/ai-editor/assets/audio/government.mp3|\
    ./_site/ai-editor/assets/audio/resident.mp3|\
    ./_site/ai-editor/assets/audio/nature.mp3|\
    ./_site/ai-editor/assets/audio/unknown.mp3|\
    ./_site/photo/250920-thanks.png|./_site/photo/fukusima.png|\
    ./_site/photo/251213/[0-9][0-9][0-9].jpg)
      ;;
    *)
      printf 'Unexpected public artifact: %s\n' "$file" >&2
      unexpected=1
      ;;
  esac
done < <(find ./_site -type f -print | sort)

if [[ "$unexpected" -ne 0 ]]; then
  exit 1
fi

required=(
  ./_site/index.html
  ./_site/CNAME
  ./_site/.nojekyll
  ./_site/ai-editor/index.html
  ./_site/ai-editor/style.css
  ./_site/ai-editor/app.js
  ./_site/ai-editor/assets/office-background.png
  ./_site/ai-editor/assets/audio/child.mp3
  ./_site/ai-editor/assets/audio/parent.mp3
  ./_site/ai-editor/assets/audio/school.mp3
  ./_site/ai-editor/assets/audio/highschool.mp3
  ./_site/ai-editor/assets/audio/welfare.mp3
  ./_site/ai-editor/assets/audio/government.mp3
  ./_site/ai-editor/assets/audio/resident.mp3
  ./_site/ai-editor/assets/audio/nature.mp3
  ./_site/ai-editor/assets/audio/unknown.mp3
  ./_site/photo/250920-thanks.png
  ./_site/photo/fukusima.png
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    printf 'Required public file is missing: %s\n' "$file" >&2
    exit 1
  fi
done

if find ./_site -type f \( -name '*.json' -o -name '*.pdf' -o -name '*.key' -o -name '*.vrew' \) -print -quit | grep -q .; then
  printf 'Private document type found in public artifact.\n' >&2
  exit 1
fi

printf 'Public artifact ready: %s files\n' "$(find ./_site -type f | wc -l | tr -d ' ')"
