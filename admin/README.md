## Build
Run:
```bash
npm run dev
```

Install dependencies:
```bash
npm install
```

Compile tailwind css:
```bash
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

Docker build and run:
```bash
docker build -t frmap-frontend .
docker run -p 4320:80 -d --name frmap-frontend frmap-frontend
```