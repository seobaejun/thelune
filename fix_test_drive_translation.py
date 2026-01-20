#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 번역 데이터에 "찾아가는 시승 서비스" 추가
"""

import os
import re

def add_test_drive_translation(file_path):
    """번역 데이터에 찾아가는 시승 서비스 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        # 한국어 번역 데이터에 추가
        ko_pattern = r"('A/S접수':\s*'A/S접수',\s*)(//)"
        ko_replacement = r"\1'찾아가는 시승 서비스': '찾아가는 시승 서비스',\n                \2"
        if re.search(ko_pattern, content):
            content = re.sub(ko_pattern, ko_replacement, content)
            modified = True
        
        # 영어 번역 데이터에 추가
        en_pattern = r"('A/S접수':\s*'A/S Service',\s*)(//)"
        en_replacement = r"\1'찾아가는 시승 서비스': 'Test Drive Service',\n                \2"
        if re.search(en_pattern, content):
            content = re.sub(en_pattern, en_replacement, content)
            modified = True
        
        # navItems에 추가
        nav_pattern = r"('갤러리':\s*translation\['갤러리'\],\s*)(\n\s*'A/S접수':\s*translation\['A/S접수'\])"
        nav_replacement = r"\1'찾아가는 시승 서비스': translation['찾아가는 시승 서비스'],\2"
        if re.search(nav_pattern, content):
            content = re.sub(nav_pattern, nav_replacement, content)
            modified = True
        
        # navItems에 추가 (A/S접수가 없는 경우)
        nav_pattern2 = r"('갤러리':\s*translation\['갤러리'\],\s*)(\n\s*\};)"
        nav_replacement2 = r"\1'찾아가는 시승 서비스': translation['찾아가는 시승 서비스'],\2"
        if re.search(nav_pattern2, content) and "'찾아가는 시승 서비스'" not in content:
            content = re.sub(nav_pattern2, nav_replacement2, content)
            modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"오류 발생 ({file_path}): {e}")
        return False

def main():
    """메인 실행 함수"""
    html_files = [
        'lune-carnival-4.html',
        'lune-carnival-7.html',
        'lune-carnival-9.html',
        'services.html',
        'gallery.html',
        'showroom.html',
        'contact.html',
        'about.html',
        'news.html',
        'sprinter.html',
        'as.html',
        'quote.html',
        'gallery-4seater.html',
        'gallery-sprinter.html',
        'gallery-etc.html',
        'test-drive.html'
    ]
    
    print("="*60)
    print("번역 데이터 업데이트 시작")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        file_path = html_file
        if os.path.exists(file_path):
            if add_test_drive_translation(file_path):
                updated_count += 1
                print(f"[OK] {html_file}")
            else:
                print(f"[SKIP] {html_file} (이미 있거나 패턴 불일치)")
        else:
            print(f"[NOT FOUND] {html_file}")
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 업데이트됨")
    print("="*60)

if __name__ == "__main__":
    main()


