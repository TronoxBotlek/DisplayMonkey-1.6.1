/*!
* DisplayMonkey source file
* http://displaymonkey.org
*
* Copyright (c) 2016 Fuel9 LLC and contributors
*
* Released under the MIT license:
* http://opensource.org/licenses/MIT
*/

use DisplayMonkey	-- TODO: change if DisplayMonkey database name is different
GO

-- changes for v1.3.1
-- Fixed issue #3

BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Display
	DROP CONSTRAINT FK_Display_Canvas
GO
ALTER TABLE dbo.Canvas SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Display ADD CONSTRAINT
	FK_Display_Canvas FOREIGN KEY
	(
	CanvasId
	) REFERENCES dbo.Canvas
	(
	CanvasId
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.Display SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
