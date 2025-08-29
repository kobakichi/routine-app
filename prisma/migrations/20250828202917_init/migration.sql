-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Routine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'slate',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Routine_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoutineCheck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routineId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT true,
    `note` VARCHAR(191) NULL,

    INDEX `RoutineCheck_date_idx`(`date`),
    UNIQUE INDEX `RoutineCheck_routineId_date_key`(`routineId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Routine` ADD CONSTRAINT `Routine_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoutineCheck` ADD CONSTRAINT `RoutineCheck_routineId_fkey` FOREIGN KEY (`routineId`) REFERENCES `Routine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
