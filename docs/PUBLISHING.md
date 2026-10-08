# GitHub에 그대로 올리기

이 안내는 저장소를 처음 공개하는 관리자를 위한 문서입니다. 일반 사용자는 [설치 안내](INSTALL.md)를 확인하세요.

## 저장소 설정

다음 값을 사용할 수 있습니다.

| 항목 | 값 |
|---|---|
| Repository name | `pdf-tool-keys` |
| Description | `Keyboard shortcuts for the built-in PDF tools in Firefox. Unofficial AutoConfig script for Windows.` |
| Topics | `firefox`, `pdf`, `keyboard-shortcuts`, `autoconfig`, `windows` |
| 공개 단계 | `0.7 beta` |

README 안의 문서 링크는 상대 경로로 되어 있어 계정명이나 저장소 이름을 바꿔 넣을 필요가 없습니다. Mozilla·Firefox 로고를 프로젝트 로고로 사용하지 않습니다.

## 웹에서 처음 업로드

1. 받은 ZIP을 압축 해제합니다. `pdf-tool-keys` 폴더 안에 `README.md`, `program`, `profile`, `tests`, `docs`, `.github`가 있는지 확인합니다.
2. GitHub에서 새 저장소를 만듭니다. 공개하려면 **Public**을 선택합니다. README·라이선스·gitignore 자동 생성 옵션은 선택하지 않습니다. 이미 준비된 파일을 올리기 때문입니다.
3. 빈 저장소의 **uploading an existing file** 링크를 엽니다. 파일이 있는 저장소에서는 **Add file → Upload files**를 사용합니다.
4. `pdf-tool-keys` 폴더 **안의 항목 전체**를 업로드 영역으로 끌어 놓습니다. ZIP 자체나 바깥 폴더를 통째로 한 겹 더 올리지 않습니다.
5. 미리보기 목록에서 `README.md`가 저장소 최상위에 있고, `.github/workflows/test.yml`, `.gitattributes`, `.gitignore`, `.editorconfig`도 포함됐는지 확인합니다. 운영체제에서 숨겨지는 항목은 숨김 파일 표시를 켜고 포함합니다.
6. 커밋 메시지는 `Prepare PDF Tool Keys 0.7 beta`처럼 적고 변경 사항을 저장합니다.
7. 저장소 첫 화면에서 README가 표시되는지 확인합니다. **Actions**에서 `Tests` 워크플로의 Windows·Ubuntu 결과를 확인합니다. 저장소나 조직 정책에 따라 Actions 허용 설정이 필요할 수 있습니다.

업로드하는 파일은 이미 LF 형식입니다. 웹 업로드는 `.gitattributes`에 따른 줄바꿈 변환을 수행하지 않으므로 업로드 전 편집기로 CRLF로 바꾸지 않습니다. 이후 Git으로 내려받는 경우에는 동봉한 `.gitattributes`가 LF 유지를 지정합니다.

## 업로드 후 확인

- README의 한국어·English 전환과 설치·보안 링크가 열리는지 확인합니다.
- 저장소 설정에서 Issues가 활성화돼 있으면 오류·기능 제안 양식을 사용할 수 있습니다.
- 보안 문제를 비공개로 받을 계획이면 GitHub의 private vulnerability reporting을 활성화합니다. SECURITY 문서는 활성화 여부를 단정하지 않습니다.
- README의 테스트 기록은 로컬 검증 기록입니다. GitHub에서 처음 실행된 결과는 Actions에서 별도로 확인합니다.

## 첫 Release — 선택 사항

저장소 파일 업로드만으로 **Code → Download ZIP**을 통한 설치가 가능합니다. 별도의 Release를 만들려면 다음처럼 구성할 수 있습니다.

| 항목 | 값 |
|---|---|
| Tag | `v0.7-beta` |
| Release title | `PDF Tool Keys 0.7 beta` |
| Target | 실제로 업로드·검증을 마친 커밋 |
| Pre-release | 선택 |

본문에는 [CHANGELOG.md](../CHANGELOG.md)의 0.7 내용을 사용하고, 고권한 AutoConfig 도구이며 수동 설치가 필요하다는 점을 명시합니다. GitHub가 제공하는 소스 ZIP에도 설치 파일이 포함되므로 별도 빌드가 필요하지 않습니다. 게시 전 최종 커밋의 테스트 결과를 확인합니다.

이 저장소의 워크플로는 테스트만 수행합니다. 태그·Release·게시글을 자동 생성하거나 공개 상태를 변경하지 않습니다.

## Git 사용 시

이미 만든 빈 저장소를 GitHub Desktop 또는 Git으로 복제한 뒤, 이 폴더 안의 항목 전체를 복제한 저장소 루트에 복사해 커밋·푸시해도 됩니다. `.github`와 Git 설정 파일을 함께 포함하고, 테스트 실행 위치도 저장소 루트로 유지합니다.

공식 안내: [파일 업로드](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [로컬 코드 게시](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github), [README 표시](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).
