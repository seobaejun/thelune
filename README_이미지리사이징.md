# 이미지 리사이징 도구 사용법

## 개요
THE LUNE 웹사이트용 이미지 최적화를 위한 파이썬 스크립트입니다.
웹 성능 향상을 위해 이미지 크기와 파일 사이즈를 최적화할 수 있습니다.

## 설치
```bash
pip install Pillow
```

## 기본 사용법

### 1. 이미지 정보 확인
```bash
python image_resizer.py --file "assets/img/logo.png" --info
```

### 2. 단일 이미지 리사이징
```bash
# 너비 800px로 리사이징 (비율 유지)
python image_resizer.py --file "assets/img/hero-bg-1.jpg" --width 800 --keep-ratio

# 정확한 크기로 리사이징
python image_resizer.py --file "assets/img/hero-bg-1.jpg" --width 1920 --height 1080

# 품질 조정 (기본값: 90)
python image_resizer.py --file "assets/img/hero-bg-1.jpg" --width 1920 --quality 85 --keep-ratio
```

### 3. 폴더 내 모든 이미지 리사이징
```bash
# 메인 이미지 폴더 전체 최적화
python image_resizer.py --folder "assets/img" --width 1920 --quality 85 --keep-ratio

# 특정 폴더만 처리
python image_resizer.py --folder "assets/img/4인승" --width 800 --quality 80 --keep-ratio
```

### 4. 파일 크기 제한
```bash
# 최대 1MB로 제한
python image_resizer.py --file "assets/img/hero-bg-1.jpg" --width 1920 --max-size 1.0 --keep-ratio
```

## 웹 최적화 권장 설정

### 히어로 이미지 (배경 이미지)
```bash
python image_resizer.py --folder "assets/img" --width 1920 --quality 85 --keep-ratio
```
- 너비: 1920px (Full HD 기준)
- 품질: 85 (웹 최적화)
- 비율 유지

### 카드 이미지 (뉴스, 갤러리)
```bash
python image_resizer.py --folder "assets/img" --width 800 --quality 80 --keep-ratio
```
- 너비: 800px
- 품질: 80
- 비율 유지

### 썸네일 이미지
```bash
python image_resizer.py --folder "assets/img" --width 400 --quality 75 --keep-ratio
```
- 너비: 400px
- 품질: 75
- 비율 유지

### 아이콘/로고
```bash
python image_resizer.py --file "assets/img/logo.png" --width 200 --keep-ratio
```
- SVG가 아닌 경우에만 리사이징
- 투명도 유지

## 실제 사용 예시

### 1. 현재 프로젝트의 대용량 이미지 최적화
```bash
# 모든 JPG 이미지를 웹 최적화
python image_resizer.py --folder "assets/img" --width 1920 --quality 85 --keep-ratio

# 4인승 폴더 이미지들을 800px로 최적화
python image_resizer.py --folder "assets/img/4인승" --width 800 --quality 80 --keep-ratio

# 6인승 폴더 이미지들을 800px로 최적화
python image_resizer.py --folder "assets/img/6인승" --width 800 --quality 80 --keep-ratio
```

### 2. 특정 이미지만 처리
```bash
# 메인 히어로 이미지 최적화
python image_resizer.py --file "assets/img/6월 4일 고양 로케이션 DH auto 화이트 카니발6323.jpg" --width 1920 --quality 85 --keep-ratio

# 뉴스 카드 이미지들 최적화
python image_resizer.py --file "assets/img/10월 29일 the lune 카니발0009.jpg" --width 800 --quality 80 --keep-ratio
```

## 주요 옵션 설명

- `--file`: 단일 파일 경로
- `--folder`: 폴더 경로 (하위 폴더 포함)
- `--width`: 목표 너비 (픽셀)
- `--height`: 목표 높이 (픽셀)
- `--quality`: JPEG 품질 (1-100, 기본값: 90)
- `--keep-ratio`: 비율 유지 (권장)
- `--max-size`: 최대 파일 크기 (MB)
- `--output`: 출력 경로 (기본값: 원본 덮어쓰기)
- `--info`: 이미지 정보만 출력

## 주의사항

1. **백업**: 원본 이미지를 백업한 후 사용하세요.
2. **SVG 파일**: SVG 파일은 벡터 이미지이므로 리사이징하지 마세요.
3. **투명도**: PNG 파일의 투명도는 자동으로 처리됩니다.
4. **품질**: 웹용으로는 80-90 품질이 적절합니다.
5. **파일 크기**: 웹용 이미지는 1MB 이하로 유지하는 것이 좋습니다.

## 성능 향상 효과

- **로딩 속도**: 이미지 크기 감소로 페이지 로딩 속도 향상
- **대역폭**: 데이터 사용량 절약
- **SEO**: 빠른 로딩으로 검색엔진 최적화
- **사용자 경험**: 모바일 환경에서 특히 효과적

## 문제 해결

### Pillow 설치 오류
```bash
pip install --upgrade pip
pip install Pillow
```

### 권한 오류
- 관리자 권한으로 실행
- 파일이 다른 프로그램에서 사용 중인지 확인

### 메모리 오류
- 매우 큰 이미지의 경우 단계적으로 리사이징
- 한 번에 처리할 이미지 수 제한
