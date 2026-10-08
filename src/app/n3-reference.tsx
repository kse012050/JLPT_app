import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { InteractiveJapaneseWord } from '@/components/InteractiveJapaneseWord';
import { GrammarExpression, SpokenGrammarExample } from '@/components/GrammarExpression';
import { grammarFocus } from '@/content/grammar-display';
import { formatKoreanMeanings } from '@/content/korean-meaning';
import { grammarFormationKo, grammarMeaningKo, grammarPatternKo } from '@/content/n3-grammar-bank';
import { n3GrammarKo } from '@/content/n3-grammar-ko';
import source from '@/content/openjlpt-n3-reference.json';
import korean from '@/content/openjlpt-reference-ko.json';
import reviewed from '@/content/reviewed-vocabulary-ko.json';
import { getReferenceProgress, saveReferenceProgress } from '@/storage/reference-progress';

type Level = 'N3' | 'N4' | 'N5';
type Kind = 'vocabulary' | 'grammar';
type Example = { ja: string; en: string; furigana?: string; tatoeba_id?: number };
type Word = { id: string; word: string; reading: string; meanings: string[]; examples: Example[] };
type Grammar = { id: string; pattern: string; meaning: string; meaningKo?: string; formation: string; notes: string; examples: Example[] };
type Row = Word | Grammar;

const reference = source as unknown as { levels: Record<Level, { vocabulary: Word[]; grammar: Grammar[] }> };
type KoWord = { meanings: string[]; examples: string[] };
type KoGrammar = { meaning: string; formation: string; notes: string; examples: string[] };
const translated = korean as unknown as { levels: Record<Level, { vocabulary: Record<string, KoWord>; grammar: Record<string, KoGrammar> }> };
const reviewedExamples = reviewed.examples as Record<string, Record<string, string>>;
const pageSize = 16;
const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', jpBold: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_700Bold' };

function readingHint(value?: string) {
  return value?.replace(/\{([^|}]+)\|([^}]+)\}/g, '$1（$2）');
}

