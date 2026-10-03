-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2026 at 01:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tutor_finder`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `tutor_id` varchar(36) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(20) NOT NULL,
  `duration` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `student_id`, `tutor_id`, `subject`, `date`, `time`, `duration`, `notes`, `price`, `status`, `created_at`, `updated_at`) VALUES
('20a93849-d687-45b4-a667-9f78843bc5fb', '10d3d992-2b77-475b-abee-dec0d407475d', '08bfe6fe-e298-4dbe-8db5-35369861136b', 'Programming', '2026-09-30', '10:00 AM', 120, 'i only want programming jave', 50.00, 'completed', '2026-09-24 16:19:58', '2026-09-24 16:46:38');

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `tutor_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `student_id`, `tutor_id`, `created_at`, `updated_at`) VALUES
('e5571a8b-985d-4645-854a-ee480ec3b2e4', '10d3d992-2b77-475b-abee-dec0d407475d', '08bfe6fe-e298-4dbe-8db5-35369861136b', '2026-09-24 16:39:12', '2026-09-24 16:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL,
  `chat_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `receiver_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `chat_id`, `sender_id`, `receiver_id`, `content`, `read_at`, `created_at`) VALUES
('778dda82-b0d6-442f-b7f6-e232b942cfac', 'e5571a8b-985d-4645-854a-ee480ec3b2e4', '08bfe6fe-e298-4dbe-8db5-35369861136b', '10d3d992-2b77-475b-abee-dec0d407475d', 'hey there i have confirmed your bookings, i will be coming 5 minutes earlier. can you send me the clear location..?', '2026-09-24 16:43:14', '2026-09-24 16:43:13'),
('921d4355-edf8-4ea2-ac91-913ddc3a05ed', 'e5571a8b-985d-4645-854a-ee480ec3b2e4', '10d3d992-2b77-475b-abee-dec0d407475d', '08bfe6fe-e298-4dbe-8db5-35369861136b', 'alright thank you. let me share the google location..', '2026-09-24 16:43:37', '2026-09-24 16:43:36');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL,
  `tutor_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `tutor_id`, `student_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
('8ec9cead-01d6-42fe-9301-1514655c34d7', '08bfe6fe-e298-4dbe-8db5-35369861136b', '10d3d992-2b77-475b-abee-dec0d407475d', 5, 'this tutor is good, and he comes on time.', '2026-09-24 16:10:46', '2026-09-24 16:10:46');

-- --------------------------------------------------------

--
-- Table structure for table `tutor_profiles`
--

CREATE TABLE `tutor_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `subjects` text NOT NULL,
  `levels` text NOT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `reviews_count` int(11) DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `distance` decimal(6,2) DEFAULT 0.00,
  `mode` enum('online','physical','both') DEFAULT 'both',
  `availability` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`availability`)),
  `verified` tinyint(1) DEFAULT 0,
  `experience` varchar(50) DEFAULT NULL,
  `qualifications` text DEFAULT NULL,
  `languages` text DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tutor_profiles`
--

INSERT INTO `tutor_profiles` (`id`, `user_id`, `subjects`, `levels`, `rating`, `reviews_count`, `price`, `distance`, `mode`, `availability`, `verified`, `experience`, `qualifications`, `languages`, `location`, `skills`, `education`, `is_active`, `created_at`, `updated_at`, `latitude`, `longitude`) VALUES
('d1032329-0d67-4239-84fc-9132a13fbb49', '08bfe6fe-e298-4dbe-8db5-35369861136b', '[\"Mathematics\",\"Physics\",\"Chemistry\",\"Music\",\"Engineering\",\"Programming\"]', '[\"Elementary\",\"Middle School\",\"High School\"]', 5.00, 1, 50.00, 0.00, 'both', '[\"Monday\",\"Friday\"]', 0, '8years', '[\"PHD in mathematics\"]', '[\"English\",\"Nyanja\"]', 'Mass Media, Kalingalinga', '[\"MCAT preparation\"]', '[{\"degree\":\"bsc biology\",\"institution\":\"University of zambia\",\"year\":\"2023\"}]', 1, '2026-09-24 16:07:53', '2026-09-24 17:00:27', -15.39079034, 28.33182670);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','tutor','admin') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_pic` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `phone`, `password`, `role`, `created_at`, `profile_pic`, `bio`) VALUES
('08bfe6fe-e298-4dbe-8db5-35369861136b', 'Celine', 'Soko', 'mrodneyk406@gmail.com', '0977651841', '$2b$10$w2nIEi2hYzytdX747ahkG.JGP0g0RwVim/945uTr4eyLL8uIhPa0a', 'tutor', '2026-09-24 16:02:08', '/uploads/profiles/08bfe6fe-e298-4dbe-8db5-35369861136b_1790266073283.avif', 'i love tutoring'),
('10d3d992-2b77-475b-abee-dec0d407475d', 'Joshua', 'Njobvu', 'moses.kaluba@cs.unza.zm', '0977651842', '$2b$10$4VGwoJ8jZC98aLFJJCNFDuEVEypKIof.vSyv6QuLHguXHnbJ8WJnS', 'student', '2026-09-24 15:59:48', '/uploads/profiles/10d3d992-2b77-475b-abee-dec0d407475d_1790268115117.webp', 'i am commited to learning');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_tutor` (`tutor_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tutor_date` (`tutor_id`,`date`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pair` (`student_id`,`tutor_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_tutor` (`tutor_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `idx_chat_created` (`chat_id`,`created_at`),
  ADD KEY `idx_receiver_unread` (`receiver_id`,`read_at`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_tutor` (`student_id`,`tutor_id`),
  ADD KEY `idx_tutor` (`tutor_id`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `tutor_profiles`
--
ALTER TABLE `tutor_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_id` (`user_id`),
  ADD KEY `idx_verified` (`verified`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_location` (`location`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tutor_profiles`
--
ALTER TABLE `tutor_profiles`
  ADD CONSTRAINT `fk_tutor_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
