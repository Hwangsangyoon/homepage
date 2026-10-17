# SMART OPTIC v6.0.0

v3 디자인 기반 / Netlify Functions + Blobs / GitHub 배포. Supabase 미사용.

1. START_HERE.html을 열어 전체 안내를 확인합니다.
2. GitHub 새 비공개 저장소에 파일을 루트에 업로드합니다.
3. 기존 Netlify 프로젝트에 OPTIC_SETUP_KEY(20자 이상 난수)를 등록하고 저장소를 연결합니다.
4. build: npm run build, publish: dist, functions: netlify/functions, Node22.
5. 초기 관리자1111 + 소유자 설정코드 → 비밀번호12자 이상 변경 → 개인정보안내 검토 → 접수열기.

## 로컬 시연
Node22에서 npm test, npm run build, npm run dev. 로컬 시연자료는 메모리 저장이며 서버 종료 시 초기화됩니다. 실제 고객자료는 넣지 마세요.

## 배포 주의
GitHub 연결 빌드를 사용합니다. 화면 파일만 드롭하면 서버 저장기능이 배포되지 않습니다. Netlify Blobs는 같은 프로젝트 내 배포가 공유하므로 시험배포도 실제자료를 수정할 수 있습니다.

## 운영
사진·팝업·글 답변·제품정보는 관리자 화면에서 저장합니다. 코드수정만 GitHub Commit → Netlify 자동배포로 진행합니다. 코드rollback과 데이터rollback은 별개입니다.

## 백업
고객 백업JSON과 원본이미지는 비공개로 별도보관합니다. 가져오기는 추가형입니다. 설정·사진·전체메시지 완전복원은 별도검토합니다.

## 외부 연동
SOLAPI는 선택 사항이며 기본실제발송OFF. SMS/알림톡은업체계정·발신번호·템플릿승인·과금설정이별도로필요합니다.
