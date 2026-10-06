"""Correct confirmed vocabulary mistranslations and remove repeated Korean senses."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/content/openjlpt-n3-reference.json"
TRANSLATIONS = ROOT / "src/content/openjlpt-reference-ko.json"

# Keys are OpenJLPT entry IDs, so homographs and different readings stay separate.
CORRECTIONS = {
    "07a4101167": ["울다(동물)", "지저귀다(새)"],
    "fbb6245e8b": ["보통", "일반적", "각 역에 서는 열차"],
    "9a184ecb80": ["한 몸", "대체", "도대체"],
    "8320d2162f": ["매화", "매실", "하급(등급)"],
    "3af04ce9d1": ["회복", "복구"],
    "7fa019fe1b": ["무렵", "즈음"],
    "b2fa7ff523": ["한창때", "절정", "제철"],
    "ba60eb30d1": ["주(행정 구역)"],
    "fb77f8ffbb": ["붓다", "쏟다", "기울이다"],
    "3ce84453e7": ["주세요", "받다"],
    "e629f70aca": ["잇다", "연결하다", "전화를 바꿔 주다"],
    "236e0b11a0": ["채우다", "좁히다", "세부 사항을 조율하다"],
    "5f300646e4": ["어쨌든", "아무튼"],
    "8a2b4c5ed1": ["흘리다", "떠내려 보내다", "흐르게 하다"],
    "a5cf314cf9": ["남기다", "남겨 두다"],
    "767cb5e2e6": ["바라다", "원하다", "내다보다"],
    "d5c6b153f1": ["늘어나다", "자라다", "실력이 향상되다"],
    "0024055e8e": ["떨어지다", "멀어지다", "떠나다"],
    "526233614e": ["편", "교통편", "편의"],
    "42ce4a629d": ["닿다", "언급하다", "법에 저촉되다"],
    "b459e9db8c": ["줄다", "감소하다"],
    "363e985c77": ["주인", "경영자", "달인"],
    "8208cbb873": ["배우다", "공부하다"],
    "bd2ba94516": ["구하다", "요구하다", "원하다"],
    "0a65b39cf7": ["안녕하세요"],
    "d5c2e69813": ["저", "나 자신"],
    "1587d6fbcf": ["나, 저(남성이 주로 사용)"],
    "5f81e206e3": ["좋다", "괜찮다"],
    "7d26b9a262": ["신호", "눈짓"],
    "cab1bc201f": ["상대방", "짝", "동행인"],
    "8b9b33028c": ["언제든지", "항상"],
    "7460e55135": ["관객", "구경꾼"],
    "c2dcadfe14": ["감정", "기분"],
    "42d188d98e": ["클래식", "고전적인 것"],
    "7aaf7b56d7": ["더하다", "추가하다"],
    "a32b605031": ["교제", "사귐", "친분"],
    "4aef785a50": ["복사", "복사본", "광고 문구"],
    "f797ab74cc": ["차지하다", "점유하다", "비율을 차지하다"],
    "69257fa105": ["스케이트", "스케이트 타기"],
    "e62a18d68e": ["자라다", "성장하다"],
    "1935a3f544": ["대", "대항하여"],
    "7433983c57": ["동행인", "일행"],
    "c2946190ea": ["나옴", "나가는 것"],
    "124f4d078f": ["동료", "한패"],
    "b01e686ddf": ["서투르다", "자신이 없다", "꺼리다"],
    "614bded84d": ["평등", "공평"],
    "41e221bc4d": ["불", "부(부정의 접두어)"],
    "525af6640e": ["페인트", "칠"],
    "e7344aa7e1": ["법", "법률"],
    "a6c8fd99d7": ["열중", "몰두", "정신이 팔림"],
}


def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    data = json.loads(TRANSLATIONS.read_text(encoding="utf-8"))
    found = set()
    deduplicated = 0
    for level, content in source["levels"].items():
        for entry in content["vocabulary"]:
            entry_id = entry["id"]
            target = data["levels"][level]["vocabulary"][entry_id]
            if entry_id in CORRECTIONS:
                target["meanings"] = CORRECTIONS[entry_id]
                found.add(entry_id)
            before = target["meanings"]
            after = list(dict.fromkeys(meaning.strip() for meaning in before if meaning.strip()))
            if len(after) < len(before):
                deduplicated += 1
            target["meanings"] = after
    if found != CORRECTIONS.keys():
        raise ValueError(f"Missing OpenJLPT entries: {CORRECTIONS.keys() - found}")
    TRANSLATIONS.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Corrected {len(found)} entries and removed repeated meanings from {deduplicated} entries")


if __name__ == "__main__":
    main()
