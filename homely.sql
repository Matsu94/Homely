DROP DATABASE IF EXISTS Homely;

CREATE DATABASE IF NOT EXISTS `Homely` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `Homely`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Users table
CREATE TABLE `users` (
  `user_id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Groups table
CREATE TABLE `groups` (
  `group_id` INT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) UNIQUE NOT NULL,
  `creator_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (`creator_id`),
  FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Group members
CREATE TABLE `group_members` (
  `group_id` INT(20) UNSIGNED NOT NULL,
  `user_id` INT(11) NOT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `user_id`),
  INDEX (`user_id`),
  FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Messages
CREATE TABLE `messages` (
  `message_id` INT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `content` TEXT NOT NULL,
  `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sender_id` INT(11) NOT NULL,
  `receiver_id` INT(20) UNSIGNED NOT NULL,
  INDEX (`sender_id`),
  INDEX (`receiver_id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `groups` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Group message read status
CREATE TABLE `group_message_status` (
  `message_id` INT(20) UNSIGNED NOT NULL,
  `user_id` INT(11) NOT NULL,
  `status` INT(11) DEFAULT 1,
  PRIMARY KEY (`message_id`, `user_id`),
  INDEX (`user_id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Periodic/occasional chores
CREATE TABLE `chores` ( 
  `chore_id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` ENUM('occasional', 'periodic') NOT NULL, 
  `periodicity` ENUM('daily', 'monthly', 'yearly', 'specific_days', 'twice_daily'), 
  `specific_days` SET('mon','tue','wed','thu','fri','sat','sun') DEFAULT NULL,
  `date_limit` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`group_id`),
  INDEX (`periodicity`),
  FOREIGN KEY (`group_id`) REFERENCES groups(`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Chore completions
CREATE TABLE `chore_completions` (
  `chore_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `proof_image_url` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`chore_id`, `user_id`, `completed_at`),
  INDEX (`user_id`),
  FOREIGN KEY (`chore_id`) REFERENCES chores(`chore_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `house_stock` (
  `group_id` INT UNSIGNED NOT NULL,
  `items` JSON NOT NULL,  -- example: {"milk": "1L", "pasta": "3 packs", "soap": "2 bars"},
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`),
  FOREIGN KEY (`group_id`) REFERENCES groups(`group_id`) ON DELETE CASCADE
);

CREATE TABLE `group_invitation` (
  `group_id` INT UNSIGNED NOT NULL,
  `group_code` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (`group_id`),
  FOREIGN KEY (`group_id`) REFERENCES groups(`group_id`) ON DELETE CASCADE
);


-- Dummy user data
INSERT INTO `users` (`user_id`, `username`, `password`) VALUES
(0, 'user1', 'scrypt:32768:8:1$WEPJFaJjJwPpKXJc$85f45fef7d073181d4993f80178e373349a0c55e791679c7ce00ce2da2612f7cd57ebf437d6cd97f01fc35c6fdaad9197e9bd0d638092c7a59b528074619b69e'),
(1, 'user2', 'scrypt:32768:8:1$YkMZtFeB6CbOWKqm$f09c184d74e48f073c571d45b3efdc42c9570a0b900ec01a4c7eedd7586f4cf2d1a25ea0b24e5ee7f9c869e8c0aee83d5827e30febfdf728df7e71a78375f06b'),
(2, 'user3', 'scrypt:32768:8:1$hTJjwKlJeCthi8up$d86c17cc6169b55eaa1ebbe5ae9f67faabee7a605edf73420722863bb083b194738cde65b2ef96b20c792021313f0bfa7875133106b84e95b88b6a14a4804738');

COMMIT;