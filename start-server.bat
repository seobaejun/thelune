@echo off
cd /d "C:\thelune\thelune-site"
echo THE LUNE 웹사이트 서버를 시작합니다...
echo.
echo 브라우저에서 다음 주소로 접속하세요:
echo http://localhost:8080
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python 서버를 시작합니다...
    python -m http.server 8080
) else (
    REM Node.js가 설치되어 있는지 확인
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Node.js 서버를 시작합니다...
        npx http-server -p 8080
    ) else (
        echo Python 또는 Node.js가 설치되어 있지 않습니다.
        echo 브라우저에서 index.html 파일을 직접 열어주세요.
        echo 파일 위치: %cd%\index.html
        pause
    )
)
