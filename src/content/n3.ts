import { n3VocabularyUnits } from './n3-vocabulary';
import { n3GrammarUnits } from './n3-grammar-bank';

export type N3Area = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export type ChoiceQuestion = {
  kind?: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  explanation: string;
};

export type VocabularyEntry = {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  translation: string;
};

export type GrammarEntry = {
  pattern: string;
  focus?: string;
  furigana?: string;
  meaning: string;
  formation?: string;
  explanation: string;
  example: string;
  translation: string;
  question: ChoiceQuestion;
};

export type N3Unit = {
  id: string;
  area: N3Area;
  title: string;
  description: string;
  vocabulary?: readonly VocabularyEntry[];
  grammar?: readonly GrammarEntry[];
  passage?: string;
  transcript?: string;
  questions?: readonly ChoiceQuestion[];
};

// 모든 문장과 문항은 앱용으로 직접 작성한 연습 자료입니다. JLPT 공식 문제 또는 공식 지정 목록이 아닙니다.
const originalN3Units: readonly N3Unit[] = [
  {
    id: 'n3-vocab-work', area: 'vocabulary', title: '일과 일정', description: '직장과 약속에서 자주 만나는 표현', vocabulary: [
      { word: '予定', reading: 'よてい', meaning: '예정', example: '来週の予定を確認します。', translation: '다음 주 일정을 확인합니다.' },
      { word: '準備', reading: 'じゅんび', meaning: '준비', example: '会議の準備をしています。', translation: '회의 준비를 하고 있습니다.' },
      { word: '変更', reading: 'へんこう', meaning: '변경', example: '時間が変更になりました。', translation: '시간이 변경되었습니다.' },
      { word: '連絡', reading: 'れんらく', meaning: '연락', example: '着いたら連絡してください。', translation: '도착하면 연락해 주세요.' },
      { word: '会議', reading: 'かいぎ', meaning: '회의', example: '午後二時から会議があります。', translation: '오후 두 시부터 회의가 있습니다.' },
      { word: '資料', reading: 'しりょう', meaning: '자료', example: '資料をメールで送りました。', translation: '자료를 이메일로 보냈습니다.' },
      { word: '締め切り', reading: 'しめきり', meaning: '마감', example: '申し込みの締め切りは金曜日です。', translation: '신청 마감은 금요일입니다.' },
      { word: '提出', reading: 'ていしゅつ', meaning: '제출', example: 'レポートを明日までに提出します。', translation: '보고서를 내일까지 제출합니다.' },
    ],
  },
  {
    id: 'n3-vocab-travel', area: 'vocabulary', title: '교통과 이동', description: '기차·버스·여행 안내를 읽는 어휘', vocabulary: [
      { word: '予約', reading: 'よやく', meaning: '예약', example: 'ホテルを予約しました。', translation: '호텔을 예약했습니다.' },
      { word: '到着', reading: 'とうちゃく', meaning: '도착', example: '電車は十時に到着します。', translation: '전철은 열 시에 도착합니다.' },
      { word: '出発', reading: 'しゅっぱつ', meaning: '출발', example: 'バスは駅前から出発します。', translation: '버스는 역 앞에서 출발합니다.' },
      { word: '乗り換え', reading: 'のりかえ', meaning: '환승', example: '次の駅で乗り換えが必要です。', translation: '다음 역에서 환승이 필요합니다.' },
      { word: '遅刻', reading: 'ちこく', meaning: '지각', example: '電車が遅れて授業に遅刻しました。', translation: '전철이 늦어서 수업에 지각했습니다.' },
      { word: '運賃', reading: 'うんちん', meaning: '운임', example: '運賃は窓口で確認できます。', translation: '운임은 창구에서 확인할 수 있습니다.' },
      { word: '窓口', reading: 'まどぐち', meaning: '창구', example: '切符はあちらの窓口で買えます。', translation: '표는 저쪽 창구에서 살 수 있습니다.' },
      { word: '片道', reading: 'かたみち', meaning: '편도', example: '片道の切符を一枚ください。', translation: '편도표 한 장 주세요.' },
    ],
  },
  {
    id: 'n3-vocab-shopping', area: 'vocabulary', title: '생활과 서비스', description: '신청·결제·고장 안내에 쓰는 어휘', vocabulary: [
      { word: '故障', reading: 'こしょう', meaning: '고장', example: 'エアコンが故障しました。', translation: '에어컨이 고장 났습니다.' },
      { word: '修理', reading: 'しゅうり', meaning: '수리', example: '時計を修理に出しました。', translation: '시계를 수리 맡겼습니다.' },
      { word: '交換', reading: 'こうかん', meaning: '교환', example: 'サイズが違うので交換できますか。', translation: '사이즈가 달라서 교환할 수 있나요?' },
      { word: '返品', reading: 'へんぴん', meaning: '반품', example: '返品にはレシートが必要です。', translation: '반품에는 영수증이 필요합니다.' },
      { word: '申し込み', reading: 'もうしこみ', meaning: '신청', example: '講座の申し込みは明日までです。', translation: '강좌 신청은 내일까지입니다.' },
      { word: '支払い', reading: 'しはらい', meaning: '지불', example: '支払いは現金でもできます。', translation: '지불은 현금으로도 할 수 있습니다.' },
      { word: '確認', reading: 'かくにん', meaning: '확인', example: '住所をもう一度確認してください。', translation: '주소를 다시 한번 확인해 주세요.' },
      { word: '必要', reading: 'ひつよう', meaning: '필요', example: '入るには予約が必要です。', translation: '들어가려면 예약이 필요합니다.' },
    ],
  },
  {
    id: 'n3-vocab-people', area: 'vocabulary', title: '사람과 마음', description: '감정과 관계를 전하는 표현', vocabulary: [
      { word: '安心', reading: 'あんしん', meaning: '안심', example: '無事だと聞いて安心しました。', translation: '무사하다고 들어서 안심했습니다.' },
      { word: '心配', reading: 'しんぱい', meaning: '걱정', example: '試験の結果が心配です。', translation: '시험 결과가 걱정됩니다.' },
      { word: '失敗', reading: 'しっぱい', meaning: '실패', example: '失敗から学ぶこともあります。', translation: '실패에서 배우는 것도 있습니다.' },
      { word: '経験', reading: 'けいけん', meaning: '경험', example: '日本で働いた経験があります。', translation: '일본에서 일한 경험이 있습니다.' },
      { word: '約束', reading: 'やくそく', meaning: '약속', example: '友達との約束を忘れました。', translation: '친구와의 약속을 잊었습니다.' },
      { word: '招待', reading: 'しょうたい', meaning: '초대', example: '友達を家に招待しました。', translation: '친구를 집에 초대했습니다.' },
      { word: '感謝', reading: 'かんしゃ', meaning: '감사', example: '手伝ってくれた人に感謝します。', translation: '도와준 사람에게 감사합니다.' },
      { word: '相談', reading: 'そうだん', meaning: '상담', example: '先生に進路を相談しました。', translation: '선생님께 진로를 상담했습니다.' },
    ],
  },
  {
    id: 'n3-vocab-society', area: 'vocabulary', title: '사회와 정보', description: '안내문과 짧은 기사에 나오는 어휘', vocabulary: [
      { word: '環境', reading: 'かんきょう', meaning: '환경', example: '環境を守る活動に参加します。', translation: '환경을 지키는 활동에 참여합니다.' },
      { word: '地域', reading: 'ちいき', meaning: '지역', example: 'この地域には公園が多いです。', translation: '이 지역에는 공원이 많습니다.' },
      { word: '交通', reading: 'こうつう', meaning: '교통', example: '交通情報を確認しましょう。', translation: '교통 정보를 확인합시다.' },
      { word: '協力', reading: 'きょうりょく', meaning: '협력', example: 'みんなで協力して準備しました。', translation: '모두 협력해서 준비했습니다.' },
      { word: '活動', reading: 'かつどう', meaning: '활동', example: '週末に地域の活動があります。', translation: '주말에 지역 활동이 있습니다.' },
      { word: '方法', reading: 'ほうほう', meaning: '방법', example: '別の方法を考えてみます。', translation: '다른 방법을 생각해 보겠습니다.' },
      { word: '理由', reading: 'りゆう', meaning: '이유', example: '欠席した理由を説明します。', translation: '결석한 이유를 설명합니다.' },
      { word: '結果', reading: 'けっか', meaning: '결과', example: '試験の結果は来月出ます。', translation: '시험 결과는 다음 달에 나옵니다.' },
    ],
  },
  {
    id: 'n3-vocab-describe', area: 'vocabulary', title: '상태와 정도', description: '의견과 상황을 더 정확히 표현하는 말', vocabulary: [
      { word: '十分', reading: 'じゅうぶん', meaning: '충분함', example: '準備する時間は十分あります。', translation: '준비할 시간은 충분히 있습니다.' },
      { word: '特別', reading: 'とくべつ', meaning: '특별함', example: '今日は特別な日です。', translation: '오늘은 특별한 날입니다.' },
      { word: '複雑', reading: 'ふくざつ', meaning: '복잡함', example: 'この問題は少し複雑です。', translation: '이 문제는 조금 복잡합니다.' },
      { word: '正確', reading: 'せいかく', meaning: '정확함', example: '正確な時間を教えてください。', translation: '정확한 시간을 알려 주세요.' },
      { word: '急に', reading: 'きゅうに', meaning: '갑자기', example: '急に雨が降り始めました。', translation: '갑자기 비가 내리기 시작했습니다.' },
      { word: 'だんだん', reading: 'だんだん', meaning: '점점', example: 'だんだん暖かくなってきました。', translation: '점점 따뜻해졌습니다.' },
      { word: 'かなり', reading: 'かなり', meaning: '상당히', example: '駅までかなり遠いです。', translation: '역까지 상당히 멉니다.' },
      { word: 'なるべく', reading: 'なるべく', meaning: '가능한 한', example: 'なるべく早く帰ります。', translation: '가능한 한 빨리 돌아가겠습니다.' },
    ],
  },
  {
    id: 'n3-grammar-decisions', area: 'grammar', title: '결정과 변화', description: '결심·결정·습관의 차이', grammar: [
      { pattern: '〜ことにする', meaning: '~하기로 하다', explanation: '자신이 의지를 가지고 결정한 일을 말합니다.', example: '毎朝、新聞を読むことにしました。', translation: '매일 아침 신문을 읽기로 했습니다.', question: { prompt: '自分で決めた予定です。来月から日本語を習う（　）。', choices: ['ことにしました', 'ことになりました', 'ようになりました', 'はずでした'], answer: 'ことにしました', explanation: '자신이 결정했으므로 ことにする를 씁니다.' } },
      { pattern: '〜ことになる', meaning: '~하게 되다', explanation: '자신의 결심보다 외부 사정이나 합의로 정해진 일을 말합니다.', example: '来月から大阪で働くことになりました。', translation: '다음 달부터 오사카에서 일하게 되었습니다.', question: { prompt: '会社の決定で、来週から大阪へ行く（　）。', choices: ['ことになりました', 'ことにしました', 'ようにしました', 'ところでした'], answer: 'ことになりました', explanation: '회사 결정에 따른 결과이므로 ことになる가 자연스럽습니다.' } },
      { pattern: '〜ようにする', meaning: '~하도록 하다', explanation: '반복적으로 노력하거나 습관으로 삼는 행동에 씁니다.', example: '寝る前にスマートフォンを見ないようにしています。', translation: '자기 전에 스마트폰을 보지 않으려고 합니다.', question: { prompt: '健康のため、毎日歩く（　）。', choices: ['ようにしています', 'ようになっています', 'ことになっています', 'はずです'], answer: 'ようにしています', explanation: '계속 노력하는 습관에는 ようにする를 씁니다.' } },
      { pattern: '〜ようになる', meaning: '~하게 되다', explanation: '능력이나 습관에 변화가 생긴 결과를 나타냅니다.', example: '日本語のニュースが少し分かるようになりました。', translation: '일본어 뉴스를 조금 이해할 수 있게 되었습니다.', question: { prompt: '練習して、漢字が読める（　）。', choices: ['ようになりました', 'ようにしました', 'ことにしました', 'つもりでした'], answer: 'ようになりました', explanation: '읽을 수 있게 된 능력의 변화를 말합니다.' } },
    ],
  },
  {
    id: 'n3-grammar-time', area: 'grammar', title: '시간과 반복', description: '기회·반복·정도를 연결하기', grammar: [
      { pattern: '〜うちに', meaning: '~하는 동안에', explanation: '어떤 상태가 바뀌기 전에 행동하거나 그동안 변화가 일어날 때 씁니다.', example: '暗くならないうちに帰りましょう。', translation: '어두워지기 전에 돌아갑시다.', question: { prompt: '雨が降らない（　）、駅まで歩きましょう。', choices: ['うちに', 'たびに', 'ほど', 'せいで'], answer: 'うちに', explanation: '비가 오기 전의 기회를 뜻합니다.' } },
      { pattern: '〜たびに', meaning: '~할 때마다', explanation: '같은 일이 반복될 때마다 다른 일도 일어남을 나타냅니다.', example: 'この写真を見るたびに、旅行を思い出します。', translation: '이 사진을 볼 때마다 여행이 떠오릅니다.', question: { prompt: 'この歌を聞く（　）、学生時代を思い出します。', choices: ['たびに', 'うちに', 'ために', 'ように'], answer: 'たびに', explanation: '노래를 들을 때마다 반복해서 떠올립니다.' } },
      { pattern: '〜ほど', meaning: '~할 정도로', explanation: '정도가 매우 큼을 나타냅니다.', example: '声が出ないほど疲れていました。', translation: '목소리가 나오지 않을 정도로 지쳐 있었습니다.', question: { prompt: '昨日は立てない（　）疲れました。', choices: ['ほど', 'たびに', 'うちに', 'おかげで'], answer: 'ほど', explanation: '지친 정도를 비유적으로 강조합니다.' } },
      { pattern: '〜ばかり', meaning: '~만, ~뿐', explanation: '같은 행동이나 대상에 치우쳐 있음을 나타냅니다.', example: '弟はゲームばかりしています。', translation: '남동생은 게임만 하고 있습니다.', question: { prompt: '甘いもの（　）食べないで、野菜も食べてください。', choices: ['ばかり', 'ほど', 'たびに', 'うちに'], answer: 'ばかり', explanation: '단것에만 치우친 상태를 말합니다.' } },
    ],
  },
  {
    id: 'n3-grammar-inference', area: 'grammar', title: '추측과 이유', description: '확신의 정도와 원인을 구별하기', grammar: [
      { pattern: '〜はずだ', meaning: '~일 것이다, ~이어야 한다', explanation: '알고 있는 근거에서 당연히 그렇다고 예상할 때 씁니다.', example: 'もう八時だから、店は開いているはずです。', translation: '벌써 여덟 시니까 가게는 열려 있을 것입니다.', question: { prompt: '田中さんは毎日練習しています。上手な（　）です。', choices: ['はず', 'せい', 'たび', 'うち'], answer: 'はず', explanation: '연습한다는 근거로 실력을 예상합니다.' } },
      { pattern: '〜わけではない', meaning: '반드시 ~인 것은 아니다', explanation: '앞의 내용을 전부 부정하지 않고 일부만 부정합니다.', example: '日本語が嫌いなわけではありません。', translation: '일본어가 싫은 것은 아닙니다.', question: { prompt: '高いものが全部いい（　）。', choices: ['わけではありません', 'はずです', 'たびです', 'おかげです'], answer: 'わけではありません', explanation: '비싼 것이 모두 좋다는 일반화를 부분 부정합니다.' } },
      { pattern: '〜おかげで', meaning: '~덕분에', explanation: '좋은 결과의 원인을 나타냅니다.', example: '友達のおかげで道が分かりました。', translation: '친구 덕분에 길을 알았습니다.', question: { prompt: '先生の説明の（　）、問題が解けました。', choices: ['おかげで', 'せいで', 'たびに', 'ばかり'], answer: 'おかげで', explanation: '문제를 풀었다는 좋은 결과의 원인입니다.' } },
      { pattern: '〜せいで', meaning: '~탓에', explanation: '좋지 않은 결과의 원인을 나타냅니다.', example: '寝坊したせいで、電車に乗り遅れました。', translation: '늦잠 잔 탓에 전철을 놓쳤습니다.', question: { prompt: '大雨の（　）、試合が中止になりました。', choices: ['せいで', 'おかげで', 'ほど', 'うちに'], answer: 'せいで', explanation: '경기가 취소된 좋지 않은 결과의 원인입니다.' } },
    ],
  },
  {
    id: 'n3-reading-notice', area: 'reading', title: '도서관 공지', description: '이용 시간과 반납 규칙 찾기', passage: '市立図書館からのお知らせです。来週の月曜日は館内の点検を行うため、午前中は利用できません。午後一時から通常どおり開館します。本の返却は、休館中も入口の返却箱を利用できます。ただし、DVDは破損を防ぐため、開館時間内に窓口へ直接お持ちください。', questions: [
      { prompt: '月曜日の午前中に本を返したい人は、どうすればいいですか。', choices: ['入口の返却箱を使う', '午後まで返却できない', 'DVDと一緒に窓口へ行く', '別の図書館へ行く'], answer: '入口の返却箱を使う', explanation: '도서관을 이용할 수 없는 시간에도 책은 입구의 반납함에 넣을 수 있습니다.' },
      { prompt: 'DVDについて正しいものはどれですか。', choices: ['開館時間内に窓口へ返す', '返却箱に入れる', '月曜日は返せない', '郵便で返す'], answer: '開館時間内に窓口へ返す', explanation: 'DVD는 파손 방지를 위해 창구에 직접 반납합니다.' },
    ] },
  {
    id: 'n3-reading-email', area: 'reading', title: '약속 변경 이메일', description: '변경된 장소와 요청 사항 파악하기', passage: '佐藤さんへ。土曜日の料理教室について連絡します。最初は駅前の市民センターを予定していましたが、工事のため、会場が中央公民館に変わりました。開始時間は午前十時で変わりません。材料はこちらで用意しますので、エプロンと手をふくタオルだけ持ってきてください。道が分からなければ、当日の朝、私に電話してください。田中', questions: [
      { prompt: '料理教室はどこで開かれますか。', choices: ['中央公民館', '駅前の市民センター', '田中さんの家', '駅の料理店'], answer: '中央公民館', explanation: '공사 때문에 장소가 중앙 공민관으로 바뀌었습니다.' },
      { prompt: '佐藤さんが持っていくものは何ですか。', choices: ['エプロンとタオル', '料理の材料', '材料とタオル', '電話と材料'], answer: 'エプロンとタオル', explanation: '재료는 준비되어 있고 앞치마와 손 닦는 수건만 가져갑니다.' },
    ] },
  {
    id: 'n3-reading-opinion', area: 'reading', title: '출퇴근 습관', description: '글쓴이의 생각과 이유 읽기', passage: '私は以前、会社まで電車で通っていました。駅から会社までは歩いて十分しかかかりませんが、雨の日以外は一つ前の駅で降りて、三十分ほど歩くことにしました。最初の一週間は疲れました。しかし、朝に歩くと気分がよくなり、仕事を始める前に頭の中を整理できると分かりました。運動のためだけではなく、静かな時間を作るために、今も続けています。', questions: [
      { prompt: '筆者が今も歩き続けている理由は何ですか。', choices: ['運動と考えを整理する時間のため', '電車がいつも遅れるため', '会社の規則が変わったため', '雨の日が多いため'], answer: '運動と考えを整理する時間のため', explanation: '운동뿐 아니라 조용히 생각을 정리하는 시간이 된다고 했습니다.' },
      { prompt: '歩き始めた最初の一週間はどうでしたか。', choices: ['疲れた', '楽だった', '雨が続いた', '電車に戻った'], answer: '疲れた', explanation: '最初の一週間は疲れました라고 명시되어 있습니다.' },
    ] },
  {
    id: 'n3-reading-information', area: 'reading', title: '행사 안내', description: '조건에 맞는 신청 방법 찾기', passage: '地域交流センターでは、十一月十二日の日曜日に写真講座を開きます。午前の部は十時から十二時までで、初めてカメラを使う人が対象です。午後の部は一時から三時までで、撮った写真の編集を学びます。参加費はどちらも五百円です。申し込みは十一月五日までにセンターのホームページから行ってください。定員は各回十五人です。', questions: [
      { prompt: 'カメラを初めて使う人は、どの回に申し込むといいですか。', choices: ['午前の部', '午後の部', 'どちらでも同じ内容', '講座は受けられない'], answer: '午前の部', explanation: '오전 수업 대상이 카메라를 처음 쓰는 사람입니다.' },
      { prompt: '申し込みについて正しいものはどれですか。', choices: ['十一月五日までにホームページから申し込む', '講座当日に窓口で申し込む', '十一月十二日まで電話で申し込む', '参加費は無料である'], answer: '十一月五日までにホームページから申し込む', explanation: '11월 5일까지 센터 홈페이지에서 신청합니다.' },
    ] },
  {
    id: 'n3-reading-volunteer', area: 'reading', title: '지역 봉사 모집', description: '참가 조건과 준비물 비교하기', passage: '町内会では、来月の第一土曜日に川沿いの清掃活動を行います。集合は午前九時に市民公園の南入口です。活動は二時間ほどで、小学生以下の子どもは保護者と一緒に参加してください。軍手とごみ袋は町内会が用意しますが、飲み物と帽子は各自で持ってきてください。雨の場合は翌週の土曜日に延期します。参加したい人は今月二十五日までに町内会の事務所へ電話してください。前回は集合場所を間違える人がいたため、今年は公園の北入口ではなく南入口に案内係が立つ予定です。', questions: [
      { prompt: '参加者が自分で用意するものは何ですか。', choices: ['飲み物と帽子', '軍手とごみ袋', 'ごみ袋と飲み物', '軍手と帽子'], answer: '飲み物と帽子', explanation: '장갑과 쓰레기봉투는 주최 측이 준비하고, 물과 모자는 각자 가져옵니다.' },
      { prompt: '雨の場合、活動はどうなりますか。', choices: ['翌週の土曜日に延期される', '同じ日の午後に行う', '市民公園の北入口で行う', '中止して再開しない'], answer: '翌週の土曜日に延期される', explanation: '비가 오면 다음 주 토요일로 연기됩니다.' },
    ] },
  {
    id: 'n3-reading-cafe', area: 'reading', title: '작은 가게의 변화', description: '글쓴이의 의견과 변화 이유 읽기', passage: '駅前の小さな喫茶店で働き始めて、半年が過ぎた。初めのころは、注文を早く聞いて飲み物を出すことだけで精いっぱいだった。ある日、いつも一人で来るお客さんが「ここでは静かに本を読める」と話してくれた。それから私は、混んでいない時間には音楽を少し小さくし、席の近くで大きな声で話さないようにした。店長は最初、そんなことより注文を早く取るほうが大切だと言った。しかし、そのお客さんが友人を連れて来るようになり、店を利用する人が少しずつ増えた。もちろん速さも必要だが、お客さんが何を求めているかを考えることも同じくらい大切だと思う。', questions: [
      { prompt: '筆者が音楽を小さくしたのはなぜですか。', choices: ['静かに過ごしたい客がいると知ったから', '店長に命令されたから', '音楽の機械が故障したから', '注文を聞きやすくするためだけ'], answer: '静かに過ごしたい客がいると知ったから', explanation: '조용히 책을 읽고 싶다는 손님의 말을 듣고 가게 환경을 바꿨습니다.' },
      { prompt: '筆者が今、大切だと考えていることは何ですか。', choices: ['速さと客の希望の両方を考えること', '注文を取る速さだけを上げること', '音楽を完全に止めること', '友人を連れて来た客だけに親切にすること'], answer: '速さと客の希望の両方を考えること', explanation: '마지막 문장에서 속도도 필요하지만 손님이 원하는 것을 생각하는 일도 중요하다고 했습니다.' },
    ] },
  {
    id: 'n3-listening-meeting', area: 'listening', title: '회의실 변경', description: '장소와 시간을 듣고 찾기', transcript: 'お知らせします。今日の午後二時からの会議は、三階の会議室ではなく、二階の研修室で行います。時間は変わりません。資料を持って、開始五分前までに集まってください。', questions: [
      { prompt: '会議はどこで行いますか。', choices: ['二階の研修室', '三階の会議室', '二階の会議室', '一階の受付'], answer: '二階の研修室', explanation: '3층 회의실이 아니라 2층 연수실이라고 했습니다.' },
      { prompt: '参加者はいつまでに集まりますか。', choices: ['午後一時五十五分', '午後二時五分', '午後一時三十分', '午後二時'], answer: '午後一時五十五分', explanation: '오후 2시 시작 5분 전이므로 1시 55분입니다.' },
    ] },
  {
    id: 'n3-listening-train', area: 'listening', title: '전철 안내 방송', description: '지연과 환승 정보를 듣기', transcript: 'ご案内いたします。この電車は車両の点検のため、駅を十分遅れて出発します。中央駅で急行に乗り換える予定のお客様は、次の電車をご利用ください。お急ぎのところ、ご迷惑をおかけします。', questions: [
      { prompt: 'この電車はなぜ遅れていますか。', choices: ['車両を点検しているため', '雨が強いため', '中央駅が閉まっているため', '乗客が多いため'], answer: '車両を点検しているため', explanation: '차량 점검 때문에 10분 늦게 출발합니다.' },
      { prompt: '中央駅で急行に乗り換える人はどうしますか。', choices: ['次の電車に乗る', 'この電車で行く', '駅員に電話する', '歩いて中央駅へ行く'], answer: '次の電車に乗る', explanation: '급행으로 갈아탈 승객은 다음 전철을 이용하라고 안내합니다.' },
    ] },
  {
    id: 'n3-listening-store', area: 'listening', title: '가게에서 교환하기', description: '필요한 물건과 기한 듣기', transcript: 'いらっしゃいませ。サイズの交換ですね。商品とレシートを一緒にお持ちいただければ、購入から一週間以内は交換できます。ただし、使った商品は交換できません。今日は購入から三日目ですので、大丈夫ですよ。', questions: [
      { prompt: '交換するときに必要なものは何ですか。', choices: ['商品とレシート', '商品と箱だけ', 'レシートだけ', '会員カードだけ'], answer: '商品とレシート', explanation: '상품과 영수증을 함께 가져와야 합니다.' },
      { prompt: 'この客の商品は交換できますか。', choices: ['使っていなければ交換できる', '一週間を過ぎたので交換できない', 'レシートがなくても必ずできる', '購入当日だけ交換できる'], answer: '使っていなければ交換できる', explanation: '구입 3일째라 기간 조건은 맞고, 사용하지 않았다면 교환 가능합니다.' },
    ] },
  {
    id: 'n3-listening-weather', area: 'listening', title: '야외 행사 계획', description: '날씨에 따른 계획 변경 듣기', transcript: '明日の公園でのイベントについてお知らせします。午前中は雨の予報ですが、午後にはやむ見込みです。そのため、開始時間を午前十時から午後一時に変更します。会場は公園のままです。雨が続く場合は、明日の朝八時にホームページでお知らせします。', questions: [
      { prompt: 'イベントの開始時間はどう変わりましたか。', choices: ['午後一時になった', '午前八時になった', '午前十時のまま', '午後三時になった'], answer: '午後一時になった', explanation: '오전 10시에서 오후 1시로 변경되었습니다.' },
      { prompt: '雨が続く場合、どこで知らせますか。', choices: ['ホームページ', '公園の入口', '電話', '駅の掲示板'], answer: 'ホームページ', explanation: '비가 계속 오면 아침 8시에 홈페이지에 안내합니다.' },
    ] },
  {
    id: 'n3-listening-library', area: 'listening', title: '도서관 반납 안내', description: '반납 기한과 연장 조건 듣기', transcript: '図書館からのお知らせです。今借りている本の返却日は今週の金曜日です。まだ読み終わっていない場合は、ほかの人の予約がなければ、ホームページから二週間延長できます。雑誌とＤＶＤは延長できませんので、金曜日までに返してください。', questions: [
      { prompt: '本を延長できるのはどんな場合ですか。', choices: ['ほかの人の予約がない場合', 'すでに二週間遅れている場合', 'ＤＶＤも一緒に借りた場合', '金曜日に窓口へ行った場合だけ'], answer: 'ほかの人の予約がない場合', explanation: '다른 사람의 예약이 없을 때 홈페이지에서 2주 연장할 수 있습니다.' },
      { prompt: '延長できないものは何ですか。', choices: ['雑誌とＤＶＤ', '本だけ', 'すべての本', '予約のない本'], answer: '雑誌とＤＶＤ', explanation: '잡지와 DVD는 연장할 수 없다고 했습니다.' },
    ] },
  {
    id: 'n3-listening-trip', area: 'listening', title: '여행 계획 상담', description: '조건에 맞는 출발일 듣기', transcript: '旅行の予約についてご案内します。土曜日に出発するツアーは満員ですが、日曜日出発なら、まだ二席あります。日曜日のツアーは朝七時に駅前からバスが出ます。申し込みは木曜日の午後五時までにお願いします。代金は出発当日にお支払いください。', questions: [
      { prompt: '今、申し込めるのはいつ出発するツアーですか。', choices: ['日曜日', '土曜日', '木曜日', '金曜日'], answer: '日曜日', explanation: '토요일 출발은 만석이고 일요일 출발은 두 자리가 남았습니다.' },
      { prompt: '代金はいつ払いますか。', choices: ['出発する当日', '申し込む木曜日', '申し込みの前日', '旅行から帰った日'], answer: '出発する当日', explanation: '대금은 출발 당일에 지불하라고 안내합니다.' },
    ] },
];

