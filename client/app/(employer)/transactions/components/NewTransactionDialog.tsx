"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Send,
  ArrowDownToLine,
  ChevronsUpDown,
  Info,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Token options
const tokens = [{ label: "APT", value: "apt" }] as const;

// Network options
const networks = [{ label: "Aptos Testnet", value: "aptos_testnet" }] as const;

// Transaction types
const transactionTypes = [
  {
    value: "send",
    label: "Send",
    description: "Send crypto to an address or wallet",
    icon: <Send className="h-5 w-5" />,
  },
  {
    value: "receive",
    label: "Receive",
    description: "Receive crypto using a unique link",
    icon: <ArrowDownToLine className="h-5 w-5" />,
  },
  {
    value: "payroll",
    label: "Payroll",
    description: "Send regular payments to employees",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    value: "save",
    label: "Save",
    description: "Move funds to your savings account",
    icon: <PiggyBank className="h-5 w-5" />,
  },
];

const FormSchema = z.object({
  amount: z.string().min(1, {
    message: "Amount is required.",
  }),
  token: z.string({
    required_error: "Please select a token.",
  }),
  recipientAddress: z.string().min(1, {
    message: "Recipient address is required.",
  }),
  network: z.string({
    required_error: "Please select a network.",
  }),
  transactionType: z.string().default("send"),
  memo: z.string().optional(),
});

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewTransactionDialog: React.FC<NewTransactionDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("send");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
      transactionType: "send",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // Here you would typically send the transaction
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-purple-bg-dark">
              New Transaction
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 hover:bg-purple-bg-light/50 transition-colors"
            >
              <X className="h-4 w-4 text-purple-bg-dark3" />
            </button>
          </div>
          <DialogDescription className="text-purple-bg-dark3">
            Create a new transaction to send or receive funds
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Tabs */}
            <div className="space-y-4">
              <FormLabel className="text-sm font-medium text-purple-bg-dark">
                Transaction Type
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {transactionTypes.map((type) => (
                  <div
                    key={type.value}
                    className={cn(
                      "relative rounded-lg border border-purple-border-secondary p-3 flex flex-col items-center justify-center gap-1.5 hover:border-purple-primary/80 hover:bg-purple-bg-light/30 cursor-pointer transition-all",
                      activeTab === type.value &&
                        "border-purple-primary bg-purple-bg-light/50"
                    )}
                    onClick={() => {
                      setActiveTab(type.value);
                      form.setValue("transactionType", type.value);
                    }}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-full",
                        activeTab === type.value
                          ? "bg-purple-primary text-white"
                          : "bg-purple-bg-light text-purple-bg-dark"
                      )}
                    >
                      {type.icon}
                    </div>
                    <div className="font-medium text-sm text-purple-bg-dark">
                      {type.label}
                    </div>
                    <div className="text-[10px] text-purple-bg-dark3 text-center leading-tight">
                      {type.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-purple-border-secondary" />

            <div className="space-y-4">
              {/* Amount & Token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-bg-dark">
                        Amount
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            {...field}
                            className="pl-7 border-purple-border-secondary focus-visible:ring-purple-primary/30"
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                          <span className="text-purple-bg-dark3 text-sm">
                            $
                          </span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-bg-dark">
                        Token
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between border-purple-border-secondary focus-visible:ring-purple-primary/30",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? tokens.find(
                                    (token) => token.value === field.value
                                  )?.label
                                : "Select token"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 border-purple-border-secondary">
                          <Command>
                            <CommandInput placeholder="Search tokens..." />
                            <CommandList>
                              <CommandEmpty>No token found.</CommandEmpty>
                              <CommandGroup>
                                {tokens.map((token) => (
                                  <CommandItem
                                    key={token.value}
                                    value={token.value}
                                    onSelect={() => {
                                      form.setValue("token", token.value);
                                    }}
                                    className="hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-full bg-purple-bg-light flex items-center justify-center text-xs font-medium text-purple-primary">
                                        {token.label.slice(0, 2)}
                                      </div>
                                      <span>{token.label}</span>
                                    </div>
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

              {/* Recipient Address */}
              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-bg-dark">
                      Recipient Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        {...field}
                        className="border-purple-border-secondary focus-visible:ring-purple-primary/30"
                      />
                    </FormControl>
                    <FormDescription className="text-purple-bg-dark3 text-xs flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Enter a valid wallet address for the recipient
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Network */}
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-bg-dark">
                      Network
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-purple-border-secondary focus-visible:ring-purple-primary/30">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-purple-border-secondary">
                        {networks.map((network) => (
                          <SelectItem
                            key={network.value}
                            value={network.value}
                            className="hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30"
                          >
                            {network.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Memo */}
              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-bg-dark flex items-center gap-1">
                      Memo{" "}
                      <span className="text-purple-bg-dark3 text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a note for this transaction..."
                        {...field}
                        className="border-purple-border-secondary focus-visible:ring-purple-primary/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-purple-border-secondary hover:bg-purple-bg-light/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-primary hover:bg-purple-primary/90"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Create Transaction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionDialog;
