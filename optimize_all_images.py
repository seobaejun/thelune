#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
전체 이미지 최적화 스크립트
THE LUNE 웹사이트의 모든 이미지를 웹 최적화합니다.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageOps
import glob

# 이미지 최적화 설정
OPTIMIZATION_SETTINGS = {
    # 히어로/배경 이미지
    'hero': {
        'max_width': 1920,
        'quality': 85,
        'patterns': ['hero', '히어로', '메인페이지', '10월 29일']
    },
    # 갤러리/카드 이미지
    'gallery': {
        'max_width': 1200,
        'quality': 80,
        'patterns': ['gallery', '갤러리', 'TL9', 'TLV4', 'TLV9', '스프린터', 'ETC', '4인승', '6인승', '9인승']
    },
    # 썸네일/작은 이미지
    'thumbnail': {
        'max_width': 800,
        'quality': 75,
        'patterns': ['시트', '핸들', 'blog', 'team', 'member']
    },
    # 기본 설정 (위에 해당하지 않는 경우)
    'default': {
        'max_width': 1200,
        'quality': 80,
        'patterns': []
    }
}

def get_optimization_settings(file_path):
    """파일 경로에 따라 최적화 설정 반환"""
    file_name = os.path.basename(file_path).lower()
    
    for setting_name, settings in OPTIMIZATION_SETTINGS.items():
        if setting_name == 'default':
            continue
        for pattern in settings['patterns']:
            if pattern.lower() in file_name:
                return settings
    
    return OPTIMIZATION_SETTINGS['default']

def optimize_image(image_path, backup=True):
    """단일 이미지 최적화"""
    try:
        # SVG 파일은 건너뛰기
        if image_path.lower().endswith('.svg'):
            return False, "SVG 파일은 건너뜀"
        
        # 이미지 열기
        with Image.open(image_path) as img:
            original_size = os.path.getsize(image_path)
            original_dimensions = img.size
            
            # EXIF 정보 기반 회전 처리
            img = ImageOps.exif_transpose(img)
            
            # 최적화 설정 가져오기
            settings = get_optimization_settings(image_path)
            max_width = settings['max_width']
            quality = settings['quality']
            
            # RGB 모드로 변환
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 리사이징 (비율 유지)
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_width = max_width
                new_height = int(height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"  리사이징: {width}x{height} -> {new_width}x{new_height}")
            else:
                print(f"  크기 유지: {width}x{height}")
            
            # 백업 생성 (원본 파일 크기가 1MB 이상인 경우)
            if backup and original_size > 1024 * 1024:
                backup_path = image_path + '.backup'
                if not os.path.exists(backup_path):
                    import shutil
                    shutil.copy2(image_path, backup_path)
                    print(f"  백업 생성: {backup_path}")
            
            # 최적화된 이미지 저장
            img.save(image_path, 'JPEG', quality=quality, optimize=True)
            
            new_size = os.path.getsize(image_path)
            reduction = ((original_size - new_size) / original_size) * 100 if original_size > 0 else 0
            
            print(f"  최적화 완료: {original_size / 1024 / 1024:.2f}MB -> {new_size / 1024 / 1024:.2f}MB ({reduction:.1f}% 감소)")
            
            return True, f"최적화 완료 ({reduction:.1f}% 감소)"
            
    except Exception as e:
        return False, f"오류: {str(e)}"

def optimize_folder(folder_path, recursive=True):
    """폴더 내 모든 이미지 최적화"""
    folder_path = Path(folder_path)
    if not folder_path.exists():
        print(f"폴더를 찾을 수 없습니다: {folder_path}")
        return
    
    # 지원되는 이미지 확장자
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
    
    # 이미지 파일 찾기
    image_files = []
    if recursive:
        for ext in extensions:
            image_files.extend(folder_path.rglob(ext))
    else:
        for ext in extensions:
            image_files.extend(folder_path.glob(ext))
    
    # SVG 파일 제외
    image_files = [f for f in image_files if not str(f).lower().endswith('.svg')]
    
    if not image_files:
        print(f"이미지 파일을 찾을 수 없습니다: {folder_path}")
        return
    
    print(f"\n총 {len(image_files)}개의 이미지를 처리합니다...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    total_original_size = 0
    total_new_size = 0
    
    for i, img_file in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] {img_file.name}")
        print(f"  경로: {img_file}")
        
        original_size = os.path.getsize(img_file)
        total_original_size += original_size
        
        success, message = optimize_image(str(img_file), backup=True)
        
        if success:
            success_count += 1
            new_size = os.path.getsize(img_file)
            total_new_size += new_size
        else:
            fail_count += 1
            print(f"  {message}")
    
    # 결과 요약
    print("\n" + "=" * 60)
    print("최적화 완료!")
    print(f"성공: {success_count}개")
    print(f"실패: {fail_count}개")
    if total_original_size > 0:
        total_reduction = ((total_original_size - total_new_size) / total_original_size) * 100
        print(f"원본 총 크기: {total_original_size / 1024 / 1024:.2f}MB")
        print(f"최적화 후 크기: {total_new_size / 1024 / 1024:.2f}MB")
        print(f"총 감소율: {total_reduction:.1f}%")
    print("=" * 60)

def main():
    """메인 함수"""
    # assets/img 폴더 경로
    img_folder = Path(__file__).parent / 'assets' / 'img'
    
    if not img_folder.exists():
        print(f"이미지 폴더를 찾을 수 없습니다: {img_folder}")
        return
    
    print("THE LUNE 웹사이트 이미지 최적화 시작")
    print(f"대상 폴더: {img_folder}")
    print("\n최적화 설정:")
    print("  - 히어로/배경 이미지: 최대 1920px, 품질 85")
    print("  - 갤러리/카드 이미지: 최대 1200px, 품질 80")
    print("  - 썸네일 이미지: 최대 800px, 품질 75")
    print("  - 기본 이미지: 최대 1200px, 품질 80")
    
    # 최적화 실행
    optimize_folder(img_folder, recursive=True)
    
    print("\n최적화가 완료되었습니다!")
    print("백업 파일(.backup)이 생성된 경우, 원본 파일을 복구할 수 있습니다.")

if __name__ == "__main__":
    main()

