const fs = require('fs');
const path = require('path');

// Excel 데이터 읽기
const excelData = JSON.parse(fs.readFileSync(path.join(__dirname, 'excel-data.json'), 'utf8'));

// TLV4 시트 분석 (4인승 VVIP - 현재 quote.html에 맞는 시트)
const tlv4Data = excelData.TLV4;

console.log('=== TLV4 시트 전체 데이터 분석 ===\n');

// 섹션별로 데이터 추출
const sections = {
    '차량 선택 옵션': [],
    '기본 컨버전 옵션': [],
    '컨버전 옵션 선택': [],
    '추가 옵션': [],
    '퍼포먼스 옵션': []
};

let currentSection = null;
let sectionStartRow = -1;

tlv4Data.forEach((row, index) => {
    const firstCell = row[0] || '';
    const secondCell = row[1] || '';
    
    // 섹션 헤더 찾기
    if (firstCell.includes('■') || firstCell.includes('차량 선택') || firstCell.includes('기본 컨버전') || 
        firstCell.includes('컨버전 옵션') || firstCell.includes('추가 옵션') || firstCell.includes('퍼포먼스')) {
        if (firstCell.includes('차량 선택')) {
            currentSection = '차량 선택 옵션';
            sectionStartRow = index;
        } else if (firstCell.includes('기본 컨버전')) {
            currentSection = '기본 컨버전 옵션';
            sectionStartRow = index;
        } else if (firstCell.includes('컨버전 옵션')) {
            currentSection = '컨버전 옵션 선택';
            sectionStartRow = index;
        } else if (firstCell.includes('추가 옵션')) {
            currentSection = '추가 옵션';
            sectionStartRow = index;
        } else if (firstCell.includes('퍼포먼스')) {
            currentSection = '퍼포먼스 옵션';
            sectionStartRow = index;
        }
    }
    
    // 현재 섹션의 데이터 수집
    if (currentSection && index > sectionStartRow) {
        // 다음 섹션이 시작되면 중단
        if (firstCell.includes('■') && index > sectionStartRow + 1) {
            // 다음 섹션으로 넘어감
        } else {
            sections[currentSection].push({ row: index + 1, data: row });
        }
    }
});

// 옵션 추출 함수
function extractOptions(sectionName, data) {
    const options = [];
    
    data.forEach((item, idx) => {
        const row = item.data;
        const name = (row[0] || '').toString();
        const desc = (row[1] || '').toString();
        const price = row[14] || row[15] || row[16] || 0;
        
        // 옵션 이름이 있고 가격이 있는 경우
        if (name && name.trim() && !name.includes('■') && !name.includes('견 적 서') && 
            !name.includes('고객') && !name.includes('상 호') && name.length < 50) {
            
            // 가격 추출 (숫자만)
            let priceValue = 0;
            if (typeof price === 'number') {
                priceValue = price;
            } else if (typeof price === 'string') {
                const match = price.toString().replace(/,/g, '').match(/\d+/);
                if (match) {
                    priceValue = parseInt(match[0]);
                }
            }
            
            if (name.trim() && (priceValue > 0 || desc.trim())) {
                options.push({
                    name: name.trim(),
                    description: desc.trim(),
                    price: priceValue
                });
            }
        }
    });
    
    return options;
}

// 각 섹션의 옵션 추출
console.log('=== 추출된 옵션들 ===\n');

Object.keys(sections).forEach(sectionName => {
    console.log(`\n[${sectionName}]`);
    const options = extractOptions(sectionName, sections[sectionName]);
    options.forEach((opt, idx) => {
        if (opt.name && opt.name.length < 100) {
            console.log(`${idx + 1}. ${opt.name} - ${opt.description || ''} (${opt.price > 0 ? opt.price.toLocaleString() + '원' : '기본 포함'})`);
        }
    });
});

// JSON으로 저장
const extractedOptions = {};
Object.keys(sections).forEach(sectionName => {
    extractedOptions[sectionName] = extractOptions(sectionName, sections[sectionName]);
});

fs.writeFileSync(
    path.join(__dirname, 'extracted-options.json'),
    JSON.stringify(extractedOptions, null, 2),
    'utf8'
);

console.log('\n\n추출된 옵션이 extracted-options.json 파일로 저장되었습니다.');

