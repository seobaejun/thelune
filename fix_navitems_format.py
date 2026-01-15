#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
navItems 포맷 수정
"""

import os
import re

def fix_navitems_format(file_path):
    """navItems 포맷 수정"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        # 잘못된 포맷 수정
        pattern = r"('갤러리':\s*translation\['갤러리'\],)'찾아가는 시승 서비스':\s*translation\['찾아가는 시승 서비스'\],"
        replacement = r"\1\n                '찾아가는 시승 서비스': translation['찾아가는 시승 서비스'],"
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
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
        'gallery-4seater.html',
        'gallery-sprinter.html',
        'gallery-etc.html',
        'test-drive.html'
    ]
    
    print("="*60)
    print("navItems 포맷 수정 시작")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        file_path = html_file
        if os.path.exists(file_path):
            if fix_navitems_format(file_path):
                updated_count += 1
                print(f"[OK] {html_file}")
            else:
                print(f"[SKIP] {html_file}")
        else:
            print(f"[NOT FOUND] {html_file}")
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 업데이트됨")
    print("="*60)

if __name__ == "__main__":
    main()

