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


CREATE TABLE Blog (
	BlogId INT NOT NULL IDENTITY(1, 1),
	ApplicationUserId INT NOT NULL,
	PhotoId INT NULL,
	Title VARCHAR(50) NOT NULL,
	Content VARCHAR(MAX) NOT NULL,
	PublishDate DATETIME NOT NULL DEFAULT GETDATE(),
	UpdateDate DATETIME NOT NULL DEFAULT GETDATE(),
	ActiveInd BIT NOT NULL DEFAULT CONVERT(BIT, 1)
	PRIMARY KEY(BlogId),
	FOREIGN KEY(ApplicationUserId) REFERENCES ApplicationUser(ApplicationUserId),
	FOREIGN KEY(PhotoId) REFERENCES Photo(PhotoId)
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

CREATE TYPE [dbo].[BlogType] AS TABLE(
	[BlogId] [int] NOT NULL,
	[Title] [varchar](50) NOT NULL,
	[Content] [varchar](max) NOT NULL,
	[PhotoId] [int] NULL
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

CREATE PROCEDURE [dbo].[Blog_Delete]
	@BlogId INT
AS

	UPDATE [dbo].[BlogComment]
	SET 
		[ActiveInd] = CONVERT(BIT, 0),
		[UpdateDate] = GETDATE()
	WHERE 
		[BlogId] = @BlogId;

	UPDATE [dbo].[Blog]
	SET
		[PhotoId] = NULL,
		[ActiveInd] = CONVERT(BIT, 0),
		[UpdateDate] = GETDATE()
	WHERE
		[BlogId] = @BlogId
GO

CREATE PROCEDURE [dbo].[Blog_Get]
	@BlogId INT
AS
	SELECT 
		[BlogId]
	   ,[ApplicationUserId]
       ,[Username]
       ,[Title]
       ,[Content]
       ,[PhotoId]
       ,[PublishDate]
       ,[UpdateDate]
	 FROM
		[aggregate].[Blog] t1
	 WHERE
		t1.[BlogId] = @BlogId AND
		t1.ActiveInd = CONVERT(BIT, 1)
GO

CREATE PROCEDURE [dbo].[Blog_GetAll]
	@Offset INT,
	@PageSize INT
AS
	SELECT 
		[BlogId]
	   ,[ApplicationUserId]
       ,[Username]
       ,[Title]
       ,[Content]
       ,[PhotoId]
       ,[PublishDate]
       ,[UpdateDate]
	 FROM
		[aggregate].[Blog] t1
	 WHERE
		t1.[ActiveInd] = CONVERT(BIT, 1)
	 ORDER BY
		t1.[BlogId]
	 OFFSET @Offset ROWS
	 FETCH NEXT @PageSize ROWS ONLY;

	 SELECT COUNT(*) FROM [aggregate].[Blog] t1 WHERE t1.[ActiveInd] = CONVERT(BIT, 1);
GO

CREATE PROCEDURE [dbo].[Blog_GetAllFamous]
AS

	SELECT 
	TOP 6
		 t1.[BlogId]
		,t1.[ApplicationUserId]
		,t1.[Username]
		,t1.[PhotoId]
		,t1.[Title]
		,t1.[Content]
		,t1.[PublishDate]
		,t1.[UpdateDate]
	FROM 
		[aggregate].[Blog] t1
	INNER JOIN
		[dbo].[BlogComment] t2 ON t1.BlogId = t2.BlogId
	WHERE
		t1.[ActiveInd] = CONVERT(BIT, 1) AND
		t2.[ActiveInd] = CONVERT(BIT, 1)
	GROUP BY
		t1.[BlogId]
	   ,t1.[ApplicationUserId]
	   ,t1.[Username]
	   ,t1.[PhotoId]
	   ,t1.[Title]
	   ,t1.[Content]
	   ,t1.[PublishDate]
	   ,t1.[UpdateDate]
	ORDER BY
		COUNT(t2.BlogCommentId)
	DESC
GO

CREATE PROCEDURE [dbo].[Blog_GetByUserId]
	@ApplicationUserId INT
AS
	SELECT 
		[BlogId]
	   ,[ApplicationUserId]
       ,[Username]
       ,[Title]
       ,[Content]
       ,[PhotoId]
       ,[PublishDate]
       ,[UpdateDate]
	 FROM
		[aggregate].[Blog] t1
	 WHERE
		t1.[ApplicationUserId] = @ApplicationUserId AND
		t1.[ActiveInd] = CONVERT(BIT, 1)
GO

CREATE PROCEDURE [dbo].[Blog_Upsert]
	@Blog BlogType READONLY,
	@ApplicationUserId INT
AS

	MERGE INTO [dbo].[Blog] TARGET
	USING (
		SELECT
			[BlogId],
			@ApplicationUserId [ApplicationUserId],
			[Title],
			[Content],
			[PhotoId]
		FROM
			@Blog
	) AS SOURCE
	ON 
	(
		TARGET.[BlogId] = SOURCE.[BlogId] AND TARGET.[ApplicationUserId] = SOURCE.[ApplicationUserId]
	)
	WHEN MATCHED THEN
		UPDATE SET
			TARGET.[Title] = SOURCE.[Title],
			TARGET.[Content] = SOURCE.[Content],
			TARGET.[PhotoId] = SOURCE.[PhotoId],
			TARGET.[UpdateDate] = GETDATE()
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (
			[ApplicationUserId],
			[Title],
			[Content],
			[PhotoId]
		)
		VALUES (
			SOURCE.[ApplicationUserId],
			SOURCE.[Title],
			SOURCE.[Content],
			SOURCE.[PhotoId]
		);

	SELECT CAST(SCOPE_IDENTITY() AS INT);
GO
