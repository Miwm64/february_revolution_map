## Build
Compile:
```bash
mvn clean compile
```

Run:
```bash
mvn spring-boot:run
```

Docker build and run
```bash
docker build -t frmap-backend .
docker run -p 8080:4321 -d --name frmap-backend frmap-backend
```