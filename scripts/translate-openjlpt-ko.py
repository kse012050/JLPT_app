"""OpenJLPT 영어 설명을 한국어로 옮기는 일회성 데이터 생성 도구.

실행 환경에는 ctranslate2, transformers와 facebook/m2m100_418M 모델이 필요하다.
--model에는 원본 토크나이저, --ct2-model에는 CTranslate2 변환 모델을 지정한다.
모델 파일은 앱에 포함하지 않으며, --cache 파일로 중단된 번역을 이어갈 수 있다.
"""

import argparse
import json
import re
from pathlib import Path

import ctranslate2
from transformers import M2M100Tokenizer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/content/openjlpt-n3-reference.json"
OUTPUT = ROOT / "src/content/openjlpt-reference-ko.json"


def all_english(data):
    texts = set()
    for level in data["levels"].values():
        for entry in level["vocabulary"]:
            texts.update(entry["meanings"])
            texts.update(example["en"] for example in entry["examples"])
        for entry in level["grammar"]:
            texts.update([entry["meaning"], entry["formation"], entry["notes"]])
            texts.update(example["en"] for example in entry["examples"])
    return sorted(text for text in texts if text.strip())


def clean_gloss(english, korean):
    translated = korean.strip()
    if english.startswith("to "):
        translated = re.sub(r"기 위해(?:서)?$", "다", translated)
    return translated


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--ct2-model", required=True, type=Path)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    texts = all_english(data)
    cache = json.loads(args.cache.read_text(encoding="utf-8")) if args.cache.exists() else {}
    pending = [text for text in texts if text not in cache]
    if args.limit is not None:
        pending = pending[:args.limit]

    if pending:
        tokenizer = M2M100Tokenizer.from_pretrained(args.model, src_lang="en")
        translator = ctranslate2.Translator(str(args.ct2_model), device="cpu", compute_type="int8", inter_threads=1, intra_threads=10)
        for offset in range(0, len(pending), args.batch_size):
            batch = pending[offset:offset + args.batch_size]
            source_tokens = [tokenizer.convert_ids_to_tokens(tokenizer.encode(text)) for text in batch]
            target_prefix = [[tokenizer.lang_code_to_token["ko"]] for _ in batch]
            generated = translator.translate_batch(source_tokens, target_prefix=target_prefix, beam_size=2, max_decoding_length=80, no_repeat_ngram_size=3)
            translated = [tokenizer.decode(tokenizer.convert_tokens_to_ids(item.hypotheses[0][1:]), skip_special_tokens=True) for item in generated]
            for english, korean in zip(batch, translated):
                cache[english] = clean_gloss(english, korean)
            if (offset // args.batch_size + 1) % 5 == 0 or offset + len(batch) == len(pending):
                args.cache.parent.mkdir(parents=True, exist_ok=True)
                args.cache.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
                print(f"번역 {len(cache)}/{len(texts)}", flush=True)

    if len(cache) < len(texts):
        print(f"시험 실행: 남은 문구 {len(texts) - len(cache)}개", flush=True)
        return

    result = {"sourceModel": "facebook/m2m100_418M", "modelLicense": "MIT", "levels": {}}
    for name, level in data["levels"].items():
        result["levels"][name] = {"vocabulary": {}, "grammar": {}}
        for entry in level["vocabulary"]:
            result["levels"][name]["vocabulary"][entry["id"]] = {
                "meanings": [cache[value] for value in entry["meanings"]],
                "examples": [cache[example["en"]] for example in entry["examples"]],
            }
        for entry in level["grammar"]:
            result["levels"][name]["grammar"][entry["id"]] = {
                "meaning": cache[entry["meaning"]],
                "formation": cache[entry["formation"]],
                "notes": cache.get(entry["notes"], ""),
                "examples": [cache[example["en"]] for example in entry["examples"]],
            }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"저장 완료: {OUTPUT}", flush=True)


if __name__ == "__main__":
    main()
