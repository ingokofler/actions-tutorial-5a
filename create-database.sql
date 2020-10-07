CREATE LOGIN demoadmin WITH PASSWORD = 'JustAdemo1';
GO
CREATE DATABASE demoDB;
GO
USE demoDB;
GO
CREATE USER demoadmin FOR LOGIN demoadmin WITH DEFAULT_SCHEMA = db_owner;
GO
EXEC sp_addrolemember 'db_owner', 'demoadmin';
GO