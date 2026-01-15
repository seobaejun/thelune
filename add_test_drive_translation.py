#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 HTML 파일에 "찾아가는 시승 서비스" 직접 번역 로직 추가
"""

import re
import os

# 처리할 HTML 파일 목록
html_files = [
    'lune-carnival-7.html',
    'lune-carnival-9.html',
    'gallery-4seater.html',
    'gallery-sprinter.html',
    'gallery-etc.html',
    'gallery-6seater.html',
    'gallery-seats.html',
    'gallery-steering.html',
    'news-detail.html',
    'news-detail-2.html',
    'news-detail-3.html',
    'news-detail-4.html',
    'news-detail-5.html',
    'news-detail-6.html',
    'quote.html',
    'test-drive.html'
]

def add_translation_logic(file_path):
    """찾아가는 시승 서비스 직접 번역 로직 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 이미 추가되어 있는지 확인
        if 'a[href="test-drive.html"]' in content:
            if re.search(r'//.*찾아가는 시승 서비스.*직접 번역', content):
                print(f"[-] {file_path} 이미 수정됨")
                return False
        
        # 네비게이션 링크 번역 부분 찾기
        pattern = r'(// 네비게이션 링크 번역\s+document\.querySelectorAll\([\'"]\.ak-nav_list a[^)]+\)\.forEach\(link => \{[\s\S]*?\}\);)\s*'
        
        replacement = r'\1\n            \n            // "찾아가는 시승 서비스" 직접 번역 (확실하게 처리)\n            document.querySelectorAll(\'.ak-nav_list a[href="test-drive.html"]\').forEach(link => {\n                if (link.textContent.trim() === \'찾아가는 시승 서비스\' || link.textContent.trim().includes(\'찾아가는 시승 서비스\')) {\n                    link.textContent = translation[\'찾아가는 시승 서비스\'];\n                }\n            });'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
        else:
            print(f"[ERROR] {file_path} 네비게이션 번역 부분을 찾을 수 없습니다")
            return False
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] {file_path} 업데이트 완료")
            return True
        else:
            print(f"[-] {file_path} 변경사항 없음")
            return False
            
    except Exception as e:
        print(f"[ERROR] {file_path} 오류: {e}")
        return False

if __name__ == '__main__':
    print("모든 HTML 파일에 '찾아가는 시승 서비스' 직접 번역 로직 추가 중...\n")
    
    updated_count = 0
    for html_file in html_files:
        file_path = html_file
        if os.path.exists(file_path):
            if add_translation_logic(file_path):
                updated_count += 1
        else:
            print(f"- {html_file} 파일을 찾을 수 없습니다")
    
    print(f"\n총 {updated_count}개 파일이 업데이트되었습니다.")

