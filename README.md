# Backend - Template 
Backend Template to start your project-implementation 
## todo
- missing open api spec (should be in repo and should be linked here)

## Installation
1. set "demo.app.info" as hostname in '~\etc\hosts'
2. Create Database (docker commands)
  ```
  $ docker pull mcr.microsoft.com/mssql/server:2019-latest 
  $ docker run -it --rm --name sqlserver -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Strong123!" -e "MSSQL_PID=Express" -p 1433:1433  mcr.microsoft.com/mssql/server:2019-latest
 
  ```
  ```
  $ docker cp create-database.sql sqlserver:/tmp/ 
  $ docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Strong123! -d master -i /tmp/create-database.sql   
  ```
3. Optional: modify environment.file


1. **Setup your [Environment with a json formatted config-file](#Config-File) or use default env-local.json**
2. Start with ```.\environments\env-local.json```
    ```
    $ npm install 
    $ npm start   
    ``` 
3. Alternatively: start with a custom configFile ```.\environments\{yourfilenamehere}.json```
   ```
   $ nmp install
   $ npm start -- --configFile exampleConfig.json
   ```
4. Backend running on host:port as specified in environment-file

## Tests
1. Do the environment configuration as described in [Installation](#Installation)
2. 
    ```
    $ npm install 
    $ npm test   
    
    $ npm test -- --configFile exampleConfig.json
    ``` 

## Features
- Configuration - Loader
- https support
- Database - Connector (Sequelize with SQL-Server)
- Central Error Handling
- Model, Controller, Router Structure 
- Tests included (mocha, chai)
- Testdata generation included
- Simple User Management 
- Simple Auth-Provider (**not for production use, security issues**)
- linted with eslint

## Config-File
Structure of Config-File
```json
{
  "name": "development-config",
  "backend": {
    "hostname": "backend.project",
    "port": 8080,
    "apiPrefix": "/api/v1"
  },
  "security": {
    "certKeyFilePath": "./certs/~.key",
    "certFilePath": "./certs/~.crt",
    "cors": {
      "allowedOrigin": "https://~:~"
    }
  },
  "dbSettings": {
    "database": "~",
    "username": "~",
    "password": "~",
    "options": {
      "host": "~",
      "dialect": "mssql",
      "dialectOptions": {
        "options": {
          "instanceName": "~",
          "trustServerCertificate": true
        }
      },
      "logging": false
    }
  },
  "devOptions": {
    "mockdata": false,
    "recreateDatabase": false   
  }
}
```
