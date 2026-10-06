"""공개 한자 목록에서 학습 어휘에 필요한 훈음만 추출한다.

사용 예:
python scripts/generate-kanji-hun-eum.py --hanja <libhangul hanja.txt> --unihan <Unihan.zip>

libhangul 자료의 저작권·BSD 조건은 src/content/HANJA_DATA_LICENSE.md를 참고한다.
"""

import argparse
import json
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VOCABULARY = ROOT / "src/content/openjlpt-n3-reference.json"
CURATED = ROOT / "src/content/n3.ts"
OUTPUT = ROOT / "src/content/kanji-hun-eum.json"
KANJI = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
JAPANESE_FORMS = {
    "教": "敎", "青": "靑", "飲": "飮", "説": "說", "鋭": "銳",
    "清": "淸", "舎": "舍", "頬": "頰", "歳": "歲", "戸": "戶",
    "繋": "繫", "既": "旣",
}


def used_characters():
    reference = json.loads(VOCABULARY.read_text(encoding="utf-8"))
    words = [entry["word"] for level in reference["levels"].values() for entry in level["vocabulary"]]
    words += re.findall(r'word:\s*["\']([^"\']+)', CURATED.read_text(encoding="utf-8"))
    return {character for word in words for character in word if KANJI.fullmatch(character)}


def read_hanja(path, wanted):
    dictionary = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        parts = line.split(":", 2)
        if len(parts) != 3 or len(parts[1]) != 1 or parts[1] not in wanted:
            continue
        if parts[2].strip():
            dictionary.setdefault(parts[1], parts[2].split(",", 1)[0].strip())
    return dictionary


def read_variants(path):
    variants = {}
    with zipfile.ZipFile(path) as archive:
        for line in archive.read("Unihan_Variants.txt").decode("utf-8").splitlines():
            parts = line.split("\t")
            if len(parts) != 3 or parts[1] not in ("kJapaneseOldVariant", "kTraditionalVariant"):
                continue
            character = chr(int(parts[0][2:], 16))
            values = [chr(int(code[2:], 16)) for code in re.findall(r"U\+[0-9A-F]+", parts[2])]
            variants.setdefault(character, []).extend(value for value in values if value != character)
    return variants


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--hanja", type=Path, required=True)
    parser.add_argument("--unihan", type=Path, required=True)
    args = parser.parse_args()

    wanted = used_characters()
    variants = read_variants(args.unihan)
    candidates = wanted | {variant for character in wanted for variant in variants.get(character, [])} | set(JAPANESE_FORMS.values())
    dictionary = read_hanja(args.hanja, candidates)
    result = {}
    for character in sorted(wanted):
        meaning = dictionary.get(character)
        if not meaning:
            meaning = next((dictionary[variant] for variant in variants.get(character, []) if variant in dictionary), None)
        if not meaning and character in JAPANESE_FORMS:
            meaning = dictionary.get(JAPANESE_FORMS[character])
        if meaning:
            result[character] = meaning

    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    missing = sorted(wanted - result.keys())
    print(f"한자 {len(wanted)}자 중 훈음 {len(result)}자 연결, 미수록 {len(missing)}자")
    if missing:
        print("미수록:", "".join(missing))


if __name__ == "__main__":
    main()
