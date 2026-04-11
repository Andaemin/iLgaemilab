const fs = require('fs');
const path = require('path');

const idiomsPath = path.join(__dirname, 'client', 'public', 'data', 'idioms.json');
const data = JSON.parse(fs.readFileSync(idiomsPath, 'utf8'));

const target = data.beginner.find(i => i.word === '자문자답');
console.log('자문자답 정보:');
console.log('- ID:', target.id);
console.log('- 한자:', target.hanja);
console.log('- 의미:', target.meaning);
console.log('- 그룹 수:', target.groups.length);

console.log('\n자문자답의 글자:', target.word.split('').join(', '));

console.log('\n자문자답과 교차 가능한 사자성어:');
const chars = target.word.split('');
let count = 0;

data.beginner.forEach(i => {
    if (i.id !== target.id) {
        const commonChars = chars.filter(c => i.word.includes(c));
        if (commonChars.length > 0) {
            count++;
            const uniqueCommon = [...new Set(commonChars)];
            console.log(`${count}. ${i.word} (공통 글자: ${uniqueCommon.join(', ')}, 그룹 수: ${i.groups.length})`);
        }
    }
});

console.log(`\n총 ${count}개의 사자성어와 교차 가능`);

// 자문자답을 포함할 수 있는 기존 그룹 찾기
console.log('\n자문자답을 추가할 수 있는 그룹 찾기...');
let foundGroups = 0;

['size6', 'size8', 'size10'].forEach(sizeKey => {
    data.groups[sizeKey].forEach(group => {
        // 그룹의 모든 사자성어가 자문자답과 교차 가능한지 확인
        const canAdd = group.idiomIds.every(id => {
            const idiom = data.beginner.find(i => i.id === id);
            const hasCommon = chars.some(c => idiom.word.includes(c));
            return hasCommon;
        });

        if (canAdd && foundGroups < 5) {
            foundGroups++;
            console.log(`\n${group.id}:`);
            console.log('- 사자성어:', group.idioms.join(', '));
            console.log('- 자문자답 추가 가능!');
        }
    });
});

if (foundGroups === 0) {
    console.log('자문자답을 추가할 수 있는 그룹을 찾지 못했습니다.');
}
