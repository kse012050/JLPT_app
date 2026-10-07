const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const cache = new Map();
function loadTsModule(file) {
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const moduleExports = {};
  cache.set(file, moduleExports);
  new Function('exports', 'require', compiled)(moduleExports, (specifier) =>
    specifier.endsWith('.json') ? require(path.resolve(path.dirname(file), specifier)) :
      specifier.startsWith('.') ? loadTsModule(path.resolve(path.dirname(file), `${specifier}.ts`)) : require(specifier));
  return moduleExports;
}
const { n3Units, n3Areas } = loadTsModule(path.join(__dirname, '../src/content/n3.ts'));
const kanjiReference = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/n3-kanji-reference.json'), 'utf8'));
const openReference = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/openjlpt-n3-reference.json'), 'utf8'));
const koreanReference = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/openjlpt-reference-ko.json'), 'utf8'));
const reviewedVocabulary = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/reviewed-vocabulary-ko.json'), 'utf8'));
const { bankByLevel, bankCounts } = loadTsModule(path.join(__dirname, '../src/content/n3-vocabulary-bank.ts'));
const { formatKoreanMeanings } = loadTsModule(path.join(__dirname, '../src/content/korean-meaning.ts'));
const { questionsForBatch, batchCount } = loadTsModule(path.join(__dirname, '../src/content/n3-vocabulary-quiz.ts'));

const errors = [];
const ids = new Set();
const vocabularyWords = new Set();
const counts = { vocabulary: 0, grammar: 0, reading: 0, listening: 0 };
const bankKeys = new Set();
for (const level of ['N5', 'N4', 'N3']) {
  for (const word of bankByLevel[level]) {
    const key = `${word.word}\u0000${word.reading}`;
    if (bankKeys.has(key)) errors.push(`어휘 중복: ${word.word}/${word.reading}`);
    bankKeys.add(key);
    if (!word.meaningKo) errors.push(`한국어 어휘 뜻 누락: ${word.id}`);
    if (word.examples.some((example) => !example.ko)) errors.push(`한국어 어휘 예문 누락: ${word.id}`);
  }
  for (let batch = 0; batch < batchCount(level); batch++) {
    const batchWords = bankByLevel[level].slice(batch * 20, (batch + 1) * 20);
    for (const mode of ['meaning', 'reading', 'orthography']) {
      const questions = questionsForBatch(level, batch, mode);
      const expected = mode === 'meaning' ? batchWords.length : batchWords.filter((word) => /[\u3400-\u9fff]/u.test(word.word)).length;
      if (questions.length !== expected) errors.push(`문제 수 오류: ${level}/${batch}/${mode}`);
      for (const question of questions) {
        if (question.choices.length !== 4 || new Set(question.choices).size !== 4 || !question.choices.includes(question.answer)) errors.push(`보기 오류: ${level}/${batch}/${mode}/${question.word.id}`);
        if (!question.prompt || question.mode !== mode) errors.push(`문제 문구 오류: ${level}/${batch}/${mode}/${question.word.id}`);
      }
    }
  }
}
if (bankCounts.N3 !== 1690 || bankCounts.N4 !== 630 || bankCounts.N5 !== 674 || bankCounts.total !== 2994 || bankKeys.size !== 2994) errors.push('통합 어휘 수 오류');
if (Object.values(bankByLevel).flat().filter((word) => word.meaningKo).length !== 2994) errors.push('한국어 뜻 병합 수 오류');
if (koreanReference.sourceModel !== 'facebook/m2m100_418M') errors.push('한국어 번역 모델 출처 오류');
let vocabularyReviewQuestions = 0;

if (kanjiReference.license !== 'CC-BY-SA-4.0' || !kanjiReference.source || !kanjiReference.verifiedWith) errors.push('한자 읽기 자료의 출처 또는 라이선스 정보가 누락되었습니다.');
if (kanjiReference.items.length !== 1432) errors.push(`한자 읽기 항목 수 오류: ${kanjiReference.items.length}/1432`);
const referenceWords = new Set();
for (const [written, reading] of kanjiReference.items) {
  if (!/[\u3400-\u9fff]/u.test(written) || !/^[\u3040-\u309f\u30a0-\u30ff]+$/u.test(reading)) errors.push(`한자 읽기 항목 형식 오류: ${written}/${reading}`);
  if (referenceWords.has(written)) errors.push(`한자 읽기 중복 표제어: ${written}`);
  referenceWords.add(written);
}

