"""자동 번역의 빈 결과와 반복 문장을 찾아 일본어 원문으로 재번역한다."""

import argparse
import json
import re
from pathlib import Path

import ctranslate2
from transformers import M2M100Tokenizer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/content/openjlpt-n3-reference.json"
OUTPUT = ROOT / "src/content/openjlpt-reference-ko.json"
OVERRIDES = ROOT / "scripts/openjlpt-ko-overrides.json"


def bad(original, translated):
    return not re.search(r"[가-힣]", translated) or len(translated) > max(180, len(original) * 3)


def formation(text):
    replacements = [
        (r"\bVerb-dict\b", "동사 사전형"), (r"\bVerb-stem\b", "동사 어간"),
        (r"\bVerb-masu\b", "동사 ます형"), (r"\bVerb-ta\b", "동사 た형"),
        (r"\bVerb-te\b", "동사 て형"), (r"\bVerb-nai\b", "동사 ない형"),
        (r"\bi-Adj\b", "い형용사"), (r"\bna-Adj\b", "な형용사"),
        (r"\bNoun\b", "명사"), (r"\bVerb\b", "동사"),
        (r"\bSentence\b", "문장"), (r"\bClause\b", "절"),
        (r"\bplain form\b", "보통형"), (r"\bpolite form\b", "정중형"),
        (r"\bQuestion word\b", "의문사"), (r"\bGroup 1\b", "1그룹"),
        (r"\bGroup 2\b", "2그룹"), (r"\bfinal u → e\b", "마지막 う단을 え단으로"),
        (r"\bfinal u → o\b", "마지막 う단을 お단으로"),
        (r"\bshort form\b", "축약형"), (r"\bplain\b", "보통형"),
        (r"\bstem\b", "어간"), (r"\bvolitional\b", "의지형"),
        (r"\bba\b", "ば형"), (r"\bquantity\b", "수량"),
        (r"\bnumber\b", "숫자"), (r"\bcounter\b", "조수사"),
        (r"\breceiver\b", "받는 사람"), (r"\bgiver\b", "주는 사람"),
    ]
    result = text
    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result, flags=re.I)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--ct2-model", required=True, type=Path)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))

    japanese = {}
    replacements = []
    for level, content in source["levels"].items():
        translated = data["levels"][level]
        for entry in content["vocabulary"]:
            target = translated["vocabulary"][entry["id"]]
            for index, meaning in enumerate(entry["meanings"]):
                if meaning in overrides:
                    target["meanings"][index] = overrides[meaning]
                if bad(meaning, target["meanings"][index]):
                    japanese[entry["word"]] = None
                    replacements.append((target["meanings"], index, entry["word"], "뜻 확인 필요"))
            for index, example in enumerate(entry["examples"]):
                if example["en"] in overrides:
                    target["examples"][index] = overrides[example["en"]]
                if bad(example["en"], target["examples"][index]):
                    japanese[example["ja"]] = None
                    replacements.append((target["examples"], index, example["ja"], "예문 번역 확인 필요"))
        for entry in content["grammar"]:
            target = translated["grammar"][entry["id"]]
            target["formation"] = formation(entry["formation"])
            target["notes"] = formation(target["notes"])
            if bad(entry["meaning"], target["meaning"]):
                target["meaning"] = entry.get("meaningKo") or "뜻 확인 필요"
            if bad(entry["notes"], target["notes"]):
                target["notes"] = "이 표현의 자세한 쓰임은 아래 예문을 참고하세요."
            for index, example in enumerate(entry["examples"]):
                if example["en"] in overrides:
                    target["examples"][index] = overrides[example["en"]]
                if bad(example["en"], target["examples"][index]):
                    japanese[example["ja"]] = None
                    replacements.append((target["examples"], index, example["ja"], "예문 번역 확인 필요"))

    if japanese:
        tokenizer = M2M100Tokenizer.from_pretrained(args.model, src_lang="ja")
        translator = ctranslate2.Translator(str(args.ct2_model), device="cpu", compute_type="int8", inter_threads=1, intra_threads=10)
        items = list(japanese)
        for offset in range(0, len(items), 32):
            batch = items[offset:offset + 32]
            tokens = [tokenizer.convert_ids_to_tokens(tokenizer.encode(text)) for text in batch]
            prefix = [[tokenizer.lang_code_to_token["ko"]] for _ in batch]
            generated = translator.translate_batch(tokens, target_prefix=prefix, beam_size=2, max_decoding_length=80, no_repeat_ngram_size=3)
            for original, item in zip(batch, generated):
                japanese[original] = tokenizer.decode(tokenizer.convert_tokens_to_ids(item.hypotheses[0][1:]), skip_special_tokens=True)
        for array, index, source_text, fallback in replacements:
            translated = japanese[source_text]
            array[index] = translated if not bad(source_text, translated) else fallback

    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"검토 대상 {len(replacements)}개, 한국어 재번역 완료", flush=True)


if __name__ == "__main__":
    main()
