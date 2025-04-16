@echo off
docker stop dcm-frontend-container >nul 2>&1
docker rm dcm-frontend-container >nul 2>&1

docker rmi dcm-frontend -f

docker build -t dcm-frontend .