if (openReference.source !== 'https://github.com/evanclan/OpenJLPT' || openReference.license !== 'CC-BY-SA-4.0') errors.push('확장 참고 자료 출처 또는 라이선스 오류');
for (const [level, expectedVocabulary, expectedGrammar] of [['N5', 674, 81], ['N4', 630, 98], ['N3', 1659, 101]]) {
  const content = openReference.levels[level];
  const translated = koreanReference.levels[level];
  if (!content || content.vocabulary.length !== expectedVocabulary || content.grammar.length !== expectedGrammar) {
    errors.push(`${level} 확장 참고 자료 수량 오류`);
    continue;
  }
  for (const [kind, entries] of [['vocabulary', content.vocabulary], ['grammar', content.grammar]]) {
    const entryIds = new Set();
    for (const entry of entries) {
      const korean = translated?.[kind]?.[entry.id];
      if (!korean || !Array.isArray(korean.examples) || korean.examples.length !== entry.examples.length || korean.examples.some((example) => !example)) errors.push(`${level}/${kind}/${entry.id}: 한국어 예문 번역 누락`);
      if (kind === 'vocabulary' && (!Array.isArray(korean?.meanings) || !korean.meanings.length || korean.meanings.some((meaning) => !meaning))) errors.push(`${level}/${kind}/${entry.id}: 한국어 뜻 누락`);
      if (kind === 'vocabulary' && korean?.meanings && new Set(korean.meanings).size !== korean.meanings.length) errors.push(`${level}/${kind}/${entry.id}: 한국어 뜻 중복`);
      if (kind === 'vocabulary' && korean?.meanings?.some((meaning) => /[A-Za-z;]/.test(meaning))) errors.push(`${level}/${kind}/${entry.id}: 한국어 뜻에 영어 또는 세미콜론 포함`);
      if (kind === 'grammar' && (!korean?.meaning || !korean.formation || entry.notes && !korean.notes)) errors.push(`${level}/${kind}/${entry.id}: 한국어 문법 설명 누락`);
      if (!entry.id || entryIds.has(entry.id)) errors.push(`${level}/${kind}: 중복 또는 빈 ID ${entry.id}`);
      entryIds.add(entry.id);
      if (kind === 'vocabulary' && (!entry.word || !entry.reading || !entry.meanings?.length)) errors.push(`${level}/${kind}/${entry.id}: 어휘 내용 누락`);
      if (kind === 'vocabulary' && !/^[\u3040-\u309f\u30a0-\u30ffー・]+$/u.test(entry.reading)) errors.push(`${level}/${kind}/${entry.id}: 읽기 표기 형식 오류`);
      if (kind === 'grammar' && (!entry.pattern || !entry.meaning || !entry.formation)) errors.push(`${level}/${kind}/${entry.id}: 문법 내용 누락`);
      if (level === 'N3' && kind === 'grammar' && !entry.meaningKo) errors.push(`${level}/${kind}/${entry.id}: 한국어 간단 뜻 누락`);
      if (!Array.isArray(entry.examples)) errors.push(`${level}/${kind}/${entry.id}: 예문 형식 오류`);
      for (const example of entry.examples ?? []) {
        if (!example.ja || !example.en) errors.push(`${level}/${kind}/${entry.id}: 예문 또는 영어 번역 누락`);
      }
    }
  }
}

const reviewedKeys = new Set();
for (const level of ['N5', 'N4', 'N3']) {
  for (const entry of openReference.levels[level].vocabulary) {
    const key = `${level}:${entry.word}:${entry.reading}`;
    if (!(key in reviewedVocabulary.meanings)) continue;
    reviewedKeys.add(key);
    const expected = formatKoreanMeanings(reviewedVocabulary.meanings[key]);
    const bankWord = bankByLevel[level].find((word) => word.id === `${level}-${entry.id}`);
    const actual = bankWord?.meaningKo;
    if (actual !== expected) errors.push(`${key}: 검수한 여러 뜻이 학습 화면에 모두 표시되지 않습니다.`);
    for (const [index, example] of (bankWord?.examples ?? []).entries()) {
      if (example.reviewed !== (reviewedVocabulary.examples[key]?.[index] !== undefined)) errors.push(`${key}/${index}: 예문 검수 표시 오류`);
    }
  }
}
if (reviewedKeys.size !== Object.keys(reviewedVocabulary.meanings).length) errors.push('검수 어휘 키 누락');
if (reviewedKeys.size !== 2963) errors.push(`원본 어휘 뜻 검수 누락: ${reviewedKeys.size}/2963`);
for (const [word, expected] of [['合う', '맞다'], ['池', '연못'], ['うがい', '가글'], ['小麦', '밀']]) {
  if (!Object.values(bankByLevel).flat().some((entry) => entry.word === word && entry.meaningKo?.includes(expected))) errors.push(`${word}: 교정한 뜻이 학습 자료에 반영되지 않았습니다.`);
}

