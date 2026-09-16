import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, CheckCircle2, AlertCircle, Save, ListOrdered, Truck, Network, Sparkles, HelpCircle, MapPin, Eye, EyeOff } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  mode: 'mst' | 'tsp';
  date: string;
}

interface MapPreset {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  mstHint: string;
  tspHint: string;
  points: Point[];
  nodeNames: string[];
}

export const CityGameTab: React.FC = () => {
  const [mode, setMode] = useState<'mst' | 'tsp'>('mst');
  const [selectedMapId, setSelectedMapId] = useState<string>('korea');
  const [pts, setPts] = useState<Point[]>([]);
  const [nodeNames, setNodeNames] = useState<string[]>([]);
  const [edges, setEdges] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [targetVal, setTargetVal] = useState<number | null>(null);
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showOptimal, setShowOptimal] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);
  const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);

  // 5대 테마 맵 프리셋 + 무작위 탐험 맵
  const MAP_PRESETS: MapPreset[] = [
    {
      id: 'korea',
      name: '한반도 6대 도시',
      subtitle: '서울~부산 국토 도로망',
      badge: '🇰🇷 한국 지리',
      description: '서울, 강릉, 대전, 대구, 광주, 부산의 실제 지리적 배치를 모형화했습니다.',
      mstHint: '경부축과 영호남을 잇는 최소 도로망을 설계하세요. 불필요한 삼각형 루프를 제거해야 합니다.',
      tspHint: '모든 거점 도시를 단 한 번씩만 방문하고 출발지로 되돌아오는 최적 물류 배송 경로를 찾아보세요.',
      points: [
        { x: 210, y: 90 },  // 서울
        { x: 380, y: 80 },  // 강릉
        { x: 240, y: 190 }, // 대전
        { x: 370, y: 230 }, // 대구
        { x: 170, y: 310 }, // 광주
        { x: 420, y: 320 }, // 부산
      ],
      nodeNames: ['서울', '강릉', '대전', '대구', '광주', '부산'],
    },
    {
      id: 'twin-cluster',
      name: '해협 너머 두 군집',
      subtitle: '다리가 몇 개 필요할까?',
      badge: '🌉 교량과 위상수학',
      description: '넓은 바다 해협을 사이에 두고 서쪽 3개, 동쪽 3개의 마을이 마주보고 있습니다.',
      mstHint: '💡 MST의 결정적 성질: 두 섬을 연결할 때 바다를 건너는 다리는 딱 1개만 있으면 충분합니다!',
      tspHint: '💡 TSP의 결정적 성질: 한 번 건너갔다가 반드시 돌아와야 하므로 바다를 건너는 다리가 최소 2개 필요합니다!',
      points: [
        { x: 110, y: 120 }, // A (서북)
        { x: 180, y: 240 }, // B (서중)
        { x: 90, y: 320 },  // C (서남)
        { x: 440, y: 110 }, // D (동북)
        { x: 510, y: 220 }, // E (동중)
        { x: 450, y: 330 }, // F (동남)
      ],
      nodeNames: ['서북 포구', '서부 곶', '서남 포구', '동북 곶', '동부 항만', '동남 포구'],
    },
    {
      id: 'radial-hub',
      name: '수도권 방사순환망',
      subtitle: '중심 허브 vs 외곽 링',
      badge: '🏙️ 대도시권',
      description: '정중앙의 메가시티 허브와 주변을 둘러싼 5개 위성도시들로 이루어진 네트워크입니다.',
      mstHint: '중심 허브에서 각 위성도시로 뻗는 스타형 도로망과 외곽 연결 중 어느 쪽이 더 짧을까요?',
      tspHint: '외곽 순환선을 따라 한 바퀴 도는 것이 빠를까요, 아니면 중심 허브를 지그재그로 관통해야 할까요?',
      points: [
        { x: 300, y: 210 }, // A: 중심 메가시티
        { x: 300, y: 70 },  // B: 북부 신도시
        { x: 450, y: 140 }, // C: 동부 테크노
        { x: 410, y: 320 }, // D: 남동 산업단지
        { x: 190, y: 320 }, // E: 남서 항만도시
        { x: 150, y: 140 }, // F: 서부 공항도시
      ],
      nodeNames: ['중심 허브', '북부 신도시', '동부 테크노', '남동 산단', '남서 항만', '서부 공항'],
    },
    {
      id: 'grid-smart',
      name: '격자형 스마트 신도시',
      subtitle: '2 × 3 블록 배관망',
      badge: '📐 신도시 블록',
      description: '바둑판처럼 정렬된 2행 3열 블록의 상하수도 배관망 및 구역별 배송 경로입니다.',
      mstHint: '대각선 도로를 놓는 것이 유리할까요, 아니면 직선 도로들로 빗 모양을 만드는 것이 짧을까요?',
      tspHint: '모든 직사각형 모서리를 빠짐없이 훑고 제자리로 돌아오는 해밀턴 순환 회로를 완성하세요.',
      points: [
        { x: 160, y: 120 }, // 1구역
        { x: 300, y: 120 }, // 2구역
        { x: 440, y: 120 }, // 3구역
        { x: 160, y: 290 }, // 4구역
        { x: 300, y: 290 }, // 5구역
        { x: 440, y: 290 }, // 6구역
      ],
      nodeNames: ['1구역', '2구역', '3구역', '4구역', '5구역', '6구역'],
    },
    {
      id: 'pentagram',
      name: '별빛 대칭 오각형 & 타워',
      subtitle: '정오각형의 기하 대칭성',
      badge: '⭐ 대칭 기하학',
      description: '중앙 관제 타워 1개와 완벽한 정오각형 둘레에 배치된 5개의 기지국입니다.',
      mstHint: '정중앙 타워를 거쳐 바깥으로 뻗는 부채살 모양이 모든 점을 잇는 가장 짧은 트리일까요?',
      tspHint: '외곽 오각형 둘레만 5변을 도는 것과, 중앙 타워를 1번 들르는 것 중 어느 쪽이 유효한 TSP일까요?',
      points: [
        { x: 300, y: 210 }, // A: 중앙 관제탑
        { x: 300, y: 65 },  // B: 북쪽 기지
        { x: 438, y: 165 }, // C: 동북 기지
        { x: 385, y: 330 }, // D: 동남 기지
        { x: 215, y: 330 }, // E: 서남 기지
        { x: 162, y: 165 }, // F: 서북 기지
      ],
      nodeNames: ['중앙 타워', '북쪽 기지', '동북 기지', '동남 기지', '서남 기지', '서북 기지'],
    },
    {
      id: 'coastal-islands',
      name: '남해 다도해 해상대교',
      subtitle: '해안선 6대 도서 연륙교',
      badge: '🏝️ 다도해 연륙교',
      description: '목포에서 완도, 여수, 남해, 통영, 거제까지 이어지는 남해안 다도해의 해상 교량 연결망입니다.',
      mstHint: '해안선을 따라 이웃한 섬끼리 차례로 연륙교를 잇는 선형 사슬 트리가 가장 짧고 경제적입니다.',
      tspHint: '거제까지 배송한 뒤 출발지 목포로 되돌아올 때, 해저터널 직선로와 육로 우회로 중 어떤 폐루프가 최단인지 찾아보세요.',
      points: [
        { x: 100, y: 300 }, // 목포
        { x: 190, y: 340 }, // 완도
        { x: 300, y: 310 }, // 여수
        { x: 380, y: 260 }, // 남해
        { x: 460, y: 230 }, // 통영
        { x: 530, y: 170 }, // 거제
      ],
      nodeNames: ['목포', '완도', '여수', '남해', '통영', '거제'],
    },
    {
      id: 'nested-triangles',
      name: '이중 삼각형 기하 타워',
      subtitle: '외곽 대형망 & 내부 역삼각',
      badge: '📐 이중 삼각형',
      description: '외곽의 거대한 정삼각형 3대 타워와, 그 안쪽에 거꾸로 뒤집힌 내부 3개 기지국으로 구성된 기하 대칭 망입니다.',
      mstHint: '외곽 정점에서 가장 가까운 내부 거점으로 뻗고, 내부 역삼각형을 잇는 Y자형 분기 트리를 찾아보세요.',
      tspHint: '외곽과 내부를 교대로 번갈아가며 지그재그 별 모양 톱니 순환을 만들면 선 교차 없이 최단 폐곡선이 나옵니다.',
      points: [
        { x: 300, y: 60 },  // 북부 정점 타워
        { x: 480, y: 330 }, // 동남 정점 타워
        { x: 120, y: 330 }, // 서남 정점 타워
        { x: 230, y: 195 }, // 내부 서북 기지
        { x: 370, y: 195 }, // 내부 동북 기지
        { x: 300, y: 285 }, // 내부 중앙 기지
      ],
      nodeNames: ['북부 타워', '동남 타워', '서남 타워', '내부 서북', '내부 동북', '내부 중앙'],
    },
    {
      id: 'river-banks',
      name: '한강 양안 6대 거점',
      subtitle: '강북 3구 vs 강남 3구 횡단',
      badge: '🌊 강남·강북 양안',
      description: '도심을 가로지르는 큰 강을 사이에 두고 강북 3곳과 강남 3곳의 주요 거점이 마주보고 있습니다.',
      mstHint: '💡 MST의 핵심: 강을 건너는 한강 교량은 단 1개만 건설하면 전체가 연결됩니다! 강북 내·강남 내 직선이 우선입니다.',
      tspHint: '💡 TSP의 핵심: 순환 왕복해야 하므로 강을 건너는 다리가 반드시 최소 2개(동쪽 1개, 서쪽 1개) 필요합니다!',
      points: [
        { x: 150, y: 130 }, // 마포 (강북서)
        { x: 300, y: 120 }, // 용산 (강북중)
        { x: 450, y: 140 }, // 성동 (강북동)
        { x: 170, y: 290 }, // 여의도 (강남서)
        { x: 320, y: 280 }, // 서초 (강남중)
        { x: 470, y: 290 }, // 강남 (강남동)
      ],
      nodeNames: ['마포 (강북서)', '용산 (강북중)', '성동 (강북동)', '여의도 (강남서)', '서초 (강남중)', '강남 (강남동)'],
    },
    {
      id: 'interchange-clover',
      name: '입체 클로버 인터체인지',
      subtitle: '중심 환승 2거점 & 4개 IC',
      badge: '🚦 입체 나들목',
      description: '중앙의 서부·동부 복합 환승센터 2곳과 사방 모퉁이의 고속도로 나들목(IC) 4곳이 연결되는 물류 분기망입니다.',
      mstHint: '중심 환승센터 두 곳을 먼저 잇고, 각 센터에서 인접한 두 나들목으로 Y자형 갈래를 뻗는 수형도를 만드세요.',
      tspHint: '네 모퉁이 나들목을 감싸며 사각형 링을 돌지, 환승센터를 거쳐 8자형 모양으로 왕복할지 총거리를 비교해보세요.',
      points: [
        { x: 240, y: 210 }, // 서부 환승센터
        { x: 360, y: 210 }, // 동부 환승센터
        { x: 130, y: 90 },  // 북서 IC
        { x: 470, y: 90 },  // 북동 IC
        { x: 470, y: 330 }, // 남동 IC
        { x: 130, y: 330 }, // 남서 IC
      ],
      nodeNames: ['서부 환승센터', '동부 환승센터', '북서 IC', '북동 IC', '남동 IC', '남서 IC'],
    },
    {
      id: 'zigzag-valley',
      name: '백두대간 협곡 지그재그',
      subtitle: '험준한 산악 도로와 터널망',
      badge: '⛰️ 산악 협곡',
      description: '높은 산줄기와 깊은 골짜기가 번갈아 이어지는 W자 지형의 산악 마을 6곳입니다.',
      mstHint: 'W자형으로 요동치는 지형에서 멀리 떨어진 봉우리를 무리하게 잇지 말고 이웃한 고갯길을 순서대로 연결하세요.',
      tspHint: '골짜기를 따라 왕복할 때 한 번 거친 험로를 되돌아가지 않고 능선을 크게 감싸 도는 순환로를 완성하세요.',
      points: [
        { x: 90, y: 110 },  // 협곡 입구
        { x: 190, y: 290 }, // 1차 고개
        { x: 290, y: 120 }, // 중앙 능선
        { x: 380, y: 300 }, // 산악 쉼터
        { x: 460, y: 130 }, // 고원 분지
        { x: 530, y: 290 }, // 협곡 출구
      ],
      nodeNames: ['협곡 입구', '1차 고개', '중앙 능선', '산악 쉼터', '고원 분지', '협곡 출구'],
    },
    {
      id: 'random',
      name: '무작위 5개 도시 탐험',
      subtitle: '매번 새로운 난수 생성',
      badge: '🎲 무작위 생성',
      description: '버튼을 누를 때마다 무작위 좌표로 새로운 마을 5곳이 배치되는 자유 탐험 모드입니다.',
      mstHint: '가장 가까운 이웃부터 차례대로 탐욕적(Greedy)으로 연결해 나가며 사이클을 피하세요.',
      tspHint: '서로 교차하는 X자 도로는 무조건 손해입니다. 교차선을 풀어서 외곽을 감싸도록 연결하세요.',
      points: [
        { x: 120, y: 110 },
        { x: 320, y: 80 },
        { x: 460, y: 210 },
        { x: 350, y: 330 },
        { x: 140, y: 280 },
      ],
      nodeNames: ['마을 A', '마을 B', '마을 C', '마을 D', '마을 E'],
    },
  ];

  const currentMap = MAP_PRESETS.find((m) => m.id === selectedMapId) || MAP_PRESETS[0];

  const randPts = (n = 5): Point[] => {
    const arr: Point[] = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: Math.round(80 + Math.random() * 440),
        y: Math.round(70 + Math.random() * 260),
      });
    }
    return arr;
  };

  const loadMap = (presetId: string) => {
    setSelectedMapId(presetId);
    setEdges(new Set());
    setSelected(null);
    setSubmitted(false);
    setTargetVal(null);
    setEfficiency(null);
    setShowOptimal(false);
    setSaveMsg(null);

    if (presetId === 'random') {
      const generated = randPts(5);
      setPts(generated);
      setNodeNames(['마을 A', '마을 B', '마을 C', '마을 D', '마을 E']);
    } else {
      const preset = MAP_PRESETS.find((m) => m.id === presetId)!;
      setPts([...preset.points]);
      setNodeNames([...preset.nodeNames]);
    }
  };

  useEffect(() => {
    loadMap('korea');
    loadLeaderboard();
  }, []);

  const totalLen = (): number => {
    let s = 0;
    edges.forEach((k) => {
      const [i, j] = k.split('-').map(Number);
      if (pts[i] && pts[j]) {
        s += dist(pts[i], pts[j]);
      }
    });
    return s;
  };

  const isConnected = (): boolean => {
    if (pts.length === 0) return false;
    const visited = new Set<number>([0]);
    const stack: number[] = [0];
    while (stack.length > 0) {
      const u = stack.pop()!;
      for (let v = 0; v < pts.length; v++) {
        if (v !== u && edges.has(key(u, v)) && !visited.has(v)) {
          visited.add(v);
          stack.push(v);
        }
      }
    }
    return visited.size === pts.length;
  };

  // Check if edges form a single valid TSP cycle
  const isValidTSPCycle = (): boolean => {
    if (pts.length === 0 || edges.size !== pts.length) return false;
    const degree = new Array(pts.length).fill(0);
    edges.forEach((k) => {
      const [i, j] = k.split('-').map(Number);
      degree[i]++;
      degree[j]++;
    });
    const allDeg2 = degree.every((d) => d === 2);
    return allDeg2 && isConnected();
  };

  // Compute MST using Prim's algorithm & return optimal edges
  const computeMSTWithEdges = (): { total: number; edges: Set<string> } => {
    const n = pts.length;
    if (n <= 1) return { total: 0, edges: new Set() };
    const inMST = new Array(n).fill(false);
    const dmin = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    dmin[0] = 0;
    let total = 0;

    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) {
        if (!inMST[i] && (u === -1 || dmin[i] < dmin[u])) {
          u = i;
        }
      }
      if (u === -1) break;
      inMST[u] = true;
      total += dmin[u] === Infinity ? 0 : dmin[u];

      for (let v = 0; v < n; v++) {
        if (!inMST[v]) {
          const d = dist(pts[u], pts[v]);
          if (d < dmin[v]) {
            dmin[v] = d;
            parent[v] = u;
          }
        }
      }
    }

    const optEdges = new Set<string>();
    for (let i = 1; i < n; i++) {
      if (parent[i] !== -1) {
        optEdges.add(key(parent[i], i));
      }
    }
    return { total, edges: optEdges };
  };

  // Compute optimal TSP tour by permuting vertices & return optimal edges
  const computeTSPWithEdges = (): { total: number; edges: Set<string> } => {
    const n = pts.length;
    if (n < 3) return { total: 0, edges: new Set() };
    const others = Array.from({ length: n - 1 }, (_, i) => i + 1);
    let bestDist = Infinity;
    let bestTour: number[] = [];

    const permute = (arr: number[], m: number[] = []) => {
      if (arr.length === 0) {
        const tour = [0, ...m];
        let d = 0;
        for (let i = 0; i < tour.length; i++) {
          const u = tour[i];
          const v = tour[(i + 1) % tour.length];
          d += dist(pts[u], pts[v]);
        }
        if (d < bestDist) {
          bestDist = d;
          bestTour = tour;
        }
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };

    permute(others);

    const optEdges = new Set<string>();
    for (let i = 0; i < bestTour.length; i++) {
      const u = bestTour[i];
      const v = bestTour[(i + 1) % bestTour.length];
      optEdges.add(key(u, v));
    }
    return { total: bestDist, edges: optEdges };
  };

  const optimalResult = mode === 'mst' ? computeMSTWithEdges() : computeTSPWithEdges();

  const handleNodeClick = (idx: number) => {
    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      const k = key(selected, idx);
      setEdges((prev) => {
        const next = new Set(prev);
        if (next.has(k)) {
          next.delete(k);
        } else {
          next.add(k);
        }
        return next;
      });
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'mst') {
      if (!isConnected()) {
        alert('⚠️ 아직 모든 마을이 연결되지 않았습니다! 끊어진 마을이 없도록 도로를 연결해 주세요.');
        return;
      }
      const mine = totalLen();
      const optimal = optimalResult.total;
      setTargetVal(optimal);
      const eff = Math.min(100, Math.round((optimal / mine) * 100));
      setEfficiency(eff);
      setSubmitted(true);
    } else {
      if (!isValidTSPCycle()) {
        alert('⚠️ 외판원 순회는 모든 마을을 정확히 1번씩만 방문하고 출발 마을로 돌아오는 "하나의 닫힌 고리(모든 마을의 연결선 2개)"여야 합니다!');
        return;
      }
      const mine = totalLen();
      const optimal = optimalResult.total;
      setTargetVal(optimal);
      const eff = Math.min(100, Math.round((optimal / mine) * 100));
      setEfficiency(eff);
      setSubmitted(true);
    }
  };

  const loadLeaderboard = () => {
    try {
      const raw = localStorage.getItem('geometry_city_leaderboard');
      if (raw) {
        const list: LeaderboardEntry[] = JSON.parse(raw);
        setLeaderboard(list.sort((a, b) => b.score - a.score));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveScore = () => {
    if (!teamName.trim()) {
      alert('이름 또는 모둠명을 입력해 주세요!');
      return;
    }
    if (efficiency === null) {
      alert('먼저 도로를 제출하고 효율을 확인해 주세요!');
      return;
    }

    try {
      const currentList: LeaderboardEntry[] = JSON.parse(
        localStorage.getItem('geometry_city_leaderboard') || '[]'
      );
      const existingIdx = currentList.findIndex(
        (item) => item.name === teamName.trim() && item.mode === mode
      );
      if (existingIdx >= 0) {
        currentList[existingIdx].score = Math.max(
          currentList[existingIdx].score,
          efficiency
        );
      } else {
        currentList.push({
          name: teamName.trim(),
          score: efficiency,
          mode: mode,
          date: new Date().toLocaleDateString('ko-KR'),
        });
      }
      currentList.sort((a, b) => b.score - a.score);
      localStorage.setItem('geometry_city_leaderboard', JSON.stringify(currentList));
      setLeaderboard(currentList);
      setShowLeaderboard(true);
      setSaveMsg(`🎉 ${teamName.trim()}님의 효율(${efficiency}%)이 랭킹에 등록되었습니다!`);
      setTimeout(() => setSaveMsg(null), 3500);
    } catch {
      alert('기록 저장에 실패했습니다.');
    }
  };

  const currentTotal = totalLen();
  const validStatus = mode === 'mst' ? isConnected() : isValidTSPCycle();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-3 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            최고의 도시 설계자 & 외판원 순회 챌린지
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-0.5">
            마을 2곳을 순서대로 클릭하여 도로를 건설/철거하세요. <strong>5가지 테마 맵</strong>에서 최적의 도로망을 찾아보세요!
          </p>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="mt-3 sm:mt-0 flex items-center bg-[#0E2A45] p-1 rounded-xl border border-[#2C567F]">
          <button
            onClick={() => {
              setMode('mst');
              setEdges(new Set());
              setSubmitted(false);
              setShowOptimal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'mst'
                ? 'bg-[#E7A93D] text-[#0E2A45] shadow-sm'
                : 'text-[#9FC0DC] hover:text-[#EAF3FC]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>최소 도로망 (MST)</span>
          </button>
          <button
            onClick={() => {
              setMode('tsp');
              setEdges(new Set());
              setSubmitted(false);
              setShowOptimal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'tsp'
                ? 'bg-[#6FCF97] text-[#0E2A45] shadow-sm'
                : 'text-[#9FC0DC] hover:text-[#EAF3FC]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>택배 기사 순회 (TSP)</span>
          </button>
        </div>
      </div>

      {/* 10+1 Map Preset Selector Bar */}
      <div className="mb-4 bg-[#102B47] border border-[#2C567F] rounded-xl p-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2 px-1 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#E7A93D]" />
            <span className="text-xs font-bold text-[#EAF3FC]">도전할 맵 시나리오 선택 (총 11종 · 5종 신규 탑재):</span>
          </div>
          <span className="text-[11px] text-[#6FCF97] font-mono">
            {currentMap.badge} · {currentMap.name} 선택됨
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {MAP_PRESETS.map((p) => {
            const isSelected = selectedMapId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => loadMap(p.id)}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1D4A73] border-[#E7A93D] shadow-md ring-1 ring-[#E7A93D]/50'
                    : 'bg-[#0E2338] border-[#2C567F]/60 hover:bg-[#153A5C] text-[#9FC0DC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#E7A93D] font-mono font-bold truncate">
                    {p.badge}
                  </span>
                </div>
                <div className={`text-xs font-bold mt-0.5 truncate ${isSelected ? 'text-[#EAF3FC]' : 'text-[#9FC0DC]'}`}>
                  {p.name}
                </div>
                <div className="text-[10px] text-[#7FC4EE]/80 truncate mt-0.5">
                  {p.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Grid Pattern Lines */}
            <defs>
              <pattern id="city-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2C567F" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="600" height="420" fill="url(#city-grid)" />

            {/* Special Environment: Ocean Channel for Twin Cluster Map */}
            {selectedMapId === 'twin-cluster' && (
              <g opacity={0.35}>
                <rect x={240} y={0} width={150} height={420} fill="#11384E" />
                <line x1={240} y1={0} x2={240} y2={420} stroke="#7FC4EE" strokeDasharray="6 4" strokeWidth={1.5} />
                <line x1={390} y1={0} x2={390} y2={420} stroke="#7FC4EE" strokeDasharray="6 4" strokeWidth={1.5} />
                <text x={315} y={210} fill="#7FC4EE" fontSize={12} fontWeight={700} textAnchor="middle" transform="rotate(-90 315 210)">
                  🌊 바다 해협 (연결 다리 필요)
                </text>
              </g>
            )}

            {/* Special Environment: Han River for River Banks Map */}
            {selectedMapId === 'river-banks' && (
              <g opacity={0.4}>
                <rect x={0} y={180} width={600} height={65} fill="#0d416b" />
                <line x1={0} y1={180} x2={600} y2={180} stroke="#38bdf8" strokeDasharray="8 5" strokeWidth={1.5} />
                <line x1={0} y1={245} x2={600} y2={245} stroke="#38bdf8" strokeDasharray="8 5" strokeWidth={1.5} />
                <text x={300} y={217} fill="#7FC4EE" fontSize={13} fontWeight={700} textAnchor="middle">
                  🌊 한강 본류 (강북 ↔ 강남 횡단 교량 건설 지대)
                </text>
              </g>
            )}

            {/* Special Environment: Coastal Islands Map */}
            {selectedMapId === 'coastal-islands' && (
              <g opacity={0.3}>
                <path d="M 0 240 Q 200 210 400 180 T 600 130 L 600 420 L 0 420 Z" fill="#082f49" />
                <text x={480} y={380} fill="#38bdf8" fontSize={12} fontWeight={700}>
                  🌊 남해 청정 해역 (연륙교 설치 구역)
                </text>
              </g>
            )}

            {/* Special Environment: Highway Interchange Map */}
            {selectedMapId === 'interchange-clover' && (
              <g opacity={0.25}>
                <line x1={50} y1={210} x2={550} y2={210} stroke="#94a3b8" strokeWidth={18} />
                <line x1={300} y1={40} x2={300} y2={380} stroke="#94a3b8" strokeWidth={18} />
                <line x1={50} y1={210} x2={550} y2={210} stroke="#facc15" strokeDasharray="10 8" strokeWidth={2} />
                <line x1={300} y1={40} x2={300} y2={380} stroke="#facc15" strokeDasharray="10 8" strokeWidth={2} />
              </g>
            )}

            {/* Special Environment: Zigzag Mountain Valley Map */}
            {selectedMapId === 'zigzag-valley' && (
              <g opacity={0.25}>
                <polygon points="50,400 140,200 230,400" fill="#14532d" />
                <polygon points="190,400 290,160 390,400" fill="#166534" />
                <polygon points="350,400 460,170 570,400" fill="#14532d" />
                <text x={300} y={390} fill="#86efac" fontSize={12} fontWeight={700} textAnchor="middle">
                  ⛰️ 험준한 산악 능선 & 협곡 도로
                </text>
              </g>
            )}

            {/* Optimal Target Solution (If Toggled) */}
            {showOptimal && (
              <g opacity={0.9}>
                {Array.from(optimalResult.edges).map((k: string) => {
                  const [i, j] = k.split('-').map(Number);
                  const p1 = pts[i];
                  const p2 = pts[j];
                  if (!p1 || !p2) return null;
                  return (
                    <line
                      key={`opt-${k}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#6FCF97"
                      strokeWidth={4.5}
                      strokeDasharray="6 5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            )}

            {/* Built Roads */}
            {Array.from(edges).map((k: string) => {
              const [i, j] = k.split('-').map(Number);
              const p1 = pts[i];
              const p2 = pts[j];
              if (!p1 || !p2) return null;
              return (
                <g key={k}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={mode === 'mst' ? '#E7A93D' : '#6FCF97'}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                  {/* Road distance label */}
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 4}
                    fill="#9FC0DC"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {Math.round(dist(p1, p2))}
                  </text>
                </g>
              );
            })}

            {/* Town Nodes */}
            {pts.map((p, idx) => {
              const isSel = selected === idx;
              const label = nodeNames[idx] || `마을 ${String.fromCharCode(65 + idx)}`;
              return (
                <g
                  key={idx}
                  onClick={() => handleNodeClick(idx)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSel ? 18 : 14}
                    fill={isSel ? '#FF6B5C' : '#1B4468'}
                    stroke={isSel ? '#FFFFFF' : '#7FC4EE'}
                    strokeWidth={isSel ? 3 : 2}
                    className="transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    fill="#EAF3FC"
                    fontSize={11}
                    fontWeight={800}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {String.fromCharCode(65 + idx)}
                  </text>
                  <text
                    x={p.x}
                    y={p.y + 26}
                    fill="#EAF3FC"
                    fontSize={10.5}
                    fontWeight={600}
                    fontFamily="Noto Sans KR"
                    textAnchor="middle"
                    pointerEvents="none"
                    filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Mode Guidance Pill */}
          <div className="absolute top-4 left-4 max-w-[85%] px-3 py-1.5 rounded-lg bg-[#0E2A45]/90 border border-[#2C567F] text-xs text-[#EAF3FC] shadow">
            {mode === 'mst' ? (
              <span>
                🌲 <strong>{currentMap.name} (MST 목표):</strong> 모든 마을 연결 최소 도로망 (필요 도로: {pts.length - 1}개)
              </span>
            ) : (
              <span>
                🚚 <strong>{currentMap.name} (TSP 목표):</strong> 모든 마을을 1번씩 방문 후 귀환하는 닫힌 루프 (도로: {pts.length}개)
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Controls & Evaluation */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2C567F] pb-2 mb-3">
              <span className="text-xs font-mono text-[#E7A93D] font-bold uppercase">
                {mode === 'mst' ? '도로망 효율 분석' : '순회 경로 효율 분석'}
              </span>
              {selectedMapId === 'random' && (
                <button
                  onClick={() => loadMap('random')}
                  className="flex items-center gap-1 text-xs text-[#9FC0DC] hover:text-[#EAF3FC] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>새 마을 난수 생성</span>
                </button>
              )}
            </div>

            {/* Map Specific Guidance Box */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs mb-3 text-[#9FC0DC] space-y-1">
              <div className="font-bold text-[#E7A93D] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentMap.name} 기하학 미션</span>
              </div>
              <p className="leading-relaxed">
                {mode === 'mst' ? currentMap.mstHint : currentMap.tspHint}
              </p>
            </div>

            {/* Live Stats */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">건설된 도로 수</span>
                <b className="font-mono text-base text-[#EAF3FC]">{edges.size} 개</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">현재 총 도로 길이</span>
                <b className="font-mono text-base text-[#EAF3FC]">{Math.round(currentTotal)} km</b>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#2C567F]">
                <span className="text-[#9FC0DC]">규칙 충족 여부</span>
                {validStatus ? (
                  <span className="text-[#6FCF97] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mode === 'mst' ? '전체 연결됨' : '유효한 순회 루프'}
                  </span>
                ) : (
                  <span className="text-[#FF6B5C] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {mode === 'mst' ? '미연결 마을 있음' : '고리 미완성'}
                  </span>
                )}
              </div>
            </div>

            {/* Submit & Result */}
            <div className="space-y-2 mb-3">
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>설계 제출 & 효율 채점</span>
              </button>

              {/* Show Optimal Solution Toggle */}
              <button
                onClick={() => setShowOptimal(!showOptimal)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#6FCF97] text-xs font-semibold cursor-pointer transition-colors"
              >
                {showOptimal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showOptimal ? '수학적 최적 정답선 숨기기' : '수학적 최적 정답선 비교하기'}</span>
              </button>

              {submitted && efficiency !== null && (
                <div className="p-3 rounded-lg bg-[#0E2A45] border border-[#6FCF97] text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#9FC0DC]">수학적 최적 최소 길이:</span>
                    <b className="font-mono text-sm text-[#6FCF97]">{Math.round(targetVal || 0)} km</b>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#EAF3FC] font-bold">내 설계 효율:</span>
                    <b
                      className={`font-mono text-lg font-extrabold ${
                        efficiency === 100 ? 'text-[#6FCF97]' : 'text-[#E7A93D]'
                      }`}
                    >
                      {efficiency}%
                    </b>
                  </div>
                  <div className="text-[11px] text-[#9FC0DC] pt-1 border-t border-[#2C567F]">
                    {efficiency === 100 ? (
                      <span className="text-[#6FCF97] font-bold">
                        🏆 축하합니다! 완벽한 수학적 최단 {mode === 'mst' ? '트리' : '루프'}를 완성했습니다!
                      </span>
                    ) : (
                      <span>불필요하게 긴 도로를 철거하고 더 짧은 연결을 찾아보세요!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Score Section */}
            {submitted && efficiency !== null && (
              <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs mb-3 space-y-2">
                <div className="font-bold text-[#EAF3FC]">모둠 랭킹에 기록 저장하기</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="이름 또는 모둠명"
                    className="flex-1 bg-[#153A5C] border border-[#2C567F] rounded px-2.5 py-1.5 text-xs text-[#EAF3FC] focus:outline-none focus:border-[#E7A93D]"
                  />
                  <button
                    onClick={handleSaveScore}
                    className="px-3 py-1.5 rounded bg-[#6FCF97] hover:bg-[#5bb882] text-[#0E2A45] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>저장</span>
                  </button>
                </div>
                {saveMsg && <div className="text-[11px] text-[#6FCF97] font-semibold">{saveMsg}</div>}
              </div>
            )}

            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-[#2C567F] text-[#9FC0DC] hover:text-[#EAF3FC] text-xs cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>{showLeaderboard ? '명예의 전당 닫기' : '명예의 전당 보기'}</span>
            </button>

            {showLeaderboard && (
              <div className="mt-3 bg-[#0E2A45] border border-[#2C567F] rounded-lg p-2.5 max-h-40 overflow-y-auto text-xs space-y-1.5">
                <div className="font-bold text-[#E7A93D] mb-1">🏆 모둠 설계 효율 랭킹</div>
                {leaderboard.length === 0 ? (
                  <div className="text-gray-400 text-[11px]">아직 등록된 기록이 없습니다.</div>
                ) : (
                  leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-[#2C567F]/40 text-[11px]"
                    >
                      <span className="font-semibold text-[#EAF3FC]">
                        {idx + 1}위. {entry.name} ({entry.mode.toUpperCase()})
                      </span>
                      <span className="font-mono text-[#6FCF97] font-bold">{entry.score}%</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Educational Comparison Footer */}
          <div className="mt-4 pt-3 border-t border-[#2C567F] text-[11px] text-[#9FC0DC] leading-relaxed">
            <div className="text-[#E7A93D] font-bold mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>MST vs TSP의 결정적 컴퓨터과학 차이</span>
            </div>
            <div>
              <strong>MST(최소 신장 트리):</strong> 컴퓨터가 눈 깜짝할 사이에 정답을 계산합니다 (다항 시간, P 문제).
            </div>
            <div>
              <strong>TSP(외판원 순회):</strong> 도시가 50개만 되어도 슈퍼컴퓨터로 수백 년이 걸리는 현대 암호학의 기반이자 최고의 난제(NP-Hard)입니다!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
