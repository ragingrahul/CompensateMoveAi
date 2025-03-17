/**
 * This file serves as a registry for supported wallet names
 */

// Import wallet types
import { AvailableWallets } from '@aptos-labs/wallet-adapter-core';

/**
 * Register available wallet names for opt-in
 * These should match the wallet names in the AIP-62 standard
 */
export const AVAILABLE_WALLET_NAMES: AvailableWallets[] = [
  'Petra',
  'Pontem Wallet',
  'Nightly',
  'T wallet',
  'Mizu Wallet'
]; 