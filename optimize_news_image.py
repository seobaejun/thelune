#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from PIL import Image
import os

# 이미지 경로
image_path = 'assets/img/갤러리/6월 4일 고양 로케이션 DH auto 화이트 카니발6323.jpg'
output_path = image_path

try:
    # 이미지 열기
    img = Image.open(image_path)
    
    # EXIF 회전 정보 적용
    try:
        from PIL.ExifTags import ORIENTATION
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = img._getexif()
        if exif is not None:
            exif = dict(exif.items())
            if orientation in exif:
                if exif[orientation] == 3:
                    img = img.rotate(180, expand=True)
                elif exif[orientation] == 6:
                    img = img.rotate(270, expand=True)
                elif exif[orientation] == 8:
                    img = img.rotate(90, expand=True)
    except:
        pass
    
    # 이미지 크기 확인
    width, height = img.size
    print(f"원본 이미지 크기: {width}x{height}")
    
    # 최대 너비 설정 (카드 이미지에 맞게)
    max_width = 1200
    max_height = 800
    
    # 비율 유지하며 리사이징
    if width > max_width or height > max_height:
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        print(f"리사이징 후 크기: {img.size[0]}x{img.size[1]}")
    
    # JPEG로 저장 (최적화)
    if img.mode in ('RGBA', 'LA', 'P'):
        # 투명도가 있는 경우 흰색 배경 추가
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 최적화된 품질로 저장
    img.save(output_path, 'JPEG', quality=85, optimize=True)
    print(f"이미지 최적화 완료: {output_path}")
    
except Exception as e:
    print(f"오류 발생: {e}")


