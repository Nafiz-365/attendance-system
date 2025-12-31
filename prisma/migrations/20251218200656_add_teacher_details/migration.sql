/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `joiningDate` DATETIME(3) NULL,
    ADD COLUMN `qualification` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `notification`;
