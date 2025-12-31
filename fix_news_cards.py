#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# news.html 파일 읽기
with open('news.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 카드 패턴 찾기: <div class="news-card" ...> ... </div>
# 각 카드 내부의 <a href="#"> 태그를 찾아서 href를 추출하고, 카드 전체를 <a> 태그로 감싸기

# 카드 패턴: <div class="news-card" data-category="..."> ... <a href="..."> ... </a> ... </div>
pattern = r'(<div class="news-card"[^>]*>)(.*?)(<h3 class="news-title">\s*<a href="([^"]*)"[^>]*>)(.*?)(</a>\s*</h3>)(.*?)(</div>\s*<!-- News Card)'

def replace_card(match):
    card_start = match.group(1)  # <div class="news-card" ...>
    before_title = match.group(2)  # 제목 전 내용
    title_link_start = match.group(3)  # <h3 class="news-title"><a href="..."
    href = match.group(4)  # 링크 URL
    title_text = match.group(5)  # 제목 텍스트
    title_link_end = match.group(6)  # </a></h3>
    after_title = match.group(7)  # 제목 후 내용
    card_end = match.group(8)  # </div> <!-- News Card
    
    # 카드 전체를 <a> 태그로 감싸고, 제목의 <a> 태그는 제거
    new_card = f'<a href="{href}" style="text-decoration: none; color: inherit; display: block;">{card_start}{before_title}<h3 class="news-title">{title_text}</h3>{after_title}</div></a>{card_end}'
    
    return new_card

# 모든 카드 교체
content = re.sub(pattern, replace_card, content, flags=re.DOTALL)

# CSS 추가: 카드 링크 스타일
css_addition = '''
        /* 카드 전체 클릭 가능하도록 스타일 추가 */
        .news-grid a {
            text-decoration: none !important;
            color: inherit !important;
            display: block !important;
        }
        
        .news-grid a:hover .news-card {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .news-grid a .news-title a {
            pointer-events: none;
        }
'''

# </style> 태그 앞에 CSS 추가
style_pattern = r'(        </style>)'
if re.search(style_pattern, content):
    content = re.sub(style_pattern, css_addition + r'\n    \1', content)

# 파일 저장
with open('news.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("뉴스 카드가 전체 클릭 가능하도록 수정되었습니다!")


