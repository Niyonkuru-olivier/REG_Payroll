-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 03:10 PM
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
-- Database: `payroll_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Present',
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `working_hours` decimal(5,2) DEFAULT NULL,
  `overtime_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `leave_type_id` int(11) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `log_id` bigint(20) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_type` varchar(20) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_values` longtext DEFAULT NULL,
  `new_values` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `branch_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `region_id` int(11) DEFAULT NULL,
  `zone_id` int(11) DEFAULT NULL,
  `branch_code` varchar(30) NOT NULL,
  `branch_name` varchar(200) NOT NULL,
  `branch_type` enum('HeadOffice','RegionalOffice','BranchOffice','Franchise','Warehouse','Store') NOT NULL DEFAULT 'BranchOffice',
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Rwanda',
  `branch_email` varchar(100) DEFAULT NULL,
  `branch_phone` varchar(20) DEFAULT NULL,
  `branch_manager_id` int(11) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_ifsc_code` varchar(20) DEFAULT NULL,
  `bank_account_holder` varchar(200) DEFAULT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `professional_tax_applicable` tinyint(1) NOT NULL DEFAULT 1,
  `pt_slab_type` enum('Karnataka','Maharashtra','Delhi','TamilNadu','WestBengal','Other') NOT NULL DEFAULT 'Karnataka',
  `minimum_wage_applicable` tinyint(1) NOT NULL DEFAULT 0,
  `shop_establishment_number` varchar(50) DEFAULT NULL,
  `payroll_cycle` enum('Monthly','BiWeekly','Weekly') NOT NULL DEFAULT 'Monthly',
  `pay_day_of_month` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `cell` varchar(100) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `district` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `village` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`branch_id`, `company_id`, `region_id`, `zone_id`, `branch_code`, `branch_name`, `branch_type`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `country`, `branch_email`, `branch_phone`, `branch_manager_id`, `bank_name`, `bank_account_number`, `bank_ifsc_code`, `bank_account_holder`, `state_code`, `professional_tax_applicable`, `pt_slab_type`, `minimum_wage_applicable`, `shop_establishment_number`, `payroll_cycle`, `pay_day_of_month`, `is_active`, `cell`, `createdAt`, `district`, `province`, `sector`, `updatedAt`, `village`, `status`) VALUES
