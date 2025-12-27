#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
배치 이미지 리사이징 스크립트 (한글 파일명 지원)
THE LUNE 웹사이트 이미지 자동 최적화
"""

import os
import glob
from PIL import Image, ImageOps

def resize_images_in_folder(folder_path, max_width=1920, quality=85):
    """폴더 내 모든 이미지를 리사이징"""
    
    # 지원되는 이미지 확장자
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
    
    total_files = 0
    processed_files = 0
    total_size_before = 0
    total_size_after = 0
    
    print(f"폴더 처리 중: {folder_path}")
    print(f"목표 너비: {max_width}px, 품질: {quality}")
    print("-" * 50)
    
    for ext in extensions:
        pattern = os.path.join(folder_path, ext)
        files = glob.glob(pattern)
        
        for file_path in files:
            total_files += 1
            
            try:
                # 원본 파일 크기
                original_size = os.path.getsize(file_path)
                total_size_before += original_size
                
                with Image.open(file_path) as img:
                    original_width, original_height = img.size
                    
                    print(f"처리 중: {os.path.basename(file_path)}")
                    print(f"  원본: {original_width}x{original_height} ({original_size/1024/1024:.2f} MB)")
                    
                    # 이미 작은 이미지는 건너뛰기
                    if original_width <= max_width:
                        print(f"  건너뛰기: 이미 최적 크기")
                        total_size_after += original_size
                        continue
                    
                    # EXIF 정보 기반 회전 처리
                    img = ImageOps.exif_transpose(img)
                    
                    # RGB 모드로 변환
                    if img.mode in ('RGBA', 'LA', 'P'):
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # 비율 유지하면서 리사이징
                    ratio = max_width / original_width
                    new_width = max_width
                    new_height = int(original_height * ratio)
                    
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # 저장
                    img.save(file_path, format='JPEG', quality=quality, optimize=True)
                    
                    # 새 파일 크기
                    new_size = os.path.getsize(file_path)
                    total_size_after += new_size
                    
                    reduction = (1 - new_size / original_size) * 100
                    
                    print(f"  완료: {new_width}x{new_height} ({new_size/1024/1024:.2f} MB)")
                    print(f"  크기 감소: {reduction:.1f}%")
                    
                    processed_files += 1
                    
            except Exception as e:
                print(f"  오류: {str(e)}")
                total_size_after += original_size
    
    # 결과 요약
    print("\n" + "="*50)
    print("처리 완료!")
    print(f"전체 파일: {total_files}개")
    print(f"처리된 파일: {processed_files}개")
    print(f"전체 크기 감소: {total_size_before/1024/1024:.2f} MB → {total_size_after/1024/1024:.2f} MB")
    if total_size_before > 0:
        total_reduction = (1 - total_size_after / total_size_before) * 100
        print(f"총 절약: {total_reduction:.1f}% ({(total_size_before - total_size_after)/1024/1024:.2f} MB)")

def main():
    """메인 실행 함수"""
    
    # 웹사이트 이미지 최적화 설정
    optimizations = [
        {
            'folder': 'assets/img',
            'max_width': 1920,
            'quality': 85,
            'description': '히어로/배경 이미지'
        }
    ]
    
    print("THE LUNE 웹사이트 이미지 자동 최적화 시작")
    print("="*60)
    
    for opt in optimizations:
        if os.path.exists(opt['folder']):
            print(f"\n[폴더] {opt['description']} 최적화")
            resize_images_in_folder(
                opt['folder'], 
                opt['max_width'], 
                opt['quality']
            )
        else:
            print(f"[오류] 폴더를 찾을 수 없습니다: {opt['folder']}")
    
    print("\n[완료] 모든 이미지 최적화가 완료되었습니다!")
    print("웹사이트 로딩 속도가 크게 향상될 것입니다.")

if __name__ == "__main__":
    main()
