#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모델 페이지 이미지 최적화 스크립트
4인승 폴더와 시트 색깔 폴더 이미지 리사이징
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
    
    if not os.path.exists(folder_path):
        print(f"[오류] 폴더를 찾을 수 없습니다: {folder_path}")
        return
    
    print(f"\n폴더 처리 중: {folder_path}")
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
                if 'original_size' in locals():
                    total_size_after += original_size
    
    # 결과 요약
    if total_files > 0:
        print("\n" + "="*50)
        print(f"전체 파일: {total_files}개")
        print(f"처리된 파일: {processed_files}개")
        print(f"전체 크기: {total_size_before/1024/1024:.2f} MB → {total_size_after/1024/1024:.2f} MB")
        if total_size_before > 0:
            total_reduction = (1 - total_size_after / total_size_before) * 100
            print(f"총 절약: {total_reduction:.1f}% ({(total_size_before - total_size_after)/1024/1024:.2f} MB)")

def main():
    """메인 실행 함수"""
    
    print("="*60)
    print("THE LUNE 모델 페이지 이미지 최적화")
    print("="*60)
    
    # 최적화할 폴더 목록
    folders_to_optimize = [
        {
            'path': 'assets/img/4인승',
            'max_width': 1920,
            'quality': 85,
            'description': '4인승 모델 이미지'
        },
        {
            'path': 'assets/img/6인승',
            'max_width': 1920,
            'quality': 85,
            'description': '6인승 모델 이미지'
        },
        {
            'path': 'assets/img/시트 색깔',
            'max_width': 1200,
            'quality': 85,
            'description': '시트 색깔 선택 이미지'
        }
    ]
    
    total_before = 0
    total_after = 0
    
    for folder_info in folders_to_optimize:
        folder_path = folder_info['path']
        max_width = folder_info['max_width']
        quality = folder_info['quality']
        description = folder_info['description']
        
        print(f"\n[{description}] 최적화 시작")
        
        # 폴더 크기 계산
        if os.path.exists(folder_path):
            folder_size_before = sum(
                os.path.getsize(os.path.join(dirpath, filename))
                for dirpath, dirnames, filenames in os.walk(folder_path)
                for filename in filenames
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))
            )
            total_before += folder_size_before
            
            resize_images_in_folder(folder_path, max_width, quality)
            
            # 폴더 크기 재계산
            folder_size_after = sum(
                os.path.getsize(os.path.join(dirpath, filename))
                for dirpath, dirnames, filenames in os.walk(folder_path)
                for filename in filenames
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))
            )
            total_after += folder_size_after
        else:
            print(f"[경고] 폴더를 찾을 수 없습니다: {folder_path}")
    
    # 전체 결과
    print("\n" + "="*60)
    print("전체 최적화 완료!")
    print(f"전체 크기: {total_before/1024/1024:.2f} MB → {total_after/1024/1024:.2f} MB")
    if total_before > 0:
        total_reduction = (1 - total_after / total_before) * 100
        print(f"총 절약: {total_reduction:.1f}% ({(total_before - total_after)/1024/1024:.2f} MB)")
    print("="*60)

if __name__ == "__main__":
    main()

