# 문제 해결

[프로젝트 소개](../README.md) · [설치·제거](INSTALL.md)

## 증상부터 확인하기

| 증상 | 확인 사항 |
|---|---|
| 단축키가 전부 기존 브라우저 기능으로 작동 | 현재 프로필에 설치했는지, Firefox를 완전히 재시작했는지, PDF 본문에 초점이 있는지 확인 |
| Ctrl+N이 새 창을 엶 | 정상 동작. 주석은 Ctrl+M |
| `user.pdfShortcuts` 항목이 없음 | 진입 파일 위치, cfg 파일명, 실제 설치 폴더, 기존 AutoConfig와의 충돌 확인 |
| `status = missing-manifest` | 현재 프로필의 `chrome\pdf-shortcuts\chrome.manifest` 위치 확인 |
| `status = missing-module` | 프로필 파일 네 개가 모두 있는지와 `error`에 기록된 누락 파일명 확인 |
| `status = safe-mode` | Firefox 문제 해결 모드에서는 사용자 모듈 로딩을 건너뜀. 이 상태 자체가 완전 제거를 뜻하지는 않음 |
| `status = error` | `error`를 확인하고 같은 배포본의 cfg·모듈을 함께 복사했는지 확인 |
| `registered`인데 특정 도구가 작동하지 않음 | 해당 도구 버튼이 실제로 보이고 활성화돼 있는지, 대화상자가 열려 있지 않은지 확인 |
| PDF에서 북마크·방문 기록 키가 작동하지 않음 | 지정한 여섯 키는 PDF 도구 전환에 사용됨. 일반 페이지와 브라우저 입력 영역에서는 기존 기능 유지 |
| 업데이트 후 작동하지 않음 | Firefox 버전과 진단값을 기록. 내부 API 변경 가능성이 있으므로 호환성을 재확인 |
| Firefox가 시작되지 않음 | Firefox를 종료한 뒤 [설치 안내의 복구 절차](INSTALL.md)에 따라 단독 진입 파일을 이동하거나 백업 복원 |

마우스 포인터가 PDF 위에 있다는 것만으로 PDF에 입력 초점이 있는 것은 아닙니다. 개발자 콘솔에서 값을 확인했다면 다시 PDF 본문에 초점을 옮겨 시험하세요.

## 진단값 읽기

`about:config`에서 `user.pdfShortcuts`를 검색합니다.

| 항목·값 | 의미 |
|---|---|
| `version = 0.7` | 0.7 시작 설정 실행 |
| `status = registered` | actor 등록과 부모 모듈 시작 성공 |
| `runtime = window-hooked` | 브라우저 창 키 처리기 연결 |
| `connection = connected` | PDF와 부모 모듈 연결 응답 |
| `lastKey = KeyM` 등 | 마지막으로 검사한 여섯 Ctrl 조합 중 하나 |
| `lastRoute = parent / child-fallback` | 부모 처리 또는 PDF 직접 처리 경로 |
| `lastRoute = browser-ui-focused / not-pdf` | 적용 대상이 아니어서 기존 동작 유지 |
| `lastResult = button-dispatched` | 버튼에 클릭 이벤트를 전달함. 이후 비동기 작업 전체의 성공을 뜻하지는 않음 |
| `lastResult = modal-open / tool-unavailable / viewer-not-focused` | 해당 조건으로 실행을 건너뜀 |
| `error` | 마지막으로 기록된 시작·부모 모듈 오류 |

상태는 현재 세션의 마지막 값이며 전체 실행 이력이 아닙니다. 일부 값은 이전 이벤트의 값으로 남을 수 있습니다. 지정한 여섯 키의 `lastKey`는 PDF 판별 전에도 갱신될 수 있습니다. Ctrl+N은 이 진단 키를 갱신하지 않습니다.

## 오류 제보에 필요한 정보

저장소 상단 **Issues → New issue**에서 오류 제보 양식을 사용합니다.

- Windows 버전·빌드와 Firefox의 정확한 버전
- `user.pdfShortcuts.version`, `status`, 필요한 마지막 진단값
- 로컬 PDF인지 웹에서 연 PDF인지, 독립 탭인지 여부
- 입력 초점 위치와 누른 키, 기대한 동작과 실제 동작
- 재현 순서와 같은 도구 버튼을 마우스로 눌렀을 때의 결과

PDF 원문, 문서 주소, 로그인 정보, 개인 프로필 경로가 포함된 화면·오류 전문은 그대로 올리지 마세요. 먼저 식별 가능한 정보를 지웁니다. 보안 취약점은 [보안 보고 안내](../SECURITY.md)를 따릅니다.
