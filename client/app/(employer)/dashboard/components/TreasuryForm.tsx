"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Check,
  ChevronsUpDown,
  TrendingUp,
  Clock,
  Users,
  CalendarDays,
  ShieldCheck,
  Settings,
  Wallet,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useTokenStream } from "@/hooks/useTokenStream";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { MODULE_OWNER_ADDRESS, MODULE_NAME } from "@/lib/contract-utils";
import { AptosClient } from "aptos";
import { useEmployees } from "@/hooks/useEmployees";

// Token options
const tokens = [
  { label: "APT", value: "apt" },
  { label: "USDT", value: "usdt" },
  { label: "USDC", value: "usdc" },
] as const;

// Network options
const networks = [{ label: "Aptos testnet", value: "aptos_testnet" }] as const;

// Frequency options
const frequencies = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Bi-weekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
] as const;

// Department options
const departments = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Finance", value: "finance" },
  { label: "Operations", value: "operations" },
  { label: "Human Resources", value: "hr" },
] as const;

const FormSchema = z.object({
  amount: z.string().min(1, {
    message: "Amount is required.",
  }),
  token: z.string({
    required_error: "Please select a token.",
  }),
  flowShape: z.string().default("linear"),
  network: z.string({
    required_error: "Please select a network.",
  }),
  memo: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  frequency: z.string().optional(),
  departments: z.array(z.string()).optional(),
  requiresApproval: z.boolean().optional(),
  multisigEnabled: z.boolean().optional(),
  gasFeeLimit: z.string().optional(),
  priorityLevel: z.string().optional(),
});

interface TreasuryFormProps {
  onUpdate: (values: {
    network?: string;
    token?: string;
    amount?: string;
    flowShape?: string;
  }) => void;
}

export interface TreasuryFormRef {
  fundTreasuryFromSummary: () => Promise<boolean>;
  isFunding: boolean;
}

// Add this CSS at the top of the file after the imports
const noSpinnerStyles = {
  WebkitAppearance: "none",
  MozAppearance: "textfield",
  margin: 0,
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
} as React.CSSProperties;

