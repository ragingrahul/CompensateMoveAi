import { useState, useEffect } from 'react';
import { Employee, EmployeeFormData } from '@/types/types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data.employees);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new employee
  const addEmployee = async (employeeData: EmployeeFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add employee');
      }
      
      const data = await response.json();
      
      // Refresh the employees list
      await fetchEmployees();
      
      return { success: true, employee: data.employee };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add employee';
      setError(errorMessage);
      console.error('Error adding employee:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
  };
}; 