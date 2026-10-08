# 설치·업데이트·제거

[프로젝트 소개로 돌아가기](../README.md)

대상은 Windows 데스크톱용 PDF Tool Keys 0.7입니다. [실행 권한](../SECURITY.md)을 먼저 확인하세요. Node.js, npm, Git은 설치에 필요하지 않습니다.

## 1. 두 폴더와 기존 설정 확인

Firefox를 연 상태에서 다음 정보를 확인합니다.

| 확인 대상 | 확인 방법 |
|---|---|
| 현재 프로필 | `about:support` → 프로필 폴더 열기 |
| Firefox 설치 폴더 | 실행 파일 `firefox.exe`가 있는 폴더. 일반적으로 `C:\Program Files\Mozilla Firefox` |
| 기존 AutoConfig | `about:config`의 `general.config.filename`과 설치 폴더의 `defaults\pref` 안 설정 파일 |

다른 AutoConfig 파일명이 설정되어 있거나 기존 진입 파일이 있다면 새 진입점을 추가하거나 기존 파일을 덮어쓰지 않습니다. 기관에서 관리하는 환경도 마찬가지입니다. 기존 설정을 관리하는 사람이 등록·호출을 통합해야 합니다. 이 안내의 기본 설치·완전 제거 절차는 이 도구를 단독으로 설치하는 경우에 적용됩니다.

PDF 편집 내용을 저장합니다. 교체할 파일이 있다면 별도 폴더에 백업한 뒤 **Firefox를 완전히 종료**합니다.

## 2. 파일 복사

저장소 상단의 **Code → Download ZIP**으로 내려받은 파일을 압축 해제합니다. 압축 안에서 `README.md`, `program`, `profile`이 함께 있는 폴더를 기준으로 합니다.

| 파일 | 목적지 |
|---|---|
| `program/pdf-shortcuts.cfg` | `<Firefox 설치 폴더>\pdf-shortcuts.cfg` |
| `program/defaults/pref/pdf-shortcuts-prefs.js` | `<Firefox 설치 폴더>\defaults\pref\pdf-shortcuts-prefs.js` |
| `profile/chrome/pdf-shortcuts/chrome.manifest` | `<현재 프로필 폴더>\chrome\pdf-shortcuts\chrome.manifest` |
| `profile/chrome/pdf-shortcuts/PdfToolKeysCommon.sys.mjs` | `<현재 프로필 폴더>\chrome\pdf-shortcuts\PdfToolKeysCommon.sys.mjs` |
| `profile/chrome/pdf-shortcuts/PdfToolKeysParent.sys.mjs` | `<현재 프로필 폴더>\chrome\pdf-shortcuts\PdfToolKeysParent.sys.mjs` |
| `profile/chrome/pdf-shortcuts/PdfToolKeysChild.sys.mjs` | `<현재 프로필 폴더>\chrome\pdf-shortcuts\PdfToolKeysChild.sys.mjs` |

- 꺾쇠 안의 표현은 실제 폴더로 바꿔 읽습니다.
- 설치 폴더에 복사할 때 Windows 관리자 권한이 필요할 수 있습니다.
- 필요한 폴더가 없으면 만듭니다. 기존 `chrome` 폴더 안의 다른 파일은 삭제하지 않습니다.
- `chrome\pdf-shortcuts\pdf-shortcuts`처럼 폴더를 한 겹 더 만들지 않습니다.
- 파일을 텍스트로 다시 작성하지 말고 그대로 복사합니다. UTF-8(BOM 없음)과 LF 줄바꿈을 유지해야 합니다.
- `program`과 `profile` 폴더 자체를 통째로 설치 폴더에 넣지 않습니다.

## 3. 실행 확인

Firefox를 다시 열고 `about:config`에서 `user.pdfShortcuts`를 검색합니다.

| 항목 | 기대값 |
|---|---|
| `user.pdfShortcuts.version` | `0.7` |
| `user.pdfShortcuts.status` | `registered` |

내장 PDF를 독립된 탭으로 열고 본문을 클릭한 다음 Ctrl+M 등 단축키를 확인합니다. 주소창이나 개발자 콘솔에 입력 초점이 있으면 해당 영역의 기존 단축키가 적용됩니다. `registered`는 초기 등록 성공을 나타내며 도구 전체의 동작을 보증하는 값은 아닙니다.

## 이전 버전에서 업데이트

1. PDF를 저장하고 Firefox를 완전히 종료합니다.
2. `pdf-shortcuts.cfg`와 프로필의 파일 네 개를 같은 배포본으로 함께 교체합니다.
3. 기존 진입 파일을 별도로 수정하지 않았다면 `pdf-shortcuts-prefs.js`의 설정 내용은 이전 패키지와 같으므로 재교체할 필요는 없습니다.
4. 다시 실행해 버전과 단축키를 확인합니다.

이미 정상 작동하는 0.7을 사용 중이면 이 저장소의 문서·라이선스 고지·GitHub 구성 변경을 이유로 재설치할 필요는 없습니다.

## 한 프로필에서만 중지

Firefox를 종료하고 해당 프로필의 `chrome\pdf-shortcuts` 폴더를 **프로필 밖으로 이동**합니다. 시작 코드는 모듈이 없는 프로필에서 도구를 등록하지 않습니다. 진단값에 `missing-manifest`가 남을 수 있습니다.

다른 프로필이 같은 설치를 사용한다면 설치 폴더의 공용 파일은 유지합니다. 이 방식은 프로필의 도구 로딩만 중지하며, 설치 단위의 AutoConfig 샌드박스 설정은 그대로 남습니다.

## 완전 제거 — 단독 설치한 경우

1. Firefox를 완전히 종료합니다.
2. **먼저** `<Firefox 설치 폴더>\defaults\pref\pdf-shortcuts-prefs.js`를 설치 폴더 밖으로 이동합니다.
3. 이 도구의 `<Firefox 설치 폴더>\pdf-shortcuts.cfg`를 제거합니다.
4. 사용한 각 프로필의 `chrome\pdf-shortcuts` 폴더를 제거합니다.
5. Firefox를 다시 실행합니다.

진입 파일을 남긴 채 참조되는 cfg만 삭제하면 설정 읽기 오류가 날 수 있습니다. 프로필 전체나 `prefs.js`를 삭제할 필요는 없습니다.

## 기존 AutoConfig에 통합한 경우

공용 파일 전체를 삭제하지 않습니다. 설치 전 백업을 복원하거나 이 도구의 등록·호출 부분만 제거합니다. 다른 스크립트가 사용하는 샌드박스 설정을 임의로 변경하지 않습니다.

## Firefox가 시작되지 않을 때

Firefox가 종료된 상태에서 이 도구의 단독 진입 파일을 설치 폴더 밖으로 옮기거나, 통합 전에 만든 백업을 복원합니다. 시작이 복구되면 파일 위치와 구문, 기존 AutoConfig와의 충돌을 확인합니다. 기타 증상은 [문제 해결 안내](TROUBLESHOOTING.md)를 참고하세요.
