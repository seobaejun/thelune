#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 네비게이션 메뉴 수직 정렬 수정
"""

import os
import re

def fix_navigation_alignment(file_path):
    """네비게이션 메뉴 수직 정렬 수정"""
    
    if not os.path.exists(file_path):
        print(f"파일을 찾을 수 없습니다: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # padding-top과 padding-bottom을 vertical-align으로 변경
    content = re.sub(
        r'\.ak-nav \.ak-nav_list a\s*\{[^}]*padding-top:\s*15px\s*![^}]*padding-bottom:\s*15px\s*![^}]*\}',
        '.ak-nav .ak-nav_list a {\n            overflow: visible !important;\n            vertical-align: middle !important;\n        }',
        content,
        flags=re.DOTALL
    )
    
    # 단순 패턴으로도 시도
    content = content.replace(
        'padding-top: 15px !important;\n            padding-bottom: 15px !important;',
        'vertical-align: middle !important;'
    )
    
    # 파일 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"수정 완료: {file_path}")
    return True

def main():
    """메인 실행 함수"""
    
    html_files = [
        'about.html',
        'contact.html',
        'gallery.html',
        'gallery-4seater.html',
        'gallery-6seater.html',
        'gallery-seats.html',
        'gallery-steering.html',
        'lune-carnival-4.html',
        'lune-carnival-7.html',
        'lune-carnival-9.html',
        'news.html',
        'quote.html',
        'services.html',
        'showroom.html'
    ]
    
    print("="*60)
    print("네비게이션 메뉴 수직 정렬 수정")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        if fix_navigation_alignment(html_file):
            updated_count += 1
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 업데이트됨")
    print("="*60)

if __name__ == "__main__":
    main()



