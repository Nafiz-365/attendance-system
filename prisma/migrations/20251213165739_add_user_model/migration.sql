/*
  Warnings:

  - A unique constraint covering the columns `[code,userId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,userId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,userId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,userId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `Course_departmentId_fkey`;

-- DropIndex
DROP INDEX `Attendance_studentId_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Course_code_key` ON `course`;

-- DropIndex
DROP INDEX `Course_departmentId_fkey` ON `course`;

-- DropIndex
DROP INDEX `Department_code_key` ON `department`;

-- DropIndex
DROP INDEX `Student_email_key` ON `student`;

-- DropIndex
DROP INDEX `Student_rollNo_key` ON `student`;

-- DropIndex
DROP INDEX `Student_studentId_key` ON `student`;

-- AlterTable
ALTER TABLE `course` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `department` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Course_code_userId_key` ON `Course`(`code`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Department_code_userId_key` ON `Department`(`code`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_studentId_userId_key` ON `Student`(`studentId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_email_userId_key` ON `Student`(`email`, `userId`);

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
