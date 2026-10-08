# 라이선스, 출처 및 상표 고지

## 이 패키지에 적용하는 라이선스

PDF Tool Keys의 `program/`, `profile/`, `tests/` 파일, 프로젝트 문서, `.github/`와 저장소 설정 파일은 **Mozilla Public License 2.0 (MPL-2.0)**으로 제공합니다. 라이선스 전문은 루트의 [LICENSE](LICENSE)에 포함되어 있습니다. JavaScript 및 cfg 파일에는 `SPDX-License-Identifier: MPL-2.0` 고지를 붙였습니다. 개별 고지가 없는 `chrome.manifest`와 문서에도 이 범위 지정이 적용됩니다.

라이선스 전문과 외부 참조 대상의 원래 권리를 이 프로젝트가 새로 소유하거나 변경한다는 뜻은 아닙니다. Firefox 이름·로고 사용 권한도 이 소프트웨어 라이선스에 포함되지 않습니다.

MPL-2.0을 선택한 것은 이 배포본의 라이선스 결정입니다. Firefox와 연동한다는 이유만으로 모든 별도 코드가 자동으로 MPL이 된다는 의미는 아닙니다. 수정본을 재배포할 때는 해당 소스와 라이선스 고지를 MPL의 조건에 맞게 제공해야 합니다. 자세한 조건은 LICENSE를 우선합니다.

## 코드 구성과 출처 검토

이 패키지는 사용자 요구에 따라 AI의 도움으로 작성·수정된 AutoConfig 진입 코드, PDF 식별·단축키 연결 모듈, 모의 테스트 및 설명 문서로 구성됩니다. Firefox 실행 파일, Firefox 원본 소스 파일, PDF.js 배포 라이브러리, 제3자 npm 패키지, 아이콘·로고·폰트를 포함하지 않습니다.

GitHub Actions 설정은 GitHub 공식 액션을 참조합니다. 해당 액션의 소스는 이 저장소에 동봉하지 않으며, 호스팅된 CI에서 별도로 받아 실행합니다.

출처 검토에서는 생성된 배포 코드와 이전 버전 묶음, 개발 중 보관한 Mozilla 참조 소스를 확인했습니다. Firefox/PDF.js 파일 전체나 기능 구현 블록을 패키지에 복사한 정황은 확인되지 않았습니다. 내부 API명·도구 버튼 ID·PDF 보안 주체 문자열과 공개 API의 짧은 사용 패턴은 호환성을 위해 참조했습니다. 이 검토는 인터넷 전체의 코드와 대조한 독창성 인증은 아닙니다.

## 개발 중 참조한 자료

| 자료 | 참조한 내용 | 원자료의 라이선스·취급 |
|---|---|---|
| Mozilla AutoConfig 지원 문서 | 설치 위치, cfg 첫 줄, 설정 함수 | 공식 웹 문서 링크로 참조; 문서 본문을 동봉하지 않음 |
| Firefox `browser-sets.inc.xhtml` | 기존 키 배정과 예약 속성 | MPL-2.0 소스 참조; 원본 파일 동봉 없음 |
| Firefox `browser.js` 및 PDF 관련 모듈 | `resource://pdf.js` 보안 주체 식별 | 원본별 라이선스에 따른 참조; 원본 파일 동봉 없음 |
| Firefox `nsIFocusManager.idl`, JSWindowActor 정의 | 콘텐츠 입력 초점과 부모·자식 통신 구조 | MPL-2.0 소스 참조; 원본 파일 동봉 없음 |
| 내장 PDF.js `viewer.mjs` 및 upstream toolbar 구현 | 버튼 ID, 클릭의 detail 값과 키보드 경로 | Apache-2.0 소스 참조; PDF.js 코드·라이브러리 동봉 없음 |

Firefox 저장소의 파일이 모두 동일한 라이선스인 것은 아닙니다. 특히 참조한 PDF.js 뷰어 및 일부 PDF 연결 모듈에는 Apache-2.0 고지가 있습니다. 이 패키지에는 해당 파일을 포함하지 않으며, 향후 원본 코드를 가져오는 경우에는 그 파일의 고지와 라이선스를 별도로 보존해야 합니다. 이 프로젝트의 MPL 고지를 붙이는 것만으로 원자료의 의무가 대체되지는 않습니다.

참고 링크:

- [AutoConfig 공식 문서](https://support.mozilla.org/en-US/kb/customizing-firefox-using-autoconfig)
- [Firefox 공식 소스 저장소](https://github.com/mozilla-firefox/firefox)
- [Firefox 키 정의](https://searchfox.org/firefox-main/source/browser/base/content/browser-sets.inc.xhtml)
- [PDF.js 공식 소스 저장소](https://github.com/mozilla/pdf.js)
- [MPL-2.0 전문](https://www.mozilla.org/en-US/MPL/2.0/)
- [MPL-2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)

LICENSE는 Mozilla가 제공하는 [공식 텍스트](https://www.mozilla.org/media/MPL/2.0/index.txt)를 포함합니다. Exhibit B의 문구는 공식 라이선스 전문의 일부로 수록된 것이며, 이 프로젝트의 개별 소스에 해당 제한 고지를 추가한 것은 아닙니다.

## 상표와 비공식 상태

프로젝트 이름은 **PDF Tool Keys**입니다. Firefox라는 이름은 호환 대상 브라우저를 설명하기 위해 사용합니다. Mozilla 또는 Firefox 로고를 프로젝트의 로고로 사용하지 않습니다.

Firefox is a trademark of the Mozilla Foundation in the U.S. and other countries. PDF Tool Keys is not officially associated with Mozilla or its products.

참고: [Mozilla Trademark Guidelines](https://www.mozilla.org/en-US/foundation/trademarks/policy/).
