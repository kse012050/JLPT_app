"""공개 N3 참고 CSV에서 읽기가 하나로 정해지는 한자 표기만 추출한다."""

import csv
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

EXPECTED_SHA256 = "bd4d68c59cfee861351e1bdf9d99818e434392201eabbed4d3657225fe53a3ac"
JMDICT_SHA256 = "b051f32e42d2c2702378354d2defcfe52ad0cdeb00fa2c5d608df69ad942c09e"
SOURCE_URL = "https://raw.githubusercontent.com/stephenmk/yomitan-jlpt-vocab/main/original_data/n3.csv"
JMDICT_URL = "https://raw.githubusercontent.com/jkindrix/japanese-language-data/main/data/core/words.json"


def main() -> None:
    source = Path(sys.argv[1])
    dictionary = Path(sys.argv[2])
    target = Path(sys.argv[3])
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise SystemExit(f"참고 CSV의 해시가 예상과 다릅니다: {digest}")
    dictionary_digest = hashlib.sha256(dictionary.read_bytes()).hexdigest()
    if dictionary_digest != JMDICT_SHA256:
        raise SystemExit(f"JMdict 검증 파일의 해시가 예상과 다릅니다: {dictionary_digest}")

    with source.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    with dictionary.open(encoding="utf-8") as handle:
        entries = {entry["id"]: entry for entry in json.load(handle)["words"]}

    readings: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        written = row["kanji"].strip()
        reading = row["kana"].strip()
        entry = entries.get(row["jmdict_seq"])
        if not entry or not re.search(r"[一-龯々]", written) or not re.fullmatch(r"[ぁ-ゖァ-ヺー]+", reading) or "TODO" in row["waller_definition"]:
            continue
        common_writing = any(form["text"] == written and form["common"] for form in entry["kanji"])
        primary_reading = next((
            form["text"] for form in entry["kana"]
            if form["common"] and ("*" in form["appliesToKanji"] or written in form["appliesToKanji"])
        ), None)
        common_reading = primary_reading == reading
        if common_writing and common_reading:
            readings[written].add(reading)

    items = sorted(
        [[written, next(iter(values))] for written, values in readings.items() if len(values) == 1],
        key=lambda pair: (pair[1], pair[0]),
    )
    payload = {
        "source": SOURCE_URL,
        "sha256": digest,
        "verifiedWith": JMDICT_URL,
        "verifiedSha256": dictionary_digest,
        "license": "CC-BY-SA-4.0",
        "items": items,
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"한자 읽기 참고 자료 {len(items)}개 생성: {target}")


if __name__ == "__main__":
    main()
