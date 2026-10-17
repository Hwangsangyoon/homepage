export const VERSION='7.1.0';
export const SETTINGS={
 storeName:'스마트삼성구내안경원',englishName:'Smart Optic',owner:'황상윤',phone:'010-4170-7575',bizno:'454-13-03335',
 address:'경북 구미시 삼성 구미 제2캠퍼스 내 구내 매장',hours:'평일 근무시간 중심 운영 · 방문 전 문의',holiday:'캠퍼스 운영일정 및 매장 휴무 공지를 확인해 주세요.',
 heroTitle:'당신의 눈을 위한\n스마트한 선택',heroText:'정밀 검안과 맞춤 상담, 편안한 착용과 꾸준한 사후관리까지. 당신의 시생활에 어울리는 안경을 함께 찾습니다.',
 aboutText:'안경을 고르는 순간부터 다시 찾아오시는 날까지. 황상윤 안경사의 현장 경험을 바탕으로 고객의 시생활과 착용감을 세심하게 살피는 구내 안경원입니다.',
 visitText:'캠퍼스 출입이 가능한 내부 이용자를 대상으로 운영합니다. 외부 방문 및 촬영은 제한되므로 방문 가능 여부와 동선은 매장으로 문의해 주세요.',
 heroImage:'assets/store_main.jpg',aboutImage:'assets/store_interior.jpg',locationImage:'assets/store_main.jpg',mainImage:'assets/store_main.jpg',
 popupEnabled:true,popupEventId:'event-october-2026',popupTitle:'10월, 당신의 시선을 위한 혜택',popupStart:'2026-10-01',popupEnd:'2026-10-31',popupRevision:'1',
 acceptingPosts:false,privacyReviewed:false,
 privacyText:'상담·예약 접수와 답변을 위해 이름, 연락처, 신청 내용을 수집합니다. 공개 제목에 개인정보를 적지 마세요. 실제 운영 전 관리자는 수집 목적·항목·보유기간·삭제 요청 연락처를 검토하고 이 문구를 확정해야 합니다.',
};
export const PRODUCT_SEEDS=[
 {id:'seed-frame',category:'안경테',brand:'FRAME COLLECTION',name:'나에게 맞는 안경테',price:'매장 상담',desc:'무게와 착용감, 얼굴형과 스타일을 함께 살펴보세요. 브랜드와 재고는 방문 전 문의해 주세요.',image:'assets/frame_brand.jpg',featured:true,published:true},
 {id:'seed-lens',category:'렌즈',brand:'LENS CONSULTATION',name:'생활에 맞춘 렌즈 상담',price:'매장 상담',desc:'사용거리와 시력, 생활환경을 고려하여 적합한 렌즈를 상담합니다.',image:'assets/lens_brand.jpg',featured:true,published:true},
 {id:'seed-contact',category:'콘택트렌즈',brand:'CONTACT LENS',name:'콘택트렌즈 상담',price:'매장 상담',desc:'제품별 사용법과 관리 방법을 매장에서 안내합니다.',image:'assets/contact_lens.jpg',featured:true,published:true},
 {id:'seed-sun',category:'선글라스',brand:'SUN COLLECTION',name:'빛을 고르는 스타일',price:'매장 상담',desc:'사용환경과 착용감을 고려한 선글라스를 만나보세요.',image:'assets/brand_board.jpg',featured:false,published:true},
 {id:'seed-sport',category:'고글',brand:'SPORT COLLECTION',name:'움직임을 위한 선택',price:'매장 상담',desc:'활동에 맞는 스포츠 아이웨어와 고글을 상담해 보세요.',image:'assets/sports.jpg',featured:false,published:true}
];
export const EVENT_SEEDS=[{id:'event-october-2026',title:'10월 특별 할인 행사 & 무료 시력검사',kind:'event',content:'국산·수입 안경테, 스포츠·패션 선글라스, 누진 렌즈 및 팩렌즈 행사 안내입니다. 품목·브랜드별 할인율과 적용 조건이 다르므로 첨부 안내문을 확인하고 매장에 문의해 주세요.',image:'assets/october-2026.jpg',startDate:'2026-10-01',endDate:'2026-10-31',active:true}];
export const TEMPLATE_SEEDS=[
 {id:'tpl-reservation',name:'방문예약 확인',type:'LMS',content:'[스마트삼성구내안경원]\n고객님, 예약 내용을 확인했습니다. 방문일시: {예약일시}\n변경이 필요하시면 010-4170-7575로 연락해 주세요.',templateId:''},
 {id:'tpl-ready',name:'제품 수령 안내',type:'LMS',content:'[스마트삼성구내안경원]\n요청하신 제품이 준비되었습니다. 방문 가능 시간을 매장으로 확인해 주세요.\n문의: 010-4170-7575',templateId:''},
 {id:'tpl-reply',name:'문의 답변 안내',type:'SMS',content:'[스마트삼성구내안경원] 문의에 답변을 등록했습니다. 홈페이지에서 확인해 주세요.',templateId:''}
];
export const COLLECTIONS=['products','inventory','customers','consultations','orders','events','messageTemplates','legacyInquiries','legacyReservations','legacyMessages'];
