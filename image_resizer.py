#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
이미지 리사이징 도구
THE LUNE 웹사이트용 이미지 최적화 스크립트

사용법:
1. 단일 이미지 리사이징: python image_resizer.py --file "이미지경로" --width 800 --height 600
2. 폴더 내 모든 이미지 리사이징: python image_resizer.py --folder "폴더경로" --width 800 --height 600
3. 품질 조정: python image_resizer.py --file "이미지경로" --width 800 --quality 85
4. 비율 유지 리사이징: python image_resizer.py --file "이미지경로" --width 800 --keep-ratio
"""

import os
import sys
import argparse
from PIL import Image, ImageOps
import glob
from pathlib import Path

class ImageResizer:
    def __init__(self):
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        
    def resize_image(self, input_path, output_path=None, width=None, height=None, 
                    quality=90, keep_ratio=False, max_size_mb=None):
        """
        이미지 리사이징 함수
        
        Args:
            input_path: 입력 이미지 경로
            output_path: 출력 이미지 경로 (None이면 원본 덮어쓰기)
            width: 목표 너비
            height: 목표 높이
            quality: JPEG 품질 (1-100)
            keep_ratio: 비율 유지 여부
            max_size_mb: 최대 파일 크기 (MB)
        """
        try:
            # 이미지 열기
            with Image.open(input_path) as img:
                print(f"원본 크기: {img.size} ({img.format})")
                
                # EXIF 정보 기반 회전 처리
                img = ImageOps.exif_transpose(img)
                
                # RGB 모드로 변환 (RGBA나 다른 모드 처리)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # 투명도가 있는 경우 흰색 배경과 합성
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 리사이징 계산
                original_width, original_height = img.size
                
                if width is None and height is None:
                    # 크기 지정이 없으면 원본 크기 유지
                    new_width, new_height = original_width, original_height
                elif keep_ratio:
                    # 비율 유지하면서 리사이징
                    if width and height:
                        # 둘 다 지정된 경우, 더 작은 비율 사용
                        ratio_w = width / original_width
                        ratio_h = height / original_height
                        ratio = min(ratio_w, ratio_h)
                        new_width = int(original_width * ratio)
                        new_height = int(original_height * ratio)
                    elif width:
                        ratio = width / original_width
                        new_width = width
                        new_height = int(original_height * ratio)
                    elif height:
                        ratio = height / original_height
                        new_width = int(original_width * ratio)
                        new_height = height
                else:
                    # 정확한 크기로 리사이징 (비율 무시)
                    new_width = width or original_width
                    new_height = height or original_height
                
                # 리사이징 실행
                if (new_width, new_height) != (original_width, original_height):
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    print(f"새 크기: {new_width}x{new_height}")
                else:
                    print("크기 변경 없음")
                
                # 출력 경로 설정
                if output_path is None:
                    output_path = input_path
                
                # 출력 디렉토리 생성
                os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
                
                # 파일 크기 제한이 있는 경우 품질 조정
                if max_size_mb:
                    target_size = max_size_mb * 1024 * 1024  # MB to bytes
                    current_quality = quality
                    
                    while current_quality > 10:
                        # 임시로 저장해서 크기 확인
                        img.save(output_path, format='JPEG', quality=current_quality, optimize=True)
                        file_size = os.path.getsize(output_path)
                        
                        if file_size <= target_size:
                            break
                        
                        current_quality -= 5
                        print(f"파일 크기 조정 중... 품질: {current_quality}")
                    
                    print(f"최종 품질: {current_quality}")
                else:
                    # 일반 저장
                    save_kwargs = {'format': 'JPEG', 'quality': quality, 'optimize': True}
                    img.save(output_path, **save_kwargs)
                
                # 결과 출력
                final_size = os.path.getsize(output_path)
                print(f"저장 완료: {output_path}")
                print(f"파일 크기: {final_size / 1024 / 1024:.2f} MB")
                
                return True
                
        except Exception as e:
            print(f"오류 발생: {input_path} - {str(e)}")
            return False
    
    def resize_folder(self, folder_path, **kwargs):
        """
        폴더 내 모든 이미지 리사이징
        """
        folder_path = Path(folder_path)
        if not folder_path.exists():
            print(f"폴더를 찾을 수 없습니다: {folder_path}")
            return
        
        # 지원되는 이미지 파일 찾기
        image_files = []
        for ext in self.supported_formats:
            image_files.extend(folder_path.glob(f"*{ext}"))
            image_files.extend(folder_path.glob(f"*{ext.upper()}"))
        
        if not image_files:
            print(f"이미지 파일을 찾을 수 없습니다: {folder_path}")
            return
        
        print(f"총 {len(image_files)}개의 이미지를 처리합니다...")
        
        success_count = 0
        for img_file in image_files:
            print(f"\n처리 중: {img_file.name}")
            if self.resize_image(str(img_file), **kwargs):
                success_count += 1
        
        print(f"\n완료: {success_count}/{len(image_files)} 개의 이미지가 성공적으로 처리되었습니다.")
    
    def get_image_info(self, image_path):
        """
        이미지 정보 출력
        """
        try:
            with Image.open(image_path) as img:
                file_size = os.path.getsize(image_path)
                print(f"파일: {os.path.basename(image_path)}")
                print(f"크기: {img.size[0]}x{img.size[1]} pixels")
                print(f"포맷: {img.format}")
                print(f"모드: {img.mode}")
                print(f"파일 크기: {file_size / 1024 / 1024:.2f} MB")
        except Exception as e:
            print(f"이미지 정보를 읽을 수 없습니다: {e}")

def main():
    parser = argparse.ArgumentParser(description='이미지 리사이징 도구')
    parser.add_argument('--file', type=str, help='리사이징할 이미지 파일 경로')
    parser.add_argument('--folder', type=str, help='리사이징할 이미지 폴더 경로')
    parser.add_argument('--output', type=str, help='출력 경로 (기본값: 원본 덮어쓰기)')
    parser.add_argument('--width', type=int, help='목표 너비')
    parser.add_argument('--height', type=int, help='목표 높이')
    parser.add_argument('--quality', type=int, default=90, help='JPEG 품질 (1-100, 기본값: 90)')
    parser.add_argument('--keep-ratio', action='store_true', help='비율 유지')
    parser.add_argument('--max-size', type=float, help='최대 파일 크기 (MB)')
    parser.add_argument('--info', action='store_true', help='이미지 정보만 출력')
    
    args = parser.parse_args()
    
    resizer = ImageResizer()
    
    # 이미지 정보만 출력하는 경우
    if args.info:
        if args.file:
            resizer.get_image_info(args.file)
        else:
            print("--info 옵션을 사용할 때는 --file을 지정해주세요.")
        return
    
    # 리사이징 옵션 설정
    resize_options = {
        'width': args.width,
        'height': args.height,
        'quality': args.quality,
        'keep_ratio': args.keep_ratio,
        'max_size_mb': args.max_size,
        'output_path': args.output
    }
    
    # 파일 또는 폴더 처리
    if args.file:
        if not os.path.exists(args.file):
            print(f"파일을 찾을 수 없습니다: {args.file}")
            return
        
        print(f"이미지 리사이징 시작: {args.file}")
        resizer.resize_image(args.file, **resize_options)
        
    elif args.folder:
        if not os.path.exists(args.folder):
            print(f"폴더를 찾을 수 없습니다: {args.folder}")
            return
        
        print(f"폴더 내 이미지 리사이징 시작: {args.folder}")
        resizer.resize_folder(args.folder, **resize_options)
        
    else:
        print("사용법:")
        print("  단일 파일: python image_resizer.py --file 'image.jpg' --width 800 --height 600")
        print("  폴더 전체: python image_resizer.py --folder 'images/' --width 800 --keep-ratio")
        print("  정보 확인: python image_resizer.py --file 'image.jpg' --info")
        print("\n웹 최적화 예시:")
        print("  python image_resizer.py --folder 'assets/img' --width 1920 --quality 85 --keep-ratio")
        print("  python image_resizer.py --file 'hero.jpg' --width 1920 --height 1080 --quality 90")

if __name__ == "__main__":
    main()

