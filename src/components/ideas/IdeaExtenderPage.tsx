import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Search,
  Brain,
  Users,
  Boxes,
  Timer,
  Copy,
  Check,
  Printer,
  Home,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { CourseId } from '../../types';

export interface TopicItem {
  id: string;
  keywords: string[];
  tag: string;
  category: string;
  title: string;
  hook: string;
  concepts: string[];
  audience: string[];
  outputs: string[];
  timeline: string[];
  linkedLab?: {
    course: CourseId;
    label: string;
  };
}

export const PRESET_TOPICS: TopicItem[] = [
  {
    id: "monty",
    keywords: ["몬티홀", "몬티 홀", "조건부확률", "확률", "베이즈", "선택", "문"],
    tag: "몬티 홀의 역설",
    category: "확률과 통계",
    title: "몬티 홀(Monty Hall) 문제: 직접 열어보는 3개의 문과 확률의 역설",
    hook: "“선생님, 지금 선택하신 1번 문 대신 남아있는 2번 문으로 바꾸시겠습니까? 과연 바꾸는 게 진짜 이득일까요?”",
    concepts: [
      "<strong>중등 연계:</strong> 확률의 기본 성질 (사건의 경우의 수 / 전체 경우의 수)",
      "<strong>심화 개념:</strong> 새로운 정보(염소 문 개방)가 추가되었을 때 표본공간의 축소와 조건부 확률",
      "<strong>수학적 원리:</strong> 선택을 유지할 때 당첨 확률은 1/3, 선택을 변경할 때 당첨 확률은 2/3로 2배 증가"
    ],
    audience: [
      "<strong>현장 시연:</strong> 청중 중 1명을 발표 무대로 불러 3개의 상자/문 중 하나를 고르게 함",
      "<strong>실시간 표 집계:</strong> 웹 앱 또는 주사위/카드 모의실험으로 10회 연속 선택 변경 시 결과 데이터 즉석 그래프화",
      "<strong>착시 해소:</strong> '어차피 남은 건 2개니까 반반(50:50) 아냐?'라는 청중의 직관을 깨뜨리는 대조"
    ],
    outputs: [
      "<strong>실물 교구:</strong> 3D 프린터나 폼보드로 제작한 자석식 미니 도어 세트 (열면 양/자동차 등장)",
      "<strong>소프트웨어:</strong> 파이썬/스크래치로 제작한 '1만 회 자동 시뮬레이터' 및 승률 수렴 실시간 차트",
      "<strong>확장 연구:</strong> 문이 4개, 10개, 100개로 늘어났을 때 일반화 공식 도출"
    ],
    timeline: [
      "<strong>0:00~0:45:</strong> 청중 참여 실험 진행 (문 선택 및 사회자 개입)",
      "<strong>0:45~1:45:</strong> 수형도(Tree Diagram)를 이용한 1/3 vs 2/3 수학적 원리 규명",
      "<strong>1:45~2:30:</strong> 1만 회 컴퓨터 시뮬레이션 결과와 실생활 거짓 양성 역설 확장",
      "<strong>2:30~3:00:</strong> 질의응답 및 '직관을 검증하는 수학의 힘' 결론"
    ]
  },
  {
    id: "nim",
    keywords: ["님 게임", "님게임", "님-합", "nim", "xor", "게임이론", "바둑돌"],
    tag: "님(Nim) 게임 필승전략",
    category: "이산수학 & 2진법",
    title: "님(Nim) 게임 vs 인공지능: 청중과의 1:1 두뇌 대결",
    hook: "“바둑돌 3줄을 놓고 저와 대결하실 분 계신가요? 단, 저는 수학의 법칙으로 무조건 이깁니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 소인수분해, 정수의 성질, 거듭제곱과 2진법",
      "<strong>심화 개념:</strong> 비트 단위 배타적 논리합(XOR 연산, Nim-Sum)",
      "<strong>수학적 원리:</strong> 모든 무더기의 돌 개수를 2진법으로 나타낸 뒤 각 자리수의 합이 짝수(Nim-sum=0)가 되도록 상대에게 넘기면 반드시 승리"
    ],
    audience: [
      "<strong>즉석 대결:</strong> 지원자 1명과 3-4-5 개수의 바둑돌 무더기로 라이브 대전",
      "<strong>화면 중계:</strong> 뒷배경 스크린에 현재 돌의 개수가 실시간 2진수 비트 블록으로 계산되는 화면을 띄워 청중에게만 힌트 공유"
    ],
    outputs: [
      "<strong>인터랙티브 웹:</strong> HTML/JS로 제작한 '절대 지지 않는 님 게임 AI 대전 웹사이트'",
      "<strong>실물 교구:</strong> 2진수 비트 스위치가 달린 LED 아크릴 님 게임 전용 게임판",
      "<strong>확장 연구:</strong> 돌을 가져갈 수 있는 최대 개수를 제한한 '서브트랙션 게임' 및 3인 대전 규칙 확장"
    ],
    timeline: [
      "<strong>0:00~0:50:</strong> 청중과의 1:1 라이브 대결 및 패배 유도",
      "<strong>0:50~1:50:</strong> 10진수를 2진수로 변환하여 짝/홀 비트 균형 맞추기 원리 설명",
      "<strong>1:50~2:40:</strong> 자체 제작한 님-합 계산 교구/소프트웨어 시연",
      "<strong>2:40~3:00:</strong> 승리 상태(P-position)와 패배 상태(N-position) 요약"
    ]
  },
  {
    id: "miura",
    keywords: ["미우라", "미우라접기", "종이접기", "오리가미", "테셀레이션", "우주", "태양전지"],
    tag: "미우라 접기와 우주공학",
    category: "기하학 & 공학 융합",
    title: "종이 한 장의 마법: 미우라 접기(Miura-ori)와 우주 전개 기술",
    hook: "“지도나 태양전지판을 접을 때 왜 모서리가 찢어질까요? 대각선 하나만 당기면 한 번에 펴지는 종이가 있습니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 평행사변형의 성질, 다각형의 내각의 합, 평면 테셀레이션",
      "<strong>심화 개념:</strong> 강체 종이접기(Rigid Origami)와 가우스 곡률(Gaussian Curvature)",
      "<strong>수학적 원리:</strong> 면 자체는 휘어지지 않고 접는 선(힌지)의 각도 회전만으로 2차원 평면을 최소 부피의 1차원 선형으로 접는 공간 압축"
    ],
    audience: [
      "<strong>동시 체험:</strong> 청중석에 미리 배포한 미니 미우라 패턴 종이를 다 함께 양 끝을 잡고 당겨보게 유도",
      "<strong>극적 비교:</strong> 전통적인 격자 접기 지도 vs 미우라 접기 지도의 펼침 속도 대결"
    ],
    outputs: [
      "<strong>실물 전시물:</strong> 두꺼운 하드보드지/플라스틱 판에 힌지를 연결해 제작한 강체 미우라 대형 패널",
      "<strong>공학 모델:</strong> 인공위성 솔라 패널의 수축-전개 미니어처 모델",
      "<strong>확장 연구:</strong> 평행사변형의 예각/둔각 각도 변화에 따른 수축률(면적 감소 비율) 삼각비 계산"
    ],
    timeline: [
      "<strong>0:00~0:40:</strong> 일반 지도 접기의 구겨짐 vs 미우라 접기의 1초 전개 시연",
      "<strong>0:40~1:40:</strong> 평행사변형 내각의 합과 꼭짓점에서의 각도 관계 기하학적 분석",
      "<strong>1:40~2:30:</strong> 우주 태양광 패널 및 스텐트 의료기기 적용 사례 소개",
      "<strong>2:30~3:00:</strong> 일상 속 기하학이 공학적 문제를 해결하는 방식 강조"
    ]
  },
  {
    id: "menger",
    keywords: ["멩거", "멩거스펀지", "프랙탈", "차원", "겉넓이", "부피", "시에르핀스키"],
    tag: "3D 멩거 스펀지 프랙탈",
    category: "입체도형 & 차원",
    title: "3D 멩거 스펀지: 뚫을수록 가벼워지는데 겉넓이는 무한대?",
    hook: "“물체에 구멍을 뚫을수록 가벼워집니다. 그렇다면 페인트칠할 면적도 줄어들까요? 수학적으로는 무한대가 됩니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 입체도형의 겉넓이와 부피, 닮음비와 부피비(1:k:k²:k³)",
      "<strong>심화 개념:</strong> 프랙탈 차원(하우스도르프 차원 log₃20 ≈ 2.727차원)",
      "<strong>수학적 원리:</strong> 단계마다 부피는 (20/27)ⁿ → 0으로 수렴, 겉넓이는 점화식에 의해 무한대로 발산"
    ],
    audience: [
      "<strong>단계별 시각화:</strong> 0단계(정육면체) → 1단계 → 2단계 실물 모형을 차례대로 청중에게 보여주며 직관적 인지부조화 유발"
    ],
    outputs: [
      "<strong>3D 프린팅 / 블록 교구:</strong> 정밀 3D 프린터 또는 나노블록으로 조립한 멩거 스펀지 1, 2단계 실물",
      "<strong>데이터 시트:</strong> 단계별 부피와 겉넓이의 증감을 계산한 엑셀 수열 그래프 패널",
      "<strong>확장 연구:</strong> 시에르핀스키 사면체와 멩거 스펀지의 부피 소멸 속도 비교"
    ],
    timeline: [
      "<strong>0:00~0:45:</strong> 멩거 스펀지 실물 제시 및 '부피 0, 겉넓이 무한대' 역설 제기",
      "<strong>0:45~1:45:</strong> 한 변의 길이가 1/3로 줄어들 때 20개 블록이 남는 닮음 계산",
      "<strong>1:45~2:30:</strong> n단계 일반항 도출 및 극한 그래프 비교",
      "<strong>2:30~3:00:</strong> 모바일 안테나 및 단열재에 응용되는 프랙탈 기술 결론"
    ]
  },
  {
    id: "voronoi",
    keywords: ["보로노이", "보로노이다이어그램", "외심", "수직이등분선", "최적화", "편의점", "소방서"],
    tag: "보로노이 다이어그램",
    category: "기하학 & 도시계획",
    title: "보로노이 다이어그램: 가장 가까운 편의점은 어디인가?",
    hook: "“길에서 갑자기 다쳤을 때, 가장 가까운 응급실은 어떻게 찾을까요? 지도에 선 몇 개만 그으면 완벽한 영역이 나옵니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 선분의 수직이등분선의 성질, 삼각형의 외심",
      "<strong>심화 개념:</strong> 델로네 삼각분할(Delaunay Triangulation)과 쌍대 그래프",
      "<strong>수학적 원리:</strong> 평면 위의 점들 중 임의의 위치에서 가장 가까운 기준점을 기준으로 영역을 분할하는 알고리즘"
    ],
    audience: [
      "<strong>실시간 동적 시연:</strong> 지오지브라 화면을 띄워두고, 청중이 부르는 좌표에 점을 찍을 때마다 영역 경계선이 실시간으로 재계산되는 과정 연출"
    ],
    outputs: [
      "<strong>시뮬레이션 지도:</strong> 실제 학교 주변 소방서/편의점 위치 데이터를 기반으로 한 보로노이 행정구역 맵",
      "<strong>아크릴 오버레이:</strong> 실제 지도 투명 필름 위에 레이저 커팅/드로잉한 보로노이 분할판 겹쳐보기",
      "<strong>확장 연구:</strong> '새로운 편의점/소방서를 어디에 신설해야 사각지대가 가장 효율적으로 줄어드는가?' 최적 입지 제안"
    ],
    timeline: [
      "<strong>0:00~0:40:</strong> 가장 가까운 장소를 결정하는 수학적 방법 문제 제기",
      "<strong>0:40~1:40:</strong> 수직이등분선의 교점(외심)을 통해 경계선이 생기는 작도 원리 시연",
      "<strong>1:40~2:30:</strong> 실제 도시 지도를 보로노이로 분석한 안전 사각지대 분석 결과 발표",
      "<strong>2:30~3:00:</strong> 잠자리 날개 맥, 기린 무늬 등 자연 속 보로노이 소개"
    ]
  },
  {
    id: "fermat",
    keywords: ["페르마", "페르마포인트", "페르마 포인트", "비누막", "슈타이너", "최단거리", "120도"],
    tag: "페르마 포인트와 비누막",
    category: "기하학 & 물리 융합",
    title: "1초 만에 풀리는 최단거리: 비누막과 페르마 포인트(Fermat Point)",
    hook: "“세 도시를 연결하는 고속도로를 가장 짧게 짓는 방법! 복잡한 미분 계산을 비눗방울은 단 1초 만에 풀어냅니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 점과 직선 사이의 거리, 삼각형의 성질, 회전이동",
      "<strong>심화 개념:</strong> 슈타이너 트리(Steiner Tree) 문제 및 표면장력 에너지 최소화",
      "<strong>수학적 원리:</strong> 세 각이 모두 120도 미만인 삼각형 내부의 점에서 세 꼭짓점에 이르는 거리의 합이 최소가 되는 점은 각 변을 바라보는 각이 120도인 점"
    ],
    audience: [
      "<strong>현장 실험 시연:</strong> 아크릴 삼각 기둥 틀을 비눗물 수조에 담갔다 꺼냈을 때 중앙에 120도로 모이는 비누막을 청중에게 직접 라이브로 보여주기"
    ],
    outputs: [
      "<strong>실험 키트:</strong> 투명 아크릴판과 볼트로 제작한 삼각형, 사각형, 오각형 가변형 비누막 실험 기구",
      "<strong>지오지브라 모델:</strong> 꼭짓점을 드래그할 때 페르마 포인트 위치와 세 거리의 합(PA+PB+PC)이 실시간 최소값으로 고정되는 작도 파일",
      "<strong>확장 연구:</strong> 4개 점(사각형)일 때 대각선 교점이 아닌 2개의 슈타이너 점이 생기는 현상 분석"
    ],
    timeline: [
      "<strong>0:00~0:50:</strong> 세 마을을 잇는 도로 문제 제시 후 비누막 즉석 침수 실험 시연",
      "<strong>0:50~1:50:</strong> 정삼각형을 바깥쪽에 붙여 60도 회전이동을 통해 최단거리를 일직선으로 증명",
      "<strong>1:50~2:30:</strong> 비누막 표면장력(물리)과 페르마 포인트(수학)의 융합 원리 설명",
      "<strong>2:30~3:00:</strong> 통신 케이블망 설계에서의 응용 및 시사점"
    ],
    linkedLab: {
      course: 'geometry',
      label: '기하 최적화 페르마 점 실험실',
    }
  },
  {
    id: "euler",
    keywords: ["오일러", "한붓그리기", "오일러경로", "그래프이론", "동선", "다리", "축제"],
    tag: "그래프 이론과 축제 최적 동선",
    category: "이산수학 & 그래프이론",
    title: "우리 학교 축제/등굣길 최단 동선: 그래프 이론과 한붓그리기",
    hook: "“축제 때 모든 부스를 빠짐없이, 줄도 겹치지 않고 가장 빠르게 도는 비밀 통로가 있다면 믿으시겠습니까?”",
    concepts: [
      "<strong>중등 연계:</strong> 입체도형의 꼭짓점·모서리·면의 개수, 논리적 추론",
      "<strong>심화 개념:</strong> 오일러 경로(Eulerian Path) 조건 (홀수점의 개수가 0개 또는 2개)",
      "<strong>수학적 원리:</strong> 모든 연결선의 차수(Degree) 분석을 통해 중복 없이 전체를 순회할 수 있는 가능성 판별"
    ],
    audience: [
      "<strong>청중 퀴즈:</strong> 쾨니히스베르크의 7개 다리 또는 학교 평면도를 화면에 띄우고 10초 안에 한붓그리기가 가능한지 손들어보게 하기"
    ],
    outputs: [
      "<strong>교내 그래프 맵:</strong> 학교 건물 평면도를 점(교실/부스)과 선(복도/계단)으로 추상화한 대형 다이어그램",
      "<strong>웹 동선 시뮬레이터:</strong> 출발 지점 입력 시 최적 순회 순서를 화살표로 애니메이션해 주는 웹 페이지",
      "<strong>확장 연구:</strong> '임시 통로를 딱 1개만 신설한다면 어느 복도에 만들어야 홀수점이 짝수점으로 바뀌어 최적 순회가 가능할까?' 제안서"
    ],
    timeline: [
      "<strong>0:00~0:40:</strong> 쾨니히스베르크 다리 건너기 퀴즈로 청중 참여 유도",
      "<strong>0:40~1:40:</strong> 들어온 선만큼 나가야 한다는 원리로 짝수점/홀수점 정리 유도",
      "<strong>1:40~2:30:</strong> 실제 우리 학교 건물에 적용한 오일러 경로 최적화 결과 발표",
      "<strong>2:30~3:00:</strong> 택배 배송 및 로봇 청소기 동선 알고리즘과의 연계 결론"
    ],
    linkedLab: {
      course: 'diffusion',
      label: '네트워크 모델링 실험실',
    }
  },
  {
    id: "golden",
    keywords: ["황금비", "피보나치", "피보나치수열", "캘리퍼스", "비율", "나선", "카드"],
    tag: "황금비 캘리퍼스 측정",
    category: "수와 연산 & 기하",
    title: "내 얼굴도 피보나치? 황금비 캘리퍼스로 재보는 일상 속 비율",
    hook: "“이 신용카드, A4 용지, 그리고 여러분의 손가락 마디에는 고대 그리스부터 내려온 1:1.618이 숨어있습니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 비례식과 비례배분, 이차방정식 (x² - x - 1 = 0)",
      "<strong>심화 개념:</strong> 피보나치 수열의 이웃한 두 항의 비의 극한 (lim F_{n+1}/F_n = φ)",
      "<strong>수학적 원리:</strong> 전체 대 긴 부분 = 긴 부분 대 짧은 부분의 비가 항상 약 1:1.618을 유지하는 기하학적 메커니즘"
    ],
    audience: [
      "<strong>즉석 신체 측정:</strong> 3D 프린터로 뽑은 연동형 황금비 캘리퍼스를 들고 객석으로 내려가 청중의 손가락 마디나 얼굴 비율을 직접 대어보기"
    ],
    outputs: [
      "<strong>실물 교구:</strong> 4개의 다리가 링크 구조로 연결되어 벌리는 너비와 무관하게 항상 황금비를 유지하는 3D 출력 캘리퍼스",
      "<strong>비율 판별 웹:</strong> 얼굴 사진이나 사물 사진을 업로드하면 황금 나선(Golden Spiral)을 오버레이해주는 분석 툴",
      "<strong>확장 연구:</strong> 일상 속 진짜 황금비(신용카드, 명함)와 착각하기 쉬운 백은비(1:√2, A4 용지)의 수학적 차이 비교"
    ],
    timeline: [
      "<strong>0:00~0:45:</strong> 황금비 캘리퍼스를 벌리며 기계적 원리 시연 및 관객 측정",
      "<strong>0:45~1:45:</strong> 피보나치 정사각형 타일링과 황금비 이차방정식 유도",
      "<strong>1:45~2:30:</strong> 주변 사물 50종 직접 측정 통계 데이터 제시 (진짜 황금비 vs 가짜 황금비)",
      "<strong>2:30~3:00:</strong> 황금비에 대한 맹신을 비판적으로 검증하는 수학적 태도 제시"
    ]
  },
  {
    id: "rsa",
    keywords: ["암호", "rsa", "소수", "모듈러", "합동식", "정수론", "비밀", "보안"],
    tag: "소수와 공개키 암호 원판",
    category: "정수론 & 정보보안",
    title: "스파이의 비밀 편지: 시저 암호부터 모듈러 연산 공개키 암호까지",
    hook: "“자물쇠는 모두에게 공개되어 있는데, 열쇠는 저만 가지고 있습니다. 어떻게 편지를 안전하게 보낼까요?”",
    concepts: [
      "<strong>중등 연계:</strong> 소수(Prime Number)의 성질, 소인수분해, 나머지 연산",
      "<strong>심화 개념:</strong> 모듈러(Modular) 합동식, 일방향 함수(One-way Function)",
      "<strong>수학적 원리:</strong> 두 큰 소수의 곱은 구하기 쉽지만(p × q = N), 그 곱을 다시 소인수분해하는 것은 엄청난 계산 시간이 걸린다는 비대칭성"
    ],
    audience: [
      "<strong>암호문 해독 미션:</strong> 발표 화면에 암호화된 숫자 3개를 띄우고, 종이 암호 해독 원판을 가진 청중 대표가 직접 돌려 풀어보게 함"
    ],
    outputs: [
      "<strong>실물 교구:</strong> 회전식 2중/3중 암호 원판(Cipher Wheel) 및 소수 모듈러 주사위",
      "<strong>소프트웨어:</strong> 작은 소수(예: 11, 13)를 선택하면 공개키와 개인키를 만들고 한글 자모를 숫자로 암호화/복호화하는 간이 웹 시뮬레이터",
      "<strong>확장 연구:</strong> 양자 컴퓨터가 등장하면 왜 현재의 RSA 암호가 뚫리는지 쇼어 알고리즘 원리 쉽게 풀어내기"
    ],
    timeline: [
      "<strong>0:00~0:40:</strong> 공개키 자물쇠 비유와 즉석 암호 퀴즈",
      "<strong>0:40~1:40:</strong> 시계 연산(모듈러)과 소인수분해의 비가역적 성질 설명",
      "<strong>1:40~2:30:</strong> 작은 소수(3과 11)를 이용한 RSA 암호화-복호화 전체 수학 과정 시연",
      "<strong>2:30~3:00:</strong> 순수 수학인 정수론이 현대 인터넷 보안의 심장이 된 의의"
    ]
  },
  {
    id: "life",
    keywords: ["생명게임", "콘웨이", "셀룰러", "오토마타", "알고리즘", "인공생명", "격자"],
    tag: "콘웨이의 생명 게임",
    category: "컴퓨터과학 & 이산수학",
    title: "콘웨이의 생명 게임(Life Game): 살아 움직이는 격자 픽셀",
    hook: "“살아있다, 죽는다 단 두 가지 규칙만 주었는데, 세포들이 스스로 걸어 다니고 공장을 만듭니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 순서쌍과 좌표, 규칙 찾기와 수열, 논리적 조건문",
      "<strong>심화 개념:</strong> 셀룰러 오토마타(Cellular Automata)와 튜링 완전성",
      "<strong>수학적 원리:</strong> 주변 8개 이웃 세포 중 2~3개가 살아있으면 유지, 3개면 탄생, 그 외엔 과밀/고립으로 사망하는 국소 결정론적 규칙"
    ],
    audience: [
      "<strong>패턴 예측:</strong> 3개의 점(신호등 모양)을 찍었을 때 다음 단계에서 어떻게 변할지 청중의 예측을 듣고 시뮬레이션 스타트"
    ],
    outputs: [
      "<strong>반응형 시뮬레이터:</strong> 캔버스에 마우스로 클릭해 세포를 살려놓고 스페이스바를 누르면 세대가 번식하는 웹 프로그램",
      "<strong>패턴 도감:</strong> 정지 생물(바위, 빵), 진동자(깜빡이, 두꺼비), 이동자(글라이더)의 수학적 주기 분석 차트",
      "<strong>확장 연구:</strong> 생명 게임 규칙을 3차원 정육면체 공간으로 확장했을 때의 생존 규칙 실험"
    ],
    timeline: [
      "<strong>0:00~0:45:</strong> 스스로 앞으로 걸어가는 '글라이더' 패턴 대형 스크린 시연",
      "<strong>0:45~1:45:</strong> 4가지 단순 생존 규칙 소개 및 안정 상태의 수학적 분석",
      "<strong>1:45~2:30:</strong> 단순한 규칙에서 복잡한 질서가 창발(Emergence)되는 과정 제시",
      "<strong>2:30~3:00:</strong> 인공생명 및 컴퓨터 시뮬레이션의 수학적 기초 결론"
    ]
  },
  {
    id: "bone_healing",
    keywords: ["골절", "골절치유", "로지스틱", "생체수학", "치유", "미분방정식"],
    tag: "골절 치유와 생체역학",
    category: "생명수학 & 미분모델링",
    title: "부러진 뼈가 다시 붙는 수학: 로지스틱 성장곡선과 가골 형성의 비밀",
    hook: "“깁스를 하면 뼈는 언제 90%까지 단단해질까요? 인체의 치유 속도는 S자 로지스틱 미분방정식을 정확히 따릅니다.”",
    concepts: [
      "<strong>중등 연계:</strong> 일차함수, 증가율과 감소율, 그래프의 기울기와 변화율",
      "<strong>심화 개념:</strong> 로지스틱 미분방정식 (dB/dt = k·B·(100 - B)/100) 및 환경수용력",
      "<strong>수학적 원리:</strong> 초기 지수적 세포 증식(혈종·염증) → 가골 형성기 최대 성장률(변곡점) → 골 개조기 포화 수렴"
    ],
    audience: [
      "<strong>치유 시뮬레이터 라이브:</strong> 환자의 대사율 k값 슬라이더를 청중이 직접 조절하며 깁스를 푸는 날짜(t₉₀) 예측 게임",
      "<strong>X-ray 가상 판독:</strong> 1단계 혈종부터 4단계 골 개조까지 날짜별 뼈 단면 치밀도 변화를 관찰"
    ],
    outputs: [
      "<strong>인터랙티브 시뮬레이터:</strong> 오일러 방법(Euler Method)으로 구현된 실시간 뼈 강도 S자 곡선 차트",
      "<strong>생체역학 교구:</strong> 3D 프린팅으로 제작한 단계별 가골 모형 및 미세 가골 강도 측정기",
      "<strong>확장 연구:</strong> 고령층(낮은 k값) vs 청소년(높은 k값)의 치유 속도 비교 및 최적 재활 타이밍 제안"
    ],
    timeline: [
      "<strong>0:00~0:40:</strong> 뼈가 부러졌을 때 몸 안에서 일어나는 세포 비상사태와 호기심 유발",
      "<strong>0:40~1:40:</strong> 로지스틱 방정식의 수학적 의미(성장 인자 vs 억제 인자) 설명",
      "<strong>1:40~2:30:</strong> 자체 개발한 가골 형성기 시뮬레이터 시연 및 골절 재활 최적 곡선 해석",
      "<strong>2:30~3:00:</strong> 수학이 의학과 인체 재생 공학에 기여하는 미래 가치 강조"
    ],
    linkedLab: {
      course: 'bone',
      label: '골절 치유 생명수학 실험실',
    }
  }
];