const originalVocabularyContext: Record<string, ChoiceQuestion> = {
  'n3-vocab-work': { kind: '문맥 어휘', prompt: '明日の会議の（　）を確認しました。', choices: ['予定', '景色', '症状', '家賃'], answer: '予定', explanation: '회의의 일정이나 계획을 확인하는 문장입니다.' },
  'n3-vocab-travel': { kind: '문맥 어휘', prompt: '旅行の前にホテルを（　）しました。', choices: ['予約', '故障', '輸出', '反対'], answer: '予約', explanation: '여행 전에 숙소를 미리 확보합니다.' },
  'n3-vocab-shopping': { kind: '문맥 어휘', prompt: 'エアコンが（　）したので、修理を頼みました。', choices: ['故障', '卒業', '到着', '交流'], answer: '故障', explanation: '수리를 요청한 원인은 에어컨 고장입니다.' },
  'n3-vocab-people': { kind: '문맥 어휘', prompt: '試験の結果が（　）です。', choices: ['心配', '往復', '配達', '観光'], answer: '心配', explanation: '시험 결과를 걱정하는 마음을 나타냅니다.' },
  'n3-vocab-society': { kind: '문맥 어휘', prompt: 'みんなで地球の（　）を守りましょう。', choices: ['環境', '家賃', '申請', '階段'], answer: '環境', explanation: '지구의 환경을 지키는 문장입니다.' },
  'n3-vocab-describe': { kind: '문맥 어휘', prompt: '説明を聞いて、内容を（　）理解しました。', choices: ['十分', '途中', '年齢', '失敗'], answer: '十分', explanation: '설명을 듣고 내용을 충분히 이해했다는 뜻입니다.' },
};

export const n3Units: readonly N3Unit[] = [
  ...originalN3Units.filter((unit) => unit.area !== 'grammar').map((unit) => unit.area === 'vocabulary'
    ? { ...unit, questions: [originalVocabularyContext[unit.id]] }
    : unit),
  ...n3GrammarUnits,
  ...originalN3Units.filter((unit) => unit.area === 'grammar'),
  ...n3VocabularyUnits,
];

export const n3Areas: readonly { id: N3Area; title: string; description: string }[] = [
  { id: 'vocabulary', title: '문자·어휘', description: '한자 읽기, 문맥과 어휘' },
  { id: 'grammar', title: '문법', description: '문장에 맞는 표현과 연결' },
  { id: 'reading', title: '독해', description: '안내문과 짧은 글의 핵심' },
  { id: 'listening', title: '청해', description: '일상 대화와 안내의 요점' },
];

export function unitsForArea(area: N3Area): readonly N3Unit[] {
  return n3Units.filter((unit) => unit.area === area);
}
