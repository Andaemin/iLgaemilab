const fs = require('fs');
const path = require('path');

// idioms.json 파일 읽기
const idiomsPath = path.join(__dirname, 'client', 'public', 'data', 'idioms.json');
const idiomsData = JSON.parse(fs.readFileSync(idiomsPath, 'utf8'));

// 두 단어가 공통 글자를 가지고 있는지 확인
function hasCommonChar(word1, word2) {
    const chars1 = word1.split('');
    const chars2 = word2.split('');
    return chars1.some(char => chars2.includes(char));
}

// 교차 가능성 맵 생성
function buildCrossabilityMap(idioms) {
    const map = new Map();

    idioms.forEach(idiom => {
        const crossable = [];
        idioms.forEach(other => {
            if (idiom.id !== other.id && hasCommonChar(idiom.word, other.word)) {
                crossable.push(other.id);
            }
        });
        map.set(idiom.id, crossable);
    });

    return map;
}

// 그룹 내 모든 단어가 서로 연결되어 있는지 확인 (BFS)
function isFullyConnected(idiomIds, crossabilityMap) {
    if (idiomIds.length <= 1) return true;

    const visited = new Set();
    const queue = [idiomIds[0]];
    visited.add(idiomIds[0]);

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = crossabilityMap.get(current) || [];

        for (const neighbor of neighbors) {
            if (idiomIds.includes(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return visited.size === idiomIds.length;
}

// 특정 크기의 교차 가능한 그룹 생성
function generateGroups(idioms, groupSize, crossabilityMap, maxGroups = 50) {
    const groups = [];
    const usedInGroups = new Set();

    console.log(`\n${groupSize}개 그룹 생성 중...`);

    // 모든 조합을 시도하는 대신, 각 사자성어를 시작점으로 그룹 생성
    for (let startIdx = 0; startIdx < idioms.length && groups.length < maxGroups; startIdx++) {
        const startIdiom = idioms[startIdx];

        // 이 사자성어로 시작하는 그룹 생성 시도
        const group = [startIdiom.id];
        const candidates = [...(crossabilityMap.get(startIdiom.id) || [])];

        // 그룹 크기가 될 때까지 단어 추가
        while (group.length < groupSize && candidates.length > 0) {
            // 랜덤하게 후보 선택
            const randIdx = Math.floor(Math.random() * candidates.length);
            const candidateId = candidates[randIdx];
            candidates.splice(randIdx, 1);

            // 후보를 그룹에 추가해도 연결성이 유지되는지 확인
            const testGroup = [...group, candidateId];
            if (isFullyConnected(testGroup, crossabilityMap)) {
                group.push(candidateId);

                // 새로운 후보들 추가 (이미 그룹에 있거나 후보 목록에 있는 것은 제외)
                const newCandidates = crossabilityMap.get(candidateId) || [];
                for (const newCand of newCandidates) {
                    if (!group.includes(newCand) && !candidates.includes(newCand)) {
                        candidates.push(newCand);
                    }
                }
            }
        }

        // 그룹 크기가 맞으면 추가
        if (group.length === groupSize) {
            // 중복 확인 (같은 조합이 이미 있는지)
            const groupKey = [...group].sort().join(',');
            const isDuplicate = groups.some(g =>
                [...g.idiomIds].sort().join(',') === groupKey
            );

            if (!isDuplicate) {
                const groupData = {
                    id: `size${groupSize}_${groups.length}`,
                    size: groupSize,
                    idiomIds: group,
                    idioms: group.map(id => idioms.find(i => i.id === id).word)
                };
                groups.push(groupData);

                // 사용된 사자성어 추적
                group.forEach(id => usedInGroups.add(id));
            }
        }
    }

    console.log(`생성된 그룹: ${groups.length}개`);
    console.log(`그룹에 포함된 사자성어: ${usedInGroups.size}/${idioms.length}개`);

    return groups;
}

// 메인 함수
function main() {
    console.log('사자성어 그룹 생성 시작...\n');
    console.log(`전체 사자성어: ${idiomsData.beginner.length}개`);

    // 교차 가능성 맵 생성
    const crossabilityMap = buildCrossabilityMap(idiomsData.beginner);

    // 각 사자성어의 교차 가능한 개수 확인
    const crossabilityCounts = Array.from(crossabilityMap.entries())
        .map(([id, crossable]) => ({ id, count: crossable.length }))
        .sort((a, b) => b.count - a.count);

    console.log('\n교차 가능성 통계:');
    console.log(`평균 교차 가능 개수: ${crossabilityCounts.reduce((sum, c) => sum + c.count, 0) / crossabilityCounts.length}`);
    console.log(`최대 교차 가능 개수: ${crossabilityCounts[0].count}`);
    console.log(`최소 교차 가능 개수: ${crossabilityCounts[crossabilityCounts.length - 1].count}`);

    // 그룹 생성
    const size6Groups = generateGroups(idiomsData.beginner, 6, crossabilityMap, 50);
    const size8Groups = generateGroups(idiomsData.beginner, 8, crossabilityMap, 50);
    const size10Groups = generateGroups(idiomsData.beginner, 10, crossabilityMap, 30);

    // 각 사자성어의 groups 배열 업데이트
    console.log('\n각 사자성어의 groups 배열 업데이트 중...');
    idiomsData.beginner.forEach(idiom => {
        idiom.groups = [];
    });

    // size6 그룹
    size6Groups.forEach(group => {
        group.idiomIds.forEach(id => {
            const idiom = idiomsData.beginner.find(i => i.id === id);
            if (idiom && !idiom.groups.includes(group.id)) {
                idiom.groups.push(group.id);
            }
        });
    });

    // size8 그룹
    size8Groups.forEach(group => {
        group.idiomIds.forEach(id => {
            const idiom = idiomsData.beginner.find(i => i.id === id);
            if (idiom && !idiom.groups.includes(group.id)) {
                idiom.groups.push(group.id);
            }
        });
    });

    // size10 그룹
    size10Groups.forEach(group => {
        group.idiomIds.forEach(id => {
            const idiom = idiomsData.beginner.find(i => i.id === id);
            if (idiom && !idiom.groups.includes(group.id)) {
                idiom.groups.push(group.id);
            }
        });
    });

    // groups 객체 업데이트
    idiomsData.groups = {
        size6: size6Groups,
        size8: size8Groups,
        size10: size10Groups
    };

    // 파일 저장
    fs.writeFileSync(idiomsPath, JSON.stringify(idiomsData, null, 2), 'utf8');
    console.log('\nidioms.json 파일이 업데이트되었습니다!');

    // 통계 출력
    const withGroups = idiomsData.beginner.filter(i => i.groups.length > 0).length;
    const withoutGroups = idiomsData.beginner.filter(i => i.groups.length === 0).length;

    console.log('\n최종 통계:');
    console.log(`- size6 그룹: ${size6Groups.length}개`);
    console.log(`- size8 그룹: ${size8Groups.length}개`);
    console.log(`- size10 그룹: ${size10Groups.length}개`);
    console.log(`- 그룹에 포함된 사자성어: ${withGroups}개`);
    console.log(`- 그룹에 포함되지 않은 사자성어: ${withoutGroups}개`);

    if (withoutGroups > 0) {
        console.log('\n그룹에 포함되지 않은 사자성어들:');
        idiomsData.beginner
            .filter(i => i.groups.length === 0)
            .forEach(i => {
                const crossable = crossabilityMap.get(i.id).length;
                console.log(`  - ${i.word} (ID: ${i.id}, 교차 가능: ${crossable}개)`);
            });
    }
}

main();
