## Build
Run:
```bash
npm run dev
```

Install dependencies:
```bash
npm install
```


Docker build and run:
```bash
docker build -t frmap-frontend .
docker run -p 4322:80 -d --name frmap-frontend frmap-frontend
```