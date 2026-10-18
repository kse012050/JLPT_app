import type { ChoiceQuestion } from './n3';

// 데이터 파일의 보기 순서가 정답 힌트가 되지 않도록 지문마다 고정된 순서로 섞는다.
export function questionChoices(question: ChoiceQuestion): string[] {
  const choices = [...question.choices];
  let seed = 2166136261;
  const questionIdentity = `${question.prompt}\u0000${question.choices.join('\u0000')}`;
  for (let index = 0; index < questionIdentity.length; index += 1) {
    seed = Math.imul(seed ^ questionIdentity.charCodeAt(index), 16777619) >>> 0;
  }
  for (let index = choices.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }
  return choices;
}
