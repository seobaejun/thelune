const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 파일 읽기
const excelPath = path.join(__dirname, '..', '.playwright-mcp', 'THE LUNE 견적서_25.1.10.xlsx');
const workbook = XLSX.readFile(excelPath);

// TLV4 시트 분석
const worksheet = workbook.Sheets['TLV4'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log('=== TLV4 시트 전체 데이터 (모든 행) ===\n');

// 모든 행 출력
data.forEach((row, index) => {
    // 빈 행이 아닌 경우만 출력
    const hasData = row.some(cell => cell !== '' && cell !== 0);
    if (hasData) {
        console.log(`\n[행 ${index + 1}]`);
        row.forEach((cell, colIdx) => {
            if (cell !== '' && cell !== 0) {
                const cellValue = typeof cell === 'string' ? cell : cell.toString();
                if (cellValue.length > 0 && cellValue.length < 200) {
                    console.log(`  열 ${colIdx + 1}: ${cellValue}`);
                }
            }
        });
    }
});

// 특정 키워드가 포함된 행 찾기
console.log('\n\n=== 옵션 관련 행 찾기 ===\n');

const keywords = ['추가', '퍼포먼스', '특장', '라인업', '사이드', '핸들', '브레이크', '서스펜션', '캠핑', 'D컷', 'HSD', 'AG'];
data.forEach((row, index) => {
    const rowStr = row.map(cell => (cell || '').toString()).join(' ');
    keywords.forEach(keyword => {
        if (rowStr.includes(keyword)) {
            console.log(`\n[행 ${index + 1}] 키워드: "${keyword}"`);
            row.forEach((cell, colIdx) => {
                if (cell !== '' && cell !== 0) {
                    const cellValue = typeof cell === 'string' ? cell : cell.toString();
                    if (cellValue.length > 0) {
                        console.log(`  열 ${colIdx + 1}: ${cellValue}`);
                    }
                }
            });
        }
    });
});





