const fs = require('fs');

// 분석 결과 읽기
const analysisData = JSON.parse(fs.readFileSync('./idioms-analysis.json', 'utf8'));
const idiomsData = JSON.parse(fs.readFileSync('./client/public/data/idioms.json', 'utf8'));
const idioms = idiomsData.beginner;

const connections = analysisData.connections;

// 고립된 사자성어 확인 (이미 제거되었을 수 있음)
const isolatedIds = Object.keys(connections).filter(id => connections[id].length === 0).map(Number);
if (isolatedIds.length > 0) {
  console.log('제거할 고립된 사자성어:', isolatedIds.map(id => {
    const idiom = idioms.find(i => i.id === id);
    return idiom ? `${idiom.word} (ID: ${id})` : `(ID: ${id} - 이미 제거됨)`;
  }).join(', '));
}

const connectedIdioms = idioms.filter(i => {
  const id = i.id.toString();
  return connections[id] && connections[id].length > 0;
});
console.log(`\n연결된 사자성어: ${connectedIdioms.length}개\n`);

// 연결 강도 순으로 정렬
const idiomsByConnections = connectedIdioms
  .map(idiom => ({
    ...idiom,
    connectionCount: connections[idiom.id]?.length || 0
  }))
  .sort((a, b) => b.connectionCount - a.connectionCount);

// BFS로 그룹이 연결되어 있는지 확인
function isConnectedGroup(group) {
  if (group.length <= 1) return true;

  const visited = new Set();
  const queue = [group[0].id];
  visited.add(group[0].id);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const connectedIds = connections[currentId]?.map(c => c.id) || [];

    for (const connId of connectedIds) {
      // 그룹 내의 다른 사자성어와 연결되어 있는지 확인
      if (group.some(g => g.id === connId) && !visited.has(connId)) {
        visited.add(connId);
        queue.push(connId);
      }
    }
  }

  return visited.size === group.length;
}

