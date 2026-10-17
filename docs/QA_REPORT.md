# v6.0.0 로컬 검증 결과

- JavaScript 구문검사: 9/9
- Node 서버 자동테스트: 통과 53, 실패 0
- 공개 폴더 빌드: 성공
- 격리 브라우저 점검: 통과 10, 실패 1

## 범위
서버 테스트는 실제 Netlify SDK 대신 MemoryStore 어댑터를 사용합니다. UI는 로컬 API에 연결한 격리 브라우저(about:blank 주입)로 검사했습니다. 관리형 브라우저의 URL 정책을 변경하지 않았습니다. 실제 Netlify/GitHub/Hosting.kr 계정 배포·DNS/TLS·유료 문자/카카오 발송·외부 침투시험은 수행하지 않았습니다.

## 운영 전 확인
Netlify의 npm 설치 및 Functions 빌드, Blobs 저장 유지, 소유자 코드, 새 비밀번호, 공개 제목/비밀 본문, 사진 업로드, 독립 브라우저 조회, 실제 DNS와 HTTPS를 확인해야 합니다. 테스트 성공이 서비스 전체의 보안·법적 적합성이나 실계정 배포 성공을 보장하지 않습니다.

## UI 검사 제한/실패
- Locator.fill: Error: strict mode violation: locator("textarea[name=content]") resolved to 2 elements:
    1) <textarea name="content"></textarea> aka locator("#app textarea[name=\"content\"]")
    2) <textarea name="content"></textarea> aka get_by_label("새 자료 등록").locator("textarea[name=\"content\"]")

Call log:
  - waiting for locator("textarea[name=content]")