interface IdeaExtenderPageProps {
  onGoHome: () => void;
  onSelectCourse: (course: CourseId) => void;
}

export const IdeaExtenderPage: React.FC<IdeaExtenderPageProps> = ({
  onGoHome,
  onSelectCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(PRESET_TOPICS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [copied, setCopied] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    PRESET_TOPICS.forEach((t) => set.add(t.category));
    return ['전체', ...Array.from(set)];
  }, []);

  // Filtered preset topics by category
  const filteredPresets = useMemo(() => {
    if (activeCategory === '전체') return PRESET_TOPICS;
    return PRESET_TOPICS.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  // Search logic
  const handleSearch = (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim().toLowerCase();
    if (!q) {
      setSelectedTopic(PRESET_TOPICS[0]);
      return;
    }

    // Match preset
    const match = PRESET_TOPICS.find(
      (item) =>
        item.keywords.some((k) => q.includes(k) || k.includes(q)) ||
        item.title.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );

    if (match) {
      setSelectedTopic(match);
      setSearchQuery(match.tag);
    } else {
      // Dynamic topic generator for user's unique query
      const formattedTitle = q.toUpperCase();
      const dynamicTopic: TopicItem = {
        id: `dyn-${Date.now()}`,
        keywords: [q],
        tag: formattedTitle,
        category: '수학적 탐구 & 융합 연구',
        title: `『${formattedTitle}』 속 수학적 구조와 청중 몰입형 발표회 설계`,
        hook: `“우리가 일상에서 당연하게 여겼던 '${formattedTitle}' 현상 뒤에는 어떤 놀라운 수학적 규칙과 계산이 숨어있을까요?”`,
        concepts: [
          `<strong>중등 연계:</strong> 함수 관계 및 규칙성을 바탕으로 한 대수적·기하학적 모델링`,
          `<strong>심화 개념:</strong> '${formattedTitle}' 관련 일반화 수식 및 극한/알고리즘적 분석`,
          `<strong>수학적 원리:</strong> 직관적 관찰 결과를 변수화하여 수학적 정리(Theorem)와 연계`
        ],
        audience: [
          `<strong>첫 30초 데모:</strong> 청중에게 '${formattedTitle}'과 관련된 직관적 퀴즈를 던져 인지부조화 유발`,
          `<strong>실시간 비교:</strong> 청중의 예상 답변과 실제 수학적 계산 결과의 차이를 그래프로 즉석 대조`
        ],
        outputs: [
          `<strong>실물/교구:</strong> 3D 프린팅 또는 아크릴을 활용한 구조적 원리 구현 실물 모형`,
          `<strong>인터랙티브 소프트웨어:</strong> 파이썬/지오지브라/웹을 이용해 파라미터 조작 시 실시간 변화를 확인하는 시뮬레이터`,
          `<strong>심화 연구 보고서:</strong> 기본 조건을 n차원 또는 역조건으로 확장한 탐구 보고서`
        ],
        timeline: [
          `<strong>0:00~0:40:</strong> '${formattedTitle}'의 일상 속 등장과 호기심 유발 질문`,
          `<strong>0:40~1:40:</strong> 수학적 정의 및 일반화된 핵심 정리 유도 과정 설명`,
          `<strong>1:40~2:30:</strong> 직접 제작한 실물 교구 또는 시뮬레이터 구동 라이브 시연`,
          `<strong>2:30~3:00:</strong> 이 탐구가 실생활과 현대 과학기술에 주는 시사점 정리`
        ]
      };
      setSelectedTopic(dynamicTopic);
    }
  };

  // Copy plan to clipboard
  const handleCopyPlan = () => {
    if (!selectedTopic) return;
    const clean = (html: string) => html.replace(/<[^>]*>?/gm, '');

    const text = `[수학 영재 산출물 & 발표회 아이디어 기획안]
주제: ${selectedTopic.title}
분야: ${selectedTopic.category}
30초 오프닝 훅: ${selectedTopic.hook}

1. 중등 연계 및 핵심 수학 개념:
${selectedTopic.concepts.map((c, i) => `  (${i + 1}) ${clean(c)}`).join('\n')}

2. 발표회 청중 참여 & 데모 시연:
${selectedTopic.audience.map((a, i) => `  (${i + 1}) ${clean(a)}`).join('\n')}

3. 구체적 산출물 확장 방안:
${selectedTopic.outputs.map((o, i) => `  (${i + 1}) ${clean(o)}`).join('\n')}

4. 발표회 추천 3분 타임라인:
${selectedTopic.timeline.map((t) => `  • ${clean(t)}`).join('\n')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Universal Classroom Header */}
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  중등 영재원 맞춤형
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  산출물 확장 & 발표회 설계 엔진
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                수학 영재 산출물 & 발표회 아이디어 익스텐더
              </h1>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-700"
            >
              <Home className="w-3.5 h-3.5" />
              <span>포털 홈</span>
            </button>

            <button
              onClick={() => onSelectCourse('workbook')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              title="교재 워크북으로 이동"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>교재 워크북</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Intro Banner */}
        <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/40 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>주제 분석 · 산출물 확장 · 청중 참여형 3분 발표 설계</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              수학 영재 발표회, <span className="text-amber-400">어떤 산출물</span>로 완성할까요?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              관심 있는 수학 주제를 입력하거나 아래의 추천 주제 태그를 클릭해 보세요. 
              중학 교과 연계 개념부터 <strong>30초 현장 데모 후크</strong>, <strong>구체적 실물/소프트웨어 산출물</strong>, <strong>3분 발표 타임라인</strong>까지 완벽한 기획서를 1초 만에 생성합니다.
            </p>
          </div>
        </section>

        {/* Search & Topic Selector Card */}
        <section className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>탐구할 수학 주제 검색 & 입력</span>
            </h3>
            <span className="text-xs text-slate-400">
              추천 주제 11선 수록 & 어떤 수학 키워드든 자동 기획 생성
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="예: 페르마 점, 몬티홀, 님 게임, 보로노이, 골절 치유, 미우라 접기, RSA 암호..."
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white text-sm placeholder-slate-500 transition shadow-inner"
              />
              <Lightbulb className="w-4 h-4 absolute left-4 top-3.5 text-amber-400" />
            </div>

            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>아이디어 생성</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>분야 필터:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Preset Tags Grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">
              💡 영재원 발표회 추천 주제 (클릭하여 즉시 열기):
            </span>
            <div className="flex flex-wrap gap-2">
              {filteredPresets.map((item) => {
                const isSelected = selectedTopic?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedTopic(item);
                      setSearchQuery(item.tag);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md scale-105'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <span># {item.tag}</span>
                    <span className="text-[10px] opacity-70">({item.category.split('&')[0].trim()})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Selected Topic Content Display */}
        {selectedTopic && (
          <section className="space-y-5 animate-in fade-in-50 duration-300">
            
            {/* Header Display Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-indigo-800/60 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-bold text-indigo-300 font-mono">
                      {selectedTopic.category}
                    </span>

                    {selectedTopic.linkedLab && (
                      <button
                        onClick={() => onSelectCourse(selectedTopic.linkedLab!.course)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                      >
                        <span>🚀 {selectedTopic.linkedLab.label} 바로가기</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">
                    {selectedTopic.title}
                  </h3>

                  {/* 30-sec hook */}
                  <div className="p-3 bg-indigo-950/60 border border-indigo-700/50 rounded-xl mt-2">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>청중을 사로잡는 첫 30초 질문 (오프닝 훅)</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium italic">
                      {selectedTopic.hook}
                    </p>
                  </div>
                </div>

                {/* Action Tools: Copy & Print */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    onClick={handleCopyPlan}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
                    title="기획안 전체 내용을 클립보드에 복사"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-300" />}
                    <span>{copied ? '복사 완료!' : '기획안 복사'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
                    title="이 기획안을 인쇄하거나 PDF로 저장"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    <span>인쇄 / PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 1. 중등 연계 및 핵심 수학 개념 */}
              <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-indigo-400 font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h4>1. 중등 연계 및 핵심 수학 개념</h4>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    {selectedTopic.concepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: concept }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>교과 개념의 깊이 있는 확장</span>
                  <span className="text-indigo-400 font-mono font-semibold">Core Theory</span>
                </div>
              </div>

              {/* 2. 발표회 청중 참여 & 데모 시연 */}
              <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col justify-between hover:border-amber-500/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-amber-400 font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4>2. 발표회 청중 참여 & 데모 시연</h4>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    {selectedTopic.audience.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-950/20 rounded-xl border border-amber-800/30 text-slate-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>현장 호응과 몰입도 극대화</span>
                  <span className="text-amber-400 font-mono font-semibold">Live Interactive</span>
                </div>
              </div>

              {/* 3. 구체적 산출물 확장 방안 */}
              <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-emerald-400 font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <h4>3. 구체적 산출물 확장 방안</h4>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    {selectedTopic.outputs.map((out, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/30 text-slate-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: out }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>교구 제작 / 소프트웨어 / 심화 연구</span>
                  <span className="text-emerald-400 font-mono font-semibold">Deliverables</span>
                </div>
              </div>

              {/* 4. 3분 발표 구조 가이드 */}
              <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col justify-between hover:border-sky-500/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-sky-400 font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <Timer className="w-4 h-4" />
                    </div>
                    <h4>4. 발표회 추천 3분 타임라인</h4>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-mono">
                    {selectedTopic.timeline.map((time, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-sky-950/20 rounded-xl border border-sky-800/30 text-slate-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: time }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>시간 초과 없는 칼 같은 프레젠테이션</span>
                  <span className="text-sky-400 font-mono font-semibold">Timeline</span>
                </div>
              </div>

            </div>

            {/* Quick Navigation to Related Labs */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  다른 산출물 아이디어를 탐구하거나, 관련된 기하·확산·골절 시뮬레이터를 직접 체험해 보세요.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onSelectCourse('geometry')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition cursor-pointer"
                >
                  기하 최적화 랩
                </button>
                <button
                  onClick={() => onSelectCourse('diffusion')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition cursor-pointer"
                >
                  확산 모델링 랩
                </button>
                <button
                  onClick={() => onSelectCourse('bone')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition cursor-pointer"
                >
                  골절 치유 랩
                </button>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>© 2026 중학교 수학 영재 발표회 가이드 · Designed for Creative Mathematics Exploration &amp; Project Showcase</p>
        <p className="text-slate-400 font-medium">Development &amp; Design: Seulgi Jeong</p>
      </footer>
    </div>
  );
};
