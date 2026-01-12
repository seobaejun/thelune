const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 파일 읽기
const excelPath = path.join(__dirname, '..', '.playwright-mcp', 'THE LUNE 견적서_25.1.10.xlsx');
const workbook = XLSX.readFile(excelPath);

// TLV4 시트 분석 (4인승 VVIP)
const worksheet = workbook.Sheets['TLV4'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log('=== TLV4 시트 전체 분석 ===\n');

// 모든 행을 출력하여 구조 파악
const options = {
    '추가 옵션': [],
    '퍼포먼스 옵션': [],
    '특장라인업 옵션': []
};

let inAdditionalSection = false;
let inPerformanceSection = false;
let inSpecialLineupSection = false;

data.forEach((row, index) => {
    const rowStr = row.join('|');
    
    // 섹션 시작 찾기
    if (rowStr.includes('추가 옵션') || rowStr.includes('추가옵션')) {
        inAdditionalSection = true;
        inPerformanceSection = false;
        inSpecialLineupSection = false;
        console.log(`\n[추가 옵션 섹션 시작 - 행 ${index + 1}]`);
    } else if (rowStr.includes('퍼포먼스') || rowStr.includes('성능')) {
        inAdditionalSection = false;
        inPerformanceSection = true;
        inSpecialLineupSection = false;
        console.log(`\n[퍼포먼스 옵션 섹션 시작 - 행 ${index + 1}]`);
    } else if (rowStr.includes('특장') || rowStr.includes('라인업')) {
        inAdditionalSection = false;
        inPerformanceSection = false;
        inSpecialLineupSection = true;
        console.log(`\n[특장라인업 옵션 섹션 시작 - 행 ${index + 1}]`);
    } else if (rowStr.includes('■') && index > 0) {
        // 새로운 섹션 시작
        inAdditionalSection = false;
        inPerformanceSection = false;
        inSpecialLineupSection = false;
    }
    
    // 각 섹션의 데이터 수집
    if (inAdditionalSection || inPerformanceSection || inSpecialLineupSection) {
        const optionName = (row[0] || '').toString().trim();
        const optionDesc = (row[1] || '').toString().trim();
        const price1 = row[14];
        const price2 = row[15];
        const price3 = row[16];
        
        // 가격 추출
        let price = 0;
        if (typeof price1 === 'number' && price1 > 0) price = price1;
        else if (typeof price2 === 'number' && price2 > 0) price = price2;
        else if (typeof price3 === 'number' && price3 > 0) price = price3;
        
        if (optionName && optionName.length > 0 && optionName.length < 100 && 
            !optionName.includes('■') && !optionName.includes('견 적') && 
            !optionName.includes('고객') && !optionName.includes('상 호')) {
            
            const option = {
                name: optionName,
                description: optionDesc,
                price: price
            };
            
            if (inAdditionalSection) {
                options['추가 옵션'].push(option);
            } else if (inPerformanceSection) {
                options['퍼포먼스 옵션'].push(option);
            } else if (inSpecialLineupSection) {
                options['특장라인업 옵션'].push(option);
            }
            
            console.log(`행 ${index + 1}: ${optionName} - ${optionDesc || ''} (${price > 0 ? price.toLocaleString() + '원' : '기본 포함'})`);
        }
    }
});

// 결과 저장
fs.writeFileSync(
    path.join(__dirname, 'analyzed-options.json'),
    JSON.stringify(options, null, 2),
    'utf8'
);

console.log('\n\n=== 최종 추출된 옵션 ===');
Object.keys(options).forEach(section => {
    console.log(`\n[${section}]`);
    options[section].forEach((opt, idx) => {
        console.log(`${idx + 1}. ${opt.name} - ${opt.price > 0 ? opt.price.toLocaleString() + '원' : '기본 포함'}`);
    });
});

console.log('\n\n분석 결과가 analyzed-options.json 파일로 저장되었습니다.');