// 그룹 생성 함수 (6~10개 사자성어로 구성, 연결된 그래프 형성)
function createStronglyConnectedGroup(availableIdioms, groupSize, usedIds = new Set()) {
  if (availableIdioms.length === 0) return null;

  const group = [];
  const available = availableIdioms.filter(i => !usedIds.has(i.id));

  if (available.length < groupSize) return null;

  // 1. 가장 연결이 많은 사자성어로 시작
  const start = available[0];
  group.push(start);
  usedIds.add(start.id);

  // 2. 나머지 사자성어를 그리디하게 추가
  while (group.length < groupSize && available.length > 0) {
    let bestCandidate = null;
    let bestScore = -1;

    // 현재 그룹의 최소 1개 이상 사자성어와 연결된 후보 찾기
    for (const candidate of available) {
      if (usedIds.has(candidate.id)) continue;

      let score = 0;
      const connectedIds = connections[candidate.id]?.map(c => c.id) || [];

      // 그룹 내 사자성어와의 연결 개수를 점수로 계산
      for (const groupMember of group) {
        if (connectedIds.includes(groupMember.id)) {
          score++;
        }
      }

      // 최소 1개 이상 연결되어 있고, 점수가 더 높으면 선택
      if (score > 0 && score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      group.push(bestCandidate);
      usedIds.add(bestCandidate.id);
    } else {
      // 더 이상 추가할 수 있는 사자성어가 없으면 중단
      break;
    }
  }

  // 목표 크기에 도달하지 못하거나 연결되지 않은 그룹이면 실패
  if (group.length < groupSize) {
    // 추가했던 것들을 usedIds에서 제거
    group.forEach(i => usedIds.delete(i.id));
    return null;
  }

  // 연결성 검증
  if (!isConnectedGroup(group)) {
    group.forEach(i => usedIds.delete(i.id));
    return null;
  }

  return group;
}

// 여러 그룹 생성 (6개, 8개, 10개 사자성어로 구성)
// 사자성어를 여러 그룹에서 재사용 가능 (다양성 확보)
const groups = {
  size6: [],
  size8: [],
  size10: []
};

// 6개짜리 그룹 생성 (초급용, 많이 생성)
console.log('=== 6개 사자성어 그룹 생성 중 (초급) ===');
const generatedGroups6 = new Set();
let attempts6 = 0;
while (groups.size6.length < 20 && attempts6 < 100) {
  attempts6++;
  // 매번 다른 시작점으로 시도 (다양성 확보)
  const startIdx = Math.floor(Math.random() * Math.min(30, idiomsByConnections.length));
  const rotated = [...idiomsByConnections.slice(startIdx), ...idiomsByConnections.slice(0, startIdx)];
  const group = createStronglyConnectedGroup(rotated, 6, new Set());

  if (group) {
    // 중복 그룹 체크 (같은 사자성어 조합인지)
    const groupKey = group.map(g => g.id).sort().join(',');
    if (!generatedGroups6.has(groupKey)) {
      generatedGroups6.add(groupKey);
      groups.size6.push(group);
      console.log(`그룹 ${groups.size6.length}: ${group.map(g => g.word).join(', ')}`);
    }
  }
}

// 8개짜리 그룹 생성 (중급용)
console.log('\n=== 8개 사자성어 그룹 생성 중 (중급) ===');
const generatedGroups8 = new Set();
let attempts8 = 0;
while (groups.size8.length < 15 && attempts8 < 100) {
  attempts8++;
  const startIdx = Math.floor(Math.random() * Math.min(30, idiomsByConnections.length));
  const rotated = [...idiomsByConnections.slice(startIdx), ...idiomsByConnections.slice(0, startIdx)];
  const group = createStronglyConnectedGroup(rotated, 8, new Set());

  if (group) {
    const groupKey = group.map(g => g.id).sort().join(',');
    if (!generatedGroups8.has(groupKey)) {
      generatedGroups8.add(groupKey);
      groups.size8.push(group);
      console.log(`그룹 ${groups.size8.length}: ${group.map(g => g.word).join(', ')}`);
    }
  }
}

// 10개짜리 그룹 생성 (고급용)
console.log('\n=== 10개 사자성어 그룹 생성 중 (고급) ===');
const generatedGroups10 = new Set();
let attempts10 = 0;
while (groups.size10.length < 10 && attempts10 < 100) {
  attempts10++;
  const startIdx = Math.floor(Math.random() * Math.min(30, idiomsByConnections.length));
  const rotated = [...idiomsByConnections.slice(startIdx), ...idiomsByConnections.slice(0, startIdx)];
  const group = createStronglyConnectedGroup(rotated, 10, new Set());

  if (group) {
    const groupKey = group.map(g => g.id).sort().join(',');
    if (!generatedGroups10.has(groupKey)) {
      generatedGroups10.add(groupKey);
      groups.size10.push(group);
      console.log(`그룹 ${groups.size10.length}: ${group.map(g => g.word).join(', ')}`);
    }
  }
}

console.log('\n=== 그룹 생성 결과 ===');
console.log(`6개 그룹: ${groups.size6.length}개`);
console.log(`8개 그룹: ${groups.size8.length}개`);
console.log(`10개 그룹: ${groups.size10.length}개`);

// 사용된 사자성어 통계
const allUsedIds = new Set();
[...groups.size6, ...groups.size8, ...groups.size10].forEach(group => {
  group.forEach(idiom => allUsedIds.add(idiom.id));
});
console.log(`사용된 사자성어: ${allUsedIds.size}/${connectedIdioms.length}개 (중복 사용 가능)`);

// JSON 업데이트 준비
const updatedIdioms = connectedIdioms.map(idiom => {
  return {
    ...idiom,
    groups: []
  };
});

// 각 사자성어에 속한 그룹 ID 추가
Object.keys(groups).forEach(size => {
  groups[size].forEach((group, groupIndex) => {
    group.forEach(idiom => {
      const idiomInList = updatedIdioms.find(i => i.id === idiom.id);
      if (idiomInList) {
        idiomInList.groups.push(`${size}_${groupIndex}`);
      }
    });
  });
});

// 그룹 메타데이터 생성
const groupMetadata = {
  size6: groups.size6.map((group, index) => ({
    id: `size6_${index}`,
    size: 6,
    idiomIds: group.map(g => g.id),
    idioms: group.map(g => g.word)
  })),
  size8: groups.size8.map((group, index) => ({
    id: `size8_${index}`,
    size: 8,
    idiomIds: group.map(g => g.id),
    idioms: group.map(g => g.word)
  })),
  size10: groups.size10.map((group, index) => ({
    id: `size10_${index}`,
    size: 10,
    idiomIds: group.map(g => g.id),
    idioms: group.map(g => g.word)
  }))
};

// 업데이트된 JSON 저장
const updatedData = {
  beginner: updatedIdioms,
  intermediate: [],
  advanced: [],
  groups: groupMetadata
};

fs.writeFileSync('./client/public/data/idioms.json', JSON.stringify(updatedData, null, 2), 'utf8');
console.log('\n✅ idioms.json 업데이트 완료!');
console.log('   - 고립된 사자성어 2개 제거');
console.log('   - 각 사자성어에 groups 필드 추가');
console.log('   - groups 메타데이터 추가');
