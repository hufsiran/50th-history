# 페르시아어·이란학과 50주년사 온라인 뷰어

최종 PDF와 제공된 BGM을 사용한 GitHub Pages용 완성 파일입니다. 별도 빌드나 유료 서버 없이 게시할 수 있습니다.

## 포함된 기능

- 원본 PDF의 55개 면을 108개 낱쪽으로 분리했습니다. 표지·빈 면도 그대로 유지했습니다.
- PC는 양면 책 넘김, 좁은 화면은 한 쪽 보기와 좌우 스와이프를 지원합니다.
- 자동 넘김·일시정지·속도 선택·이전/다음·페이지 번호 이동을 지원합니다.
- 원본의 QR코드 4개를 클릭하면 해당 주소가 새 탭에서 열립니다.
- 페이지마다 여러 개의 투명 링크 영역을 넣을 수 있습니다.
- 목차 27개 항목, 전체 페이지 썸네일, PDF 본문 검색이 있습니다.
- 첫 방문 안내 및 안내 다시 보기(?)를 제공합니다.
- 제공된 MP3 반복 재생·음악 켜기/끄기·음량 조절을 제공합니다.
- `config.json`으로 제목·목차·링크·음원·속도·음량·반복 여부를 바꿀 수 있습니다.
- `editor.html`에서 링크 영역을 그려 설정 파일을 만들 수 있습니다.

## 가장 쉬운 게시 방법: GitHub Desktop

파일이 200개 이상이어서 한 번에 보낼 수 있는 GitHub Desktop 사용을 권합니다.