export default function N3ReferenceScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const [level, setLevel] = useState<Level>('N3');
  const [kind, setKind] = useState<Kind>(params.kind === 'grammar' ? 'grammar' : 'vocabulary');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [studied, setStudied] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    getReferenceProgress().then((ids) => { setStudied(ids); setLoaded(true); }).catch(() => { setSaveError(true); setLoaded(true); });
  }, []);

  const allRows: Row[] = reference.levels[level][kind];
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return allRows;
    return allRows.filter((row) => kind === 'vocabulary'
      ? `${(row as Word).word} ${(row as Word).reading} ${translated.levels[level].vocabulary[row.id].meanings.join(' ')}`.toLocaleLowerCase().includes(term)
      : `${(row as Grammar).pattern} ${grammarMeaningKo(level, row.id)}`.toLocaleLowerCase().includes(term));
  }, [allRows, kind, level, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const studiedSet = useMemo(() => new Set(studied), [studied]);
  const studiedCount = allRows.filter((row) => studiedSet.has(`${level}-${kind}-${row.id}`)).length;

  function chooseLevel(next: Level) { setLevel(next); setPage(0); setExpanded(null); }
  function chooseKind(next: Kind) { setKind(next); setPage(0); setExpanded(null); }
  function changePage(delta: number) { setPage((value) => Math.max(0, Math.min(pageCount - 1, value + delta))); setExpanded(null); }
  function toggleStudied(id: string) {
    if (!loaded) return;
    const next = studiedSet.has(id) ? studied.filter((item) => item !== id) : [...studied, id];
    setStudied(next);
    writeQueue.current = writeQueue.current.catch(() => {}).then(() => saveReferenceProgress(next)).catch(() => setSaveError(true));
  }

  const header = <View style={s.content}>
    <View style={s.hero}><Text style={s.eyebrow}>N3 합격 대비 · 공개 참고 자료</Text><Text style={s.heroTitle}>어휘·문법 확장 학습</Text><Text style={s.heroText}>N3 어휘 1,659개와 문법 101개, 선행 단계 N4·N5까지 탐색할 수 있습니다. 어휘 뜻과 문법 간단 뜻은 한국어 교정을 반영했습니다.</Text><Text style={s.heroNote}>검수하지 않은 예문 번역은 표시하지 않습니다. N3 문법은 해설과 대표 예문 번역을 제공하며, N4·N5 문법은 뜻과 접속 형태를 먼저 제공합니다. 이 목록은 공식 시험 범위가 아닙니다.</Text></View>
    <View style={s.segmentRow}>{(['N3', 'N4', 'N5'] as const).map((item) => <Pressable key={item} onPress={() => chooseLevel(item)} style={[s.segment, level === item && s.segmentActive]} accessibilityRole="button"><Text style={[s.segmentText, level === item && s.segmentTextActive]}>{item}</Text></Pressable>)}</View>
    <View style={s.segmentRow}>{([['vocabulary', '어휘'], ['grammar', '문법']] as const).map(([item, label]) => <Pressable key={item} onPress={() => chooseKind(item)} style={[s.segment, kind === item && s.segmentActive]} accessibilityRole="button"><Text style={[s.segmentText, kind === item && s.segmentTextActive]}>{label} {reference.levels[level][item].length}</Text></Pressable>)}</View>
    <TextInput value={query} onChangeText={(value) => { setQuery(value); setPage(0); setExpanded(null); }} placeholder={kind === 'vocabulary' ? '일본어·읽기·한국어 뜻 검색' : '문법 표현·한국어 뜻 검색'} placeholderTextColor={colors.muted} style={s.search} autoCorrect={false} accessibilityLabel="참고 자료 검색" />
    <Text style={s.count}>{filtered.length}개 중 {filtered.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filtered.length)}개 표시 · 학습 표시 {studiedCount}/{allRows.length}</Text>
    {saveError ? <Text style={s.error}>학습 표시를 저장하거나 불러오지 못했습니다. 저장 공간을 확인해 주세요.</Text> : null}
  </View>;

  function renderRow({ item }: { item: Row }) {
    const key = `${level}-${kind}-${item.id}`;
    const isExpanded = expanded === key;
    const isStudied = studiedSet.has(key);
    const wordKo = kind === 'vocabulary' ? translated.levels[level].vocabulary[item.id] : null;
    const grammarKo = kind === 'grammar' && level === 'N3' ? n3GrammarKo[item.id] : null;
    const wordReviewKey = kind === 'vocabulary' ? `${level}:${(item as Word).word}:${(item as Word).reading}` : '';
    return <View style={s.card}>
      {kind === 'vocabulary'
        ? <><InteractiveJapaneseWord word={(item as Word).word} reading={(item as Word).reading} /><Text style={s.englishLabel}>뜻</Text><Text style={s.meaning}>{wordKo ? formatKoreanMeanings(wordKo.meanings) : ''}</Text><Pressable onPress={() => setExpanded(isExpanded ? null : key)} accessibilityRole="button" accessibilityLabel={`${(item as Word).word} 예문 ${isExpanded ? '접기' : '보기'}`} style={s.expandButton}><Text style={s.expandText}>{isExpanded ? '예문 접기 ⌃' : '예문 보기 ⌄'}</Text></Pressable></>
        : <><View style={s.cardTop}><GrammarExpression key={key} pattern={grammarPatternKo((item as Grammar).pattern)} example={item.examples[0]?.ja ?? ''} focus={grammarKo?.focus} furigana={item.examples[0]?.furigana} compact /><Pressable onPress={() => setExpanded(isExpanded ? null : key)} accessibilityRole="button" accessibilityLabel={`${(item as Grammar).pattern} 예문 ${isExpanded ? '접기' : '보기'}`} style={s.expandIcon}><Text style={s.chevron}>{isExpanded ? '⌃' : '⌄'}</Text></Pressable></View><Pressable onPress={() => setExpanded(isExpanded ? null : key)} accessibilityRole="button" accessibilityLabel={`${(item as Grammar).pattern} 자세히 보기`}><Text style={s.englishLabel}>뜻</Text><Text style={s.meaning}>{grammarMeaningKo(level, item.id)}</Text><Text style={s.expandText}>{isExpanded ? '예문 접기 ⌃' : '예문 보기 ⌄'}</Text></Pressable></>}
      {isExpanded ? <View style={s.detail}>
        {kind === 'grammar' ? <><Text style={s.detailLabel}>접속 형태</Text><Text style={s.detailText}>{grammarFormationKo((item as Grammar).formation)}</Text>{grammarKo ? <><Text style={s.detailLabel}>설명</Text><Text style={s.detailText}>{grammarKo.explanation}</Text></> : null}</> : null}
        <Text style={s.detailLabel}>예문</Text>
        {item.examples.length ? item.examples.map((example, index) => <View key={`${key}-${index}`} style={s.example}>{kind === 'grammar' ? <SpokenGrammarExample text={example.ja} focus={grammarFocus(grammarPatternKo((item as Grammar).pattern), example.ja, grammarKo?.focus)} furigana={example.furigana} style={s.japanese} /> : <Text style={s.japanese}>{example.ja}</Text>}{example.furigana ? <Text style={s.furigana}>{readingHint(example.furigana)}</Text> : null}{kind === 'grammar' ? index === 0 && grammarKo ? <Text style={s.exampleEnglish}>{grammarKo.translation}</Text> : null : reviewedExamples[wordReviewKey]?.[index] !== undefined ? <Text style={s.exampleEnglish}>{wordKo?.examples[index]}</Text> : null}{example.tatoeba_id ? <Link href={`https://tatoeba.org/sentences/show/${example.tatoeba_id}`} target="_blank" style={s.exampleSource}>Tatoeba 예문 출처 ↗</Link> : null}</View>) : <Text style={s.detailText}>원자료에 예문이 없습니다.</Text>}
      </View> : null}
      <Pressable onPress={() => toggleStudied(key)} disabled={!loaded} style={[s.studiedButton, isStudied && s.studiedButtonActive]} accessibilityRole="button" accessibilityLabel={isStudied ? '학습 표시 해제' : '학습함으로 표시'}><Text style={[s.studiedText, isStudied && s.studiedTextActive]}>{isStudied ? '✓ 학습함' : '학습함으로 표시'}</Text></Pressable>
    </View>;
  }

  const footer = <View style={s.footer}>
    <View style={s.pageControls}><Pressable onPress={() => changePage(-1)} disabled={page === 0} style={[s.pageButton, page === 0 && s.disabled]} accessibilityRole="button"><Text style={s.pageText}>이전</Text></Pressable><Text style={s.pageNumber}>{page + 1} / {pageCount}</Text><Pressable onPress={() => changePage(1)} disabled={page === pageCount - 1} style={[s.pageButton, page === pageCount - 1 && s.disabled]} accessibilityRole="button"><Text style={s.pageText}>다음</Text></Pressable></View>
    <View style={s.source}><Text style={s.sourceTitle}>자료 출처와 범위</Text><Text style={s.sourceText}>OpenJLPT 가공 자료 · CC BY-SA 4.0. 어휘 예문에는 Tatoeba 자료가 포함됩니다. 한국어 뜻과 N3 문법 대표 예문은 교정 내용을 반영했습니다. 번역이 표시되지 않는 예문은 원문만 참고하세요.</Text><Link href="https://github.com/evanclan/OpenJLPT/blob/main/NOTICE.md" target="_blank" style={s.sourceLink}>원자료 출처 보기 ↗</Link><Link href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" style={s.sourceLink}>CC BY-SA 4.0 보기 ↗</Link><Link href="https://tatoeba.org/" target="_blank" style={s.sourceLink}>Tatoeba 보기 ↗</Link></View>
  </View>;

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}><View style={s.header}><HeaderBackButton onPress={() => router.back()} /><Text style={s.headerTitle}>N3 확장 참고 자료</Text><View style={s.back} /></View><FlatList data={visible} keyExtractor={(item) => item.id} renderItem={renderRow} ListHeaderComponent={header} ListFooterComponent={footer} contentContainerStyle={s.list} keyboardShouldPersistTaps="handled" initialNumToRender={8} windowSize={5} /></SafeAreaView>;
}

