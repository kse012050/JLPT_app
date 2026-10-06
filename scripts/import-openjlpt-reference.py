"""OpenJLPT N5~N3 공개 자료를 앱의 오프라인 참고 학습 자료로 압축한다."""

import hashlib
import json
import sys
from pathlib import Path

HASHES = {
    "n5-vocab": "cbb221c9a3a92108fcd02fb088d9afacc70bc8c96570d5730425de0a49dad5f3",
    "n5-grammar": "fb8151594263f5e98372adc51d4498578bc198e22259b161fba524eea2faa0bd",
    "n4-vocab": "b38512a6dc1e06a3615f377b3e58184c4a85b6f769c2e3f58f2a4ef0e1810927",
    "n4-grammar": "7b388b8636ab7d9eaed02484d7d6be1c2468885f2354e28c02a29c2dfeb8d70d",
    "n3-vocab": "17ca6bcbba9d212c3c9d38c38cecc2adef0fd8718cb7157bb48dd9d3a1724948",
    "n3-grammar": "a94fed69f213a0896a06e62d47c81b870c570ebc0ae5f01b971780f844a7b295",
}


def main() -> None:
    source_dir, target = Path(sys.argv[1]), Path(sys.argv[2])
    grammar_ko = json.loads((Path(__file__).parent / "openjlpt-n3-grammar-ko.json").read_text(encoding="utf-8"))
    if len(grammar_ko) != 101:
        raise SystemExit(f"N3 한국어 간단 뜻 수량 오류: {len(grammar_ko)}")
    levels = {}
    for level in ("n5", "n4", "n3"):
        vocabulary = []
        grammar = []
        for kind, destination in (("vocab", vocabulary), ("grammar", grammar)):
            name = f"{level}-{kind}"
            source = source_dir / f"openjlpt-{name}.json"
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            if digest != HASHES[name]:
                raise SystemExit(f"원본 해시 불일치: {name} {digest}")
            rows = json.loads(source.read_text(encoding="utf-8"))
            for index, row in enumerate(rows):
                if kind == "vocab":
                    destination.append({
                        "id": row["id"], "word": row["word"], "reading": row["reading"],
                        "meanings": row["meanings"],
                        "examples": [
                            {key: item[key] for key in ("ja", "furigana", "en", "tatoeba_id") if key in item}
                            for item in row.get("examples", [])[:2]
                        ],
                    })
                else:
                    entry = {
                        "id": row["id"], "pattern": row["pattern"], "meaning": row["meaning"],
                        "formation": row["formation"], "notes": row.get("notes", ""),
                        "examples": [
                            {key: item[key] for key in ("ja", "furigana", "en") if key in item}
                            for item in row.get("examples", [])[:3]
                        ],
                    }
                    if level == "n3":
                        entry["meaningKo"] = grammar_ko[index]
                    destination.append(entry)
        levels[level.upper()] = {"vocabulary": vocabulary, "grammar": grammar}
    payload = {
        "source": "https://github.com/evanclan/OpenJLPT",
        "license": "CC-BY-SA-4.0",
        "sourceSha256": HASHES,
        "levels": levels,
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("OpenJLPT 참고 자료 생성:", ", ".join(
        f"{level} 어휘 {len(content['vocabulary'])}개 · 문법 {len(content['grammar'])}개"
        for level, content in levels.items()
    ))


if __name__ == "__main__":
    main()
