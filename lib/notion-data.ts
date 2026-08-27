/** Sample pages copied into a new user's workspace on first login. */
export type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'text'; text: string }
  | { type: 'todo'; text: string; checked: boolean }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; text: string; index: number }
  | { type: 'quote'; text: string }
  | { type: 'callout'; icon: string; text: string }
  | { type: 'divider' }
  | { type: 'image'; src: string; caption?: string }

export type NotionPage = {
  id: string
  icon: string
  title: string
  cover?: string
  parentId?: string
  blocks: Block[]
}

export type NavItem = {
  id: string
  icon: string
  title: string
  children?: NavItem[]
}

export const pages: NotionPage[] = [
  {
    id: 'getting-started',
    icon: '📝',
    title: '시작하기',
    cover: '/covers/gradient-cover.svg',
    blocks: [
      {
        type: 'callout',
        icon: '👋',
        text: 'Notion에 오신 것을 환영해요! 이 페이지에서 기본 사용법을 익혀보세요.',
      },
      { type: 'h1', text: '기본 기능' },
      {
        type: 'text',
        text: '아무 곳이나 클릭하고 입력을 시작하세요. 글자를 선택하면 서식 메뉴가 나타납니다.',
      },
      { type: 'todo', text: '제목 옆의 아이콘 바꿔보기', checked: true },
      { type: 'todo', text: '새로운 페이지 만들어보기', checked: true },
      { type: 'todo', text: '텍스트에 굵게, 기울임 서식 적용하기', checked: false },
      { type: 'todo', text: '팀원 초대하고 함께 편집하기', checked: false },
      { type: 'divider' },
      { type: 'h2', text: '블록으로 무엇이든 만들기' },
      {
        type: 'text',
        text: '`/`를 입력하면 텍스트, 이미지, 표, 할 일 목록 등 다양한 블록을 추가할 수 있어요.',
      },
      { type: 'bullet', text: '텍스트와 제목' },
      { type: 'bullet', text: '할 일 목록과 체크박스' },
      { type: 'bullet', text: '이미지, 파일, 임베드' },
      { type: 'bullet', text: '데이터베이스와 표' },
      {
        type: 'quote',
        text: '작은 것부터 시작하세요. 하나의 페이지가 곧 하나의 습관이 됩니다.',
      },
    ],
  },
  {
    id: 'journal',
    icon: '📔',
    title: '일기',
    cover: '/covers/mountain-cover.svg',
    blocks: [
      { type: 'h1', text: '2026년 8월 25일' },
      {
        type: 'text',
        text: '오늘은 새로운 워크스페이스를 정리했다. 흩어져 있던 메모를 한곳에 모으니 마음이 한결 가볍다.',
      },
      { type: 'h2', text: '오늘 감사한 일' },
      { type: 'numbered', text: '아침의 맑은 공기', index: 1 },
      { type: 'numbered', text: '오랜만에 만난 친구와의 대화', index: 2 },
      { type: 'numbered', text: '무사히 끝낸 프로젝트 회의', index: 3 },
      { type: 'divider' },
      { type: 'h2', text: '내일의 다짐' },
      { type: 'todo', text: '아침 산책 30분', checked: false },
      { type: 'todo', text: '책 20페이지 읽기', checked: false },
    ],
  },
  {
    id: 'tasks',
    icon: '✅',
    title: '할 일 목록',
    blocks: [
      { type: 'h1', text: '이번 주 할 일' },
      {
        type: 'callout',
        icon: '⚡',
        text: '우선순위가 높은 일부터 처리하세요. 완료하면 체크박스를 눌러 지워보세요.',
      },
      { type: 'h2', text: '진행 중' },
      { type: 'todo', text: '분기 보고서 초안 작성', checked: false },
      { type: 'todo', text: '디자인 시안 피드백 정리', checked: false },
      { type: 'todo', text: '신규 기능 스펙 문서화', checked: false },
      { type: 'h2', text: '완료' },
      { type: 'todo', text: '주간 회의 준비', checked: true },
      { type: 'todo', text: '고객 이메일 회신', checked: true },
    ],
  },
  {
    id: 'reading',
    icon: '📚',
    title: '독서 기록',
    blocks: [
      { type: 'h1', text: '2026년에 읽은 책' },
      {
        type: 'text',
        text: '읽은 책과 인상 깊었던 문장을 기록하는 공간입니다.',
      },
      { type: 'h2', text: '읽는 중' },
      { type: 'bullet', text: '『생각에 관한 생각』 — 대니얼 카너먼' },
      { type: 'bullet', text: '『아주 작은 습관의 힘』 — 제임스 클리어' },
      { type: 'h2', text: '완독' },
      { type: 'bullet', text: '『몰입』 — 미하이 칙센트미하이' },
      { type: 'bullet', text: '『디자인의 디자인』 — 하라 켄야' },
      { type: 'divider' },
      {
        type: 'quote',
        text: '"우리는 반복적으로 행하는 것의 결과다. 그러므로 탁월함은 행위가 아니라 습관이다."',
      },
    ],
  },
  {
    id: 'goals',
    icon: '🎯',
    title: '목표',
    parentId: undefined,
    blocks: [
      { type: 'h1', text: '2026 연간 목표' },
      {
        type: 'callout',
        icon: '🌱',
        text: '큰 목표를 분기별로 쪼개면 훨씬 실천하기 쉬워집니다.',
      },
      { type: 'h2', text: '건강' },
      { type: 'todo', text: '주 3회 운동 습관 만들기', checked: true },
      { type: 'todo', text: '수면 시간 7시간 확보', checked: false },
      { type: 'h2', text: '커리어' },
      { type: 'todo', text: '사이드 프로젝트 하나 완성', checked: false },
      { type: 'todo', text: '기술 아티클 12편 작성', checked: false },
    ],
  },
  {
    id: 'goals-q1',
    icon: '📈',
    title: '1분기 계획',
    parentId: 'goals',
    blocks: [
      { type: 'h1', text: '1분기 (1월–3월)' },
      { type: 'todo', text: '운동 루틴 자리잡기', checked: true },
      { type: 'todo', text: '독서 4권', checked: false },
      { type: 'todo', text: '포트폴리오 리뉴얼', checked: false },
    ],
  },
  {
    id: 'goals-q2',
    icon: '🚀',
    title: '2분기 계획',
    parentId: 'goals',
    blocks: [
      { type: 'h1', text: '2분기 (4월–6월)' },
      { type: 'todo', text: '사이드 프로젝트 MVP 출시', checked: false },
      { type: 'todo', text: '기술 발표 1회', checked: false },
    ],
  },
]
