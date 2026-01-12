const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 파일 읽기
const excelPath = path.join(__dirname, '..', '.playwright-mcp', 'THE LUNE 견적서_25.1.10.xlsx');
const workbook = XLSX.readFile(excelPath);

// 모든 시트 이름 출력
console.log('시트 목록:', workbook.SheetNames);

// 각 시트 읽기
workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== 시트 ${index + 1}: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // 데이터 출력 (처음 20행만)
    console.log('데이터 샘플 (처음 20행):');
    data.slice(0, 20).forEach((row, i) => {
        console.log(`행 ${i + 1}:`, row);
    });
});

// JSON으로 변환하여 파일로 저장
const allData = {};
workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    allData[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
});

fs.writeFileSync(
    path.join(__dirname, 'excel-data.json'),
    JSON.stringify(allData, null, 2),
    'utf8'
);

console.log('\nExcel 데이터가 excel-data.json 파일로 저장되었습니다.');





