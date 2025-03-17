import { Types, AptosClient } from "aptos";

// The module owner address
export const MODULE_OWNER_ADDRESS = "0xa7be87dd0114c9c72b037dded157eabd9d76a827ed6ecd54ec68112005abeb5d";
export const MODULE_NAME = "token_stream";

// Function to create a treasury
export async function createTreasury(
  client: AptosClient,
  signer: string,
  coinType: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::create_treasury`,
    type_arguments: [coinType],
    arguments: [],
  };
}

// Function to fund a treasury
export async function fundTreasury(
  client: AptosClient,
  signer: string,
  coinType: string,
  amount: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::fund_treasury`,
    type_arguments: [coinType],
    arguments: [amount],
  };
}

// Function to add recipient to treasury
export async function addRecipient(
  client: AptosClient,
  signer: string,
  coinType: string,
  recipientAddress: string,
  paymentAmount: string,
  paymentFrequency: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::add_recipient`,
    type_arguments: [coinType],
    arguments: [recipientAddress, paymentAmount, paymentFrequency],
  };
}

// Function to remove recipient from treasury
export async function removeRecipient(
  client: AptosClient,
  signer: string,
  coinType: string,
  recipientAddress: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::remove_recipient`,
    type_arguments: [coinType],
    arguments: [recipientAddress],
  };
}

// Function to update recipient payment details
export async function updateRecipient(
  client: AptosClient,
  signer: string,
  coinType: string,
  recipientAddress: string,
  paymentAmount: string,
  paymentFrequency: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::update_recipient`,
    type_arguments: [coinType],
    arguments: [recipientAddress, paymentAmount, paymentFrequency],
  };
}

// Function to process payments for all recipients
export async function processAllPayments(
  client: AptosClient,
  signer: string,
  coinType: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::process_all_payments`,
    type_arguments: [coinType],
    arguments: [],
  };
}

// Function to withdraw funds from treasury
export async function withdrawFunds(
  client: AptosClient,
  signer: string,
  coinType: string,
  amount: string
): Promise<Types.EntryFunctionPayload> {
  return {
    function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::withdraw_funds`,
    type_arguments: [coinType],
    arguments: [amount],
  };
} 