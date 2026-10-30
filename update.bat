@echo off
git add .
git commit -m "Actualizacion automatica local: %date% %time%"
git push origin main
