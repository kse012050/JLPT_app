const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const content = path.resolve(__dirname, '../src/content');
const source = fs.readFileSync(path.join(content, 'japanese-reading.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', compiled)(
  (name) => require(path.join(content, name)), loaded, loaded.exports,
);

const { kanaToHangul, kanjiHunEum } = loaded.exports;
for (const [kana, expected] of [
  ['あう', '아우'],
  ['がっこう', '갓코우'],
  ['きょう', '쿄우'],
  ['コーヒー', '코오히이'],
]) {
  const actual = kanaToHangul(kana);
  if (actual !== expected) throw new Error(`${kana}: ${actual} (예상: ${expected})`);
}
if (kanjiHunEum('会') !== '모일 회, 모을 회') throw new Error('会의 여러 훈음이 다릅니다.');
if (!kanjiHunEum('行')?.includes('다닐 행')) throw new Error('行의 여러 훈음이 누락되었습니다.');
console.log('가나 발음과 한자 훈음 예시 검증 완료');
