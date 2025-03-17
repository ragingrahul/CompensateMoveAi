import { Building2, CheckCircle2 } from "lucide-react";
import React from "react";

function OrgTitle() {
  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Organization</span>
          <span className="px-2 py-1 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            Verified
          </span>
        </h1>
        <div>
          <h2 className="text-2xl font-bold mb-2">Sweet Drinks LLC</h2>
          <p className="text-purple-bg-dark3 text-sm font-medium flex items-center">
            <CheckCircle2 className="mr-1 h-4 w-4 text-purple-primary" />
            Premium account active
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <Building2 className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default OrgTitle;
