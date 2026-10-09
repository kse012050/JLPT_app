import { kanaToHangul } from './japanese-reading';

/** 예문에 실제로 쓰인 표현을 우선 찾고, 없으면 표제 표현의 첫 형태를 찾는다. */
export function grammarFocus(pattern: string, example: string, focus?: string): string {
  if (focus && example.includes(focus)) return focus;
  const candidates = pattern.replace(/（[^）]*）/gu, '').split(/\s*\/\s*/u)
    .map((part) => part.replace(/^〜/u, '').trim())
    .filter(Boolean);
  return candidates.find((part) => example.includes(part)) ?? '';
}

/** OpenJLPT의 {한자|읽기} 표기를 예문 위치에 맞춰 읽기로 변환한다. */
export function grammarReading(example: string, furigana: string | undefined, focus: string): string {
  if (!focus) return '';
  const start = example.indexOf(focus);
  if (start < 0 || !furigana) return /^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u.test(focus) ? focus : '';
  const readings: string[] = [];
  const ruby = /\{([^|}]+)\|([^}]+)\}|([^{}])/gu;
  for (const match of furigana.matchAll(ruby)) {
    if (match[1]) {
      readings.push(match[2], ...Array.from({ length: Array.from(match[1]).length - 1 }, () => ''));
    } else {
      readings.push(match[3]);
    }
  }
  if (readings.length !== Array.from(example).length) return '';
  const position = Array.from(example.slice(0, start)).length;
  const reading = readings.slice(position, position + Array.from(focus).length).join('');
  return /^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u.test(reading) ? reading : '';
}

/** 화면에 표시할 학습용 근사 표기이며 음성 합성에는 사용하지 않는다. */
export function grammarHangul(reading: string): string {
  return reading ? kanaToHangul(reading) : '';
}

/** 조사 は·へ는 표기와 발음이 다르므로 단독 문법 표현에서는 실제 발음을 사용한다. */
export function grammarSpokenReading(pattern: string, reading: string): string {
  if (pattern === '〜は' && reading === 'は') return 'わ';
  if (pattern === '〜へ' && reading === 'へ') return 'え';
  return reading;
}

const handWrittenExampleReadings: Record<string, string> = {
  '毎朝、新聞を読むことにしました。': 'まいあさ、しんぶんをよむことにしました。',
  '来月から大阪で働くことになりました。': 'らいげつからおおさかではたらくことになりました。',
  '寝る前にスマートフォンを見ないようにしています。': 'ねるまえにスマートフォンをみないようにしています。',
  '日本語のニュースが少し分かるようになりました。': 'にほんごのニュースがすこしわかるようになりました。',
  '暗くならないうちに帰りましょう。': 'くらくならないうちにかえりましょう。',
  'この写真を見るたびに、旅行を思い出します。': 'このしゃしんをみるたびに、りょこうをおもいだします。',
  '声が出ないほど疲れていました。': 'こえがでないほどつかれていました。',
  '弟はゲームばかりしています。': 'おとうとはゲームばかりしています。',
  'もう八時だから、店は開いているはずです。': 'もうはちじだから、みせはあいているはずです。',
  '日本語が嫌いなわけではありません。': 'にほんごがきらいなわけではありません。',
  '友達のおかげで道が分かりました。': 'ともだちのおかげでみちがわかりました。',
  '寝坊したせいで、電車に乗り遅れました。': 'ねぼうしたせいで、でんしゃにのりおくれました。',
};

/** 예문 전체의 후리가나를 가나 문장으로 펼친다. */
export function grammarSentenceReading(example: string, furigana?: string): string {
  const kana = furigana?.replace(/\{[^|}]+\|([^}]+)\}/gu, '$1') ?? handWrittenExampleReadings[example] ?? example;
  return /[\p{Script=Han}{}]/u.test(kana) ? '' : kana;
}
