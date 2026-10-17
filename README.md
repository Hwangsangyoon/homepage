# SMART OPTIC 7.1.0

START_HERE.html을 먼저 여세요. 이메일·Resend·Supabase를 사용하지 않습니다.

1. 현재 homepage 프로젝트에 OPTIC_ADMIN_PASSWORD를 등록(직접 정한 영문+숫자 12~128자).
2. 같은 프로젝트에 전체 소스와 Functions 배포(기존 GitHub 또는 03_UPDATE_SITE.cmd).
3. 관리자 비밀번호 한 칸 로그인 → 기본설정에서 개인정보 안내 검토 후 접수 허용.

최초 패키지에는 SITE_ID.txt가 없습니다. 기존 파일은 유지하며 새 폴더라면 현재 프로젝트 ID를 입력합니다.
기존 v6/v7 데이터가 있는 Blobs 이름과 구조를 유지합니다. 새 프로젝트로 만들면 기존 데이터가 자동 이전되지 않습니다.

로컬: node scripts/dev.mjs (127.0.0.1 전용, 메모리 저장, LOCAL 테스트 비밀번호 화면 안내).
검사: npm run check (Node 내장 모듈, 실제 고객자료·외부서비스 사용 안 함).
빌드: npm run build (dist에는 공개 파일만 복사).
라이브 서버 의존성: @netlify/blobs 11.1.4, 기존 v7과 동일.

QA_REPORT.md에 검증 범위와 실제 운영에서 확인해야 할 사항이 있습니다.
