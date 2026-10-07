export type KanaEntry = { hiragana: string; romaji: string; hangul: string };
export type KanaGroup = 'basic' | 'voiced' | 'contracted';

const entry = (hiragana: string, romaji: string, hangul: string): KanaEntry => ({ hiragana, romaji, hangul });

export const kanaRows: Record<KanaGroup, (KanaEntry | null)[][]> = {
  basic: [
    [entry('あ', 'a', '아'), entry('い', 'i', '이'), entry('う', 'u', '우'), entry('え', 'e', '에'), entry('お', 'o', '오')],
    [entry('か', 'ka', '카'), entry('き', 'ki', '키'), entry('く', 'ku', '쿠'), entry('け', 'ke', '케'), entry('こ', 'ko', '코')],
    [entry('さ', 'sa', '사'), entry('し', 'shi', '시'), entry('す', 'su', '스'), entry('せ', 'se', '세'), entry('そ', 'so', '소')],
    [entry('た', 'ta', '타'), entry('ち', 'chi', '치'), entry('つ', 'tsu', '츠'), entry('て', 'te', '테'), entry('と', 'to', '토')],
    [entry('な', 'na', '나'), entry('に', 'ni', '니'), entry('ぬ', 'nu', '누'), entry('ね', 'ne', '네'), entry('の', 'no', '노')],
    [entry('は', 'ha', '하'), entry('ひ', 'hi', '히'), entry('ふ', 'fu', '후'), entry('へ', 'he', '헤'), entry('ほ', 'ho', '호')],
    [entry('ま', 'ma', '마'), entry('み', 'mi', '미'), entry('む', 'mu', '무'), entry('め', 'me', '메'), entry('も', 'mo', '모')],
    [entry('や', 'ya', '야'), null, entry('ゆ', 'yu', '유'), null, entry('よ', 'yo', '요')],
    [entry('ら', 'ra', '라'), entry('り', 'ri', '리'), entry('る', 'ru', '루'), entry('れ', 're', '레'), entry('ろ', 'ro', '로')],
    [entry('わ', 'wa', '와'), null, null, null, entry('を', 'wo', '오')],
    [entry('ん', 'n', '응/ㄴ'), null, null, null, null],
  ],
  voiced: [
    [entry('が', 'ga', '가'), entry('ぎ', 'gi', '기'), entry('ぐ', 'gu', '구'), entry('げ', 'ge', '게'), entry('ご', 'go', '고')],
    [entry('ざ', 'za', '자'), entry('じ', 'ji', '지'), entry('ず', 'zu', '즈'), entry('ぜ', 'ze', '제'), entry('ぞ', 'zo', '조')],
    [entry('だ', 'da', '다'), entry('ぢ', 'ji', '지'), entry('づ', 'zu', '즈'), entry('で', 'de', '데'), entry('ど', 'do', '도')],
    [entry('ば', 'ba', '바'), entry('び', 'bi', '비'), entry('ぶ', 'bu', '부'), entry('べ', 'be', '베'), entry('ぼ', 'bo', '보')],
    [entry('ぱ', 'pa', '파'), entry('ぴ', 'pi', '피'), entry('ぷ', 'pu', '푸'), entry('ぺ', 'pe', '페'), entry('ぽ', 'po', '포')],
  ],
  contracted: [
    [entry('きゃ', 'kya', '캬'), entry('きゅ', 'kyu', '큐'), entry('きょ', 'kyo', '쿄')],
    [entry('しゃ', 'sha', '샤'), entry('しゅ', 'shu', '슈'), entry('しょ', 'sho', '쇼')],
    [entry('ちゃ', 'cha', '차'), entry('ちゅ', 'chu', '추'), entry('ちょ', 'cho', '초')],
    [entry('にゃ', 'nya', '냐'), entry('にゅ', 'nyu', '뉴'), entry('にょ', 'nyo', '뇨')],
    [entry('ひゃ', 'hya', '햐'), entry('ひゅ', 'hyu', '휴'), entry('ひょ', 'hyo', '효')],
    [entry('みゃ', 'mya', '먀'), entry('みゅ', 'myu', '뮤'), entry('みょ', 'myo', '묘')],
    [entry('りゃ', 'rya', '랴'), entry('りゅ', 'ryu', '류'), entry('りょ', 'ryo', '료')],
    [entry('ぎゃ', 'gya', '갸'), entry('ぎゅ', 'gyu', '규'), entry('ぎょ', 'gyo', '교')],
    [entry('じゃ', 'ja', '자'), entry('じゅ', 'ju', '주'), entry('じょ', 'jo', '조')],
    [entry('びゃ', 'bya', '뱌'), entry('びゅ', 'byu', '뷰'), entry('びょ', 'byo', '뵤')],
    [entry('ぴゃ', 'pya', '퍄'), entry('ぴゅ', 'pyu', '퓨'), entry('ぴょ', 'pyo', '표')],
  ],
};

export function kanaCharacter(hiragana: string, script: 'hiragana' | 'katakana'): string {
  return script === 'hiragana' ? hiragana : Array.from(hiragana, (character) => String.fromCharCode(character.charCodeAt(0) + 0x60)).join('');
}