(1, 2, NULL, NULL, 'KGL-HQ', 'Kigali Headquarters', 'BranchOffice', 'Remera, Kigali', NULL, 'Kigali', NULL, NULL, 'Rwanda', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Karnataka', 0, NULL, 'Monthly', 1, 1, NULL, '2026-04-29 11:37:12.442', NULL, NULL, NULL, '2026-04-29 11:37:12.442', NULL, 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `legal_name` varchar(200) DEFAULT NULL,
  `company_code` varchar(50) NOT NULL,
  `incorporation_date` datetime(3) DEFAULT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Rwanda',
  `company_email` varchar(100) NOT NULL,
  `company_phone` varchar(20) NOT NULL,
  `website` varchar(200) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `cell` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `paye_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `province` varchar(100) DEFAULT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `rssb_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sector` varchar(100) DEFAULT NULL,
  `tin_number` varchar(20) DEFAULT NULL,
  `vat_number` varchar(20) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `bank_account_holder` varchar(200) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_swift_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`company_id`, `company_name`, `legal_name`, `company_code`, `incorporation_date`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `country`, `company_email`, `company_phone`, `website`, `logo_url`, `is_active`, `created_at`, `updated_at`, `cell`, `district`, `paye_enabled`, `province`, `registration_number`, `rssb_enabled`, `sector`, `tin_number`, `vat_number`, `village`, `bank_account_holder`, `bank_account_number`, `bank_name`, `bank_swift_code`) VALUES
(1, 'Main Company', NULL, 'MAIN001', NULL, '123 Main St', NULL, 'Kigali', NULL, NULL, 'Rwanda', 'admin@company.com', '0700000000', NULL, NULL, 1, '2026-04-28 12:00:13.000', '2026-04-28 12:00:13.000', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Antigravity Tech Solutions', NULL, 'TECH-01', NULL, '123 AI Boulevard', NULL, 'Kigali', NULL, NULL, 'Rwanda', 'info@antigravity.com', '+250123456789', NULL, NULL, 1, '2026-04-29 11:37:12.433', '2026-04-29 11:37:12.433', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `department_code` varchar(20) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `head_employee_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(20) NOT NULL DEFAULT 'Approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `company_id`, `branch_id`, `department_code`, `department_name`, `description`, `head_employee_id`, `is_active`, `created_at`, `updated_at`, `status`) VALUES
(1, 2, 1, 'ENG', 'Engineering', NULL, NULL, 1, '2026-04-29 11:37:12.450', '2026-04-29 11:37:12.450', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `document_type` varchar(50) NOT NULL,
  `document_name` varchar(200) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `marital_status` enum('Single','Married','Divorced','Widowed') DEFAULT NULL,
  `personal_email` varchar(100) NOT NULL,
  `work_email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `alternate_phone` varchar(15) DEFAULT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(15) DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  `date_of_confirmation` date DEFAULT NULL,
  `employment_type` enum('FullTime','PartTime','Contract','Intern') NOT NULL DEFAULT 'FullTime',
  `probation_months` int(11) NOT NULL DEFAULT 6,
  `reporting_manager_id` int(11) DEFAULT NULL,
  `work_location` enum('Office','Remote','Hybrid','Field') NOT NULL DEFAULT 'Office',
  `current_base_salary` decimal(12,2) NOT NULL,
  `current_hra_percentage` decimal(5,2) NOT NULL DEFAULT 40.00,
  `current_special_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bank_account_holder` varchar(200) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `bank_account_number` varchar(50) NOT NULL,
  `bank_ifsc_code` varchar(20) NOT NULL,
  `bank_branch` varchar(200) DEFAULT NULL,
  `password_hash` varchar(191) DEFAULT NULL,
  `profile_photo_url` varchar(500) DEFAULT NULL,
  `employment_status` enum('Active','Inactive','Resigned','Terminated','OnNotice','Transferred','Pending','Rejected') NOT NULL DEFAULT 'Active',
  `resignation_date` date DEFAULT NULL,
  `last_working_date` date DEFAULT NULL,
  `exit_reason` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_by` int(11) DEFAULT NULL,
  `full_name` varchar(191) DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `national_id` varchar(20) DEFAULT NULL,
  `rssb_number` varchar(20) DEFAULT NULL,
  `tin_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `company_id`, `branch_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `blood_group`, `marital_status`, `personal_email`, `work_email`, `phone_number`, `alternate_phone`, `emergency_contact_name`, `emergency_contact_phone`, `current_address`, `permanent_address`, `city`, `state`, `pincode`, `department_id`, `post_id`, `grade_id`, `date_of_joining`, `date_of_confirmation`, `employment_type`, `probation_months`, `reporting_manager_id`, `work_location`, `current_base_salary`, `current_hra_percentage`, `current_special_allowance`, `bank_account_holder`, `bank_name`, `bank_account_number`, `bank_ifsc_code`, `bank_branch`, `password_hash`, `profile_photo_url`, `employment_status`, `resignation_date`, `last_working_date`, `exit_reason`, `is_active`, `created_at`, `updated_at`, `created_by`, `full_name`, `must_change_password`, `national_id`, `rssb_number`, `tin_number`) VALUES
(1, 2, 1, 'EMP001', 'John', NULL, 'Smith', '1990-01-01', 'Male', NULL, NULL, 'john.smith@gmail.com', NULL, '555-0101', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-04-29', NULL, 'FullTime', 6, NULL, 'Office', 75000.00, 40.00, 0.00, 'John Smith', 'Standard Bank', '987654321', 'STD001', NULL, NULL, NULL, 'Active', NULL, NULL, NULL, 1, '2026-04-29 11:37:12.489', '2026-04-29 11:37:12.489', NULL, NULL, 0, NULL, NULL, NULL),
(2, 1, 1, 'EMP001', 'John', NULL, 'Doe', '1990-01-15', 'Male', NULL, NULL, 'john.doe@example.com', NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-04-29', NULL, 'FullTime', 6, NULL, 'Office', 50000.00, 40.00, 0.00, 'John Doe', 'Default Bank', 'BK123456789', '0000', NULL, NULL, NULL, 'Active', NULL, NULL, NULL, 1, '2026-04-29 12:16:07.694', '2026-04-29 12:16:07.694', NULL, NULL, 0, 'ID123456789', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_change_requests`
--

CREATE TABLE `employee_change_requests` (
  `request_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `request_type` enum('PhoneUpdate','EmailUpdate','AddressUpdate','BankAccountUpdate','NameCorrection','DocumentUpdate') NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text NOT NULL,
  `reason` text DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  `submitted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `review_remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_leaves`
--

CREATE TABLE `employee_leaves` (
  `leave_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(5,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_salary_components`
--

CREATE TABLE `employee_salary_components` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `component_id` int(11) NOT NULL,
  `custom_value` decimal(12,2) DEFAULT NULL,
  `is_applicable` tinyint(1) NOT NULL DEFAULT 1,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_salary_components`
--

INSERT INTO `employee_salary_components` (`id`, `employee_id`, `component_id`, `custom_value`, `is_applicable`, `effective_from`, `effective_to`, `remarks`, `created_at`, `company_id`) VALUES
(1, 1, 1, NULL, 1, '2026-04-29', NULL, NULL, '2026-04-29 11:37:12.521', 2),
(2, 1, 2, NULL, 1, '2026-04-29', NULL, NULL, '2026-04-29 11:37:12.529', 2);

-- --------------------------------------------------------

--
-- Table structure for table `employee_transfers`
--

CREATE TABLE `employee_transfers` (
  `transfer_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `from_branch_id` int(11) NOT NULL,
  `to_branch_id` int(11) NOT NULL,
  `from_department_id` int(11) DEFAULT NULL,
  `to_department_id` int(11) DEFAULT NULL,
  `from_post_id` int(11) DEFAULT NULL,
  `to_post_id` int(11) DEFAULT NULL,
  `from_base_salary` decimal(12,2) DEFAULT NULL,
  `to_base_salary` decimal(12,2) DEFAULT NULL,
  `transfer_date` date NOT NULL,
  `effective_from` date NOT NULL,
  `transfer_type` enum('Permanent','Temporary','Deputation') NOT NULL DEFAULT 'Permanent',
  `transfer_reason` text DEFAULT NULL,
  `status` enum('Initiated','Approved','Rejected','Completed') NOT NULL DEFAULT 'Initiated',
  `initiated_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `holiday_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `holiday_name` varchar(200) NOT NULL,
  `holiday_date` date NOT NULL,
  `holiday_type` varchar(20) NOT NULL DEFAULT 'National',
  `description` text DEFAULT NULL,
  `is_recurring_yearly` tinyint(1) NOT NULL DEFAULT 1,
  `applicable_for` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hr_users`
--

CREATE TABLE `hr_users` (
  `user_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `refresh_token_hash` varchar(191) DEFAULT NULL,
  `activation_token` varchar(191) DEFAULT NULL,
  `activation_expires_at` datetime(3) DEFAULT NULL,
  `password_hash` varchar(191) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `role` enum('PlatformAdmin','SuperAdmin','CompanyAdmin','BranchHR','Employee') NOT NULL,
  `access_scope` enum('AllBranches','RegionOnly','BranchOnly','Self') NOT NULL DEFAULT 'BranchOnly',
  `accessible_branches` longtext DEFAULT NULL,
  `accessible_regions` longtext DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `last_login` datetime(3) DEFAULT NULL,
  `login_attempts` int(11) NOT NULL DEFAULT 0,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hr_users`
--

INSERT INTO `hr_users` (`user_id`, `company_id`, `employee_id`, `username`, `email`, `refresh_token_hash`, `activation_token`, `activation_expires_at`, `password_hash`, `full_name`, `role`, `access_scope`, `accessible_branches`, `accessible_regions`, `permissions`, `last_login`, `login_attempts`, `is_locked`, `is_active`, `created_at`, `updated_at`, `branch_id`, `must_change_password`) VALUES
(1, 1, NULL, 'admin', 'admin@example.com', '$2b$10$H4Nd7.wUixrtJWFhLU9WTOcIwBb5Kf/uXQCLB61PyoX3EAQjgSzGq', NULL, NULL, '$2b$10$OxUCpSAl31xkJnad5RRQCOIkV0gVYvUwnIcrGZL6O2ns9nvjvGBPm', 'Admin User', 'SuperAdmin', 'BranchOnly', NULL, NULL, NULL, NULL, 0, 0, 1, '2026-04-28 12:00:29.000', '2026-04-29 12:26:42.773', NULL, 0),
(2, NULL, NULL, 'superadmin', 'admin@payroll.com', NULL, NULL, NULL, '$2b$10$LFHZBT7xK1XYphHUfQd.c.TrdgM7AZAJc9xd1h0Tx87d9lnS06/Dq', 'System Super Admin', '', 'BranchOnly', NULL, NULL, NULL, NULL, 0, 0, 1, '2026-04-29 11:37:12.389', '0000-00-00 00:00:00.000', NULL, 0),
(3, NULL, NULL, 'hr_manager', 'hr@antigravity.com', NULL, NULL, NULL, '$2b$10$LFHZBT7xK1XYphHUfQd.c.TrdgM7AZAJc9xd1h0Tx87d9lnS06/Dq', 'Jane Doe', '', 'BranchOnly', NULL, NULL, NULL, NULL, 0, 0, 1, '2026-04-29 11:37:12.469', '0000-00-00 00:00:00.000', NULL, 0),
(4, NULL, 2, 'EMP001', 'john.doe@example.com', NULL, NULL, NULL, '$2b$10$xlyK8n4F3i3ei7pMWJLLne95PG903dwZI2/FVn.wPhSLPSf9a022K', 'John Doe', 'Employee', 'BranchOnly', NULL, NULL, NULL, NULL, 0, 0, 1, '2026-04-29 12:16:07.801', '2026-04-29 12:18:59.903', NULL, 0),
(5, 1, NULL, 'hq_alice', 'hq.hr@company.com', NULL, '9a35efb9-0736-4c12-87e6-6afb56361203', '2026-04-30 12:26:55.128', '', 'Alice HQ Manager', 'CompanyAdmin', 'BranchOnly', NULL, NULL, NULL, NULL, 0, 0, 0, '2026-04-29 12:26:55.203', '2026-04-29 12:26:55.203', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `balance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `financial_year` varchar(9) NOT NULL,
  `opening_balance` decimal(5,2) NOT NULL DEFAULT 0.00,
  `accrued_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `used_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `closing_balance` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `leave_type_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `leave_code` varchar(20) NOT NULL,
  `leave_name` varchar(100) NOT NULL,
  `default_days_per_year` int(11) NOT NULL DEFAULT 0,
  `max_days_per_year` int(11) DEFAULT NULL,
  `carry_forward_limit` int(11) NOT NULL DEFAULT 0,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `recipient_type` varchar(20) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `notification_type` enum('SalaryCredited','PayslipReady','LeaveApproved','LeaveRejected','ProfileUpdated','ChangeRequestApproved','ChangeRequestRejected','BirthdayReminder','DocumentExpiry','GeneralAnnouncement','TransferInitiated','TransferApproved','TransferCompleted') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `short_message` varchar(160) DEFAULT NULL,
  `delivery_methods` varchar(191) NOT NULL DEFAULT 'IN_APP',
  `email_sent` tinyint(1) NOT NULL DEFAULT 0,
  `email_sent_at` datetime(3) DEFAULT NULL,
  `sms_sent` tinyint(1) NOT NULL DEFAULT 0,
  `sms_sent_at` datetime(3) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime(3) DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `action_url` varchar(500) DEFAULT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_batches`
--

CREATE TABLE `payroll_batches` (
  `batch_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `pay_date` date NOT NULL,
  `total_employees` int(11) NOT NULL DEFAULT 0,
  `total_gross` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_deductions` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_net_payable` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_bonus` decimal(14,2) NOT NULL DEFAULT 0.00,
  `status` enum('Draft','Calculated','Approved','PaymentInitiated','Paid','Cancelled') NOT NULL DEFAULT 'Draft',
  `calculated_at` datetime(3) DEFAULT NULL,
  `calculated_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `paid_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payslips`
--

CREATE TABLE `payslips` (
  `payslip_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `payslip_number` varchar(50) NOT NULL,
  `days_present` int(11) NOT NULL DEFAULT 30,
  `days_absent` int(11) NOT NULL DEFAULT 0,
  `paid_leaves` int(11) NOT NULL DEFAULT 0,
  `unpaid_leaves` int(11) NOT NULL DEFAULT 0,
  `basic_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `hra` decimal(12,2) NOT NULL DEFAULT 0.00,
  `conveyance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `medical_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `special_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bonus` decimal(10,2) NOT NULL DEFAULT 0.00,
  `other_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_earnings` decimal(12,2) NOT NULL DEFAULT 0.00,
  `pf_employee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pf_employer` decimal(10,2) NOT NULL DEFAULT 0.00,
  `esi_employee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `esi_employer` decimal(10,2) NOT NULL DEFAULT 0.00,
  `professional_tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tds` decimal(10,2) NOT NULL DEFAULT 0.00,
  `advance_recovery` decimal(10,2) NOT NULL DEFAULT 0.00,
  `other_deductions` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_deductions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_payable` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_pay_words` varchar(500) DEFAULT NULL,
  `payment_status` enum('Pending','Processed','Paid','Failed') NOT NULL DEFAULT 'Pending',
  `payment_date` date DEFAULT NULL,
  `payment_mode` enum('BankTransfer','Cash','Cheque') NOT NULL DEFAULT 'BankTransfer',
  `transaction_reference` varchar(100) DEFAULT NULL,
  `calculation_data` longtext DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `post_code` varchar(20) NOT NULL,
  `post_title` varchar(100) NOT NULL,
  `post_description` text DEFAULT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `hra_percentage` decimal(5,2) NOT NULL DEFAULT 40.00,
  `da_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `conveyance_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `medical_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `special_allowance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pf_applicable` tinyint(1) NOT NULL DEFAULT 1,
  `pf_percentage` decimal(5,2) NOT NULL DEFAULT 12.00,
  `esi_applicable` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `company_id`, `branch_id`, `department_id`, `grade_id`, `post_code`, `post_title`, `post_description`, `base_salary`, `hra_percentage`, `da_percentage`, `conveyance_allowance`, `medical_allowance`, `special_allowance`, `pf_applicable`, `pf_percentage`, `esi_applicable`, `is_active`, `created_at`, `updatedAt`) VALUES
(1, 2, 1, 1, NULL, 'SNR-DEV', 'Senior Developer', NULL, 80000.00, 40.00, 0.00, 0.00, 0.00, 0.00, 1, 12.00, 0, 1, '2026-04-29 11:37:12.457', '2026-04-29 11:37:12.457');

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `region_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `region_code` varchar(20) NOT NULL,
  `region_name` varchar(100) NOT NULL,
  `regional_head_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salary_components`
--

CREATE TABLE `salary_components` (
  `component_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `component_code` varchar(20) NOT NULL,
  `component_name` varchar(100) NOT NULL,
  `component_type` enum('Earning','Deduction') NOT NULL,
  `calculation_type` enum('Fixed','Percentage','Formula') NOT NULL,
  `default_value` decimal(12,2) DEFAULT NULL,
  `percentage_of` varchar(20) DEFAULT NULL,
  `formula` text DEFAULT NULL,
  `is_taxable` tinyint(1) NOT NULL DEFAULT 1,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salary_components`
--

INSERT INTO `salary_components` (`component_id`, `company_id`, `component_code`, `component_name`, `component_type`, `calculation_type`, `default_value`, `percentage_of`, `formula`, `is_taxable`, `is_mandatory`, `display_order`, `is_active`) VALUES
(1, 2, 'HRA', 'House Rent Allowance', 'Earning', 'Formula', NULL, NULL, 'basicSalary * 0.4', 1, 0, 0, 1),
(2, 2, 'PT', 'Professional Tax', 'Deduction', 'Fixed', 200.00, NULL, NULL, 1, 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `salary_grades`
--

CREATE TABLE `salary_grades` (
  `grade_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `grade_code` varchar(10) NOT NULL,
  `grade_name` varchar(50) NOT NULL,
  `min_salary` decimal(12,2) DEFAULT NULL,
  `max_salary` decimal(12,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tax_deductions`
--

CREATE TABLE `tax_deductions` (
  `tax_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `financial_year` varchar(9) NOT NULL,
  `estimated_annual_income` decimal(14,2) DEFAULT NULL,
  `total_exemptions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_deductions_80c` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_deductions_80d` decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_deductions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `taxable_income` decimal(14,2) DEFAULT NULL,
  `tax_liability` decimal(12,2) DEFAULT NULL,
  `tds_deducted_so_far` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tds_per_month` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `zone_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `region_id` int(11) DEFAULT NULL,
  `zone_code` varchar(20) NOT NULL,
  `zone_name` varchar(100) NOT NULL,
  `zone_head_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `attendance_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`branch_id`),
  ADD KEY `branches_company_id_fkey` (`company_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`company_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD KEY `departments_company_id_fkey` (`company_id`),
  ADD KEY `departments_branch_id_fkey` (`branch_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `documents_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD KEY `employees_company_id_fkey` (`company_id`),
  ADD KEY `employees_branch_id_fkey` (`branch_id`),
  ADD KEY `employees_department_id_fkey` (`department_id`),
  ADD KEY `employees_post_id_fkey` (`post_id`);

--
-- Indexes for table `employee_change_requests`
--
ALTER TABLE `employee_change_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `employee_change_requests_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `employee_leaves`
--
ALTER TABLE `employee_leaves`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `employee_leaves_employee_id_fkey` (`employee_id`),
  ADD KEY `employee_leaves_leave_type_id_fkey` (`leave_type_id`);

--
-- Indexes for table `employee_salary_components`
--
ALTER TABLE `employee_salary_components`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_salary_components_employee_id_fkey` (`employee_id`),
  ADD KEY `employee_salary_components_component_id_fkey` (`component_id`);

--
-- Indexes for table `employee_transfers`
--
ALTER TABLE `employee_transfers`
  ADD PRIMARY KEY (`transfer_id`),
  ADD KEY `employee_transfers_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`holiday_id`);

--
-- Indexes for table `hr_users`
--
ALTER TABLE `hr_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `hr_users_email_key` (`email`),
  ADD KEY `hr_users_company_id_fkey` (`company_id`),
  ADD KEY `hr_users_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`balance_id`),
  ADD KEY `leave_balances_employee_id_fkey` (`employee_id`),
  ADD KEY `leave_balances_leave_type_id_fkey` (`leave_type_id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`leave_type_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `payroll_batches_branch_id_fkey` (`branch_id`);

--
-- Indexes for table `payslips`
--
ALTER TABLE `payslips`
  ADD PRIMARY KEY (`payslip_id`),
  ADD KEY `payslips_employee_id_fkey` (`employee_id`),
  ADD KEY `payslips_batch_id_fkey` (`batch_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `posts_department_id_fkey` (`department_id`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`region_id`);

--
-- Indexes for table `salary_components`
--
ALTER TABLE `salary_components`
  ADD PRIMARY KEY (`component_id`);

--
-- Indexes for table `salary_grades`
--
ALTER TABLE `salary_grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `salary_grades_branch_id_fkey` (`branch_id`);

--
-- Indexes for table `tax_deductions`
--
ALTER TABLE `tax_deductions`
  ADD PRIMARY KEY (`tax_id`),
  ADD KEY `tax_deductions_employee_id_fkey` (`employee_id`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`zone_id`),
  ADD KEY `zones_region_id_fkey` (`region_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `log_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_change_requests`
--
ALTER TABLE `employee_change_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_leaves`
--
ALTER TABLE `employee_leaves`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_salary_components`
--
ALTER TABLE `employee_salary_components`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_transfers`
--
ALTER TABLE `employee_transfers`
  MODIFY `transfer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `holiday_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hr_users`
--
ALTER TABLE `hr_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `balance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `leave_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payslips`
--
ALTER TABLE `payslips`
  MODIFY `payslip_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `region_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salary_components`
--
ALTER TABLE `salary_components`
  MODIFY `component_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `salary_grades`
--
ALTER TABLE `salary_grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_deductions`
--
ALTER TABLE `tax_deductions`
  MODIFY `tax_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `zone_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `departments_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON UPDATE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee_change_requests`
--
ALTER TABLE `employee_change_requests`
  ADD CONSTRAINT `employee_change_requests_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee_leaves`
--
ALTER TABLE `employee_leaves`
  ADD CONSTRAINT `employee_leaves_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_leaves_leave_type_id_fkey` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee_salary_components`
--
ALTER TABLE `employee_salary_components`
  ADD CONSTRAINT `employee_salary_components_component_id_fkey` FOREIGN KEY (`component_id`) REFERENCES `salary_components` (`component_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_salary_components_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee_transfers`
--
ALTER TABLE `employee_transfers`
  ADD CONSTRAINT `employee_transfers_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `hr_users`
--
ALTER TABLE `hr_users`
  ADD CONSTRAINT `hr_users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `hr_users_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `leave_balances_leave_type_id_fkey` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  ADD CONSTRAINT `payroll_batches_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE;

--
-- Constraints for table `payslips`
--
ALTER TABLE `payslips`
  ADD CONSTRAINT `payslips_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `payroll_batches` (`batch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payslips_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON UPDATE CASCADE;

--
-- Constraints for table `salary_grades`
--
ALTER TABLE `salary_grades`
  ADD CONSTRAINT `salary_grades_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tax_deductions`
--
ALTER TABLE `tax_deductions`
  ADD CONSTRAINT `tax_deductions_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `zones`
--
ALTER TABLE `zones`
  ADD CONSTRAINT `zones_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
