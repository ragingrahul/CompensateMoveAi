"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { createClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  LinkIcon,
  UnlinkIcon,
  CheckCircle,
  Edit,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const { walletAddress, connectWallet, status } = useAptosWallet();
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const supabase = createClient();

  // Fetch the user's linked wallet and organization name on component mount
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch linked wallet
        const walletResponse = await supabase
          .from("user_wallets")
          .select("wallet_address")
          .eq("user_id", user.id)
          .single();

        if (walletResponse.error && walletResponse.error.code !== "PGRST116") {
          console.error("Error fetching linked wallet:", walletResponse.error);
        } else if (walletResponse.data) {
          setLinkedWallet(walletResponse.data.wallet_address);
        }

        // Fetch organization name
        const profileResponse = await supabase
          .from("user_profiles")
          .select("organization_name")
          .eq("user_id", user.id)
          .single();

        if (
          profileResponse.error &&
          profileResponse.error.code !== "PGRST116"
        ) {
          console.error("Error fetching profile:", profileResponse.error);
        } else if (profileResponse.data) {
          setOrganizationName(profileResponse.data.organization_name || "");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user, supabase]);

  // Link the connected wallet to the user's account
  const linkWallet = async () => {
    if (!user || !walletAddress) return;

    try {
      setIsLinking(true);

      // Check if this wallet is already linked to another user
      const { data: existingLink, error: checkError } = await supabase
        .from("user_wallets")
        .select("user_id")
        .eq("wallet_address", walletAddress)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is what we want
        throw checkError;
      }

      if (existingLink && existingLink.user_id !== user.id) {
        toast.error("This wallet is already linked to another account");
        return;
      }

      // Link the wallet to this user
      const { error } = await supabase.from("user_wallets").upsert({
        user_id: user.id,
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setLinkedWallet(walletAddress);
      toast.success("Wallet linked successfully");
    } catch (error) {
      console.error("Error linking wallet:", error);
      toast.error("Failed to link wallet. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };

  // Unlink the wallet from the user's account
  const unlinkWallet = async () => {
    if (!user || !linkedWallet) return;

    try {
      setIsLinking(true);

      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setLinkedWallet(null);
      toast.success("Wallet unlinked successfully");
    } catch (error) {
      console.error("Error unlinking wallet:", error);
      toast.error("Failed to unlink wallet. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };

  // Save organization name
  const saveOrganizationName = async () => {
    if (!user) return;

    try {
      setIsSavingOrg(true);

      // Upsert operation to either update existing or insert new record
      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          organization_name: organizationName,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id", // This assumes user_id is the primary key or has a unique constraint
        }
      );

      if (error) {
        throw error;
      }

      setIsEditingOrg(false);
      toast.success("Organization name saved successfully");
    } catch (error) {
      console.error("Error saving organization name:", error);
      toast.error("Failed to save organization name. Please try again.");
    } finally {
      setIsSavingOrg(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your personal information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Email
              </h3>
              <p>{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Organization Name
              </h3>
              {isEditingOrg ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter organization name"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={saveOrganizationName}
                    disabled={isSavingOrg}
                  >
                    {isSavingOrg ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingOrg(false)}
                    disabled={isSavingOrg}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p>{organizationName || "Not set"}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingOrg(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                User ID
              </h3>
              <p className="text-xs font-mono">{user.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Last Sign In
              </h3>
              <p>{new Date(user.last_sign_in_at || "").toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>
              Link your blockchain wallet to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : linkedWallet ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-500 h-5 w-5" />
                  <span className="text-sm font-medium">Wallet Linked</span>
                </div>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md mb-4">
                  <p className="font-mono text-xs break-all">{linkedWallet}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={unlinkWallet}
                  disabled={isLinking}
                  className="w-full"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unlinking...
                    </>
                  ) : (
                    <>
                      <UnlinkIcon className="mr-2 h-4 w-4" />
                      Unlink Wallet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm">
                  Connect and link your blockchain wallet to use it with your
                  account.
                </p>

                {status.connected && walletAddress ? (
                  <div>
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md mb-4">
                      <p className="font-mono text-xs break-all">
                        {walletAddress}
                      </p>
                    </div>
                    <Button
                      onClick={linkWallet}
                      disabled={isLinking}
                      className="w-full"
                    >
                      {isLinking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Link This Wallet
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => connectWallet()}
                    disabled={status.connected}
                    className="w-full"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
