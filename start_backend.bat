@echo off

cd /d C:\xampp\htdocs\landslide_warning

call venv\Scripts\activate.bat

cd backend

waitress-serve --host=127.0.0.1 --port=5000 app:app

pause