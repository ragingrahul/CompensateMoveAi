import React, { useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/useEmployees";

export default function EmployeeTable() {
  const { employees, loading } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.role.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower)
    );
  });

  // Format salary as currency
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "APT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  // Format Aptos wallet address for display
  const formatWalletAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let badgeClass = "";

    switch (status?.toLowerCase()) {
      case "active":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "inactive":
        badgeClass = "bg-gray-100 text-gray-800";
        break;
      case "on leave":
        badgeClass = "bg-yellow-100 text-yellow-800";
        break;
      default:
        badgeClass = "";
    }

    return <Badge className={`capitalize ${badgeClass}`}>{status}</Badge>;
  };

  return (
    <div>
      <div className="p-4 border-b border-purple-border-secondary">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="w-full pl-8 bg-white/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-border-secondary">
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Email
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Wallet
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Role
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Department
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Salary
              </th>
              <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="h-24 text-center">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-24 text-center">
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-purple-border-secondary hover:bg-purple-bg-light/30"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{employee.name}</div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{employee.email}</td>
                  <td className="p-4 align-middle">
                    {formatWalletAddress(employee.aptosWalletAddress)}
                  </td>
                  <td className="p-4 align-middle">{employee.role}</td>
                  <td className="p-4 align-middle">{employee.department}</td>
                  <td className="p-4 align-middle">
                    {renderStatusBadge(employee.status || "Active")}
                  </td>
                  <td className="p-4 align-middle">
                    {formatSalary(employee.salary)}
                  </td>
                  <td className="p-4 text-right align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-purple-bg-light/50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
