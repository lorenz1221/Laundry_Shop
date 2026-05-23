@echo off
REM Spinzone — import laundryshop_db schema into local MySQL (XAMPP)
echo Importing database schema...
"C:\xampp\mysql\bin\mysql.exe" -u root < "%~dp0database\schema.sql"
if %ERRORLEVEL% EQU 0 (
    echo Database laundryshop_db ready.
) else (
    echo Failed. Ensure XAMPP MySQL is running.
    exit /b 1
)
