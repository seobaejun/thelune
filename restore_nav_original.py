#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 네비게이션 메뉴를 원래 스타일로 복원
"""

import os
import re

def restore_navigation_style(file_path):
    """네비게이션 메뉴를 원래 스타일로 복원"""
    
    if not os.path.exists(file_path):
        print(f"파일을 찾을 수 없습니다: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # padding: 2px 4px을 padding: 12px 2px로 변경
    content = re.sub(
        r'padding:\s*2px\s+4px\s*!important;',
        'padding: 12px 2px !important;',
        content
    )
    
    # padding: 8px 4px도 padding: 12px 2px로 변경
    content = re.sub(
        r'padding:\s*8px\s+4px\s*!important;',
        'padding: 12px 2px !important;',
        content
    )
    
    # display: inline-block 제거 (원래 스타일에는 없음)
    content = re.sub(
        r'display:\s*inline-block\s*!important;\s*\n\s*transition:',
        'transition:',
        content
    )
    content = re.sub(
        r',\s*display:\s*inline-block\s*!important;',
        '',
        content
    )
    
    # vertical-align 제거
    content = re.sub(
        r'vertical-align:\s*middle\s*!important;\s*\n\s*\}',
        '}',
        content
    )
    content = re.sub(
        r',\s*vertical-align:\s*middle\s*!important;',
        '',
        content
    )
    
    # .ak-nav .ak-nav_list a의 vertical-align 제거하고 hover 스타일만 남기기
    content = re.sub(
        r'\.ak-nav \.ak-nav_list a\s*\{[^}]*vertical-align[^}]*\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 파일 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"복원 완료: {file_path}")
    return True

def main():
    """메인 실행 함수"""
    
    html_files = [
        'about.html',
        'contact.html',
        'gallery-4seater.html',
        'gallery-6seater.html',
        'gallery-seats.html',
        'gallery-steering.html',
        'lune-carnival-4.html',
        'lune-carnival-7.html',
        'lune-carnival-9.html',
        'news.html',
        'quote.html',
        'showroom.html'
    ]
    
    print("="*60)
    print("네비게이션 메뉴 원래 스타일로 복원")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        if restore_navigation_style(html_file):
            updated_count += 1
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 복원됨")
    print("="*60)

if __name__ == "__main__":
    main()

