-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `Teacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subjects` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,

    UNIQUE INDEX `Teacher_employeeId_key`(`employeeId`),
    UNIQUE INDEX `Teacher_email_key`(`email`),
    UNIQUE INDEX `Teacher_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
