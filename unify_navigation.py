#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 네비게이션 바를 메인 페이지와 동일하게 통일하는 스크립트
"""

import os
import re

# 메인 페이지의 네비게이션 바 HTML
MAIN_NAV_HTML = '''    <!-- Start Header Section -->
    <header class="ak-site_header ak-style1 ak-sticky_header">
        <div class="ak-main_header">
            <div style="width: 100%; padding: 0 50px;">
                <div class="ak-main_header_in" style="display: flex !important; justify-content: space-between !important; align-items: center !important; width: 100% !important;">
                    <div class="ak-main-header-left">
                        <a class="ak-site_branding lune-logo" href="index.html">
                            <img src="assets/img/logo.png" alt="THE LUNE">
                        </a>
                    </div>
                    <div class="ak-main-header-center" style="flex: 1 !important; display: flex !important; justify-content: center !important;">
                        <div class="ak-nav ak-medium">
                            <ul class="ak-nav_list" style="display: flex !important; align-items: center !important; gap: 30px !important; padding: 0 !important; white-space: nowrap !important; overflow: visible !important; justify-content: center !important;">
                                <li><a href="about.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">회사소개</a></li>
                                <li class="menu-item-has-children">
                                    <a href="services.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">모델소개</a>
                                    <ul>
                                        <li><a href="lune-carnival-4.html" class="text-hover-animaiton">LUNE CARNIVAL 4</a></li>
                                        <li><a href="lune-carnival-7.html" class="text-hover-animaiton">LUNE CARNIVAL 6</a></li>
                                        <li><a href="lune-carnival-9.html" class="text-hover-animaiton">LUNE CARNIVAL 9</a></li>
                                        <li><a href="sprinter.html" class="text-hover-animaiton">SPRINTER</a></li>
                                    </ul>
                                </li>
                                <li><a href="gallery.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">갤러리</a></li>
                                <li><a href="news.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">홍보센터</a></li>
                                <li><a href="showroom.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">전시장</a></li>
                                <li><a href="quote.html" class="text-hover-animaiton" style="font-size: 15px !important; color: #ffffff !important;">견적내기</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="ak-main-header-right" style="display: flex !important; align-items: center !important; gap: 20px !important;">
                        <div class="ak-header_btns" style="display: flex !important; align-items: center !important; gap: 20px !important;">
                            <a href="contact.html" style="display: inline-block; padding: 8px 20px; border: 1px solid rgba(188, 184, 177, 0.5); border-radius: 4px; color: #ffffff !important; text-decoration: none !important; font-size: 15px !important; transition: all 0.3s ease;">
                                문의하기
                            </a>
                            <div style="color: #ffffff !important; font-size: 15px !important; cursor: pointer !important;">A/S접수</div>
                            <a href="tel:031-943-4488">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="heartbeat-icon">
                                        <span class="ak-heartbeat-btn"><img src="assets/img/phone.svg" alt="..."></span>
                                    </div>
                                    <h6 style="color: white !important; margin: 0 !important; font-size: 16px !important; white-space: nowrap !important;">031-943-4488</h6>
                                </div>
                            </a>
                            <div class="language-selector" style="display: flex !important; align-items: center !important; gap: 3px !important; color: white !important; font-size: 14px !important;">
                                <button class="lang-btn active" onclick="switchLanguage('ko')" style="background: none !important; border: none !important; color: #bcb8b1 !important; cursor: pointer !important; padding: 2px 4px !important; font-size: 14px !important; font-weight: 600 !important;">KOR</button>
                                <span style="color: white !important; margin: 0 2px !important;">/</span>
                                <button class="lang-btn" onclick="switchLanguage('en')" style="background: none !important; border: none !important; color: white !important; cursor: pointer !important; padding: 2px 4px !important; font-size: 14px !important;">ENG</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="nav-bar-border"></div>
    </header>
    <!-- End Header Section -->'''

# 메인 페이지의 네비게이션 스타일
NAV_STYLES = '''        /* 호버 효과 개선 */
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

def update_navigation(file_path):
    """파일의 네비게이션 바를 업데이트"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 기존 header 섹션 찾기 및 교체
    header_pattern = r'<!-- Start Header Section -->.*?<!-- End Header Section -->'
    
    if re.search(header_pattern, content, re.DOTALL):
        content = re.sub(header_pattern, MAIN_NAV_HTML, content, flags=re.DOTALL)
        print(f"네비게이션 바 업데이트: {file_path}")
    else:
        print(f"헤더 섹션을 찾을 수 없습니다: {file_path}")
        return False
    
    # 스타일 추가 또는 업데이트
    style_pattern = r'(</style>)'
    
    # 네비게이션 스타일이 이미 있는지 확인
    if 'text-hover-animaiton' not in content or 'overflow: visible !important' not in content:
        # </style> 태그 앞에 스타일 추가
        if re.search(style_pattern, content):
            content = re.sub(style_pattern, NAV_STYLES + r'\n    \1', content)
            print(f"네비게이션 스타일 추가: {file_path}")
    
    # 파일 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """메인 실행 함수"""
    
    # 제외할 파일 목록
    exclude_files = ['index.html', 'quote_temp.html']
    
    # HTML 파일 목록
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
    print("네비게이션 바 통일 작업 시작")
    print("="*60)
    
    updated_count = 0
    
    for html_file in html_files:
        if html_file in exclude_files:
            continue
        
        file_path = html_file
        if os.path.exists(file_path):
            if update_navigation(file_path):
                updated_count += 1
        else:
            print(f"파일을 찾을 수 없습니다: {file_path}")
    
    print("\n" + "="*60)
    print(f"작업 완료! {updated_count}개 파일 업데이트됨")
    print("="*60)

if __name__ == "__main__":
    main()


