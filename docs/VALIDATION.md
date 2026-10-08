# 검증 기록 — PDF Tool Keys 0.7 공개 베타

검토일: 2026-10-08.

[프로젝트 소개](../README.md) · [문제 해결](TROUBLESHOOTING.md)

## 실행 코드와 공개 패키지의 관계

이 공개 패키지는 정상 작동 보고를 받은 0.7의 실행 동작을 유지합니다. 배포 이름·문서를 정리하고 코드에 SPDX 라이선스 주석을 추가했습니다. 단축키 배정, 등록 설정, 모듈 URL, 진단 버전 값은 0.7 그대로입니다. 기존 설치본을 이 문서 개정만을 이유로 다시 설치할 필요는 없습니다.

공개 패키지의 JavaScript/cfg 파일은 추가한 SPDX 한 줄을 제외하면 이전 0.7 ZIP의 동일 파일과 일치함을 확인했습니다. chrome.manifest는 바이트 단위로 동일합니다. GitHub 저장소의 `program/`, `profile/`, `tests/` 파일은 공개 베타 패키지와 바이트 단위로 동일하게 유지합니다.

## 확인 수준

| 검증 종류 | 결과 및 범위 |
|---|---|
| 사용자 실환경 보고 | 2026-10-08에 0.7 설치 후 전체 정상 작동 보고 1건 |
| 정확한 실환경 버전 | 성공 보고 시점의 OS 빌드·Firefox 버전을 새로 수집하지 않음. 개발 당시 참조 기준은 Windows 11 / Firefox 157.0 |
| 모의 테스트 | 32개 통과, 0개 실패. 아래의 코드 분기와 메시지 모형을 검증 |
| 구문 검사 | 설치용 JavaScript, cfg 및 모듈 구문 확인 |
| 패키지 검사 | 원본 0.7과 실행 코드 일치, ZIP 무결성, 파일 목록·해시 확인 |
| 실제 브라우저 자동화 | 수행하지 못함. 테스트 환경의 Firefox가 시작 단계에서 application directory 오류로 종료됨 |
| 다중 환경·장기 사용 | 추가 Windows 환경, 다른 Firefox 버전, macOS·Linux, 장기간 사용은 미검증 |

사용자의 성공 보고는 실제 사용 근거입니다. 다만 각 수동 검사 항목의 화면·이벤트 로그를 독립적으로 수집한 시험 성적서는 아닙니다. 여러 버전에서 모두 검증됐다고 해석하지 않습니다.

## 모의 테스트 재실행

저장소 루트에서 Node.js 24.x로 다음 명령을 실행합니다. 외부 npm 의존성이나 설치 작업은 없습니다.

```sh
node --test tests/shortcuts.test.mjs tests/startup.test.mjs
```

모형에서 확인하는 항목은 여섯 Ctrl 키의 정확한 도구 배정, Ctrl+N 비개입, 일반 문서·주소창의 기본 동작 유지, 입력 초점 이동, 반복 입력, 모달·숨김·비활성 도구, 부모와 자식 경로의 중복 실행, 초기화·누락 파일·창 종료 정리입니다. 모의 객체가 Firefox 엔진·Windows 키 입력을 대신하므로 엔진 동작을 증명하지는 않습니다.

## GitHub 저장소 구성

`.github/workflows/test.yml`은 Windows·Ubuntu 호스팅 환경에서 Node.js 24로 같은 모의 테스트를 실행하도록 구성했습니다. GitHub에 업로드하기 전에는 호스팅된 워크플로 실행 결과가 없습니다. 로컬 테스트 통과와 GitHub Actions 실행 완료를 구분합니다. Actions가 통과해도 실제 Firefox·PDF UI 시험을 수행한 것은 아닙니다.

GitHub용 묶음은 문서 상대 링크 49개, YAML 설정 구조, LF 줄바꿈, 실행·테스트 파일 8개의 보존과 ZIP 무결성을 확인했습니다. README에는 특정 계정명·저장소 URL을 넣지 않았습니다.

## 새 환경에서 확인할 동작

1. PDF에서 Ctrl+G/D/H/M/U/I가 각각 해당 도구를 실행하는지 확인합니다.
2. Ctrl+G로 도구만 선택되고 가운데 빈 상자가 생기지 않는지 확인합니다.
3. PDF에서 Ctrl+N은 새 창을 열고, 일반 페이지에서는 기존 Ctrl 조합들이 유지되는지 확인합니다.
4. PDF를 열어 두어도 주소창에 초점이 있으면 기존 키가 유지되는지 확인합니다.
5. 같은 키를 길게 누를 때 반복 토글되지 않는지, 키를 뗐다가 다시 누르면 반응하는지 확인합니다.
6. 업데이트 후와 제거 후 각각 정상 시작하는지 확인합니다.

이 목록은 새 환경의 확인 절차이며, 모든 항목을 모든 환경에서 통과했다는 주장으로 사용하지 않습니다.

## 진단값

`about:config`에서 `user.pdfShortcuts`를 검색합니다.

| 항목 | 의미 |
|---|---|
| version = 0.7 | 새 시작 설정 실행 |
| status = registered | actor 등록 및 부모 모듈 시작 성공 |
| runtime = window-hooked | 일반 키 처리기 연결 |
| connection = connected | PDF와 부모 모듈 연결 응답 |
| lastKey = KeyM 등 | 마지막으로 검사한 여섯 Ctrl 조합 중 하나 |
| lastRoute = parent / child-fallback | 부모 또는 PDF 직접 처리 경로 |
| lastRoute = browser-ui-focused / not-pdf | 적용 대상이 아니어서 기존 기능 유지 |
| lastResult = button-dispatched | 도구 버튼에 클릭 전달; 이후 모든 비동기 작업의 완료를 의미하지 않음 |
| lastResult = modal-open / tool-unavailable / viewer-not-focused | 해당 조건 때문에 도구 실행을 건너뜀 |
| error | 마지막으로 기록된 시작·부모 모듈 오류 문자열 |

Ctrl+N은 처리 대상이 아니므로 진단 키를 KeyN으로 바꾸지 않습니다. 오류와 진단은 현재 세션의 마지막 상태이며 여러 창의 값을 합산한 이력이 아닙니다. 단순히 `registered`라고 표시되는 것만으로 여섯 도구의 정상 작동이 검증되는 것은 아닙니다.
