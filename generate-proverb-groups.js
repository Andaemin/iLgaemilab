const fs = require('fs');
const path = require('path');

// proverbs.json 파일 읽기
const proverbsPath = path.join(__dirname, 'client', 'public', 'data', 'proverbs.json');
const proverbsData = JSON.parse(fs.readFileSync(proverbsPath, 'utf8'));

// 두 단어가 공통 글자를 가지고 있는지 확인
function hasCommonChar(word1, word2) {
    const chars1 = word1.split('');
    const chars2 = word2.split('');
    return chars1.some(char => chars2.includes(char));
}

// 교차 가능성 맵 생성
function buildCrossabilityMap(proverbs) {
    const map = new Map();

    proverbs.forEach(proverb => {
        const crossable = [];
        proverbs.forEach(other => {
            if (proverb.id !== other.id && hasCommonChar(proverb.word, other.word)) {
                crossable.push(other.id);
            }
        });
        map.set(proverb.id, crossable);
    });

    return map;
}

// 그룹 내 모든 단어가 서로 연결되어 있는지 확인 (BFS)
function isFullyConnected(proverbIds, crossabilityMap) {
    if (proverbIds.length <= 1) return true;

    const visited = new Set();
    const queue = [proverbIds[0]];
    visited.add(proverbIds[0]);

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = crossabilityMap.get(current) || [];

        for (const neighbor of neighbors) {
            if (proverbIds.includes(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return visited.size === proverbIds.length;
}

// 특정 크기의 교차 가능한 그룹 생성
function generateGroups(proverbs, groupSize, crossabilityMap, maxGroups = 50) {
    const groups = [];
    const usedInGroups = new Set();

    console.log(`\n${groupSize}개 그룹 생성 중...`);

    // 모든 조합을 시도하는 대신, 각 속담을 시작점으로 그룹 생성
    for (let startIdx = 0; startIdx < proverbs.length && groups.length < maxGroups; startIdx++) {
        const startProverb = proverbs[startIdx];

        // 이 속담으로 시작하는 그룹 생성 시도
        const group = [startProverb.id];
        const candidates = [...(crossabilityMap.get(startProverb.id) || [])];

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
                [...g.proverbIds].sort().join(',') === groupKey
            );

            if (!isDuplicate) {
                const groupData = {
                    id: `size${groupSize}_${groups.length}`,
                    size: groupSize,
                    proverbIds: group,
                    proverbs: group.map(id => proverbs.find(i => i.id === id).word)
                };
                groups.push(groupData);

                // 사용된 속담 추적
                group.forEach(id => usedInGroups.add(id));
            }
        }
    }

    console.log(`생성된 그룹: ${groups.length}개`);
    console.log(`그룹에 포함된 속담: ${usedInGroups.size}/${proverbs.length}개`);

    return groups;
}

// 메인 함수
function main() {
    console.log('속담 그룹 생성 시작...\n');

    // 초급, 중급, 고급을 합쳐서 처리
    const allProverbs = [
        ...proverbsData.beginner,
        ...proverbsData.intermediate,
        ...proverbsData.advanced
    ];

    console.log(`전체 속담: ${allProverbs.length}개`);

    // 교차 가능성 맵 생성
    const crossabilityMap = buildCrossabilityMap(allProverbs);

    // 각 속담의 교차 가능한 개수 확인
    const crossabilityCounts = Array.from(crossabilityMap.entries())
        .map(([id, crossable]) => ({ id, count: crossable.length }))
        .sort((a, b) => b.count - a.count);

    console.log('\n교차 가능성 통계:');
    console.log(`평균 교차 가능 개수: ${(crossabilityCounts.reduce((sum, c) => sum + c.count, 0) / crossabilityCounts.length).toFixed(2)}`);
    console.log(`최대 교차 가능 개수: ${crossabilityCounts[0].count}`);
    console.log(`최소 교차 가능 개수: ${crossabilityCounts[crossabilityCounts.length - 1].count}`);

    // 그룹 생성
    const size6Groups = generateGroups(allProverbs, 6, crossabilityMap, 50);
    const size8Groups = generateGroups(allProverbs, 8, crossabilityMap, 50);
    const size10Groups = generateGroups(allProverbs, 10, crossabilityMap, 30);

    // 각 속담의 groups 배열 업데이트
    console.log('\n각 속담의 groups 배열 업데이트 중...');

    // 초기화
    proverbsData.beginner.forEach(proverb => {
        proverb.groups = [];
    });
    proverbsData.intermediate.forEach(proverb => {
        proverb.groups = [];
    });
    proverbsData.advanced.forEach(proverb => {
        proverb.groups = [];
    });

    // 그룹 정보 업데이트 함수
    function updateProverbGroups(groups) {
        groups.forEach(group => {
            group.proverbIds.forEach(id => {
                let proverb = proverbsData.beginner.find(i => i.id === id);
                if (!proverb) proverb = proverbsData.intermediate.find(i => i.id === id);
                if (!proverb) proverb = proverbsData.advanced.find(i => i.id === id);

                if (proverb && !proverb.groups.includes(group.id)) {
                    proverb.groups.push(group.id);
                }
            });
        });
    }

    // size6 그룹
    updateProverbGroups(size6Groups);
    // size8 그룹
    updateProverbGroups(size8Groups);
    // size10 그룹
    updateProverbGroups(size10Groups);

    // groups 객체 업데이트
    proverbsData.groups = {
        size6: size6Groups,
        size8: size8Groups,
        size10: size10Groups
    };

    // 파일 저장
    fs.writeFileSync(proverbsPath, JSON.stringify(proverbsData, null, 2), 'utf8');
    console.log('\nproverbs.json 파일이 업데이트되었습니다!');

    // 통계 출력
    const withGroups = allProverbs.filter(p => {
        let proverb = proverbsData.beginner.find(i => i.id === p.id);
        if (!proverb) proverb = proverbsData.intermediate.find(i => i.id === p.id);
        if (!proverb) proverb = proverbsData.advanced.find(i => i.id === p.id);
        return proverb && proverb.groups && proverb.groups.length > 0;
    }).length;
    const withoutGroups = allProverbs.length - withGroups;

    console.log('\n최종 통계:');
    console.log(`- size6 그룹: ${size6Groups.length}개`);
    console.log(`- size8 그룹: ${size8Groups.length}개`);
    console.log(`- size10 그룹: ${size10Groups.length}개`);
    console.log(`- 그룹에 포함된 속담: ${withGroups}개`);
    console.log(`- 그룹에 포함되지 않은 속담: ${withoutGroups}개`);

    if (withoutGroups > 0) {
        console.log('\n그룹에 포함되지 않은 속담들:');
        allProverbs.forEach(p => {
            let proverb = proverbsData.beginner.find(i => i.id === p.id);
            if (!proverb) proverb = proverbsData.intermediate.find(i => i.id === p.id);
            if (!proverb) proverb = proverbsData.advanced.find(i => i.id === p.id);

            if (proverb && (!proverb.groups || proverb.groups.length === 0)) {
                const crossable = crossabilityMap.get(p.id).length;
                console.log(`  - ${p.word} (ID: ${p.id}, 교차 가능: ${crossable}개)`);
            }
        });
    }
}

main();
