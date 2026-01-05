#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 네비게이션 메뉴 텍스트 잘림 문제 수정
"""

import os
import re

# 네비게이션 스타일 (텍스트 잘림 방지)
NAV_STYLES = '''        
        /* 호버 효과 개선 - 텍스트 잘림 방지 */
        .text-hover-animaiton {
            overflow: visible !important;
            line-height: 1.8 !important;
            padding: 15px 8px !important;
            display: inline-block !important;
            transition: all 0.3s ease !important;
        }
        
        .text-hover-animaiton:hover {
            color: #bcb8b1 !important;
            transform: none !important;
        }
        
        /* 네비게이션 메뉴 호버 강제 적용 */
        .ak-nav .ak-nav_list a {
            overflow: visible !important;
            padding-top: 15px !important;
            padding-bottom: 15px !important;
        }
        
        .ak-nav .ak-nav_list a:hover {
            color: #bcb8b1 !important;
        }
        
        .ak-nav .ak-nav_list > li > a:hover {
            color: #bcb8b1 !important;
        }
        
        /* 네비게이션 메뉴 호버 개선 */
        .ak-nav_list li {
            overflow: visible !important;
        }
        
        .ak-nav_list {
            overflow: visible !important;
        }
        
        /* 네비게이션 컨테이너 overflow 설정 */
        .ak-nav {
            overflow: visible !important;
        }
        
        .ak-main-header-center {
            overflow: visible !important;
        }'''

def fix_navigation_styles(file_path):
    """네비게이션 스타일 추가 및 수정"""
    
    if not os.path.exists(file_path):
        print(f"파일을 찾을 수 없습니다: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 기존 네비게이션 스타일 제거 (잘못된 스타일이 있을 수 있음)
    # text-hover-animaiton 관련 스타일 제거
    content = re.sub(r'/\* 호버 효과.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'\.text-hover-animaiton\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.ak-nav[^{]*\{[^}]*overflow[^}]*\}', '', content, flags=re.DOTALL)
    
    # </style> 태그 앞에 스타일 추가
    style_pattern = r'(    </style>)'
    if re.search(style_pattern, content):
        # 이미 스타일이 있는지 확인
        if 'text-hover-animaiton' not in content or 'padding: 15px 8px' not in content:
            content = re.sub(style_pattern, NAV_STYLES + r'\n    \1', content)
            print(f"네비게이션 스타일 추가: {file_path}")
        else:
            print(f"스타일이 이미 있습니다: {file_path}")
    else:
        print(f"</style> 태그를 찾을 수 없습니다: {file_path}")
        return False
    
    # 파일 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
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
    print("네비게이션 텍스트 잘림 문제 수정")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        if fix_navigation_styles(html_file):
            updated_count += 1
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 업데이트됨")
    print("="*60)

if __name__ == "__main__":
    main()