function checkQuestion(question, where) {
  if (!question.prompt || !question.explanation) errors.push(`${where}: 문제 또는 해설이 비어 있습니다.`);
  if (question.choices.length !== 4 || new Set(question.choices).size !== 4) errors.push(`${where}: 보기는 서로 다른 4개여야 합니다.`);
  if (!question.choices.includes(question.answer)) errors.push(`${where}: 정답이 보기에 없습니다.`);
}

for (const unit of n3Units) {
  if (ids.has(unit.id)) errors.push(`${unit.id}: 중복 단원 ID`);
  ids.add(unit.id);
  if (!n3Areas.some((area) => area.id === unit.area)) errors.push(`${unit.id}: 잘못된 영역`);
  if (!unit.title || !unit.description) errors.push(`${unit.id}: 제목 또는 설명 누락`);
  if (unit.vocabulary) {
    counts.vocabulary += unit.vocabulary.length;
    const readings = new Set();
    const meanings = new Set();
    for (const word of unit.vocabulary) {
      if (vocabularyWords.has(word.word)) errors.push(`${unit.id}: 다른 단원과 중복된 어휘 ${word.word}`);
      vocabularyWords.add(word.word);
      if (readings.has(word.reading) || meanings.has(word.meaning)) errors.push(`${unit.id}: 퀴즈 보기가 중복됩니다.`);
      readings.add(word.reading);
      meanings.add(word.meaning);
      if (!word.word || !word.reading || !word.meaning || !word.example || !word.translation) errors.push(`${unit.id}: 어휘 내용 누락`);
    }
    for (const [index, question] of (unit.questions ?? []).entries()) checkQuestion(question, `${unit.id}/${index}`);
    vocabularyReviewQuestions += unit.questions?.length ?? 0;
  }
  if (unit.grammar) {
    counts.grammar += unit.grammar.length;
    for (const [index, entry] of unit.grammar.entries()) {
      if (!entry.pattern || !entry.meaning || !entry.explanation || !entry.example || !entry.translation) errors.push(`${unit.id}/${index}: 문법 내용 누락`);
      checkQuestion(entry.question, `${unit.id}/${index}`);
    }
  }
  if (unit.passage || unit.transcript) {
    if (!unit.questions?.length) errors.push(`${unit.id}: 독해·청해 문제 누락`);
    for (const [index, question] of (unit.questions ?? []).entries()) checkQuestion(question, `${unit.id}/${index}`);
    counts[unit.area] += unit.questions?.length ?? 0;
  }
}

if (n3Units.length !== 33) errors.push(`단원 수 오류: ${n3Units.length}/33`);
if (vocabularyReviewQuestions !== 42) errors.push(`어휘 유형별 문제 수 오류: ${vocabularyReviewQuestions}/42`);
for (const [area, expected] of Object.entries({ vocabulary: 144, grammar: 12, reading: 12, listening: 12 })) {
  if (counts[area] !== expected) errors.push(`${area} 항목 수 오류: ${counts[area]}/${expected}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`N3 콘텐츠 검증 완료: 통합 어휘 ${bankCounts.total}개(N3 ${bankCounts.N3}, N4 ${bankCounts.N4}, N5 ${bankCounts.N5}), 원본 어휘 뜻 ${reviewedKeys.size}개 검수 반영, 어휘 예문 ${Object.keys(reviewedVocabulary.examples).length}개 항목 검수 반영, 뜻·읽기·표기 문제 보기 정상; 문맥·유의 표현·용법 ${vocabularyReviewQuestions}문항, 문법 ${counts.grammar}개, 독해 ${counts.reading}문항, 청해 ${counts.listening}문항`);
}
