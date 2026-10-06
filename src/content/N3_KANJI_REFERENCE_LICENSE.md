# N3 한자 읽기 참고 자료 출처

`n3-kanji-reference.json`은 JLPT 공식 어휘 목록이 아닙니다. 한자 읽기 연습에만 사용하며, 단어의 뜻·문맥·용법이나 시험 범위를 보증하지 않습니다.

- 원본 목록: Jonathan Waller의 비공식 JLPT 어휘 목록을 [stephenmk/yomitan-jlpt-vocab](https://github.com/stephenmk/yomitan-jlpt-vocab)에서 정리한 `original_data/n3.csv`. 저장소에 표시된 라이선스는 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)입니다.
- 표기와 읽기 대조: [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html)를 바탕으로 한 [jkindrix/japanese-language-data](https://github.com/jkindrix/japanese-language-data)의 `data/core/words.json`. JMdict의 저작권 표기와 라이선스 조건은 [EDRDG](https://www.edrdg.org/edrdg/licence.html)를 따릅니다.
- 가공 방식: 원본 N3 목록에서 한자 표기가 있는 항목만 추리고, JMdict의 동일 항목에 있는 일반 표기와 첫 번째 일반 읽기가 일치하는 경우만 남겼습니다. 여러 읽기가 남는 표제어와 미완성 항목은 제외했습니다. 생성 과정은 `scripts/generate-n3-kanji-reference.py`에 있습니다.
- 재배포 조건: 이 가공 목록은 원본의 표시 조건에 따라 **CC BY-SA 4.0**으로 제공합니다. 출처 표시, 라이선스 링크 및 변경 사실을 유지하고, 이 목록의 2차 가공물은 같은 라이선스로 공유해야 합니다.

앱 화면에도 출처와 비공식 자료라는 점을 표시합니다. 자세한 원본 파일 주소와 SHA-256 해시는 `n3-kanji-reference.json`에 기록되어 있습니다.