export const TreasuryForm = forwardRef<TreasuryFormRef, TreasuryFormProps>(
  ({ onUpdate }, ref) => {
    const [activeSection, setActiveSection] = useState<string>("basic");
    const [isCreatingTreasury, setIsCreatingTreasury] = useState(false);
    const [isFundingTreasury, setIsFundingTreasury] = useState(false);
    const [selectedAllocationMethod, setSelectedAllocationMethod] =
      useState<string>("equal");
    const [treasuryExists, setTreasuryExists] = useState(false);
    const { createTreasury, fundTreasury, isLoading, addRecipient } =
      useTokenStream();
    const { walletAddress, isConnected } = useAptosWallet();
    const { employees } = useEmployees();
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        amount: "0",
        requiresApproval: false,
        multisigEnabled: false,
        gasFeeLimit: "0.005",
        priorityLevel: "medium",
        network: "aptos_testnet",
        flowShape: "linear",
        token: "apt",
      },
    });

    // Watch for changes in the relevant form fields
    const watchedValues = {
      network: form.watch("network"),
      token: form.watch("token"),
      amount: form.watch("amount"),
      flowShape: form.watch("flowShape"),
    };

    // Check if treasury exists when wallet is connected
    useEffect(() => {
      const checkTreasuryExists = async () => {
        if (!isConnected || !walletAddress) return;

        try {
          const client = new AptosClient(
            process.env.NEXT_PUBLIC_APTOS_NODE_URL ||
              "https://fullnode.testnet.aptoslabs.com/v1"
          );
          const coinType =
            form.getValues("token") === "apt"
              ? "0x1::aptos_coin::AptosCoin"
              : form.getValues("token") === "usdt"
              ? "0x1::usdt::USDT"
              : "0x1::usdc::USDC";

          // Try to get the treasury resource
          try {
            const resource = await client.getAccountResource(
              walletAddress,
              `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::Treasury<${coinType}>`
            );

            // If resource exists, treasury exists
            if (resource && resource.data) {
              setTreasuryExists(true);
            }
          } catch {
            // If resource doesn't exist, treasury doesn't exist
            setTreasuryExists(false);
          }
        } catch (error) {
          console.error("Error checking if treasury exists:", error);
          setTreasuryExists(false);
        }
      };

      checkTreasuryExists();
    }, [isConnected, walletAddress, form]);

    // Update parent component when fields change
    useEffect(() => {
      onUpdate(watchedValues);
    }, [
      watchedValues.network,
      watchedValues.token,
      watchedValues.amount,
      watchedValues.flowShape,
      onUpdate,
    ]);

    // Expose function to parent component through ref
    useImperativeHandle(ref, () => ({
      fundTreasuryFromSummary: async () => {
        // Make sure treasury exists before attempting to fund it
        if (!treasuryExists) {
          toast({
            title: "Treasury Required",
            description: "You need to create a treasury first",
            variant: "destructive",
          });
          return false;
        }

        const formValues = form.getValues();
        const { token, amount } = formValues;

        if (!amount || parseFloat(amount) <= 0) {
          toast({
            title: "Invalid Amount",
            description: "Please enter a valid amount to fund the treasury",
            variant: "destructive",
          });
          return false;
        }

        try {
          setIsFundingTreasury(true);
          // Convert amount to Aptos decimal format (8 decimals)
          const aptosAmount = (parseFloat(amount) * Math.pow(10, 8)).toString();
          const result = await fundTreasury(token, aptosAmount);

          if (result) {
            toast({
              title: "Treasury Funded",
              description: `Successfully funded treasury with ${amount} ${token.toUpperCase()}`,
            });
            return true;
          }
          // If result is falsy (null, undefined, false), transaction might have been cancelled
          return false;
        } catch (error) {
          console.error("Error funding treasury:", error);
          // Check if error message contains "cancelled" or "rejected" to detect user cancellation
          const errorMessage =
            error instanceof Error ? error.message.toLowerCase() : "";
          if (
            errorMessage.includes("cancelled") ||
            errorMessage.includes("rejected") ||
            errorMessage.includes("denied")
          ) {
            toast({
              title: "Transaction Cancelled",
              description: "The funding transaction was cancelled",
              variant: "default",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to fund treasury. Please try again.",
              variant: "destructive",
            });
          }
          return false;
        } finally {
          setIsFundingTreasury(false);
        }
      },
      isFunding: isFundingTreasury,
    }));

    async function onSubmit(data: z.infer<typeof FormSchema>) {
      try {
        setIsFundingTreasury(true);
        // Convert amount to Aptos decimal format (8 decimals)
        const aptosAmount = (
          parseFloat(data.amount) * Math.pow(10, 8)
        ).toString();
        // Fund the treasury with the specified amount
        const result = await fundTreasury(data.token, aptosAmount);

        if (result) {
          toast({
            title: "Treasury Funded",
            description: `Successfully funded treasury with ${
              data.amount
            } ${data.token.toUpperCase()}`,
          });
        }
      } catch (error) {
        console.error("Error funding treasury:", error);
        toast({
          title: "Error",
          description: "Failed to fund treasury. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsFundingTreasury(false);
      }
    }

    async function handleCreateTreasury() {
      try {
        setIsCreatingTreasury(true);

        // Create a new treasury with the selected token
        const result = await createTreasury(form.getValues("token"));

        if (result) {
          toast({
            title: "Treasury Created",
            description: "Your treasury has been successfully created",
          });
        }
      } catch (error) {
        console.error("Error creating treasury:", error);
        toast({
          title: "Error",
          description: "Failed to create treasury. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingTreasury(false);
      }
    }

    return (
      <Form {...form}>
        <div className="p-6">
          <div className="pb-4 mb-4 border-b border-purple-border-secondary flex flex-row justify-between items-center">
            <h1 className="text-lg font-semibold text-purple-bg-dark2 flex items-center">
              <span>Treasury Management</span>
              <span className="ml-2 px-2 py-0.5 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
                {treasuryExists ? "Active" : "Not Created"}
              </span>
            </h1>
            <div className="flex gap-2">
              {!treasuryExists ? (
                <button
                  type="button"
                  onClick={handleCreateTreasury}
                  disabled={isCreatingTreasury || isLoading}
                  className="text-purple-bg-dark2 inline-flex items-center gap-2 bg-purple-bg-light hover:bg-purple-bg-light2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTreasury ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wallet className="size-4" />
                      Create Treasury
                    </>
                  )}
                </button>
              ) : (
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1.5 rounded-lg inline-flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Treasury Created
                </span>
              )}
              <button className="text-purple-bg-dark2 inline-flex items-center gap-2 bg-purple-bg-light hover:bg-purple-bg-light2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium">
                <TrendingUp className="size-4" />
                View Chart
              </button>
            </div>
          </div>

          <Tabs
            defaultValue="basic"
            className="mb-4"
            onValueChange={setActiveSection}
            value={activeSection}
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                <span>Basic</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="flex items-center gap-1.5"
                disabled={!treasuryExists}
              >
                <Clock className="h-4 w-4" />
                <span>Schedule</span>
              </TabsTrigger>
              <TabsTrigger
                value="allocation"
                className="flex items-center gap-1.5"
                disabled={!treasuryExists}
              >
                <Users className="h-4 w-4" />
                <span>Allocation</span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-1.5"
                disabled={!treasuryExists}
              >
                <Settings className="h-4 w-4" />
                <span>Advanced</span>
              </TabsTrigger>
            </TabsList>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-6">
                {!treasuryExists ? (
                  <>
                    <div className="flex flex-col xl:flex-row justify-between gap-6">
                      <FormField
                        control={form.control}
                        name="network"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                            <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                              <Globe className="h-4 w-4 mr-1.5 text-purple-primary" />
                              Network
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full p-6 text-base justify-between bg-white border-purple-border-secondary hover:bg-purple-bg-light/50 transition-all duration-200 shadow-sm",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? networks.find(
                                          (network) =>
                                            network.value === field.value
                                        )?.label
                                      : "Select Network"}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[--trigger-width] p-0 shadow-md border border-purple-border-secondary bg-white"
                                side="bottom"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder="Search network..."
                                    className="h-9 border-b border-purple-border-secondary"
                                  />
                                  <CommandList className="max-h-[200px]">
                                    <CommandEmpty>
                                      No network found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {networks.map((network) => (
                                        <CommandItem
                                          value={network.label}
                                          key={network.value}
                                          onSelect={() => {
                                            form.setValue(
                                              "network",
                                              network.value
                                            );
                                          }}
                                          className="py-3"
                                        >
                                          {network.label}
                                          <Check
                                            className={cn(
                                              "ml-auto h-4 w-4",
                                              network.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                            <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                              <Wallet className="h-4 w-4 mr-1.5 text-purple-primary" />
                              Token
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full p-6 text-base justify-between bg-white border-purple-border-secondary hover:bg-purple-bg-light/50 transition-all duration-200 shadow-sm",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? tokens.find(
                                          (token) => token.value === field.value
                                        )?.label
                                      : "Select Token"}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[--trigger-width] p-0 shadow-md border border-purple-border-secondary bg-white"
                                side="bottom"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder="Search token..."
                                    className="h-9 border-b border-purple-border-secondary"
                                  />
                                  <CommandList className="max-h-[200px]">
                                    <CommandEmpty>No token found.</CommandEmpty>
                                    <CommandGroup>
                                      {tokens.map((token) => (
                                        <CommandItem
                                          value={token.label}
                                          key={token.value}
                                          onSelect={() => {
                                            form.setValue("token", token.value);
                                          }}
                                          className="py-3"
                                        >
                                          {token.label}
                                          <Check
                                            className={cn(
                                              "ml-auto h-4 w-4",
                                              token.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="flowShape"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1.5 text-purple-primary" />
                            Flow Shape
                          </FormLabel>
                          <div className="grid grid-cols-1 gap-3">
                            <RadioGroup
                              value={field.value}
                              onValueChange={(value) =>
                                form.setValue("flowShape", value)
                              }
                            >
                              <div className="flex flex-col space-y-4 border border-purple-border-secondary rounded-lg p-6 hover:bg-purple-bg-light/30 transition-all">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="linear" id="linear" />
                                  <label
                                    htmlFor="linear"
                                    className="text-base font-medium"
                                  >
                                    Linear Flow
                                  </label>
                                </div>
                                <p className="text-sm text-purple-bg-dark3 pl-6">
                                  Streams tokens at a constant rate over time
                                </p>
                                <div className="pl-6 pt-2">
                                  <div className="bg-gradient-to-r from-purple-bg-light to-purple-primary h-2 w-full rounded-full" />
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                            <Wallet className="h-4 w-4 mr-1.5 text-purple-primary" />
                            Fund Treasury Amount
                          </FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input
                                placeholder="0.00"
                                type="number"
                                {...field}
                                style={noSpinnerStyles}
                                className="flex-1 p-6 text-base rounded-r-none bg-white border-purple-border-secondary hover:bg-purple-bg-light/50 transition-all duration-200 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div
                                className="h-auto rounded-l-none p-2 text-base flex items-center justify-center border border-l-0 border-purple-border-secondary bg-white"
                                style={{ minWidth: "100px" }}
                              >
                                {form.getValues("token")?.toUpperCase()}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <div className="flex flex-col xl:flex-row justify-between gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                        <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1.5 text-purple-primary" />
                          Start Date
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              placeholder="Select date..."
                              {...field}
                              className="p-6"
                            />
                            <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-primary pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-purple-bg-dark3 text-sm">
                          When should the treasury stream begin?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                        <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-purple-primary" />
                          Duration (Days)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            min="1"
                            {...field}
                            className="p-6"
                          />
                        </FormControl>
                        <FormDescription className="text-purple-bg-dark3 text-sm">
                          How long should the treasury stream last?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-purple-bg-dark font-medium">
                        Distribution Frequency
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {frequencies.map((option) => (
                          <div
                            key={option.value}
                            className={`border ${
                              field.value === option.value
                                ? "bg-purple-bg-light border-purple-primary"
                                : "bg-white border-purple-border-secondary hover:bg-purple-bg-light/30"
                            } rounded-lg p-4 cursor-pointer transition-all`}
                            onClick={() =>
                              form.setValue("frequency", option.value)
                            }
                          >
                            <div className="text-center">
                              <span className="block text-sm font-medium">
                                {option.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormDescription className="text-purple-bg-dark3 text-sm">
                        How often should funds be distributed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 bg-purple-bg-light/30 p-4 rounded-lg border border-purple-border-secondary">
                  <h3 className="text-sm font-medium text-purple-bg-dark">
                    Schedule Preview
                  </h3>
                  <div className="h-32 bg-gradient-to-r from-purple-bg-light to-purple-bg-light2 rounded-lg flex items-center justify-center">
                    <p className="text-purple-bg-dark text-sm">
                      Timeline visualization will appear here
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Allocation Tab */}
              <TabsContent value="allocation" className="space-y-6">
                <FormField
                  control={form.control}
                  name="departments"
                  render={() => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-purple-bg-dark font-medium">
                        Recipient Departments
                      </FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {departments.map((department) => (
                          <div
                            key={department.value}
                            className="flex items-center space-x-2 border border-purple-border-secondary rounded-lg p-4 hover:bg-purple-bg-light/30 transition-all"
                          >
                            <Checkbox
                              id={department.value}
                              onCheckedChange={(checked) => {
                                const currentValues =
                                  form.getValues("departments") || [];
                                if (checked) {
                                  form.setValue("departments", [
                                    ...currentValues,
                                    department.value,
                                  ]);
                                } else {
                                  form.setValue(
                                    "departments",
                                    currentValues.filter(
                                      (value) => value !== department.value
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={department.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {department.label}
                            </label>
                            <span className="text-xs text-purple-bg-dark3 bg-purple-bg-light px-2 py-1 rounded-full">
                              {department.value === "engineering"
                                ? "12 members"
                                : department.value === "design"
                                ? "8 members"
                                : department.value === "marketing"
                                ? "6 members"
                                : department.value === "finance"
                                ? "4 members"
                                : department.value === "operations"
                                ? "7 members"
                                : "3 members"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <FormDescription className="text-purple-bg-dark3 text-sm">
                        Select which departments should receive funds.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-purple-bg-dark font-medium">
                    Allocation Method
                  </h3>
                  <RadioGroup
                    defaultValue="equal"
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    value={selectedAllocationMethod}
                    onValueChange={setSelectedAllocationMethod}
                  >
                    <div className="flex flex-col space-y-1 border border-purple-border-secondary rounded-lg p-4 hover:bg-purple-bg-light/30 transition-all">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="equal" id="equal" />
                        <label htmlFor="equal" className="text-sm font-medium">
                          Equal Distribution
                        </label>
                      </div>
                      <p className="text-xs text-purple-bg-dark3 pl-6">
                        Split funds equally among all recipients
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1 border border-purple-border-secondary rounded-lg p-4 hover:bg-purple-bg-light/30 transition-all">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weighted" id="weighted" />
                        <label
                          htmlFor="weighted"
                          className="text-sm font-medium"
                        >
                          Weighted by Role
                        </label>
                      </div>
                      <p className="text-xs text-purple-bg-dark3 pl-6">
                        Distribute based on role or seniority
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1 border border-purple-border-secondary rounded-lg p-4 hover:bg-purple-bg-light/30 transition-all">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <label htmlFor="custom" className="text-sm font-medium">
                          Custom Allocation
                        </label>
                      </div>
                      <p className="text-xs text-purple-bg-dark3 pl-6">
                        Set custom amounts per recipient
                      </p>
                    </div>
                  </RadioGroup>
                </div>

                {selectedAllocationMethod === "custom" && (
                  <div className="space-y-4 border border-purple-border-secondary rounded-lg p-4">
                    <h3 className="text-purple-bg-dark font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-primary" />
                      Select Employee as Recipient
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-bg-dark">
                          Select Employee
                        </label>
                        <select
                          id="employeeSelect"
                          className="w-full rounded-md border border-purple-border-secondary bg-white p-2"
                          value={selectedEmployee}
                          onChange={(e) => {
                            setSelectedEmployee(e.target.value);
                            // Find the selected employee
                            const employee = employees.find(
                              (emp) => emp.aptosWalletAddress === e.target.value
                            );
                            // If employee is found, set the payment amount to their salary
                            if (employee) {
                              // Set payment amount field to employee's salary
                              const paymentAmountInput =
                                document.getElementById(
                                  "paymentAmount"
                                ) as HTMLInputElement;
                              if (paymentAmountInput) {
                                paymentAmountInput.value =
                                  employee.salary.toString();
                              }
                            }
                          }}
                        >
                          <option value="">Select an employee</option>
                          {employees.map((employee) => (
                            <option
                              key={employee.id}
                              value={employee.aptosWalletAddress}
                            >
                              {employee.name} ({employee.email})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-purple-bg-dark3">
                          Select an employee to add to treasury recipients
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-bg-dark">
                          Payment Amount (from salary)
                        </label>
                        <div className="flex">
                          <div
                            id="paymentAmountDisplay"
                            className="w-full p-2 border border-purple-border-secondary rounded-md bg-gray-50 text-gray-700"
                          >
                            {selectedEmployee
                              ? employees.find(
                                  (emp) =>
                                    emp.aptosWalletAddress === selectedEmployee
                                )?.salary || "-"
                              : "Will display employee's salary"}
                          </div>
                        </div>
                        <p className="text-xs text-purple-bg-dark3">
                          This amount is automatically set from the
                          employee&apos;s salary
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-bg-dark">
                          Payment Frequency
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="paymentFrequencyValue"
                            placeholder="1"
                            type="number"
                            min="1"
                            defaultValue="1"
                            className="border-purple-border-secondary w-1/3"
                          />
                          <select
                            id="paymentFrequencyUnit"
                            className="w-2/3 rounded-md border border-purple-border-secondary bg-white p-2"
                            defaultValue="day"
                          >
                            <option value="day">Day(s)</option>
                            <option value="week">Week(s)</option>
                            <option value="month">Month(s)</option>
                          </select>
                        </div>
                        <p className="text-xs text-purple-bg-dark3">
                          How often payments should be made to this employee
                        </p>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          className="bg-purple-primary hover:bg-purple-primary/90 text-white w-full"
                          onClick={async () => {
                            if (!selectedEmployee) {
                              toast({
                                title: "Employee Required",
                                description: "Please select an employee",
                                variant: "destructive",
                              });
                              return;
                            }

                            const selectedEmployeeData = employees.find(
                              (emp) =>
                                emp.aptosWalletAddress === selectedEmployee
                            );

                            if (!selectedEmployeeData) {
                              toast({
                                title: "Error",
                                description: "Could not find employee data",
                                variant: "destructive",
                              });
                              return;
                            }

                            const paymentAmount =
                              selectedEmployeeData.salary.toString();

                            const frequencyValue = parseInt(
                              (
                                document.getElementById(
                                  "paymentFrequencyValue"
                                ) as HTMLInputElement
                              )?.value || "1"
                            );

                            const frequencyUnit = (
                              document.getElementById(
                                "paymentFrequencyUnit"
                              ) as HTMLSelectElement
                            )?.value;

                            // Convert to seconds based on unit
                            let paymentFrequencyInSeconds: string;
                            switch (frequencyUnit) {
                              case "day":
                                paymentFrequencyInSeconds = (
                                  frequencyValue * 86400
                                ).toString();
                                break;
                              case "week":
                                paymentFrequencyInSeconds = (
                                  frequencyValue * 604800
                                ).toString();
                                break;
                              case "month":
                                // Approximate month as 30 days
                                paymentFrequencyInSeconds = (
                                  frequencyValue * 2592000
                                ).toString();
                                break;
                              default:
                                paymentFrequencyInSeconds = "86400"; // Default to daily
                            }

                            if (!paymentAmount || !frequencyValue) {
                              toast({
                                title: "Missing Information",
                                description:
                                  "Please fill in all payment fields",
                                variant: "destructive",
                              });
                              return;
                            }

                            try {
                              const result = await addRecipient(
                                form.getValues("token"),
                                selectedEmployee,
                                paymentAmount,
                                paymentFrequencyInSeconds
                              );

                              if (result) {
                                toast({
                                  title: "Employee Added",
                                  description: `Successfully added ${selectedEmployeeData.name} to your treasury recipients`,
                                });

                                // Clear the form
                                setSelectedEmployee("");
                                (
                                  document.getElementById(
                                    "paymentFrequencyValue"
                                  ) as HTMLInputElement
                                ).value = "1";
                                (
                                  document.getElementById(
                                    "paymentFrequencyUnit"
                                  ) as HTMLSelectElement
                                ).value = "day";
                              }
                            } catch (error) {
                              console.error("Error adding recipient:", error);
                              toast({
                                title: "Error",
                                description:
                                  "Failed to add recipient. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Add Employee to Treasury
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 bg-purple-bg-light/30 p-4 rounded-lg border border-purple-border-secondary">
                  <h3 className="text-sm font-medium text-purple-bg-dark">
                    Allocation Preview
                  </h3>
                  <div className="h-32 bg-gradient-to-r from-purple-bg-light to-purple-bg-light2 rounded-lg flex items-center justify-center">
                    <p className="text-purple-bg-dark text-sm">
                      Allocation chart will appear here
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="security">
                    <AccordionTrigger className="text-purple-bg-dark font-medium hover:no-underline py-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-primary" />
                        <span>Security & Compliance</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="flex items-start space-x-3">
                        <FormField
                          control={form.control}
                          name="requiresApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-purple-border-secondary p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Require Additional Approval
                                </FormLabel>
                                <FormDescription className="text-xs text-purple-bg-dark3">
                                  This transaction will need additional approval
                                  before processing.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-start space-x-3">
                        <FormField
                          control={form.control}
                          name="multisigEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-purple-border-secondary p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Enable Multi-signature
                                </FormLabel>
                                <FormDescription className="text-xs text-purple-bg-dark3">
                                  Require multiple signers to authorize this
                                  treasury action.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="transactions">
                    <AccordionTrigger className="text-purple-bg-dark font-medium hover:no-underline py-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-primary" />
                        <span>Transaction Settings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="gasFeeLimit"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <div className="flex justify-between">
                              <FormLabel className="text-sm font-medium">
                                Gas Fee Limit
                              </FormLabel>
                              <span className="text-sm text-purple-primary font-medium">
                                {field.value} ETH
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                defaultValue={[0.005]}
                                max={0.05}
                                step={0.001}
                                className="py-4"
                                onValueChange={(val) => {
                                  form.setValue(
                                    "gasFeeLimit",
                                    val[0].toString()
                                  );
                                }}
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-purple-bg-dark3">
                              <span>Economical (Slower)</span>
                              <span>Fast (Costly)</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priorityLevel"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-sm font-medium">
                              Priority Level
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-3 gap-2"
                              >
                                <div className="flex items-center space-x-2 border border-purple-border-secondary rounded-lg p-3">
                                  <RadioGroupItem value="low" id="low" />
                                  <label
                                    htmlFor="low"
                                    className="text-xs font-medium"
                                  >
                                    Low
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2 border border-purple-border-secondary rounded-lg p-3">
                                  <RadioGroupItem value="medium" id="medium" />
                                  <label
                                    htmlFor="medium"
                                    className="text-xs font-medium"
                                  >
                                    Medium
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2 border border-purple-border-secondary rounded-lg p-3">
                                  <RadioGroupItem value="high" id="high" />
                                  <label
                                    htmlFor="high"
                                    className="text-xs font-medium"
                                  >
                                    High
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription className="text-xs text-purple-bg-dark3">
                              Set the priority level for this treasury action.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <div
                className={`flex flex-row ${
                  activeSection === "basic" ? "justify-end" : "justify-between"
                } mt-8`}
              >
                {activeSection !== "basic" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-purple-border-secondary hover:bg-purple-bg-light/50 transition-all px-6 py-6 text-base font-medium"
                    onClick={() => {
                      const sections = [
                        "basic",
                        "schedule",
                        "allocation",
                        "advanced",
                      ];
                      const currentIndex = sections.indexOf(activeSection);
                      if (currentIndex > 0) {
                        const newSection = sections[currentIndex - 1];
                        setActiveSection(newSection);
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}

                {/* Next button for navigation */}
                <Button
                  type="button"
                  onClick={() => {
                    const sections = [
                      "basic",
                      "schedule",
                      "allocation",
                      "advanced",
                    ];
                    const currentIndex = sections.indexOf(activeSection);
                    if (currentIndex < sections.length - 1) {
                      const newSection = sections[currentIndex + 1];
                      setActiveSection(newSection);
                    }
                  }}
                  className="bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-6 text-base font-medium"
                  disabled={!treasuryExists && activeSection !== "basic"}
                >
                  Next
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </Form>
    );
  }
);

// Add display name
TreasuryForm.displayName = "TreasuryForm";
