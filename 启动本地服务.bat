@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8823
set PAGE=%E9%A5%AD%E9%A5%AD%E7%9B%B2%E7%9B%92-%E7%99%BD%E4%BA%91%E6%A0%A1%E5%8C%BA%E7%89%88.html

echo ============================================
echo   饭饭盲盒 · 白云校区版  本地服务
echo   http://localhost:%PORT%/
echo   用 localhost 打开才能用浏览器定位（https 也行）
echo   关闭：直接关掉这个窗口
echo ============================================
echo.

start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%PORT%/%PAGE%"

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 127.0.0.1
  goto :end
)
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT% --bind 127.0.0.1
  goto :end
)
where node >nul 2>nul
if %errorlevel%==0 (
  node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';f.readFile(p.join(process.cwd(),u.slice(1)),(e,d)=>{if(e){s.writeHead(404);s.end('404')}else{s.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});s.end(d)}})}).listen(%PORT%,'127.0.0.1',()=>console.log('http://localhost:%PORT%/'))"
  goto :end
)
echo 没找到 python / py / node，随便装一个再运行，
echo 或者直接把 HTML 文件拖进浏览器（定位功能会被拦截，其余功能正常）。
pause

:end
