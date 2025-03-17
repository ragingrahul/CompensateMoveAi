import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { employeeSchema, Employee } from '@/types/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body against schema
    const result = employeeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid employee data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, aptosWalletAddress, role, department, salary } = result.data;
    
    // Create a Supabase client with the request's cookies for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookies) {
            // We don't need to set cookies in this route
            // But we need to handle the parameter to avoid linter warnings
            cookies.forEach(() => {});
          },
        },
      }
    );
    
    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to add employees' },
        { status: 401 }
      );
    }
    
    // Insert employee data into Supabase
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name,
        email,
        aptos_wallet_address: aptosWalletAddress,
        role,
        department,
        salary,
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to add employee', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Employee added successfully',
      employee: data[0]
    }, { status: 201 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Create a Supabase client with the request's cookies for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookies) {
            // We don't need to set cookies in this route
            // But we need to handle the parameter to avoid linter warnings
            cookies.forEach(() => {});
          },
        },
      }
    );
    
    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to view employees' },
        { status: 401 }
      );
    }
    
    // Get all employees from Supabase
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      );
    }
    
    // Transform the data to match our TypeScript types
    const employees: Employee[] = data.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      aptosWalletAddress: employee.aptos_wallet_address,
      role: employee.role,
      department: employee.department,
      salary: employee.salary,
      status: employee.status,
      createdAt: new Date(employee.created_at),
      updatedAt: new Date(employee.updated_at)
    }));
    
    return NextResponse.json({
      employees
    }, { status: 200 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 