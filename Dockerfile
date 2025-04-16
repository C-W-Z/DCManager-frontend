FROM node:22-slim

WORKDIR /app

COPY .. ..

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# docker run --rm -it -p 5173:5173 -v .:/app dcm-frontend
