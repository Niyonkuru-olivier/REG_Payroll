# 🛡️ Reserve Force Payroll System (REG Payroll)

[![Built with Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Built with NestJS](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Database Prisma](https://img.shields.io/badge/Database-Prisma%20&%20MySQL-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License UNLICENSED](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

A robust, enterprise-grade payroll and human resource management system designed for the **Reserve Force**. This monorepo contains a high-performance **NestJS** backend and a modern **Next.js** frontend, providing a seamless experience for administrators, HR managers, and employees.

---

## 🚀 Key Features

-   **💰 Automated Payroll**: Batch processing, salary recalculations, and automated payslip generation.
-   **👥 User Management**: Role-based access control with complex approval workflows.
-   **📅 Attendance & Leaves**: Track employee attendance and manage leave requests with multi-level approval.
-   **🏢 Branch Management**: Centralized control over multiple regional branches and hubs.
-   **📊 Reporting & Auditing**: Detailed audit logs and financial reports for transparency.
-   **🔐 Security**: JWT-based authentication, password encryption, and account locking mechanisms.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework**: Next.js 15 (App Router)
-   **State Management**: React Hooks & Context API
-   **Styling**: Vanilla CSS & Tailwind CSS 4
-   **Icons**: Lucide React
-   **API Communication**: Custom Fetch Wrapper (`apiFetchAuth`)

### Backend
-   **Framework**: NestJS 11
-   **ORM**: Prisma 7
-   **Database**: MySQL / MariaDB
-   **Authentication**: Passport.js & JWT
-   **Mailing**: Nodemailer
-   **Documentation**: Swagger (OpenAPI)

---

## 📂 Project Structure

```text
reserve-payroll/
├── backend/            # NestJS Backend API
│   ├── prisma/         # Database schema & migrations
│   ├── src/            # Application logic (modules, controllers, services)
│   └── test/           # E2E and Unit tests
├── frontend/           # Next.js Frontend
│   ├── app/            # App router pages & layouts
│   ├── components/     # Reusable UI components
│   └── lib/            # Utilities and API fetchers
└── package.json        # Root workspace configuration (if applicable)
```

---

## 👤 User Management Deep Dive

The **User Management Section** is the core of the system's security and administrative hierarchy. It implements a strict **Role-Based Access Control (RBAC)** system.

### 🔑 Roles & Permissions

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **SuperAdmin** | Global | Full system access, creating/deleting users, role management, system-wide settings, and password resets. |
| **BranchHR** | Branch-Specific | Managing employees and payroll within assigned branches. Can request status changes for users. |
| **Employee** | Personal | Viewing personal profile, attendance records, and downloading payslips. |

### 🔄 User Lifecycle & Status Workflow

The system manages user accessibility through a dynamic status workflow:

1.  **Registration**: SuperAdmins can register new users with specific roles and branch assignments.
2.  **Activation**: Users are set to `ACTIVE` by default upon registration or after a successful password reset.
3.  **Locking/Blocking**: 
    -   `BLOCKED`: Manual restriction applied by an admin to prevent access.
    -   `LOCKED`: Automatic security lockout after multiple failed login attempts or manual administrative action.
4.  **Approval Workflow**: 
    -   BranchHR can initiate status changes (e.g., requesting to reactivate a locked account).
    -   SuperAdmins receive these requests and can either **Approve** or **Reject** them via the User Management dashboard.

### 🛡️ Security Features
-   **Password Policy**: Default passwords (e.g., `Reg@12345`) are set during creation, with a "Must Change Password" flag for first-time login.
-   **Audit Logs**: Every administrative action (creation, edit, status change) is recorded in the `audit_log` table for accountability.
-   **JWT Session Management**: Secure, stateless authentication with refresh token support.

---

## ⚙️ Getting Started

### Prerequisites
-   Node.js (v20 or higher)
-   MySQL or MariaDB
-   npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd reserve-payroll
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Configure your .env file with DATABASE_URL, JWT_SECRET, etc.
    npx prisma generate
    npx prisma db push
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    # Configure your .env.local with NEXT_PUBLIC_API_URL
    npm run dev
    ```

4.  **Access the application**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.

---
*Created with ❤️ by the REG Development Team.*
