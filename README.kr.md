# PDF Tool Keys

**Firefox 내장 PDF 편집 도구를 단축키로 사용하세요.**

`0.7 beta` · `Windows 대상` · `MPL-2.0` · `수동 설치`

한국어 · [English](README.en.md)

[설치·제거](docs/INSTALL.md) · [문제 해결](docs/TROUBLESHOOTING.md) · [권한·보안](SECURITY.md) · [검증 기록](docs/VALIDATION.md) · [변경 기록](CHANGELOG.md)

PDF Tool Keys는 Firefox 데스크톱 브라우저의 내장 PDF 뷰어에 텍스트, 그리기, 강조, 주석, 서명, 이미지 도구 단축키를 연결하는 **비공식 AutoConfig 스크립트**입니다. PDF 안에 입력 초점이 있을 때 작동하며, 일반 웹페이지와 주소창에서는 기존 브라우저 단축키를 유지합니다.

Mozilla 또는 그 제품과 공식적인 제휴 관계가 없으며, Mozilla가 제작·승인·보증한 도구가 아닙니다. 부가 기능 스토어에서 설치하는 WebExtension이 아닙니다.

## 단축키

| 단축키 | 내장 PDF에서 실행하는 도구 |
|---|---|
| **Ctrl + G** | 텍스트 |
| **Ctrl + D** | 그리기 |
| **Ctrl + H** | 강조 |
| **Ctrl + M** | 주석 |
| **Ctrl + U** | 서명 |
| **Ctrl + I** | 이미지 |

## 어디에서 작동하나요?

- 독립된 탭으로 연 Firefox 내장 PDF에 **입력 초점**이 있을 때 작동합니다.
- 입력 초점은 마우스 포인터 위치와 다릅니다. PDF 탭을 열어 두어도 주소창에 초점이 있으면 주소창의 기존 동작을 유지합니다.
- PDF 자체의 텍스트 입력칸에서도 위의 여섯 Ctrl 조합은 도구 전환에 사용됩니다.
- 일반 문자, Shift+문자, Ctrl+Alt 조합과 나머지 Ctrl 조합은 처리하지 않습니다.
- 도구가 숨겨졌거나 비활성화된 경우, 또는 모달 대화상자가 열린 경우에는 도구를 실행하지 않습니다. 이때 소비한 키가 북마크·방문 기록 등 브라우저 기능으로 다시 넘어가지는 않습니다.

## 설치 전에

> [!WARNING]
> 이 도구는 `general.config.sandbox_enabled=false`를 사용해 AutoConfig 코드를 브라우저 내부 권한으로 실행합니다. 웹 콘텐츠의 프로세스 샌드박스나 확장 기능 서명 검사를 끄는 설정은 아니지만, 일반 확장 기능보다 강한 권한을 갖습니다. 설치할 코드와 배포자를 신뢰할 수 있는 경우에 사용하세요. 자세한 범위는 [권한·보안 설명](SECURITY.md)을 확인하세요.

Firefox 설치 폴더에 파일을 복사하므로 관리자 권한이 필요할 수 있습니다. 이미 AutoConfig를 사용하거나 기관에서 관리하는 Firefox에는 기존 설정과의 통합 검토 없이 설치하지 마세요.

## 설치

1. 이 저장소 상단의 **Code → Download ZIP**으로 파일을 받아 압축을 풉니다.
2. [설치 안내](docs/INSTALL.md)에 따라 설치 폴더·현재 프로필·기존 AutoConfig 사용 여부를 확인합니다. 편집 중인 PDF를 저장한 뒤 Firefox를 완전히 종료합니다.
3. 아래 파일을 각 위치에 복사합니다.

