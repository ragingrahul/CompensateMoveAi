import { z } from "zod"

export interface UseRequestParams {
    url: string;
    method: "get" | "post" | "put" | "delete";
    body?: Record<string, unknown>;
    onSuccess?: (data: unknown) => void
}

export type UseRequestReturn = {
    doRequest: () => Promise<unknown | undefined>
    errors: string | null
}

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const loginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z.string()
        .min(1, "Password is required"),
})

export const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(40, "Password cannot exceed 40 characters")
        .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

export type Employee = {
  id?: string;
  name: string;
  email: string;
  aptosWalletAddress: string;
  role: string;
  department: string;
  salary: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  aptosWalletAddress: z.string().min(1, "Aptos wallet address is required"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>