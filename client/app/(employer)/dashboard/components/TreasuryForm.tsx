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
  BadgePercent,
  Globe,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
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

// Add flowShapes constant back
const flowShapes = [{ label: "Linear", value: "linear" }] as const;

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

export function TreasuryForm({ onUpdate }: TreasuryFormProps) {
  const [activeSection, setActiveSection] = useState<string>("basic");

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

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <div className="p-6">
        <div className="pb-4 mb-4 border-b border-purple-border-secondary flex flex-row justify-between items-center">
          <h1 className="text-lg font-semibold text-purple-bg-dark2 flex items-center">
            <span>Treasury Management</span>
            <span className="ml-2 px-2 py-0.5 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
              Active
            </span>
          </h1>
          <button className="text-purple-bg-dark2 inline-flex items-center gap-2 bg-purple-bg-light hover:bg-purple-bg-light2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium">
            <TrendingUp className="size-4" />
            View Chart
          </button>
        </div>

        <Tabs
          defaultValue="basic"
          className="mb-4"
          onValueChange={setActiveSection}
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              <span>Basic</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger
              value="allocation"
              className="flex items-center gap-1.5"
            >
              <Users className="h-4 w-4" />
              <span>Allocation</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5">
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
                                    (network) => network.value === field.value
                                  )?.label
                                : "Select Network"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--trigger-width] p-0 shadow-md border border-purple-border-secondary bg-white"
                          style={
                            {
                              "--trigger-width":
                                "var(--radix-popper-anchor-width)",
                            } as React.CSSProperties
                          }
                        >
                          <Command className="bg-white">
                            <CommandInput
                              placeholder="Search networks..."
                              className="h-10 border-b border-purple-border-secondary"
                            />
                            <CommandList>
                              <CommandEmpty>No networks found.</CommandEmpty>
                              <CommandGroup>
                                {networks.map((network) => (
                                  <CommandItem
                                    value={network.label}
                                    key={network.value}
                                    onSelect={() => {
                                      form.setValue("network", network.value);
                                    }}
                                    className="hover:bg-purple-bg-light/70"
                                  >
                                    {network.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        network.value === field.value
                                          ? "opacity-100 text-purple-primary"
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
                        <BadgePercent className="h-4 w-4 mr-1.5 text-purple-primary" />
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
                          style={
                            {
                              "--trigger-width":
                                "var(--radix-popper-anchor-width)",
                            } as React.CSSProperties
                          }
                        >
                          <Command className="bg-white">
                            <CommandInput
                              placeholder="Search tokens..."
                              className="h-10 border-b border-purple-border-secondary"
                            />
                            <CommandList>
                              <CommandEmpty>No tokens found.</CommandEmpty>
                              <CommandGroup>
                                {tokens.map((token) => (
                                  <CommandItem
                                    value={token.label}
                                    key={token.value}
                                    onSelect={() => {
                                      form.setValue("token", token.value);
                                    }}
                                    className="hover:bg-purple-bg-light/70"
                                  >
                                    {token.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        token.value === field.value
                                          ? "opacity-100 text-purple-primary"
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

              <div className="flex flex-col xl:flex-row justify-between gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                      <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1.5 text-purple-primary" />
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter amount..."
                          {...field}
                          className="p-6"
                        />
                      </FormControl>
                      <FormDescription className="text-purple-bg-dark3 text-sm">
                        The amount that will be streamed to your employees.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flowShape"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full xl:w-1/2 space-y-4">
                      <FormLabel className="text-purple-bg-dark font-medium flex items-center">
                        <ArrowDown className="h-4 w-4 mr-1.5 text-purple-primary" />
                        Flow Shape
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
                              {flowShapes[0].label}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--trigger-width] p-0 shadow-md border border-purple-border-secondary bg-white"
                          style={
                            {
                              "--trigger-width":
                                "var(--radix-popper-anchor-width)",
                            } as React.CSSProperties
                          }
                        >
                          <Command className="bg-white">
                            <CommandList>
                              <CommandGroup>
                                {flowShapes.map((shape) => (
                                  <CommandItem
                                    value={shape.label}
                                    key={shape.value}
                                    onSelect={() => {
                                      form.setValue("flowShape", shape.value);
                                    }}
                                    className="hover:bg-purple-bg-light/70"
                                  >
                                    {shape.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        "opacity-100 text-purple-primary"
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
                name="memo"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-purple-bg-dark font-medium">
                      Memo (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a memo for this transaction..."
                        {...field}
                        className="p-6"
                      />
                    </FormControl>
                    <FormDescription className="text-purple-bg-dark3 text-sm">
                      Add a note or description for this treasury action.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <label htmlFor="weighted" className="text-sm font-medium">
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
                                form.setValue("gasFeeLimit", val[0].toString());
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
                      setActiveSection(sections[currentIndex - 1]);
                    }
                  }}
                >
                  Previous
                </Button>
              )}

              {activeSection === "advanced" ? (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-bg-dark2 to-purple-primary hover:opacity-90 transition-all px-6 py-6 text-base font-medium shadow-sm"
                >
                  Submit
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-gradient-to-r from-purple-bg-dark2 to-purple-primary hover:opacity-90 transition-all px-6 py-6 text-base font-medium shadow-sm"
                  onClick={() => {
                    const sections = [
                      "basic",
                      "schedule",
                      "allocation",
                      "advanced",
                    ];
                    const currentIndex = sections.indexOf(activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1]);
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </div>
          </form>
        </Tabs>
      </div>
    </Form>
  );
}