| 저장소 안의 경로 | 복사할 위치 |
|---|---|
| `program/pdf-shortcuts.cfg` | `<Firefox 설치 폴더>\pdf-shortcuts.cfg` |
| `program/defaults/pref/pdf-shortcuts-prefs.js` | `<Firefox 설치 폴더>\defaults\pref\pdf-shortcuts-prefs.js` |
| `profile/chrome/pdf-shortcuts/` 안 파일 네 개 | `<현재 프로필 폴더>\chrome\pdf-shortcuts\` |

4. Firefox를 실행하고 `about:config`에서 `user.pdfShortcuts.version = 0.7`, `user.pdfShortcuts.status = registered`를 확인합니다. PDF 본문에 초점을 둔 뒤 단축키를 확인합니다.

꺾쇠 안의 경로는 실제 설치·프로필 위치를 뜻합니다. `program`과 `profile` 폴더 자체를 설치 폴더에 넣는 방식이 아닙니다. 실행에 필요한 것은 위 파일 여섯 개이며, **Node.js와 Git은 사용자가 도구를 설치할 때 필요하지 않습니다.**

업데이트·비활성화·제거·시작 실패 복구는 [설치 안내](docs/INSTALL.md)에 포함되어 있습니다. 이미 정상 작동하는 0.7을 사용 중이면 문서와 저장소 구성 변경 때문에 다시 설치할 필요는 없습니다.

## 지원 상태

| 항목 | 현재 상태 |
|---|---|
| 배포 단계 | 수동 설치형 비공식 베타 |
| 개발 대상 | Windows 데스크톱, 독립된 탭의 내장 PDF |
| 참조 소스 | Firefox 157.0 |
| 실제 사용 확인 | 2026-10-08 기준 사용자 한 환경의 정상 작동 보고 |
| 자동 검사 | Node.js 모의 테스트 32개 통과. 실제 Firefox 실행 시험과 구분 |
| 미검증 | 다른 Firefox 버전, macOS·Linux·모바일, iframe 안의 PDF |

성공 보고 시점의 정확한 OS 빌드와 Firefox 버전은 별도로 재수집하지 않았습니다. 내부 API와 PDF 도구 구조에 의존하므로 Firefox 업데이트 후 호환성을 다시 확인해야 합니다. 자세한 근거와 한계는 [검증 기록](docs/VALIDATION.md)을 참고하세요.

## 문제 제보와 개발

먼저 [문제 해결 안내](docs/TROUBLESHOOTING.md)를 확인한 뒤 저장소의 **Issues**에서 오류 제보 양식을 사용해 주세요. OS·Firefox 버전·재현 순서를 적되, PDF 원문이나 개인정보가 포함된 진단 자료는 공개하지 마세요.

개발·기여 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다. Node.js 24.x에서 별도의 npm 설치 없이 모의 테스트를 실행할 수 있습니다.

```sh
node --test tests/shortcuts.test.mjs tests/startup.test.mjs
```

GitHub Actions에는 Windows와 Ubuntu에서 위 모의 테스트를 실행하도록 설정했습니다. 해당 설정은 Firefox를 설치하거나 실제 PDF UI를 조작하지 않습니다. 업로드 후 실행 결과는 저장소의 **Actions**에서 확인할 수 있습니다.

## 문서와 라이선스

| 문서 | 내용 |
|---|---|
| [설치 안내](docs/INSTALL.md) | 처음 설치, 업데이트, 중지, 제거, 복구 |
| [문제 해결](docs/TROUBLESHOOTING.md) | 증상별 확인 사항과 진단값 |
| [권한·보안](SECURITY.md) | 실행 권한, 데이터 처리, 보안 문제 보고 |
| [검증 기록](docs/VALIDATION.md) | 확인한 동작과 미검증 범위 |
| [공개 전 검토](docs/RELEASE-REVIEW.md) | 명칭·권한·라이선스·검증 검토 |
| [출처와 고지](NOTICE.md) | 참조한 소스, 라이선스와 상표 |
| [GitHub 게시 안내](docs/PUBLISHING.md) | 저장소 업로드와 첫 공개 절차 |

프로젝트 소스와 문서는 [MPL-2.0](LICENSE)으로 제공합니다. 참조 자료의 원래 라이선스와 권리는 [NOTICE.md](NOTICE.md)에 구분해 기록했습니다.

Firefox is a trademark of the Mozilla Foundation in the U.S. and other countries. PDF Tool Keys is not officially associated with Mozilla or its products.
