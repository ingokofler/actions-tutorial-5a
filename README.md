# Backend - Template 
Backend Template to start your project-implementation 
## todo's
* missing open api spec (should be included in repo and should be linked in documentation section)


## Installation
1. set "demo.app.info" as hostname in **hosts** File 
   - hosts located at ```c:\windows\system32\drivers\etc\hosts``` (for windows)
   - entry in host-file: ```127.0.0.1  demo.app.info``` 

2. Create Database (docker commands)
    ```
    $ docker pull mcr.microsoft.com/mssql/server:2019-latest 
    $ docker run -it --name sqlserver -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Strong123!" -e "MSSQL_PID=Express" -p 1433:1433  mcr.microsoft.com/mssql/server:2019-latest
    ```
    ```
    $ docker cp create-database.sql sqlserver:/tmp/ 
    $ docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Strong123! -d master -i /tmp/create-database.sql   
    ```
3. Install certificate '.\certs\demo-ca-root-certificate.pem'     
4. Start with default-configuration 
    ```
    $ npm install 
    $ npm start   
    ``` 
5. Backend should be up and running now
6. Check in browser https://demo.app.info:8080/api/v1/users . You should get an meaningful answer. 

### Alternatively: start with your own config
1. Create / modiy your [Environment with a json formatted config-file](#Config-File) or use default env-local.json

2. Start with a custom configFile ```.\environments\{yourfilenamehere}.json```
   ```
   $ nmp install
   $ npm start -- --configFile exampleConfig.json
   ```


## Tests
1. Do the environment configuration as described in [Installation](#Installation)
2. 
    ```
    $ npm install 
    $ npm test   
    // with a custom configFile
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

## Documentation 
as ever: missing

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
