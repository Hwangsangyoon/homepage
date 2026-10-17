# 변경 근거와 검증 구분
원본: 이 대화에서 제공된 v7 ZIP(7.0.0).
요청: 관리자 비밀번호 방식, 기존 운영자료 보존, 외부 메일 가입/인증 제거.

공식 문서(2026-10-17 확인):
- https://docs.netlify.com/build/functions/environment-variables/ — Functions 범위, 환경변수 변경 후 새 배포
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/ — 사이트 범위 저장소, strong consistency, conditional writes
- https://cli.netlify.com/commands/deploy/ — dir/functions/prod/no-build 옵션
- https://nodejs.org/api/crypto.html — scrypt / timingSafeEqual

구현 및 검사결과는 소스코드와 QA_REPORT.md를 기준으로 함. 공식 문서가 이 앱의 라이브 배포 성공을 보증하지 않음.
