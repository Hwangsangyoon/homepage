# SMART OPTIC v7.0.0

**먼저 START_HERE.html을 여세요. 기존 Netlify 프로젝트를 삭제하지 않습니다.**

## 변경사항
- v3 기반 디자인 유지. v6 Netlify 자료 저장소 재사용.
- 비밀번호/OPTIC_SETUP_KEY 제거, 관리자 이메일 6자리 OTP 로그인.
- 검안·고객상담·예약 신청 응답시간 제한, 중복클릭·중복저장 방지, 오류 시 입력 유지.
- 관리자 등록자료/게시글/발송이력 삭제, 휴지통 복원/영구삭제.
- 관리자 JSON 내보내기/추가 가져오기, 한국시간 매일 04:17 자료백업·만료기록 정리.

## 초기 환경변수
필수 `OPTIC_ADMIN_EMAIL`, `RESEND_API_KEY` (Functions/Production).
운영 권장 `OPTIC_FROM_EMAIL` (Resend 인증한 발신 도메인).
테스트 기본 발신자 onboarding@resend.dev는 Resend 가입 이메일로만 발송 가능.
변경 후 재배포. 기존 1111, OPTIC_SETUP_KEY, Supabase 환경변수는 v7에서 사용하지 않습니다.
실제 SMS/Kakao는 기본 비활성. SOLAPI 기존 설정은 .env.example 참고.

## 배포
기존 GitHub 저장소 → 동일 Netlify 프로젝트 연결.
Node 22 / Build `npm run check && npm run build` / Publish `dist` / Functions `netlify/functions`.
서버함수가 필요하므로 정적파일 드래그배포로 대체하지 마세요.
선택 CLI: 01_LOGIN.cmd → 03_UPDATE_SITE.cmd, 현재 Project ID 입력. SITE_ID.txt는 의도적으로 빈 파일입니다.

## 로컬 시험
`npm test`, `npm run build`는 외부서비스 없이 시험 가능.
`npm run dev`는 127.0.0.1:8877 루프백 모의환경. 실제 메일/데이터와 무관하며 재시작하면 초기화.
로컬 인증번호는 개발용 콘솔에만 출력. 운영 서버에는 이러한 경로가 없습니다.
실제 Netlify SDK 설치는 `npm install` 필요. SDK @netlify/blobs 11.1.4 고정.

## 데이터 중요사항
store 이름 optic-v6-data, optic-v6-media를 절대로 버전별로 바꾸지 않습니다.
getStore는 사이트범위이므로 배포버전 간 자료를 공유. 같은 프로젝트의 Draft도 실제 자료를 공유합니다.
새 프로젝트로 이전하면 자동이관되지 않습니다. Supabase 자료도 자동이관되지 않습니다.
JSON 백업에는 이미지 바이너리·인증비밀키 제외. 사진 원본 별도 보관.
삭제된 자료는 30일 휴지통, 기존 JSON백업 사본은 최근7일 남을 수 있음.
현재 백업은 논리적 레코드 사본이며 트랜잭션 시점백업/독립재해복구가 아닙니다.

## 검증
실제 수행결과 docs/QA_REPORT.md 참고. 실계정 배포·메일 전달·외부발송은 아직 수행하지 않았습니다.
