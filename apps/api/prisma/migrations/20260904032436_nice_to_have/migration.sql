-- AlterTable
ALTER TABLE `Quiz` ADD COLUMN `scheduledStartAt` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `notifyNewQuiz` BOOLEAN NOT NULL DEFAULT true;
