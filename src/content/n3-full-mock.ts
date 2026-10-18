import type { ChoiceQuestion, N3Unit } from './n3';
import { n3DiagnosticGrammar } from './n3-diagnostic-grammar';
import { n3DiagnosticListening } from './n3-diagnostic-listening';
import { n3DiagnosticReading } from './n3-diagnostic-reading';
import { n3DiagnosticVocabulary } from './n3-diagnostic-vocabulary';
import { n3FullMockVocabularyExtra } from './n3-full-mock-vocabulary';
import { n3GrammarMocks } from './n3-grammar-mock';
import { n3FullMockListeningTwo } from './n3-full-mock-listening';
import { n3ListeningMocks, type ListeningMockItem } from './n3-listening-mock';
import { n3ReadingMocks } from './n3-reading-mock';
import { n3VocabularyMocks } from './n3-vocabulary-mock';

export type N3FullMock = {
  id: string;
  title: string;
  diagnostic?: boolean;
  vocabulary: readonly ChoiceQuestion[];
  grammar: readonly ChoiceQuestion[];
  reading: readonly N3Unit[];
  listening: readonly ListeningMockItem[];
};

const firstListeningExtra: readonly ListeningMockItem[] = [
  { id: 'full-listening-task-1', kind: '과제 이해', transcript: '女：明日の公園の清掃は、朝九時に南の入口に集まってください。ごみ袋はこちらで用意しますが、軍手は持って来てください。雨が強い場合は朝七時にメールで中止を知らせます。 男：分かりました。朝、メールを確認します。', question: { prompt: '男の人は清掃に参加する前に、何をしますか。', choices: ['朝のメールを確認し、軍手を用意する', 'ごみ袋を買って北の入口へ行く', '九時に中止のメールを送る', '雨でも七時に公園へ行く'], answer: '朝のメールを確認し、軍手を用意する', explanation: '폭우 시 오전 7시 메일로 취소를 알리므로 확인하고, 장갑은 직접 준비해야 합니다.' } },
  { id: 'full-listening-point-1', kind: '요점 이해', transcript: '男：新しい図書館、駅から近くて便利だね。 女：うん。でも夕方は席がいっぱいで、なかなか勉強できないの。 男：朝は空いているらしいよ。 女：朝なら授業の前に寄れるから、今度試してみる。', question: { prompt: '女の人が朝に図書館へ行こうと思うのはなぜですか。', choices: ['夕方は席が埋まっているから', '朝だけ駅から近くなるから', '授業が夕方に変わったから', '夕方は本を借りられないから'], answer: '夕方は席が埋まっているから', explanation: '저녁에는 자리가 꽉 차서 공부하기 어렵기 때문에 오전 이용을 시도합니다.' } },
  { id: 'full-listening-response-1', kind: '즉시 응답', transcript: '同僚：会議室の予約、もう済みましたか。', question: { prompt: 'まだ予約していない場合、何と答えますか。', choices: ['まだです。これから予約します。', 'はい、昨日会議が終わりました。', '会議室には誰もいません。', '予約は必要ありませんでしたか。'], answer: 'まだです。これから予約します。', explanation: '예약을 아직 하지 않았으므로 지금부터 하겠다고 답합니다.' } },
  { id: 'full-listening-response-2', kind: '즉시 응답', transcript: '店員：こちらで召し上がりますか、お持ち帰りですか。', question: { prompt: '店内で食べる場合、何と答えますか。', choices: ['ここで食べます。', '持って帰りました。', 'もう食べませんでした。', '明日持って来ます。'], answer: 'ここで食べます。', explanation: '매장에서 먹겠다는 응답입니다.' } },
  { id: 'full-listening-response-3', kind: '즉시 응답', transcript: '友達：その本、読み終わったら貸してくれない？', question: { prompt: '貸してもよい場合、何と答えますか。', choices: ['いいよ。読み終わったら持って行くね。', '今から本屋で買ってきて。', '昨日読み終わらなかった。', 'その本は友達が読みますか。'], answer: 'いいよ。読み終わったら持って行くね。', explanation: '책을 다 읽은 뒤 빌려주겠다는 응답입니다.' } },
  { id: 'full-listening-response-4', kind: '즉시 응답', transcript: '先生：この漢字、読めますか。', question: { prompt: '読めない場合、何と答えますか。', choices: ['すみません、まだ読めません。', 'はい、書きました。', '昨日の授業は楽しかったです。', 'この漢字は青いです。'], answer: 'すみません、まだ読めません。', explanation: '한자를 읽을 수 있는지 물었으므로 아직 읽지 못한다고 답합니다.' } },
];

function readingSet(base: number, extra: number): readonly N3Unit[] {
  const source = n3ReadingMocks[extra].passages;
  return [
    ...n3ReadingMocks[base].passages,
    source[0],
    source[1],
    { ...source[2], questions: source[2].questions?.slice(0, 2) },
  ];
}

const listeningOrder = ['과제 이해', '요점 이해', '개요 이해', '발화 표현', '즉시 응답'];
const sortedListening = (items: readonly ListeningMockItem[]) => [...items].sort((a, b) => listeningOrder.indexOf(a.kind) - listeningOrder.indexOf(b.kind));

export const n3FullMocks: readonly N3FullMock[] = [
  {
    id: 'n3-full-mock-1', title: 'N3 종합 모의고사 1회',
    vocabulary: [...n3VocabularyMocks[0].questions, ...n3FullMockVocabularyExtra[0]],
    grammar: [...n3GrammarMocks[0].questions, ...[0, 12, 16].map((index) => n3GrammarMocks[2].questions[index])],
    reading: readingSet(0, 2),
    listening: sortedListening([...n3ListeningMocks.flatMap((mock) => mock.items).filter((item) => item.kind !== '개요 이해' || ['lm1-gist', 'lm2-gist', 'lm3-gist'].includes(item.id)).filter((item) => item.kind !== '발화 표현' || item.id !== 'lm5-expression'), ...firstListeningExtra]),
  },
  {
    id: 'n3-full-mock-2', title: 'N3 종합 모의고사 2회',
    vocabulary: [...n3VocabularyMocks[1].questions, ...n3FullMockVocabularyExtra[1]],
    grammar: [...n3GrammarMocks[1].questions, ...[0, 12, 16].map((index) => n3GrammarMocks[3].questions[index])],
    reading: readingSet(1, 3),
    listening: sortedListening(n3FullMockListeningTwo),
  },
  {
    id: 'n3-diagnostic-1', title: 'N3 실전 진단 모의고사', diagnostic: true,
    vocabulary: n3DiagnosticVocabulary,
    grammar: n3DiagnosticGrammar,
    reading: n3DiagnosticReading,
    listening: sortedListening(n3DiagnosticListening),
  },
];
