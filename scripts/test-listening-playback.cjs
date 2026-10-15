const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function compile(relativePath, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const output = {};
  new Function('exports', 'require', javascript)(output, (name) => imports[name]);
  return output;
}

const parser = compile('src/content/listening-speakers.ts');
const spoken = [];
let stops = 0;
const speech = {
  stop: async () => { stops += 1; },
  getAvailableVoicesAsync: async () => [
    { identifier: 'ja-one', language: 'ja-JP' },
    { identifier: 'ja-two', language: 'ja-JP' },
  ],
  speak: (text, options) => spoken.push({ text, options }),
};
const playback = compile('src/utils/listening-playback.ts', {
  'expo-speech': speech,
  '@/content/listening-speakers': parser,
});

async function main() {
  await playback.playListeningTranscript('女：先に資料を見てください。 男：分かりました。 女：お願いします。', () => assert.fail('재생 오류'));
  assert.deepEqual(spoken.map((item) => item.text), ['先に資料を見てください。']);
  assert.equal(spoken[0].options.voice, 'ja-one');
  spoken[0].options.onDone();
  assert.equal(spoken[1].text, '分かりました。');
  assert.equal(spoken[1].options.voice, 'ja-two');
  spoken[1].options.onDone();
  assert.equal(spoken[2].text, 'お願いします。');
  assert.equal(spoken[2].options.voice, 'ja-one');

  await playback.stopListeningPlayback();
  spoken[2].options.onDone();
  assert.equal(spoken.length, 3);
  assert.ok(stops >= 2);

  const oldRequest = playback.playListeningTranscript('女：古い問題です。', () => assert.fail('이전 재생 오류'));
  const newRequest = playback.playListeningTranscript('男：新しい問題です。', () => assert.fail('새 재생 오류'));
  await Promise.all([oldRequest, newRequest]);
  assert.deepEqual(spoken.slice(3).map((item) => item.text), ['新しい問題です。']);

  const fallbackSpoken = [];
  const fallback = compile('src/utils/listening-playback.ts', {
    'expo-speech': {
      stop: async () => {},
      getAvailableVoicesAsync: async () => [{ identifier: 'only-ja', language: 'ja-JP' }],
      speak: (text, options) => fallbackSpoken.push({ text, options }),
    },
    '@/content/listening-speakers': parser,
  });
  await fallback.playListeningTranscript('先生：確認してください。 生徒：はい。', () => assert.fail('단일 음성 오류'));
  fallbackSpoken[0].options.onDone();
  assert.equal(fallbackSpoken[0].options.voice, 'only-ja');
  assert.equal(fallbackSpoken[1].options.voice, 'only-ja');
  assert.notEqual(fallbackSpoken[0].options.pitch, fallbackSpoken[1].options.pitch);
  assert.deepEqual(parser.splitListeningTranscript('お知らせします。'), [{ speaker: 'ナレーション', text: 'お知らせします。' }]);
  console.log('청해 화자별 재생 및 중단 검사 통과');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