const s = StyleSheet.create({
  expandButton: { alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center', marginTop: 8 },
  expandText: { color: colors.pink, fontFamily: fonts.semi, fontSize: 11 },
  screen: { flex: 1, backgroundColor: colors.bg }, header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, back: { width: 40, height: 40 }, headerTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 }, list: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 28 }, content: { paddingTop: 20 },
  hero: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 18, padding: 19 }, eyebrow: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, heroTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 20, marginTop: 7 }, heroText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 8 }, heroNote: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, lineHeight: 18, marginTop: 10 },
  segmentRow: { flexDirection: 'row', gap: 8, marginTop: 13 }, segment: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10 }, segmentActive: { backgroundColor: colors.pink, borderColor: colors.pink }, segmentText: { color: colors.ink, fontFamily: fonts.semi, fontSize: 12 }, segmentTextActive: { color: colors.white }, search: { height: 46, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, color: colors.ink, fontFamily: fonts.body, fontSize: 13, paddingHorizontal: 14, marginTop: 14 }, count: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11, marginVertical: 14 }, error: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, marginBottom: 10 }, cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, expandIcon: { minWidth: 44, minHeight: 44, alignItems: 'center' }, word: { flex: 1, color: colors.ink, fontFamily: fonts.jpBold, fontSize: 21 }, chevron: { color: colors.pink, fontSize: 22 }, reading: { color: colors.pink, fontFamily: fonts.jp, fontSize: 14, marginTop: 3 }, englishLabel: { color: colors.muted, fontFamily: fonts.semi, fontSize: 10, marginTop: 11 }, meaning: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 2 }, detail: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 13, paddingTop: 12 }, detailLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11, marginTop: 7 }, detailText: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, marginTop: 4 }, example: { backgroundColor: '#F6F5F9', borderRadius: 10, padding: 12, marginTop: 9 }, japanese: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 23 }, furigana: { color: colors.muted, fontFamily: fonts.jp, fontSize: 11, lineHeight: 18, marginTop: 5 }, exampleEnglish: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 18, marginTop: 5 }, exampleSource: { color: colors.pink, fontFamily: fonts.semi, fontSize: 10, marginTop: 6 }, studiedButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.pink, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 13 }, studiedButtonActive: { backgroundColor: colors.greenPale, borderColor: colors.green }, studiedText: { color: colors.pink, fontFamily: fonts.semi, fontSize: 11 }, studiedTextActive: { color: colors.green },
  footer: { paddingBottom: 12 }, pageControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 }, pageButton: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: colors.pink, borderRadius: 9, paddingVertical: 11 }, pageText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 12 }, pageNumber: { color: colors.ink, fontFamily: fonts.number, fontSize: 12 }, disabled: { opacity: 0.35 }, source: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginTop: 20 }, sourceTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 }, sourceText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 18, marginTop: 7 }, sourceLink: { color: colors.pink, fontFamily: fonts.semi, fontSize: 11, marginTop: 8 },
});
