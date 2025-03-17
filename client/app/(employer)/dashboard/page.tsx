"use client";

import React, { useState, useCallback } from "react";
import { TreasuryForm } from "./components/TreasuryForm";
import Summary from "./components/Summary";
import OrgTitle from "./components/OrgTitle";
import TreasuryBalance from "./components/TreasuryBalance";
import EmployeeCount from "./components/EmployeeCount";

function Page() {
  // State to store the form values from TreasuryForm
  const [formValues, setFormValues] = useState({
    network: "aptos_testnet",
    token: "apt",
    amount: "0",
    flowShape: "linear", // Set default flow shape to linear
  });

  // Handler to update form values, wrapped in useCallback to prevent unnecessary recreations
  const handleFormUpdate = useCallback(
    (values: {
      network?: string;
      token?: string;
      amount?: string;
      flowShape?: string;
    }) => {
      setFormValues((prev) => ({
        ...prev,
        network: values.network ?? prev.network,
        token: values.token ?? prev.token,
        amount: values.amount ?? prev.amount,
        flowShape: values.flowShape ?? prev.flowShape,
      }));
    },
    []
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-background to-purple-bg-light">
      <h1 className="text-2xl font-bold text-purple-bg-dark">
        Dashboard Overview
      </h1>

      <div className="grid auto-rows-min gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <EmployeeCount />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <TreasuryBalance />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <OrgTitle />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 h-full lg:grid-cols-3">
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary lg:col-span-2 h-full transition-all duration-300 hover:shadow-lg hover:bg-white/90">
          <TreasuryForm onUpdate={handleFormUpdate} />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary h-full transition-all duration-300 hover:shadow-lg hover:bg-white/90">
          <Summary
            network={formValues.network}
            token={formValues.token}
            amount={formValues.amount}
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
