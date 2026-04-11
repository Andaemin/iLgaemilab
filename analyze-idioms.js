const fs = require('fs');

// idioms.json 읽기
const data = JSON.parse(fs.readFileSync('./client/public/data/idioms.json', 'utf8'));
const idioms = data.beginner;

console.log(`총 ${idioms.length}개의 사자성어 분석 중...\n`);

// 각 사자성어의 글자 분석
const analysis = idioms.map(idiom => ({
  id: idiom.id,
  word: idiom.word,
  hanja: idiom.hanja,
  chars: idiom.word.split('')
}));

// 공통 글자 찾기 및 연결 정보 생성
const connections = {};
analysis.forEach(idiom => {
  connections[idiom.id] = [];

  analysis.forEach(other => {
    if (idiom.id !== other.id) {
      // 공통 글자 찾기
      const commonChars = idiom.chars.filter(char => other.chars.includes(char));
      if (commonChars.length > 0) {
        connections[idiom.id].push({
          id: other.id,
          word: other.word,
          commonChars: [...new Set(commonChars)] // 중복 제거
        });
      }
    }
  });
});

// 연결 통계
console.log('=== 연결 통계 ===');
let totalConnections = 0;
let minConnections = Infinity;
let maxConnections = 0;
let weaklyConnected = []; // 연결이 5개 미만인 사자성어

Object.keys(connections).forEach(id => {
  const count = connections[id].length;
  totalConnections += count;
  minConnections = Math.min(minConnections, count);
  maxConnections = Math.max(maxConnections, count);

  if (count < 10) {
    const idiom = idioms.find(i => i.id === parseInt(id));
    weaklyConnected.push({ id, word: idiom.word, count });
  }
});

console.log(`평균 연결: ${(totalConnections / idioms.length).toFixed(1)}개`);
console.log(`최소 연결: ${minConnections}개`);
console.log(`최대 연결: ${maxConnections}개`);
console.log(`\n연결이 약한 사자성어 (10개 미만): ${weaklyConnected.length}개`);

weaklyConnected.sort((a, b) => a.count - b.count);
weaklyConnected.slice(0, 10).forEach(item => {
  console.log(`  - ${item.word}: ${item.count}개 연결`);
});

// 그래프 탐색으로 최대 연결 그룹 찾기 (BFS)
function findLargestConnectedGroup(startId, minGroupSize = 6) {
  const visited = new Set();
  const queue = [startId];
  const group = [];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (visited.has(currentId)) continue;
    visited.add(currentId);
    group.push(currentId);

    // 연결된 사자성어 탐색
    connections[currentId].forEach(conn => {
      if (!visited.has(conn.id)) {
        queue.push(conn.id);
      }
    });
  }

  return group;
}

// 모든 사자성어가 하나의 그룹으로 연결되어 있는지 확인
const mainGroup = findLargestConnectedGroup(1);
console.log(`\n=== 연결 그룹 분석 ===`);
console.log(`메인 그룹 크기: ${mainGroup.length}개 (전체의 ${(mainGroup.length / idioms.length * 100).toFixed(1)}%)`);

if (mainGroup.length === idioms.length) {
  console.log('✅ 모든 사자성어가 하나의 그룹으로 연결되어 있습니다!');
} else {
  console.log('⚠️ 일부 사자성어가 고립되어 있습니다.');
  const isolated = idioms.filter(i => !mainGroup.includes(i.id));
  console.log(`고립된 사자성어 (${isolated.length}개):`);
  isolated.forEach(i => console.log(`  - ${i.word} (${i.hanja})`));
}

// 강하게 연결된 서브 그룹 찾기 (최소 6개 이상이 서로 잘 연결된 그룹)
console.log('\n=== 강하게 연결된 그룹 찾기 ===');

// 연결 수가 많은 사자성어부터 시작해서 그룹 생성
const sortedByConnections = Object.keys(connections)
  .map(id => ({ id: parseInt(id), count: connections[id].length }))
  .sort((a, b) => b.count - a.count);

console.log(`\n상위 10개 연결이 많은 사자성어:`);
sortedByConnections.slice(0, 10).forEach((item, index) => {
  const idiom = idioms.find(i => i.id === item.id);
  console.log(`${index + 1}. ${idiom.word} (${idiom.hanja}): ${item.count}개 연결`);
});

// 글자별 빈도 분석
console.log('\n=== 글자 빈도 분석 ===');
const charFreq = {};
analysis.forEach(idiom => {
  idiom.chars.forEach(char => {
    charFreq[char] = (charFreq[char] || 0) + 1;
  });
});

const sortedChars = Object.keys(charFreq)
  .map(char => ({ char, count: charFreq[char] }))
  .sort((a, b) => b.count - a.count);

console.log('가장 많이 사용된 글자 (Top 20):');
sortedChars.slice(0, 20).forEach((item, index) => {
  console.log(`${index + 1}. "${item.char}": ${item.count}개 사자성어에서 사용`);
});

// 연결 정보를 JSON 파일로 저장
const outputData = {
  totalIdioms: idioms.length,
  connections: connections,
  charFrequency: charFreq,
  statistics: {
    avgConnections: (totalConnections / idioms.length).toFixed(1),
    minConnections,
    maxConnections,
    mainGroupSize: mainGroup.length
  }
};

fs.writeFileSync('./idioms-analysis.json', JSON.stringify(outputData, null, 2));
console.log('\n✅ 분석 결과를 idioms-analysis.json에 저장했습니다.');
