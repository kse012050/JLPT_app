export type VocabularyWord = {
  id: string;
  written: string;
  reading: string;
  meaning: string;
  example: string;
  translation: string;
};

export type VocabularyUnit = {
  id: string;
  title: string;
  description: string;
  words: readonly VocabularyWord[];
};

// 앱에서 직접 작성한 입문용 예시입니다. JLPT 공식 지정 어휘 목록을 뜻하지 않습니다.
export const n5VocabularyUnits: readonly VocabularyUnit[] = [
  {
    id: 'n5-time',
    title: '시간과 하루',
    description: '오늘과 내일, 매일 쓰는 시간 표현',
    words: [
      { id: 'today', written: '今日', reading: 'きょう', meaning: '오늘', example: '今日は月曜日です。', translation: '오늘은 월요일입니다.' },
      { id: 'tomorrow', written: '明日', reading: 'あした', meaning: '내일', example: '明日、学校へ行きます。', translation: '내일 학교에 갑니다.' },
      { id: 'everyday', written: '毎日', reading: 'まいにち', meaning: '매일', example: '毎日、日本語を勉強します。', translation: '매일 일본어를 공부합니다.' },
      { id: 'time', written: '時間', reading: 'じかん', meaning: '시간', example: '時間がありますか。', translation: '시간이 있습니까?' },
    ],
  },
  {
    id: 'n5-places',
    title: '장소와 이동',
    description: '학교와 집, 이동할 때 만나는 단어',
    words: [
      { id: 'school', written: '学校', reading: 'がっこう', meaning: '학교', example: '学校は近いです。', translation: '학교는 가깝습니다.' },
      { id: 'station', written: '駅', reading: 'えき', meaning: '역', example: '駅はどこですか。', translation: '역은 어디입니까?' },
      { id: 'train', written: '電車', reading: 'でんしゃ', meaning: '전철', example: '電車に乗ります。', translation: '전철을 탑니다.' },
      { id: 'home', written: '家', reading: 'いえ', meaning: '집', example: '家に帰ります。', translation: '집에 돌아갑니다.' },
    ],
  },
  {
    id: 'n5-actions',
    title: '일상 동작',
    description: '먹고 마시고 이동하는 기본 동사',
    words: [
      { id: 'eat', written: '食べる', reading: 'たべる', meaning: '먹다', example: '朝ご飯を食べます。', translation: '아침밥을 먹습니다.' },
      { id: 'drink', written: '飲む', reading: 'のむ', meaning: '마시다', example: '水を飲みます。', translation: '물을 마십니다.' },
      { id: 'go', written: '行く', reading: 'いく', meaning: '가다', example: '公園に行きます。', translation: '공원에 갑니다.' },
      { id: 'see', written: '見る', reading: 'みる', meaning: '보다', example: '映画を見ます。', translation: '영화를 봅니다.' },
    ],
  },
];
