/*
  Warnings:

  - You are about to drop the column `rollNo` on the `student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Student_email_userId_key` ON `student`;

-- DropIndex
DROP INDEX `Student_studentId_userId_key` ON `student`;

-- AlterTable
ALTER TABLE `leaverequest` ADD COLUMN `approvedById` INTEGER NULL,
    ADD COLUMN `teacherId` INTEGER NULL,
    MODIFY `studentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `rollNo`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `image` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Notice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `audience` VARCHAR(191) NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `authorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_read_idx`(`userId`, `read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Student_studentId_key` ON `Student`(`studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_email_key` ON `Student`(`email`);

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notice` ADD CONSTRAINT `Notice_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
