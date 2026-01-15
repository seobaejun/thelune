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
                            <ul class="ak-nav_list" style="display: flex !important; align-items: center !important; gap: 20px !important; padding: 0 !important; white-space: nowrap !important; overflow: visible !important; justify-content: center !important; flex-wrap: nowrap !important;">
                                <li><a href="about.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">회사소개</a></li>
                                <li class="menu-item-has-children">
                                    <a href="services.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">모델소개</a>
                                    <ul>
                                        <li><a href="lune-carnival-9.html" class="text-hover-animaiton" style="text-transform: none !important;">Carnival TL9</a></li>
                                        <li><a href="lune-carnival-7.html" class="text-hover-animaiton" style="text-transform: none !important;">Carnival TLV9</a></li>
                                        <li><a href="lune-carnival-4.html" class="text-hover-animaiton" style="text-transform: none !important;">Carnival TLV4</a></li>
                                        <li><a href="sprinter.html" class="text-hover-animaiton" style="text-transform: none !important;">Benz Sprinter</a></li>
                                    </ul>
                                </li>
                                <li><a href="gallery.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">갤러리</a></li>
                                <li><a href="news.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">홍보센터</a></li>
                                <li><a href="showroom.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">전시장</a></li>
                                <li><a href="test-drive.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">찾아가는 시승 서비스</a></li>
                                <li><a href="quote.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">견적내기</a></li>
                                <li class="mobile-menu-item"><a href="contact.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">문의하기</a></li>
                                <li class="mobile-menu-item"><a href="as.html" class="text-hover-animaiton" style="font-size: 14px !important; color: #ffffff !important;">A/S접수</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="ak-main-header-right" style="display: flex !important; align-items: center !important; gap: 20px !important;">
                        <div class="ak-header_btns" style="display: flex !important; align-items: center !important; gap: 20px !important;">
                            <a href="contact.html" style="display: inline-block; padding: 8px 20px; border: 1px solid rgba(188, 184, 177, 0.5); border-radius: 4px; color: #ffffff !important; text-decoration: none !important; font-size: 15px !important; transition: all 0.3s ease;">
                                문의하기
                            </a>
                            <a href="as.html" style="display: inline-block; padding: 8px 20px; border: none; color: #ffffff !important; text-decoration: none !important; font-size: 15px !important; transition: all 0.3s ease;">A/S접수</a>
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

def update_navigation(file_path):
    """파일의 네비게이션 바를 메인 페이지와 동일하게 업데이트"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 기존 헤더 섹션 찾기 (시작부터 끝까지)
        header_pattern = r'<!--\s*Start\s+Header\s+Section\s*-->.*?<!--\s*End\s+Header\s+Section\s*-->'
        
        if re.search(header_pattern, content, re.DOTALL | re.IGNORECASE):
            # 기존 헤더를 새 헤더로 교체
            content = re.sub(
                header_pattern,
                MAIN_NAV_HTML,
                content,
                flags=re.DOTALL | re.IGNORECASE
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Updated: {file_path}")
            return True
        else:
            print(f"[SKIP] No header found: {file_path}")
            return False
    except Exception as e:
        print(f"[ERROR] Error updating {file_path}: {e}")
        return False

def main():
    """모든 HTML 파일의 네비게이션 바 업데이트"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 업데이트할 파일 목록 (index.html 제외)
    html_files = [
        'about.html',
        'services.html',
        'gallery.html',
        'gallery-4seater.html',
        'gallery-6seater.html',
        'gallery-seats.html',
        'gallery-steering.html',
        'gallery-sprinter.html',
        'gallery-etc.html',
        'news.html',
        'news-detail.html',
        'news-detail-2.html',
        'news-detail-3.html',
        'news-detail-4.html',
        'news-detail-5.html',
        'news-detail-6.html',
        'showroom.html',
        'test-drive.html',
        'quote.html',
        'contact.html',
        'as.html',
        'lune-carnival-4.html',
        'lune-carnival-7.html',
        'lune-carnival-9.html',
        'sprinter.html',
    ]
    
    updated_count = 0
    skipped_count = 0
    
    for html_file in html_files:
        file_path = os.path.join(base_dir, html_file)
        if os.path.exists(file_path):
            if update_navigation(file_path):
                updated_count += 1
            else:
                skipped_count += 1
        else:
            print(f"[SKIP] File not found: {html_file}")
            skipped_count += 1
    
    print(f"\n=== 완료 ===")
    print(f"업데이트된 파일: {updated_count}개")
    print(f"건너뛴 파일: {skipped_count}개")

if __name__ == '__main__':
    main()

