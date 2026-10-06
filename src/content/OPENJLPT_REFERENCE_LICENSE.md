# N5~N3 어휘·문법 참고 자료 출처

`openjlpt-n3-reference.json`은 [OpenJLPT](https://github.com/evanclan/OpenJLPT)의 N5·N4·N3 어휘 및 문법 자료를 앱에 맞게 필드를 줄여 수록한 **가공 자료**입니다. 일본어 표기, 읽기, 영어 뜻, 예문, 문법의 영어 설명은 원자료를 유지했습니다. 원본 파일의 SHA-256과 가공 코드는 각각 JSON의 `sourceSha256`, `scripts/import-openjlpt-reference.py`에서 확인할 수 있습니다.

`openjlpt-reference-ko.json`은 영어 뜻·예문 번역·문법 설명을 [M2M100 418M](https://huggingface.co/facebook/m2m100_418M)(MIT 라이선스)으로 한국어로 자동 번역한 초안입니다. 생성 코드는 `scripts/translate-openjlpt-ko.py`입니다. 기존에 직접 작성한 한국어 어휘 144개의 뜻과 예문은 학습 화면에서 우선 사용합니다. 자동 번역은 전체 문맥을 사람이 검토한 자료가 아니므로 어색하거나 부정확한 항목이 있을 수 있습니다.

이 가공 자료는 원본에 따라 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)으로 제공합니다. 재배포할 때 출처와 변경 사실을 밝히고 동일한 라이선스 조건을 지켜야 합니다.

OpenJLPT에는 아래 출처가 포함됩니다.

- N5~N3 분류 및 어휘 영어 뜻: [Jonathan Waller JLPT Resources](https://www.tanos.co.uk/jlpt/) (CC BY)
- 표기·읽기·품사 대조: [JMdict / EDRDG](https://www.edrdg.org/jmdict/j_jmdict.html) (CC BY-SA 4.0, [EDRDG 조건](https://www.edrdg.org/edrdg/licence.html))
- 어휘 예문: [Tatoeba](https://tatoeba.org/) (CC BY 2.0 FR). JSON에는 각 예문의 `tatoeba_id`를 남겼습니다.
- 문법 설명과 문법 예문: OpenJLPT 기여자 (CC BY-SA 4.0)

자세한 원자료별 조건은 [OpenJLPT NOTICE](https://github.com/evanclan/OpenJLPT/blob/main/NOTICE.md)에 있습니다. JLPT 운영 기관은 공식 어휘·한자·문법 목록을 공개하지 않으므로 이 분류는 비공식 참고 범위입니다.
