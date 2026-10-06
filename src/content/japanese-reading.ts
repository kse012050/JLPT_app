import hunEum from './kanji-hun-eum.json';

const kana: Record<string, string> = {
  あ: '아', い: '이', う: '우', え: '에', お: '오',
  か: '카', き: '키', く: '쿠', け: '케', こ: '코',
  が: '가', ぎ: '기', ぐ: '구', げ: '게', ご: '고',
  さ: '사', し: '시', す: '스', せ: '세', そ: '소',
  ざ: '자', じ: '지', ず: '즈', ぜ: '제', ぞ: '조',
  た: '타', ち: '치', つ: '츠', て: '테', と: '토',
  だ: '다', ぢ: '지', づ: '즈', で: '데', ど: '도',
  な: '나', に: '니', ぬ: '누', ね: '네', の: '노',
  は: '하', ひ: '히', ふ: '후', へ: '헤', ほ: '호',
  ば: '바', び: '비', ぶ: '부', べ: '베', ぼ: '보',
  ぱ: '파', ぴ: '피', ぷ: '푸', ぺ: '페', ぽ: '포',
  ま: '마', み: '미', む: '무', め: '메', も: '모',
  や: '야', ゆ: '유', よ: '요',
  ら: '라', り: '리', る: '루', れ: '레', ろ: '로',
  わ: '와', ゐ: '이', ゑ: '에', を: '오',
};

const joined: Record<string, string> = {
  きゃ: '캬', きゅ: '큐', きょ: '쿄', ぎゃ: '갸', ぎゅ: '규', ぎょ: '교',
  しゃ: '샤', しゅ: '슈', しょ: '쇼', じゃ: '자', じゅ: '주', じょ: '조',
  ちゃ: '차', ちゅ: '추', ちょ: '초', にゃ: '냐', にゅ: '뉴', にょ: '뇨',
  ひゃ: '햐', ひゅ: '휴', ひょ: '효', びゃ: '뱌', びゅ: '뷰', びょ: '뵤',
  ぴゃ: '퍄', ぴゅ: '퓨', ぴょ: '표', みゃ: '먀', みゅ: '뮤', みょ: '묘',
  りゃ: '랴', りゅ: '류', りょ: '료',
  ぢゃ: '자', ぢゅ: '주', ぢょ: '조',
};

const longVowel: Record<string, string> = {
  아: '아', 이: '이', 우: '우', 에: '에', 오: '오',
};

function hiragana(character: string): string {
  const code = character.codePointAt(0) ?? 0;
  return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : character;
}

function attachFinal(syllable: string, finalIndex: number): string {
  const code = syllable.codePointAt(0) ?? 0;
  if (code < 0xac00 || code > 0xd7a3 || (code - 0xac00) % 28 !== 0) return syllable;
  return String.fromCodePoint(code + finalIndex);
}

function lastVowel(syllable: string): string {
  const code = syllable.codePointAt(0) ?? 0;
  if (code < 0xac00 || code > 0xd7a3) return '';
  const vowel = Math.floor((code - 0xac00) / 28) % 21;
  return [0, 1, 2, 3].includes(vowel) ? longVowel.아
    : [4, 5, 6, 7].includes(vowel) ? longVowel.에
    : [8, 9, 10, 11, 12].includes(vowel) ? longVowel.오
    : [13, 14, 15, 16, 17].includes(vowel) ? longVowel.우
    : longVowel.이;
}

/** 가나의 발음을 한글로 대략 옮긴 학습용 표기다. */
export function kanaToHangul(reading: string): string {
  const characters = Array.from(reading).map(hiragana);
  const result: string[] = [];
  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === 'っ' || character === 'ん') {
      if (result.length) result[result.length - 1] = attachFinal(result[result.length - 1], character === 'っ' ? 19 : 4);
      else result.push(character === 'っ' ? 'ㅅ' : 'ㄴ');
      continue;
    }
    if (character === 'ー') {
      result.push(lastVowel(result[result.length - 1] ?? ''));
      continue;
    }
    const combination = joined[character + (characters[index + 1] ?? '')];
    if (combination) {
      result.push(combination);
      index++;
    } else {
      result.push(kana[character] ?? character);
    }
  }
  return result.join('');
}

export function kanjiHunEum(character: string): string | undefined {
  return (hunEum as Record<string, string>)[character];
}

export function isKanji(character: string): boolean {
  return /[\u3400-\u9fff\uf900-\ufaff]/u.test(character);
}
