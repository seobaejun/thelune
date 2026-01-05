#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# 4인승 페이지 읽기
with open('lune-carnival-4.html', 'r', encoding='utf-8') as f:
    content = f.read()

# SPRINTER에 맞게 텍스트 변경
replacements = [
    # 제목 및 태그
    ('<title>LUNE CARNIVAL 4 - THE LUNE</title>', '<title>SPRINTER - THE LUNE</title>'),
    ('<div class="model-tag english-serif-light">CARNIVAL</div>', '<div class="model-tag english-serif-light">SPRINTER</div>'),
    ('<h1 class="english-serif">LUNE CARNIVAL 4</h1>', '<h1 class="english-serif">SPRINTER</h1>'),
    
    # 섹션 서브타이틀
    ('LUNE CARNIVAL CUSTOM', 'LUNE SPRINTER CUSTOM'),
    
    # 4 SEATER PARTITION → SPRINTER PARTITION
    ('<h2 class="model-section-title english-serif">4 SEATER<br>PARTITION</h2>', '<h2 class="model-section-title english-serif">SPRINTER<br>PARTITION</h2>'),
    ('alt="4 SEATER PARTITION"', 'alt="SPRINTER PARTITION"'),
    
    # 이미지 alt 텍스트
    ('alt="LUNE CARNIVAL 4 Interior', 'alt="SPRINTER Interior'),
    ('LUNE CARNIVAL 4', 'SPRINTER'),
]

# 모든 변경사항 적용
for old, new in replacements:
    content = content.replace(old, new)

# SPRINTER 페이지 저장
with open('sprinter.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SPRINTER 페이지가 성공적으로 생성되었습니다!")



