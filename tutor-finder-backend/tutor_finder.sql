-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 06, 2026 at 11:50 AM
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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_pic` varchar(500) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `mobile_phone` varchar(20) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `physical_address` text DEFAULT NULL,
  `postal_address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `place_of_birth_town` varchar(100) DEFAULT NULL,
  `place_of_birth_country` varchar(100) DEFAULT NULL,
  `nrc_number` varchar(100) DEFAULT NULL,
  `nrc_place_of_issue` varchar(100) DEFAULT NULL,
  `nrc_date_of_issue` date DEFAULT NULL,
  `profile_completed` tinyint(1) NOT NULL DEFAULT 0,
  `is_registered` tinyint(1) NOT NULL DEFAULT 1,
  `password` varchar(255) NOT NULL,
  `role` enum('student','tutor','admin') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password`, `role`, `created_at`) VALUES
('2e7cd31b-8a90-4069-80ba-8399c0b86116', 'mrodneyk406@gmail.com', '0977651841', '$2b$10$DmtSG8veIMpAOmPum.N3qOyOetRRi83K5DeRlJJOtahLbWv/eK9N2', 'student', '2026-08-06 08:29:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Table structure for table `tutor_profiles`
--

CREATE TABLE `tutor_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `subjects` json DEFAULT NULL,
  `levels` json DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` int(10) unsigned NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `distance` decimal(10,2) DEFAULT NULL,
  `mode` varchar(20) NOT NULL DEFAULT 'both',
  `availability` json DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `experience` varchar(255) DEFAULT NULL,
  `qualifications` json DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `education` json DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tutor_profiles_user_id` (`user_id`),
  KEY `idx_tutor_profiles_active_rating` (`is_active`,`rating`,`reviews_count`),
  KEY `idx_tutor_profiles_location` (`latitude`,`longitude`),
  CONSTRAINT `fk_tutor_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
