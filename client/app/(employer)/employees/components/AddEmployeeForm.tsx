import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeFormData } from "@/types/types";
import {
  Loader2,
  User,
  Mail,
  Wallet,
  Briefcase,
  Building2,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddEmployeeFormProps {
  onComplete: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onComplete }) => {
  const { addEmployee, loading } = useEmployees();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    email: "",
    aptosWalletAddress: "",
    role: "",
    department: "",
    salary: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const result = await addEmployee(formData);

        if (result.success) {
          toast({
            title: "Success",
            description: "Employee added successfully!",
            variant: "default",
          });
          onComplete();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add employee",
            variant: "destructive",
          });
        }
      } catch (error: unknown) {
        console.error("Error adding employee:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Helper function to get appropriate step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Job Details";
      case 3:
        return "Compensation";
      default:
        return "";
    }
  };

  // Helper function to get appropriate step description
  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Enter the employee's basic information";
      case 2:
        return "Specify the employee's role and department";
      case 3:
        return "Set the employee's compensation package";
      default:
        return "";
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-6 pt-0">
      <div className="mb-8">
        <div className="flex items-center justify-between my-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                    step === currentStep
                      ? "bg-purple-primary text-white shadow-lg shadow-purple-primary/30"
                      : step < currentStep
                      ? "bg-purple-primary/20 text-purple-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`absolute top-1/2 left-full w-5 h-0.5 -translate-y-1/2 transition-all duration-300 ${
                      step < currentStep ? "bg-purple-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-purple-primary">
            Step {currentStep} of 3
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStep}
          transition={{ duration: 0.3 }}
          className="mt-2"
        >
          <h3 className="text-lg font-semibold text-purple-primary">
            {getStepTitle()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getStepDescription()}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="overflow-hidden border-purple-border-secondary shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <User className="h-4 w-4 text-purple-primary/70" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border-purple-border-secondary focus:border-purple-primary"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <Mail className="h-4 w-4 text-purple-primary/70" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-purple-border-secondary focus:border-purple-primary"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="aptosWalletAddress"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <Wallet className="h-4 w-4 text-purple-primary/70" />
                        Aptos Wallet Address
                      </Label>
                      <Input
                        id="aptosWalletAddress"
                        name="aptosWalletAddress"
                        value={formData.aptosWalletAddress}
                        onChange={handleChange}
                        className="border-purple-border-secondary focus:border-purple-primary"
                        placeholder="0x..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for crypto payroll and benefits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="overflow-hidden border-purple-border-secondary shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <Briefcase className="h-4 w-4 text-purple-primary/70" />
                        Role
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          handleSelectChange("role", value)
                        }
                      >
                        <SelectTrigger className="border-purple-border-secondary focus:border-purple-primary">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software Engineer">
                            Software Engineer
                          </SelectItem>
                          <SelectItem value="Product Manager">
                            Product Manager
                          </SelectItem>
                          <SelectItem value="Designer">Designer</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <Building2 className="h-4 w-4 text-purple-primary/70" />
                        Department
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          handleSelectChange("department", value)
                        }
                      >
                        <SelectTrigger className="border-purple-border-secondary focus:border-purple-primary">
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="overflow-hidden border-purple-border-secondary shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="salary"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <DollarSign className="h-4 w-4 text-purple-primary/70" />
                        Monthly Salary
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </div>
                        <Input
                          id="salary"
                          name="salary"
                          type="number"
                          value={formData.salary.toString()}
                          onChange={handleChange}
                          className="pl-6 border-purple-border-secondary focus:border-purple-primary"
                          placeholder="6250"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly base compensation before taxes and deductions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary transition-all duration-200"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-primary hover:bg-purple-primary/90 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentStep < 3 ? "Next" : "Adding..."}
              </>
            ) : currentStep < 3 ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Add Employee
                <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
