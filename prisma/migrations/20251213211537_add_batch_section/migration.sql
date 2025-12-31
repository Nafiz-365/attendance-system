-- AlterTable: Add batch and section columns with defaults
ALTER TABLE `Student` ADD COLUMN `batch` VARCHAR(191) NOT NULL DEFAULT 'Batch 50';
ALTER TABLE `Student` ADD COLUMN `section` VARCHAR(191) NOT NULL DEFAULT 'A';

-- Migrate existing data: Try to extract section from class field if it exists
-- For example "10-A" would set section to "A"
UPDATE `Student` 
SET `section` = SUBSTRING_INDEX(`class`, '-', -1)
WHERE `class` LIKE '%-%' AND SUBSTRING_INDEX(`class`, '-', -1) IN ('A','B','C','D','E','F','G','H','I','J');

-- Drop the old class column
ALTER TABLE `Student` DROP COLUMN `class`;