1. ZIP 압축을 풀어 `50th-viewer` 폴더를 확인합니다. ZIP 파일 자체를 저장소에 올리지 마세요.
2. [GitHub Desktop](https://desktop.github.com/)을 설치하고 GitHub 계정으로 로그인합니다.
3. **File → New Repository**에서 이름을 `50th-history`로 지정해 새 저장소를 만듭니다.
4. **Repository → Show in Finder**(Windows에서는 Show in Explorer)로 저장소 폴더를 엽니다.
5. 압축을 푼 `50th-viewer` 폴더 **안의 모든 파일과 assets 폴더**를 그 저장소 폴더에 복사합니다. `index.html`이 저장소 최상위에 있어야 합니다.
6. GitHub Desktop의 Summary에 `50주년사 뷰어 추가`를 입력하고 **Commit to main**을 누릅니다.
7. **Publish repository**를 누릅니다. GitHub Free로 Pages를 이용할 때는 **Keep this code private**를 해제해 Public으로 만듭니다.
8. GitHub 웹사이트에서 방금 만든 저장소를 열고 **Settings → Pages**로 갑니다.
9. **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**를 선택하고 **Save**를 누릅니다.
10. 배포가 끝나면 Pages 화면의 **Visit site**로 확인합니다. 업데이트 반영에 몇 분 걸릴 수 있습니다.

기본 주소 형식: `https://계정명.github.io/50th-history/`

기관의 장기 운영이라면 기관 소유 계정/조직의 저장소에 두고 담당자를 추가하는 방식이 인수인계에 편합니다.

## 브라우저만으로 올리는 방법

GitHub 웹 업로드는 **한 번에 최대 100개 파일, 파일 하나당 25MiB**입니다. 이 패키지는 각 파일이 25MiB보다 작지만 총 파일 수가 많습니다.

1. GitHub에서 Public 저장소 `50th-history`를 만들고 README 추가를 선택합니다.
2. 저장소 최상위에서 **Add file → Upload files**로 `index.html`, `style.css`, `viewer.js`, `editor.html`, `editor.js`, `config.json`, `pages.json`, `README.md`, `QR_LINKS.csv`를 올립니다.
3. `assets/pages` 폴더를 만들기 위해 **Add file → Create new file**의 파일명에 `assets/pages/.gitkeep`를 입력하고 저장합니다. 그 폴더에서 Upload files로 `001.webp`~`080.webp`를 먼저 올리고, 다시 `081.webp`~`108.webp`를 올립니다.
4. `assets/thumbs/.gitkeep`도 같은 방법으로 만들고 썸네일을 80개와 28개로 나누어 올립니다.
5. `assets/audio/.gitkeep`를 만들고 그 폴더에 `bgm.mp3`를 올립니다.
6. 저장소 최상위에 빈 `.nojekyll` 파일을 추가합니다. 숨김 파일이 보이지 않으면 GitHub의 Create new file로 만들면 됩니다.
7. 위와 같이 Settings → Pages에서 `main`과 `/ (root)`를 선택합니다.

폴더 구조를 바꾸거나 이미지 파일명을 임의로 바꾸면 경로를 함께 수정해야 합니다.

## 파일 구조와 역할

```text
50th-viewer/
  index.html           방문자용 뷰어
  style.css            디자인·반응형 화면·책의 3D 면
  viewer.js            페이지 전환·검색·음악·목차 동작
  config.json          운영 설정·링크 영역·목차
  pages.json           페이지 파일 경로·PDF에서 추출한 검색용 본문
  editor.html          링크 영역과 설정을 만드는 도우미 화면
  editor.js            설정 도우미 동작
  QR_LINKS.csv         추출한 QR 주소와 위치 목록
  .nojekyll            정적 파일을 그대로 게시하기 위한 파일
  assets/pages/        고해상도 페이지 이미지 108장
  assets/thumbs/       작은 썸네일 108장
  assets/audio/bgm.mp3 제공된 배경음악
```

약 193MB인 원본 PDF는 업로드할 필요가 없습니다. 웹용 이미지·텍스트·음원만 포함했습니다.

## 코드 입력 없이 링크 추가·수정하기

1. 게시 주소 뒤에 `editor.html`을 붙여 엽니다. 예: `https://계정명.github.io/50th-history/editor.html`
2. 페이지 번호를 입력하고 **보기**를 누릅니다.
3. 이미지에서 마우스나 손가락으로 사각형을 그립니다.
4. 연결 주소와 설명을 입력하고 **영역 저장**을 누릅니다.
5. 한 페이지에 여러 링크가 필요하면 **새 영역**으로 반복합니다.
6. 기존 영역은 오른쪽 목록에서 선택해 수정하거나 삭제합니다.
7. 제목, 기본 넘김 간격, 음량, 반복 여부, 목차도 바꿀 수 있습니다.
8. **설정 다운로드**를 눌러 `config.json`을 받습니다.
9. GitHub 저장소의 기존 `config.json`을 새 파일로 교체하고 변경 사항을 저장합니다. 몇 분 뒤 사이트에 반영됩니다.

이 도우미는 로그인형 관리자 서버가 아닙니다. 누구나 화면을 볼 수 있지만, 방문자가 여기서 편집해도 공개 사이트는 변경되지 않습니다. GitHub 저장소에 쓸 권한이 있는 운영자가 설정 파일을 교체해야 반영됩니다. 변경 파일을 잃어버리지 않도록 작업을 마치면 다운로드하세요.

## config.json 직접 수정하기

`autoTurnSeconds`는 기본 넘김 간격(초), `volume`은 기본 음량(0~1), `loop`는 끝에서 처음으로 반복할지 여부입니다.

```json
{
  "autoTurnSeconds": 8,
  "volume": 0.45,
  "loop": false
}
```

위 예제만으로 전체 파일을 덮어쓰지 말고 **기존 파일의 해당 항목만** 바꾸세요.

`links` 배열에는 아래와 같은 항목을 여러 개 넣을 수 있습니다. `page`는 1부터 시작합니다. 좌표는 이미지의 왼쪽 위를 기준으로 한 백분율입니다.

```json
{
  "page": 61,
  "url": "https://example.com/video",
  "label": "노루즈 행사 영상 보기",
  "x": 70,
  "y": 10,
  "width": 15,
  "height": 12,
  "kind": "manual"
}
```

`toc` 배열의 항목 형식은 `{ "page": 60, "title": "노루즈 행사" }`입니다.

`pages.json`의 페이지 순서를 바꾸거나 페이지를 추가/삭제하면 `page` 번호, 목차, 링크의 페이지 번호도 맞춰 주세요. 이미지 파일만 교체하고 같은 이름을 유지하면 같은 위치의 페이지가 바뀝니다. 검색 내용도 바뀌었다면 해당 항목의 `text`를 함께 수정해야 합니다. 이 버전은 PDF를 웹에서 올려 자동 재변환하는 도구를 포함하지 않습니다.

## QR 링크

- 61페이지: `https://m.site.naver.com/2im1n`
- 63페이지: `https://m.site.naver.com/2im4y`
- 67페이지: `https://m.site.naver.com/2im7v`
- 69페이지: `https://m.site.naver.com/2im8Y`

QR코드에서 읽은 주소를 그대로 설정했습니다. 연결된 외부 자료의 재생·공개 권한은 해당 서비스 설정을 따릅니다.

## 로컬에서 미리 보기

HTML을 더블클릭하는 `file://` 방식은 JSON 불러오기가 제한될 수 있습니다. GitHub Pages에서 확인하거나, Python이 설치된 컴퓨터에서 이 폴더를 연 터미널에서 아래 명령을 실행하세요.

```sh
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/`에 접속합니다. 작업을 마치면 터미널에서 Ctrl+C로 종료합니다. Windows에서 `python3`가 없으면 `py -m http.server 8000`을 사용하세요.

## 사용상 특징

- 음악은 브라우저 정책에 맞춰 방문자가 시작 버튼 또는 음악 켜기를 눌렀을 때 재생합니다. 직접 읽기는 음악 없이 시작합니다.
- 음악과 자동 넘김은 독립적입니다. 자동 넘김을 멈춰도 음악은 계속될 수 있으므로 음악 끄기로 따로 조절할 수 있습니다.
- 일부 iPhone/iPad 브라우저는 웹페이지의 음량 제어를 제한합니다. 이 경우 기기의 음량 버튼을 사용하세요.
- 자동 넘김은 설정한 시간이 지나면 다음 펼침면(PC) 또는 다음 한 쪽(모바일)으로 이동합니다. 마지막에서는 기본적으로 멈춥니다.
- 검색은 PDF의 텍스트 추출 결과입니다. 이미지 속 글자·특수 글꼴·일부 페르시아어는 정확히 검색되지 않을 수 있습니다. 검색 결과에서 페이지로 이동하며 이미지 위에 검색어를 강조하는 기능은 포함하지 않습니다.
- 페이지 번호는 표지부터 1~108 순서입니다. 일부 원본의 인쇄 쪽수와 일치하더라도 모든 면에서 동일하다고 가정하지 않습니다.
- 첫 방문 안내 생략은 같은 브라우저의 로컬 저장소에 기록합니다. 시크릿 모드나 저장소 초기화 후에는 다시 표시됩니다.
- 외부 글꼴·광고·추적 도구·CDN 스크립트 없이 동작합니다. QR 링크를 클릭할 때만 외부 사이트로 이동합니다.
- 이미지 형태이므로 본문을 선택해 복사하거나 본문 전체를 화면 읽기 도구로 읽는 기능은 없습니다. 향후 접근성용 텍스트 읽기 화면을 별도로 추가할 수 있습니다.

## 게시 후 확인

PC와 실제 휴대폰에서 첫 화면, 양면/한 쪽 전환, 링크 4개, 검색, 음악, 음량, 마지막 페이지를 확인하세요. 특히 휴대폰의 실제 음원 재생 정책과 볼륨은 기기에서 확인해야 합니다.

## 공식 도움말

- [GitHub Pages 게시 위치 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub 파일 업로드와 제한](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
