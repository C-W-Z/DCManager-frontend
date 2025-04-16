@echo off
docker run --name dcm-frontend-container --rm -it -p 5173:5173 -v .:/app dcm-frontend
