-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `allocationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AcademicSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AcademicSession_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubjectAllocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `batch` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `sessionId` INTEGER NOT NULL,

    UNIQUE INDEX `SubjectAllocation_courseId_batch_section_sessionId_key`(`courseId`, `batch`, `section`, `sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassRoutine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `allocationId` INTEGER NOT NULL,
    `dayOfWeek` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `roomNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_allocationId_fkey` FOREIGN KEY (`allocationId`) REFERENCES `SubjectAllocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectAllocation` ADD CONSTRAINT `SubjectAllocation_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectAllocation` ADD CONSTRAINT `SubjectAllocation_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectAllocation` ADD CONSTRAINT `SubjectAllocation_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AcademicSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassRoutine` ADD CONSTRAINT `ClassRoutine_allocationId_fkey` FOREIGN KEY (`allocationId`) REFERENCES `SubjectAllocation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
