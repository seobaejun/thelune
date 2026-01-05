#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
6인승과 9인승 모델 페이지 생성 스크립트
"""

import os
import re

def create_model_page(source_file, target_file, model_name, model_number, image_folder, seat_text):
    """모델 페이지 생성"""
    
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 제목 변경
    content = content.replace('LUNE CARNIVAL 4', f'LUNE CARNIVAL {model_number}')
    content = content.replace('<title>LUNE CARNIVAL 4 - THE LUNE</title>', f'<title>LUNE CARNIVAL {model_number} - THE LUNE</title>')
    
    # 히어로 섹션 변경
    content = content.replace('LUNE CARNIVAL 4</h1>', f'LUNE CARNIVAL {model_number}</h1>')
    
    # 이미지 경로 변경 (4인승 -> 6인승 또는 6인승)
    content = content.replace('assets/img/4인승/', f'assets/img/{image_folder}/')
    
    # 섹션 제목 변경 (4 SEATER -> 6 SEATER 또는 9 SEATER)
    content = content.replace('4 SEATER<br>PARTITION', f'{seat_text} SEATER<br>PARTITION')
    
    # 섹션 설명 변경
    if model_number == '7':
        content = content.replace('총 4인승으로 이루어졌습니다', '총 6인승으로 이루어졌습니다')
        content = content.replace('시트 2석으로 구성한 1열과 VIP 의전용 전동 리무진 시트 2석의 2열까지', '시트 2석으로 구성한 1열과 VIP 의전용 전동 리무진 시트 4석의 2열까지')
    elif model_number == '9':
        content = content.replace('총 4인승으로 이루어졌습니다', '총 9인승으로 이루어졌습니다')
        content = content.replace('시트 2석으로 구성한 1열과 VIP 의전용 전동 리무진 시트 2석의 2열까지', '시트 2석으로 구성한 1열과 VIP 의전용 전동 리무진 시트 7석의 2열까지')
    
    # 슬라이더 이미지 변경 (6인승 이미지 목록)
    if image_folder == '6인승':
        # 슬라이더 이미지 4개 교체
        slider_images = [
            '4월 19일 dh auto 카니발0663.jpg',
            '4월 19일 dh auto 카니발1935.jpg',
            '4월 19일 dh auto 카니발2216.jpg',
            '4월 19일 dh auto 카니발2217.jpg'
        ]
        
        # PLACE 섹션 이미지
        content = re.sub(
            r'assets/img/6인승/[^"]+\.jpg',
            f'assets/img/6인승/4월 19일 dh auto 카니발2222.jpg',
            content,
            count=1
        )
        
        # INTERIOR SPACE 섹션 이미지
        content = re.sub(
            r'assets/img/6인승/[^"]+\.jpg',
            f'assets/img/6인승/4월 19일 dh auto 카니발4273.jpg',
            content,
            count=1
        )
        
        # 슬라이더 이미지 교체
        for i, img in enumerate(slider_images):
            pattern = r'<div class="swiper-slide">\s*<img src="assets/img/6인승/[^"]+\.jpg"'
            matches = list(re.finditer(pattern, content))
            if i < len(matches):
                start = matches[i].start()
                end = matches[i].end()
                old_text = content[start:end]
                new_text = old_text.replace(old_text.split('"')[1].split('/')[-1], img)
                content = content[:start] + new_text + content[end:]
        
        # 6 SEATER PARTITION 섹션 이미지
        content = re.sub(
            r'assets/img/6인승/[^"]+\.jpg',
            f'assets/img/6인승/4월 19일 dh auto 카니발9114.jpg',
            content,
            count=1
        )
    
    # 파일 저장
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"생성 완료: {target_file}")

def main():
    """메인 실행 함수"""
    
    source_file = 'lune-carnival-4.html'
    
    # 6인승 페이지 생성
    create_model_page(
        source_file,
        'lune-carnival-7.html',
        'LUNE CARNIVAL 7',
        '7',
        '6인승',
        '6'
    )
    
    # 9인승 페이지 생성 (6인승 이미지 사용)
    create_model_page(
        source_file,
        'lune-carnival-9.html',
        'LUNE CARNIVAL 9',
        '9',
        '6인승',
        '9'
    )
    
    print("\n모든 모델 페이지 생성이 완료되었습니다!")

if __name__ == "__main__":
    main()



