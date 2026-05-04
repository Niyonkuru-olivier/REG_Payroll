/* ── TYPES ── */
export interface Role {
  id: number;
  name: string;
  status: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  national_id: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  branch: string;
  payment_method: string;
  payment_number: string;
  password?: string;
  roleId: number;
  status: string;
  category: string;
  contract_type: string;
  contract_start?: string;
  contract_end?: string;
  education_level: string;
  status_request?: string | null;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface Branch {
  id: number;
  name: string;
  hubId: string;
  province?: string;
  district?: string;
  status: string;
}
