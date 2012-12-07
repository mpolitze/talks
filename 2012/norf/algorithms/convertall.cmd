 for /R %%i in (*.svg) do @start /wait ..\..\Programme\InkscapePortable\App\Inkscape\inkscape.exe -f "%%~fi" -e "%%~dpni.png" -w 400
 
 PAUSE