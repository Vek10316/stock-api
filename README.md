Sam Recycle Management App API

# Pre-requisites
- Node.js v24
- Microsoft SQL Server 2022 - 16.0.1200.5
- NPM v10

# Installation (Startup app)
```bash
pm2-startup install

pm2 startup

pm2 start dist/server.js --name *API_NAME*

pm2 save
```

Upon starting the API, it will automatically create an SQL pool, retrying every few seconds upon connection failure