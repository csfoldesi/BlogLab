CREATE DATABASE [BlogDB]
GO

USE [BlogDB]
GO

-- Tables

CREATE TABLE ApplicationUser (
	ApplicationUserId INT NOT NULL IDENTITY(1, 1),
	Username VARCHAR(20) NOT NULL,
	NormalizedUsername VARCHAR(20) NOT NULL,
	Email VARCHAR(30) NOT NULL,
	NormalizedEmail VARCHAR(30) NOT NULL,
	Fullname VARCHAR(30) NULL,
	PasswordHash NVARCHAR(MAX) NOT NULL,
	PRIMARY KEY(ApplicationUserId)
)

CREATE INDEX [IX_ApplicationUser_NormalizedUsername] ON [dbo].[ApplicationUser] ([NormalizedUsername])
GO

CREATE INDEX [IX_ApplicationUser_NormalizedEmail] ON [dbo].[ApplicationUser] ([NormalizedEmail])
GO



CREATE TABLE Photo (
	PhotoId INT NOT NULL IDENTITY(1, 1),
	ApplicationUserId INT NOT NULL,
	PublicId VARCHAR(50) NOT NULL,
	ImageUrl VARCHAR(250) NOT NULL,
	[Description] VARCHAR(30) NOT NULL,
	PublishDate DATETIME NOT NULL DEFAULT GETDATE(),
	UpdateDate DATETIME NOT NULL DEFAULT GETDATE(),
	PRIMARY KEY(PhotoId),
	FOREIGN KEY(ApplicationUserId) REFERENCES ApplicationUser(ApplicationUserId)
)
GO


-- Types

CREATE TYPE [dbo].[AccountType] AS TABLE(
	[Username] [varchar](20) NOT NULL,
	[NormalizedUsername] [varchar](20) NOT NULL,
	[Email] [varchar](30) NOT NULL,
	[NormalizedEmail] [varchar](30) NOT NULL,
	[Fullname] [varchar](30) NULL,
	[PasswordHash] [nvarchar](max) NOT NULL
)
GO

CREATE TYPE [dbo].[PhotoType] AS TABLE(
	[PublicId] [varchar](50) NOT NULL,
	[ImageUrl] [varchar](250) NOT NULL,
	[Description] [varchar](30) NOT NULL
)
GO


-- Stored procedures

CREATE PROCEDURE [dbo].[Account_Insert]
	@Account AccountType READONLY
AS
	INSERT INTO 
		[dbo].[ApplicationUser]
           ([Username]
           ,[NormalizedUsername]
           ,[Email]
           ,[NormalizedEmail]
           ,[Fullname]
           ,[PasswordHash])
	SELECT
		 [Username]
		,[NormalizedUsername]
		,[Email]
        ,[NormalizedEmail]
        ,[Fullname]
        ,[PasswordHash]
	FROM
		@Account;

	SELECT CAST(SCOPE_IDENTITY() AS INT);
GO

CREATE PROCEDURE [dbo].[Account_GetByUsername]
	@NormalizedUsername VARCHAR(20)
AS
	SELECT 
	   [ApplicationUserId]
      ,[Username]
      ,[NormalizedUsername]
      ,[Email]
      ,[NormalizedEmail]
      ,[Fullname]
      ,[PasswordHash]
	FROM 
		[dbo].[ApplicationUser] t1 
	WHERE
		t1.[NormalizedUsername] = @NormalizedUsername

GO

CREATE PROCEDURE [dbo].[Photo_Delete]
	@PhotoId INT
AS

	DELETE FROM [dbo].[Photo] WHERE [PhotoId] = @PhotoId
GO

CREATE PROCEDURE [dbo].[Photo_Get]
	@PhotoId INT
AS

	SELECT
		 t1.[PhotoId]
		,t1.[ApplicationUserId]
		,t1.[PublicId]
		,t1.[ImageUrl]
		,t1.[Description]
		,t1.[PublishDate]
		,t1.[UpdateDate]
	FROM 
		[dbo].[Photo] t1
	WHERE
		t1.[PhotoId] = @PhotoId

GO

CREATE PROCEDURE [dbo].[Photo_GetByUserId]
	@ApplicationUserId INT
AS

	SELECT
		 t1.[PhotoId]
		,t1.[ApplicationUserId]
		,t1.[PublicId]
		,t1.[ImageUrl]
		,t1.[Description]
		,t1.[PublishDate]
		,t1.[UpdateDate]
	FROM 
		[dbo].[Photo] t1
	WHERE
		t1.[ApplicationUserId] = @ApplicationUserId
GO

CREATE PROCEDURE [dbo].[Photo_Insert]
	@Photo PhotoType READONLY,
	@ApplicationUserId INT
AS

	INSERT INTO [dbo].[Photo]
           ([ApplicationUserId]
           ,[PublicId]
           ,[ImageUrl]
           ,[Description])
	SELECT 
		@ApplicationUserId,
		[PublicId],
		[ImageUrl],
		[Description]
	FROM
		@Photo;

	SELECT CAST(SCOPE_IDENTITY() AS INT);
GO
