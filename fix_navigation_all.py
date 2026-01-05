#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 네비게이션 바 스타일 통일
"""

import os
import re

# 네비게이션 스타일
NAV_STYLES = '''        
        /* 호버 효과 개선 */
        .text-hover-animaiton {
            overflow: visible !important;
            line-height: 1.5 !important;
            padding: 12px 2px !important;
            transition: all 0.3s ease !important;
        }
        
        .text-hover-animaiton:hover {
            color: #bcb8b1 !important;
        }
        
        /* 네비게이션 메뉴 호버 강제 적용 */
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
        }'''

def fix_navigation_styles(file_path):
    """네비게이션 스타일 추가 및 수정"""
    
    if not os.path.exists(file_path):
        print(f"파일을 찾을 수 없습니다: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 네비게이션 스타일이 이미 있는지 확인
    if 'text-hover-animaiton' in content and 'overflow: visible !important' in content:
        print(f"스타일이 이미 있습니다: {file_path}")
    else:
        # </style> 태그 앞에 스타일 추가
        style_pattern = r'(    </style>)'
        if re.search(style_pattern, content):
            content = re.sub(style_pattern, NAV_STYLES + r'\n    \1', content)
            print(f"네비게이션 스타일 추가: {file_path}")
        else:
            print(f"</style> 태그를 찾을 수 없습니다: {file_path}")
            return False
    
    # 헤더 주석 추가
    if '<!-- Start Header Section -->' not in content:
        content = content.replace(
            '<header class="ak-site_header ak-style1 ak-sticky_header">',
            '    <!-- Start Header Section -->\n    <header class="ak-site_header ak-style1 ak-sticky_header">'
        )
        print(f"헤더 시작 주석 추가: {file_path}")
    
    if '<!-- End Header Section -->' not in content:
        content = content.replace(
            '        <div class="nav-bar-border"></div>\n    </header>',
            '        <div class="nav-bar-border"></div>\n    </header>\n    <!-- End Header Section -->'
        )
        print(f"헤더 종료 주석 추가: {file_path}")
    
    # 전화번호 스타일 통일
    content = re.sub(
        r'(<h6>)031-943-4488</h6>',
        r'<h6 style="color: white !important; margin: 0 !important; font-size: 16px !important; white-space: nowrap !important;">031-943-4488</h6>',
        content
    )
    
    # LUNE CARNIVAL 7을 6으로 변경
    content = content.replace('LUNE CARNIVAL 7</a>', 'LUNE CARNIVAL 6</a>')
    
    # 파일 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """메인 실행 함수"""
    
    html_files = [
        'gallery.html',
        'gallery-4seater.html',
        'gallery-6seater.html',
        'gallery-seats.html',
        'gallery-steering.html',
        'news.html',
        'showroom.html'
    ]
    
    print("="*60)
    print("네비게이션 바 스타일 통일 작업")
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



