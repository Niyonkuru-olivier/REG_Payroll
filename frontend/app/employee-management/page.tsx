"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone1: string;
  phone2: string;
  startDate: string;
  endDate: string;
  contractType: "Permanent" | "Fixed Term";
  branch: "Kigali Branch" | "Musanze Branch";
  category: "Officer" | "Soldier";
  level: "Diploma" | "Degree";
  accountNo: string;
  dateOfBirth: string;
  status: "ACTIVE" | "INACTIVE";
}

const blankEmployeeForm: Omit<Employee, "id"> = {
  firstName: "",
  lastName: "",
  nationalId: "",
  phone1: "",
  phone2: "",
  startDate: "",
  endDate: "",
  contractType: "Permanent",
  branch: "Kigali Branch",
  category: "Officer",
  level: "Diploma",
  accountNo: "",
  dateOfBirth: "",
  status: "ACTIVE",
};

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<{ id: number } & Omit<Employee, "id">>({
    id: 0,
    ...blankEmployeeForm,
  });

  const authHeaders = (): Record<string, string> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const mapApiEmployee = (emp: any): Employee => ({
    id: emp.employee_id,
    firstName: emp.first_name || "",
    lastName: emp.last_name || "",
    nationalId: emp.national_id || "",
    phone1: emp.phone_number || "",
    phone2: emp.alternate_phone || "",
    startDate: emp.date_of_joining ? String(emp.date_of_joining).slice(0, 10) : "",
    endDate: emp.last_working_date ? String(emp.last_working_date).slice(0, 10) : "",
    contractType: emp.employment_type === "Contract" ? "Fixed Term" : "Permanent",
    branch: emp.branch_id === 2 ? "Musanze Branch" : "Kigali Branch",
    category: "Officer",
    level: "Diploma",
    accountNo: emp.bank_account_number || "",
    dateOfBirth: emp.date_of_birth ? String(emp.date_of_birth).slice(0, 10) : "",
    status: emp.employment_status === "Active" ? "ACTIVE" : "INACTIVE",
  });

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<any[]>("/employees", {
        headers: authHeaders(),
      });
      setEmployees(data.map(mapApiEmployee));
      setMessage("");
    } catch {
      setMessage("Unable to load employees from backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      id: 0,
      ...blankEmployeeForm,
    });
  }

  async function saveEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.nationalId || !form.phone1 || !form.accountNo) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (form.id) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === form.id ? { ...emp, ...form } : emp
        )
      );
      setMessage("Local update applied (backend update endpoint is not available yet).");
    } else {
      try {
        await apiFetch("/employees", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: `${form.firstName}.${form.lastName}@reserve.local`.toLowerCase(),
            dateOfBirth: form.dateOfBirth || "1990-01-01",
            gender: "Male",
            nationalId: form.nationalId,
            bankAccount: form.accountNo,
            companyId: 1,
            branchId: form.branch === "Musanze Branch" ? 2 : 1,
            departmentId: 1,
            postId: 1,
            employeeCode: `EMP-${Date.now()}`,
            baseSalary: 50000,
          }),
        });
        await loadEmployees();
        setMessage("Employee saved to backend successfully.");
      } catch {
        setMessage("Failed to save employee to backend.");
        return;
      }
    }

    resetForm();
  }

  function editEmployee(emp: Employee) {
    setForm(emp);
  }

  function deleteEmployee(id: number) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="page-wrap">
      {/* TOP BAR */}
      <header className="topbar">
        <div>
          <h1>Employee Management</h1>
          <p>Shared module for Admin and Super Admin</p>
        </div>

        <div className="topbar-actions">
          <Link href="/admin-dashboard" className="nav-link">
            Admin Dashboard
          </Link>
          <Link href="/super-admin-dashboard" className="nav-link">
            Super Admin Dashboard
          </Link>
          <Link href="/" className="logout-link">
            Logout
          </Link>
        </div>
      </header>

      <main className="main-content">
        {message && <p>{message}</p>}
        {/* FORM */}
        <section className="panel">
          <h2>Employee Form</h2>

          <form className="form-grid" onSubmit={saveEmployee}>
            {/* Row 1 */}
            <div className="field-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>National ID</label>
              <input name="nationalId" value={form.nationalId} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Phone 1</label>
              <input name="phone1" value={form.phone1} onChange={handleChange} required />
            </div>

            {/* Row 2 */}
            <div className="field-group">
              <label>Phone 2</label>
              <input name="phone2" value={form.phone2} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>End Date (Optional)</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Contract Type</label>
              <select name="contractType" value={form.contractType} onChange={handleChange}>
                <option>Permanent</option>
                <option>Fixed Term</option>
              </select>
            </div>

            {/* Row 3 */}
            <div className="field-group">
              <label>Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange}>
                <option>Kigali Branch</option>
                <option>Musanze Branch</option>
              </select>
            </div>

            <div className="field-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Officer</option>
                <option>Soldier</option>
              </select>
            </div>

            <div className="field-group">
              <label>Education Level</label>
              <select name="level" value={form.level} onChange={handleChange}>
                <option>Diploma</option>
                <option>Degree</option>
              </select>
            </div>

            <div className="field-group">
              <label>Account No</label>
              <input name="accountNo" value={form.accountNo} onChange={handleChange} required />
            </div>

            {/* Row 4 */}
            <div className="field-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="form-actions">
              <button className="primary-btn" type="submit">
                {form.id ? "Update Employee" : "Save Employee"}
              </button>
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>

        {/* TABLE */}
        <section className="panel">
          <h2>Employee Records</h2>
          {isLoading && <p>Loading employees...</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>National ID</th>
                  <th>Branch</th>
                  <th>Category</th>
                  <th>Contract</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>{emp.nationalId}</td>
                    <td>{emp.branch}</td>
                    <td>{emp.category}</td>
                    <td>{emp.contractType}</td>
                    <td>{emp.accountNo}</td>
                    <td>{emp.status}</td>
                    <td>
                      <button className="action-btn edit" type="button" onClick={() => editEmployee(emp)}>
                        Edit
                      </button>
                      <button className="action-btn delete" type="button" onClick={() => deleteEmployee(emp.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}