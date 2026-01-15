#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 HTML 파일에 "찾아가는 시승 서비스" 번역 데이터 추가
"""

import re
import os

# 처리할 HTML 파일 목록
html_files = [
    'about.html',
    'as.html',
    'contact.html',
    'gallery.html',
    'gallery-4seater.html',
    'gallery-6seater.html',
    'gallery-etc.html',
    'gallery-seats.html',
    'gallery-sprinter.html',
    'gallery-steering.html',
    'lune-carnival-4.html',
    'lune-carnival-7.html',
    'lune-carnival-9.html',
    'news.html',
    'news-detail.html',
    'news-detail-2.html',
    'news-detail-3.html',
    'news-detail-4.html',
    'news-detail-5.html',
    'news-detail-6.html',
    'quote.html',
    'services.html',
    'showroom.html',
    'sprinter.html',
    'test-drive.html'
]

def add_translation_data(file_path):
    """번역 데이터에 찾아가는 시승 서비스 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 한국어 번역 데이터에 추가
        ko_pattern = r"('A/S접수':\s*'A/S접수',)\s*//"
        ko_replacement = r"\1\n                '찾아가는 시승 서비스': '찾아가는 시승 서비스',\n                //"
        if re.search(ko_pattern, content):
            content = re.sub(ko_pattern, ko_replacement, content)
        
        # 영어 번역 데이터에 추가
        en_pattern = r"('A/S접수':\s*'A/S Service',)\s*//"
        en_replacement = r"\1\n                '찾아가는 시승 서비스': 'Test Drive Service',\n                //"
        if re.search(en_pattern, content):
            content = re.sub(en_pattern, en_replacement, content)
        
        # navItems에 추가
        nav_pattern = r"('A/S접수':\s*translation\['A/S접수'\])\s*\};"
        nav_replacement = r"\1,\n                '찾아가는 시승 서비스': translation['찾아가는 시승 서비스']\n            };"
        if re.search(nav_pattern, content):
            content = re.sub(nav_pattern, nav_replacement, content)
        
        # navItems에 추가 (다른 형식)
        nav_pattern2 = r"('갤러리':\s*translation\['갤러리'\],)\s*('A/S접수':\s*translation\['A/S접수'\])"
        nav_replacement2 = r"\1\n                '찾아가는 시승 서비스': translation['찾아가는 시승 서비스'],\n                \2"
        if re.search(nav_pattern2, content):
            content = re.sub(nav_pattern2, nav_replacement2, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {file_path} 업데이트 완료")
            return True
        else:
            print(f"- {file_path} 변경사항 없음")
            return False
            
    except Exception as e:
        print(f"✗ {file_path} 오류: {e}")
        return False

if __name__ == '__main__':
    print("모든 HTML 파일에 '찾아가는 시승 서비스' 번역 데이터 추가 중...\n")
    
    updated_count = 0
    for html_file in html_files:
        file_path = html_file
        if os.path.exists(file_path):
            if add_translation_data(file_path):
                updated_count += 1
        else:
            print(f"- {html_file} 파일을 찾을 수 없습니다")
    
    print(f"\n총 {updated_count}개 파일이 업데이트되었습니다.")

