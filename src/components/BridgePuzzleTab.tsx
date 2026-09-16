import React, { useState, useEffect } from 'react';
import { Shield, Scissors, Play, RotateCcw, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, Building2, Stethoscope, Plane, Server, School, Landmark, Radio, Factory, Zap } from 'lucide-react';

interface ScenarioNode {
  id: number;
  label: string;
  x: number;
  y: number;
  group: 'A' | 'B';
}

interface ScenarioEdge {
  from: number;
  to: number;
  isBridge?: boolean;
}

interface BridgeScenario {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: 'school' | 'hospital' | 'city' | 'server' | 'plane' | 'bridge' | 'fortress' | 'bypass' | 'factory';
  groupAName: string;
  groupBName: string;
  patientZero: number;
  patientZeroLabel: string;
  maxCuts: number;
  story: string;
  mathLesson: string;
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
}

export const BridgePuzzleTab: React.FC<{
  onCompleteMission?: (xp: number, stars: number) => void;
  isMissionCompleted?: boolean;
}> = ({ onCompleteMission }) => {
  const SCENARIOS: BridgeScenario[] = [
    {
      id: 'school',
      title: 'A학교 vs B학교 커뮤니티',
      subtitle: '기본 2-클러스터 다리 끊기',
      badge: '🏫 학교 간 교류',
      icon: 'school',
      groupAName: 'A학교 커뮤니티 (감염 발생)',
      groupBName: 'B학교 커뮤니티 (보호 대상)',
      patientZero: 2,
      patientZeroLabel: 'A3 학생',
      maxCuts: 2,
      story: 'A학교 동아리방에서 감염 발생! 두 학교를 잇는 2개의 동아리 교류 다리를 찾아 끊으면 B학교 5명 전원을 완벽히 지킬 수 있습니다.',
      mathLesson: '그래프 이론에서 서로 다른 두 클러스터를 잇는 적은 수의 선을 "브릿지(Bridge)"라고 부릅니다. 이 다리만 차단하면 전체를 격리하지 않고도 확산을 막을 수 있습니다.',
      nodes: [
        // Group A (Left School)
        { id: 0, label: 'A1', x: 100, y: 130, group: 'A' },
        { id: 1, label: 'A2', x: 190, y: 90, group: 'A' },
        { id: 2, label: 'A3 (감염원)', x: 110, y: 280, group: 'A' },
        { id: 3, label: 'A4', x: 210, y: 210, group: 'A' },
        { id: 4, label: 'A5 (허브)', x: 220, y: 320, group: 'A' },

        // Group B (Right School)
        { id: 5, label: 'B1 (허브)', x: 380, y: 130, group: 'B' },
        { id: 6, label: 'B2', x: 480, y: 90, group: 'B' },
        { id: 7, label: 'B3', x: 490, y: 210, group: 'B' },
        { id: 8, label: 'B4', x: 390, y: 290, group: 'B' },
        { id: 9, label: 'B5', x: 490, y: 330, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 4 },
        { from: 1, to: 5, isBridge: true },
        { from: 4, to: 8, isBridge: true },
        { from: 5, to: 6 },
        { from: 5, to: 7 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 7, to: 9 },
        { from: 8, to: 9 },
      ],
    },
    {
      id: 'hospital',
      title: '종합병원 감염내과 & 일반병동',
      subtitle: '원내 집단감염 음압 방화벽',
      badge: '🏥 의료 클러스터',
      icon: 'hospital',
      groupAName: '응급실 & 선별진료 구역',
      groupBName: '일반병동 & 중환자실 (보호 대상)',
      patientZero: 1,
      patientZeroLabel: 'ER 내원환자',
      maxCuts: 2,
      story: '응급실에 고열 환자가 내원했습니다! 본관 병동과 중환자실로 통하는 중앙 복도 차단문(음압 방화벽) 2곳을 폐쇄하여 원내 전파를 막으세요.',
      mathLesson: '병원 감염관리는 "구역화(Zoning)" 기법을 사용합니다. 취약 계층이 모여있는 일반병동으로 통하는 병목 통로를 신속히 격리하는 원리입니다.',
      nodes: [
        { id: 0, label: '접수처', x: 100, y: 130, group: 'A' },
        { id: 1, label: '응급환자', x: 100, y: 270, group: 'A' },
        { id: 2, label: 'ER 간호과', x: 200, y: 130, group: 'A' },
        { id: 3, label: 'ER 이송통로', x: 200, y: 270, group: 'A' },

        { id: 4, label: '중앙스테이션', x: 380, y: 130, group: 'B' },
        { id: 5, label: '중환자실(ICU)', x: 480, y: 90, group: 'B' },
        { id: 6, label: '일반병동 101', x: 490, y: 180, group: 'B' },
        { id: 7, label: '본관 물류실', x: 380, y: 280, group: 'B' },
        { id: 8, label: '일반병동 102', x: 490, y: 270, group: 'B' },
        { id: 9, label: '재활치료실', x: 470, y: 340, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        // Bridges connecting ER to Main Ward
        { from: 2, to: 4, isBridge: true },
        { from: 3, to: 7, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
        { from: 7, to: 9 },
        { from: 8, to: 9 },
      ],
    },
    {
      id: 'city',
      title: '광역 교통망 & 물류 터미널',
      subtitle: '고속도로 관문 선제 차단',
      badge: '🏙️ 도시 간 방역',
      icon: 'city',
      groupAName: '발원 도시 A (물류산단)',
      groupBName: '청정 도시 B (보호 대상)',
      patientZero: 0,
      patientZeroLabel: 'A 물류센터',
      maxCuts: 2,
      story: '발원 도시의 화물 물류센터에서 확진 발생! 인접한 청정 도시로 향하는 2개의 고속도로 IC 요금소를 차단하여 바이러스 유입을 막으세요.',
      mathLesson: '도시 간 전파는 이동량(Traffic)이 집중되는 간선도로를 따라 발생합니다. 교통망 그래프에서 절단점(Cut Edge)을 제어하는 최소 컷(Min-Cut) 알고리즘입니다.',
      nodes: [
        { id: 0, label: '물류센터', x: 90, y: 120, group: 'A' },
        { id: 1, label: 'A공단', x: 90, y: 270, group: 'A' },
        { id: 2, label: 'A 북부IC', x: 200, y: 110, group: 'A' },
        { id: 3, label: 'A 남부IC', x: 200, y: 290, group: 'A' },

        { id: 4, label: 'B 북부톨게이트', x: 380, y: 110, group: 'B' },
        { id: 5, label: 'B 시청', x: 480, y: 90, group: 'B' },
        { id: 6, label: 'B 대학교', x: 480, y: 180, group: 'B' },
        { id: 7, label: 'B 남부톨게이트', x: 380, y: 290, group: 'B' },
        { id: 8, label: 'B 주거단지', x: 490, y: 280, group: 'B' },
        { id: 9, label: 'B KTX역', x: 420, y: 350, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        // Bridges between City A and City B
        { from: 2, to: 4, isBridge: true },
        { from: 3, to: 7, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
        { from: 7, to: 9 },
        { from: 8, to: 9 },
      ],
    },
    {
      id: 'server',
      title: '기업 사내망 & 핵심 고객 DB',
      subtitle: '랜섬웨어 방화벽 망분리',
      badge: '💻 사이버 보안',
      icon: 'server',
      groupAName: '사원 업무망 PC (침투 발생)',
      groupBName: '고객 DB & 결제 서버 (보호 대상)',
      patientZero: 1,
      patientZeroLabel: '피싱 클릭 PC',
      maxCuts: 2,
      story: '사원이 피싱 이메일을 열어 사내 PC 1대가 랜섬웨어에 감염되었습니다! 핵심 결제 서버와 고객 DB망으로 연결된 게이트웨이 포트 2개를 차단하세요.',
      mathLesson: '컴퓨터 보안의 방화벽(Firewall)은 질병의 역학 조사와 완전히 동일한 그래프 이론을 따릅니다. 위험 망과 보안 망 사이의 통로를 격리하는 망분리 기술입니다.',
      nodes: [
        { id: 0, label: '사원 PC1', x: 100, y: 120, group: 'A' },
        { id: 1, label: '감염 PC2', x: 100, y: 270, group: 'A' },
        { id: 2, label: '내부 라우터1', x: 200, y: 130, group: 'A' },
        { id: 3, label: '내부 라우터2', x: 200, y: 270, group: 'A' },

        { id: 4, label: '보안 방화벽', x: 380, y: 130, group: 'B' },
        { id: 5, label: '인증 서버', x: 480, y: 90, group: 'B' },
        { id: 6, label: '고객 DB', x: 490, y: 180, group: 'B' },
        { id: 7, label: '결제 게이트웨이', x: 380, y: 280, group: 'B' },
        { id: 8, label: '금융 결제망', x: 490, y: 270, group: 'B' },
        { id: 9, label: '백업 볼트', x: 470, y: 340, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        // Firewall Bridges
        { from: 2, to: 4, isBridge: true },
        { from: 3, to: 7, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
        { from: 7, to: 9 },
        { from: 8, to: 9 },
      ],
    },
    {
      id: 'plane',
      title: '글로벌 항공 허브 & 국경 방역',
      subtitle: '국제선 직항 노선 입국 통제',
      badge: '✈️ 팬데믹 국경 방역',
      icon: 'plane',
      groupAName: '해외 유행국 공항망',
      groupBName: '국내 5대 거점 공항 (보호 대상)',
      patientZero: 0,
      patientZeroLabel: '해외 공항 A',
      maxCuts: 2,
      story: '해외에서 변이 바이러스가 급속 확산 중입니다! 국내 거점 공항으로 직행하는 직항 노선 2개를 신속히 찾아 입국 제한을 시행하세요.',
      mathLesson: '현대 팬데믹은 지리적 거리보다 "항공망 연결도"에 비례해 퍼집니다. 슈퍼스프레더 허브 공항 간의 직항 노선을 제어하는 것이 국경 방역의 핵심입니다.',
      nodes: [
        { id: 0, label: '해외 공항 A', x: 90, y: 120, group: 'A' },
        { id: 1, label: '해외 공항 B', x: 90, y: 270, group: 'A' },
        { id: 2, label: '해외 허브 1', x: 200, y: 120, group: 'A' },
        { id: 3, label: '해외 허브 2', x: 200, y: 280, group: 'A' },

        { id: 4, label: '인천국제공항', x: 380, y: 120, group: 'B' },
        { id: 5, label: '김포공항', x: 480, y: 90, group: 'B' },
        { id: 6, label: '청주공항', x: 490, y: 180, group: 'B' },
        { id: 7, label: '김해국제공항', x: 380, y: 280, group: 'B' },
        { id: 8, label: '대구공항', x: 490, y: 270, group: 'B' },
        { id: 9, label: '제주공항', x: 470, y: 340, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        // International Flight Bridges
        { from: 2, to: 4, isBridge: true },
        { from: 3, to: 7, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
        { from: 7, to: 9 },
        { from: 8, to: 9 },
      ],
    },
    {
      id: 'single-canyon',
      title: '외딴 섬 유일한 연륙교',
      subtitle: '단 1개 브릿지 차단 (초급 개념편)',
      badge: '🌉 1-Cut 단일 브릿지',
      icon: 'bridge',
      groupAName: '외딴 섬 어촌마을 (발원지)',
      groupBName: '본토 주민 거주구 (보호 대상)',
      patientZero: 0,
      patientZeroLabel: '섬 포구 환자',
      maxCuts: 1,
      story: '외딴 섬의 어촌 포구에서 미지의 감염이 시작되었습니다! 섬과 본토를 이어주는 유일한 해상 현수교 딱 1개만 신속히 차단하면 본토 주민 전원을 완벽히 지킬 수 있습니다.',
      mathLesson: '그래프에서 어떤 변(Edge) 하나를 제거했을 때 연결 요소의 개수가 1개에서 2개로 분리된다면, 이 변을 "절단선(Bridge)"이라고 부릅니다. 브릿지는 방역망의 절대적 병목점입니다.',
      nodes: [
        // Group A (Island)
        { id: 0, label: '섬 포구 (감염원)', x: 80, y: 140, group: 'A' },
        { id: 1, label: '섬 등대', x: 80, y: 280, group: 'A' },
        { id: 2, label: '섬마을 시장', x: 170, y: 210, group: 'A' },
        { id: 3, label: '현수교 섬 입구', x: 250, y: 210, group: 'A' },

        // Group B (Mainland)
        { id: 4, label: '현수교 본토 톨게이트', x: 360, y: 210, group: 'B' },
        { id: 5, label: '본토 해안마을', x: 440, y: 120, group: 'B' },
        { id: 6, label: '본토 시가지', x: 520, y: 150, group: 'B' },
        { id: 7, label: '본토 종합병원', x: 440, y: 300, group: 'B' },
        { id: 8, label: '본토 터미널', x: 520, y: 270, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        // The Single Bridge connecting Island to Mainland!
        { from: 3, to: 4, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 7 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
        { from: 5, to: 7 },
      ],
    },
    {
      id: 'tri-fortress',
      title: '3대 성벽 관문과 내성',
      subtitle: '북문·중앙문·남문 동시 봉쇄 (3-Cut 중급)',
      badge: '🏰 3-Cut 성벽 요새',
      icon: 'fortress',
      groupAName: '외곽 저잣거리 (감염 확산)',
      groupBName: '내성 왕실 & 구휼원 (보호 대상)',
      patientZero: 0,
      patientZeroLabel: '저잣거리 주막',
      maxCuts: 3,
      story: '성 밖 저잣거리에서 전염병이 창궐했습니다! 내성으로 통하는 3개의 관문(북문, 중앙 대문, 남문)을 모두 폐쇄하여 내성 안쪽 주민들을 보호하세요.',
      mathLesson: '두 집단 사이에 겹치지 않는 경로가 3개 존재할 때(Menger의 정리), 두 집단을 완벽히 분리하려면 최소 3개의 변(Min-Cut=3)을 끊어야 합니다.',
      nodes: [
        // Group A (Outer Marketplace)
        { id: 0, label: '저잣거리 주막', x: 80, y: 210, group: 'A' },
        { id: 1, label: '북쪽 장터', x: 180, y: 110, group: 'A' },
        { id: 2, label: '중앙 나들목', x: 180, y: 210, group: 'A' },
        { id: 3, label: '남쪽 축사', x: 180, y: 310, group: 'A' },
        { id: 4, label: '외곽 마구간', x: 100, y: 320, group: 'A' },

        // Group B (Inner Royal Fortress)
        { id: 5, label: '성벽 북문', x: 370, y: 110, group: 'B' },
        { id: 6, label: '북부 궁채', x: 480, y: 90, group: 'B' },
        { id: 7, label: '성벽 중앙문', x: 370, y: 210, group: 'B' },
        { id: 8, label: '중앙 정전', x: 480, y: 210, group: 'B' },
        { id: 9, label: '성벽 남문', x: 370, y: 310, group: 'B' },
        { id: 10, label: '남부 병영', x: 480, y: 330, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 3, to: 4 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        // 3 Bridges through 3 Gates
        { from: 1, to: 5, isBridge: true },
        { from: 2, to: 7, isBridge: true },
        { from: 3, to: 9, isBridge: true },
        { from: 5, to: 6 },
        { from: 7, to: 8 },
        { from: 9, to: 10 },
        { from: 6, to: 8 },
        { from: 8, to: 10 },
      ],
    },
    {
      id: 'bypass-router',
      title: '통신 중계망과 비밀 우회선',
      subtitle: '메인망 & 백도어 바이패스 (2-Cut 함정)',
      badge: '⚡ 우회로 바이패스',
      icon: 'bypass',
      groupAName: '침투된 외부 네트워크망',
      groupBName: '중앙 통신 코어 (보호 대상)',
      patientZero: 0,
      patientZeroLabel: '악성 트래픽 노드',
      maxCuts: 2,
      story: '외부에서 대규모 악성 트래픽이 유입 중입니다! 거대한 메인 통신선만 차단하면 방심하기 쉽지만, 야간 백업용 비밀 우회 광선로까지 찾아내어 2곳을 모두 차단해야 침투를 막을 수 있습니다.',
      mathLesson: '눈에 띄는 주 통로를 차단하더라도 우회 경로(Bypass)가 남아있으면 바이러스나 패킷이 침투합니다. 그래프의 전체 통로를 추적하여 완전한 절단집합(Cut-set)을 구성해야 합니다.',
      nodes: [
        { id: 0, label: '외부 감염원', x: 90, y: 140, group: 'A' },
        { id: 1, label: '외부 분배기', x: 90, y: 280, group: 'A' },
        { id: 2, label: '메인 송출탑', x: 200, y: 130, group: 'A' },
        { id: 3, label: '비상 우회스위치', x: 200, y: 300, group: 'A' },

        { id: 4, label: '코어 라우터 (메인)', x: 380, y: 130, group: 'B' },
        { id: 5, label: '인증 헤드엔드', x: 490, y: 90, group: 'B' },
        { id: 6, label: '중앙 제어국', x: 490, y: 180, group: 'B' },
        { id: 7, label: '보조 수신 허브', x: 380, y: 300, group: 'B' },
        { id: 8, label: '클라우드 스토리지', x: 490, y: 290, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        // 2 Bridges: Main and Bypass
        { from: 2, to: 4, isBridge: true },
        { from: 3, to: 7, isBridge: true },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 8 },
        { from: 7, to: 8 },
      ],
    },
    {
      id: 'smart-factory',
      title: '스마트 팩토리 로봇 제어망',
      subtitle: '생산라인 OT망 ↔ 클라우드 ERP 격리',
      badge: '🏭 스마트 팩토리',
      icon: 'factory',
      groupAName: '공장 현장 로봇 설비 (웜 감염)',
      groupBName: '본사 ERP & 설계 서버 (보호 대상)',
      patientZero: 1,
      patientZeroLabel: '용접 로봇 센서',
      maxCuts: 2,
      story: '공장 생산 라인의 자동 용접 로봇 센서에 산업용 웜코드가 감염되었습니다! 본사 클라우드 ERP 및 핵심 도면 서버로 연결되는 엣지 게이트웨이 포트 2곳을 차단하세요.',
      mathLesson: '스마트 팩토리에서는 현장 운영망(OT)과 비즈니스망(IT)의 경계를 좁혀 통신망을 최소화하고 브릿지 방화벽으로 엄격히 감시하는 "제로 트러스트(Zero-Trust)" 모델을 적용합니다.',
      nodes: [
        { id: 0, label: '프레스 로봇', x: 100, y: 120, group: 'A' },
        { id: 1, label: '용접 센서(감염)', x: 100, y: 260, group: 'A' },
        { id: 2, label: '도장 로봇', x: 190, y: 100, group: 'A' },
        { id: 3, label: '현장 게이트웨이 1', x: 210, y: 190, group: 'A' },
        { id: 4, label: '현장 게이트웨이 2', x: 210, y: 300, group: 'A' },

        { id: 5, label: '본사 보안 라우터', x: 380, y: 140, group: 'B' },
        { id: 6, label: '클라우드 ERP', x: 490, y: 100, group: 'B' },
        { id: 7, label: '핵심 설계 도면DB', x: 490, y: 200, group: 'B' },
        { id: 8, label: '물류 자동화 관제', x: 380, y: 280, group: 'B' },
        { id: 9, label: '원격 유지보수국', x: 480, y: 320, group: 'B' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        // OT to IT Bridges
        { from: 3, to: 5, isBridge: true },
        { from: 4, to: 8, isBridge: true },
        { from: 5, to: 6 },
        { from: 5, to: 7 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 8, to: 9 },
      ],
    },
  ];

  const [currentScenarioId, setCurrentScenarioId] = useState<string>('school');
  const scenario = SCENARIOS.find((s) => s.id === currentScenarioId) || SCENARIOS[0];

  const [cutEdges, setCutEdges] = useState<Set<string>>(new Set());
  const [infectedNodes, setInfectedNodes] = useState<Set<number>>(new Set([scenario.patientZero]));
  const [simulating, setSimulating] = useState<boolean>(false);
  const [stageCleared, setStageCleared] = useState<boolean>(false);
  const [breached, setBreached] = useState<boolean>(false);

  const edgeKey = (u: number, v: number) => (u < v ? `${u}-${v}` : `${v}-${u}`);

  const handleSelectScenario = (id: string) => {
    setCurrentScenarioId(id);
    const target = SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
    setCutEdges(new Set());
    setInfectedNodes(new Set([target.patientZero]));
    setSimulating(false);
    setStageCleared(false);
    setBreached(false);
  };

  const handleToggleCut = (u: number, v: number) => {
    if (simulating) return;
    const k = edgeKey(u, v);
    setCutEdges((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        if (next.size >= scenario.maxCuts) {
          alert(`방화벽 가위는 최대 ${scenario.maxCuts}개의 연결선만 자를 수 있습니다!`);
          return prev;
        }
        next.add(k);
      }
      return next;
    });
    setStageCleared(false);
    setBreached(false);
    setInfectedNodes(new Set([scenario.patientZero]));
  };

  // Run infection spread simulation
  const runSpread = () => {
    setSimulating(true);
    setInfectedNodes(new Set([scenario.patientZero]));
    setStageCleared(false);
    setBreached(false);

    let currentInfected = new Set<number>([scenario.patientZero]);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const nextInfected = new Set<number>(currentInfected);

      currentInfected.forEach((u) => {
        scenario.edges.forEach((e) => {
          const k = edgeKey(e.from, e.to);
          if (cutEdges.has(k)) return; // blocked by firewall!

          if (e.from === u) nextInfected.add(e.to);
          if (e.to === u) nextInfected.add(e.from);
        });
      });

      setInfectedNodes(new Set(nextInfected));
      currentInfected = nextInfected;

      // Check if any node in Group B got infected
      const groupBInfected = Array.from(currentInfected).some((id) => {
        const node = scenario.nodes[id];
        return node && node.group === 'B';
      });

      if (groupBInfected) {
        clearInterval(interval);
        setSimulating(false);
        setBreached(true);
      } else if (step >= 5) {
        clearInterval(interval);
        setSimulating(false);
        setStageCleared(true);
        if (onCompleteMission) onCompleteMission(50, 3);
      }
    }, 550);
  };

  const resetPuzzle = () => {
    setCutEdges(new Set());
    setInfectedNodes(new Set([scenario.patientZero]));
    setSimulating(false);
    setStageCleared(false);
    setBreached(false);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Stethoscope className="w-3.5 h-3.5 text-[#4ADE80]" />;
      case 'city':
        return <Building2 className="w-3.5 h-3.5 text-[#E7A93D]" />;
      case 'server':
        return <Server className="w-3.5 h-3.5 text-[#C084FC]" />;
      case 'plane':
        return <Plane className="w-3.5 h-3.5 text-[#7FC4EE]" />;
      case 'bridge':
        return <Landmark className="w-3.5 h-3.5 text-[#38bdf8]" />;
      case 'fortress':
        return <Building2 className="w-3.5 h-3.5 text-[#f59e0b]" />;
      case 'bypass':
        return <Zap className="w-3.5 h-3.5 text-[#e879f9]" />;
      case 'factory':
        return <Factory className="w-3.5 h-3.5 text-[#34d399]" />;
      default:
        return <School className="w-3.5 h-3.5 text-[#F2B84B]" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-3 border-b border-[#234E47] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAFBF6]">
            방화벽 브릿지 퍼즐 🛡️
          </h2>
          <p className="text-xs sm:text-sm text-[#7DBFB0] mt-1">
            "세상 사람들은 평균 6명만 거치면 모두 연결된다(작은 세상 네트워크)." 반대로,{' '}
            <strong className="text-[#F2B84B]">서로 다른 두 집단을 잇는 좁은 '다리(Bridge)' 소수의 연결선</strong>만 끊으면 바이러스 확산을 완벽히 봉쇄할 수 있습니다!
          </p>
        </div>
        {stageCleared && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80] text-[#4ADE80] text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            보호 구역 감염율 0%! 방화벽 격리 성공!
          </span>
        )}
      </div>

      {/* Scenario Selector Pills */}
      <div className="mb-4 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2.5 shadow-sm">
        <div className="text-[11px] font-bold text-[#EAFBF6] mb-2 px-1 flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F2B84B]" />
            <span>도전할 방화벽 시나리오 선택 (총 9개 실전 예시 · 1-Cut, 2-Cut, 3-Cut 난이도별):</span>
          </div>
          <span className="text-[11px] text-[#F2B84B] font-mono">
            {scenario.badge} · 최대 가위 차단: {scenario.maxCuts}회
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {SCENARIOS.map((s) => {
            const isSelected = currentScenarioId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectScenario(s.id)}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1D4A3E] border-[#F2B84B] shadow-md ring-1 ring-[#F2B84B]/50'
                    : 'bg-[#132E29] border-[#234E47] hover:bg-[#1A3D37] text-[#7DBFB0]'
                }`}
              >
                <div className="flex items-center gap-1">
                  {renderIcon(s.icon)}
                  <span className="text-[10px] font-mono text-[#F2B84B] font-bold truncate">{s.badge}</span>
                </div>
                <div className={`text-xs font-bold mt-1 truncate ${isSelected ? 'text-[#EAFBF6]' : 'text-[#7DBFB0]'}`}>
                  {s.title}
                </div>
                <div className="text-[10px] text-[#7DBFB0]/80 truncate mt-0.5">
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Network Graph */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Background Group Zones */}
            <rect x="40" y="50" width="230" height="325" rx="20" fill="#132E29" opacity="0.5" />
            <text x="155" y="75" fill="#3FA796" fontSize="12" fontWeight="bold" textAnchor="middle">
              {scenario.groupAName}
            </text>

            <rect x="330" y="50" width="230" height="325" rx="20" fill="#153A5C" opacity="0.4" />
            <text x="445" y="75" fill="#7FC4EE" fontSize="12" fontWeight="bold" textAnchor="middle">
              {scenario.groupBName}
            </text>

            {/* Edges */}
            {scenario.edges.map((e) => {
              const u = scenario.nodes[e.from];
              const v = scenario.nodes[e.to];
              if (!u || !v) return null;
              const k = edgeKey(e.from, e.to);
              const isCut = cutEdges.has(k);

              return (
                <g key={k} onClick={() => handleToggleCut(e.from, e.to)} className="cursor-pointer group">
                  {/* Invisible thicker stroke for easy clicking */}
                  <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="transparent" strokeWidth={18} />

                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={
                      isCut
                        ? '#FF6B5C'
                        : e.isBridge
                        ? '#F2B84B'
                        : '#234E47'
                    }
                    strokeWidth={e.isBridge ? 4 : 2}
                    strokeDasharray={isCut ? '5 4' : undefined}
                    className="transition-colors group-hover:stroke-[#F2B84B]"
                  />

                  {/* Scissors icon on cut edge */}
                  {isCut && (
                    <g transform={`translate(${(u.x + v.x) / 2 - 10}, ${(u.y + v.y) / 2 - 10})`}>
                      <circle cx="10" cy="10" r="11" fill="#FF6B5C" />
                      <text x="10" y="14" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="bold">
                        ✕
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {scenario.nodes.map((node) => {
              const isInfected = infectedNodes.has(node.id);
              const isPatientZero = node.id === scenario.patientZero;
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isPatientZero ? 18 : 14}
                    fill={
                      isInfected
                        ? '#FF6B5C'
                        : node.group === 'A'
                        ? '#3FA796'
                        : '#4B6B94'
                    }
                    stroke={isPatientZero ? '#FFD166' : isInfected ? '#FFFFFF' : '#EAFBF6'}
                    strokeWidth={isPatientZero ? 3 : 2}
                    className="transition-colors duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#FFFFFF"
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {node.label.split(' ')[0]}
                  </text>
                  {isPatientZero && (
                    <text
                      x={node.x}
                      y={node.y + 24}
                      fill="#FF6B5C"
                      fontSize={10}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      최초 감염 ({scenario.patientZeroLabel})
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#132E29] border border-[#234E47] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#F2B84B] font-bold uppercase tracking-wider mb-2">
              방화벽 설치 제어반
            </div>

            {/* Scenario Story Box */}
            <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs space-y-1.5 mb-3">
              <div className="font-bold text-[#EAFBF6] flex items-center gap-1.5">
                {renderIcon(scenario.icon)}
                <span>{scenario.title}</span>
              </div>
              <p className="text-[#7DBFB0] leading-relaxed">
                {scenario.story}
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-[#234E47]">
                <span className="text-[#7DBFB0]">가위(방화벽) 사용:</span>
                <b className="font-mono text-sm text-[#F2B84B]">
                  {cutEdges.size} / {scenario.maxCuts} 개
                </b>
              </div>
            </div>

            {/* Simulation Feedback */}
            {breached && (
              <div className="p-3 rounded-lg bg-[#FF6B5C]/20 border border-[#FF6B5C] text-xs text-[#FF6B5C] mb-3 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>방화벽 뚫림!</strong>
                  <div className="text-[11px] mt-0.5">
                    차단되지 않은 다리를 통해 {scenario.groupBName} 구역으로 전파되었습니다. 다른 다리를 잘라보세요!
                  </div>
                </div>
              </div>
            )}

            {stageCleared && (
              <div className="p-3 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80] text-xs text-[#4ADE80] mb-3 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>격리 성공!</strong>
                  <div className="text-[11px] mt-0.5">
                    핵심 다리를 완벽히 차단하여 {scenario.groupBName}의 전원을 전파로부터 지켜냈습니다! (+50 XP)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-3">
              <button
                onClick={runSpread}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#d9a038] text-[#0A1A18] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>바이러스 확산 시작!</span>
              </button>

              <button
                onClick={resetPuzzle}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#234E47] hover:bg-[#1A3D37] text-[#7DBFB0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>방화벽 초기화</span>
              </button>
            </div>

            {/* Educational Math Lesson Box */}
            <div className="bg-[#0A1A18] border border-[#234E47] rounded-lg p-3 text-xs leading-relaxed">
              <div className="text-[#F2B84B] font-bold mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>그래프 이론 핵심: '브릿지와 최소 컷'</span>
              </div>
              <p className="text-[#7DBFB0]">
                {scenario.mathLesson}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
