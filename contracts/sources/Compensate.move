module compensate::token_stream {
    use std::error;
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    
    /// Error codes
    const ETREASURY_ALREADY_EXISTS: u64 = 1;
    const ETREASURY_DOES_NOT_EXIST: u64 = 2;
    const ENOT_TREASURY_OWNER: u64 = 3;
    const ERECIPIENT_ALREADY_EXISTS: u64 = 4;
    const ERECIPIENT_DOES_NOT_EXIST: u64 = 5;
    const EINSUFFICIENT_FUNDS: u64 = 6;
    const EINVALID_PAYMENT_FREQUENCY: u64 = 7;
    const EINVALID_PAYMENT_AMOUNT: u64 = 8;
    const ENO_PAYMENT_DUE: u64 = 9;

    /// Stream status
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PAUSED: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;

    /// Recipient information
    struct Recipient<phantom CoinType> has store, drop {
        recipient_address: address,
        payment_amount: u64,      // Amount per payment
        payment_frequency: u64,   // Payment frequency in seconds
        last_payment_time: u64,   // Timestamp of last payment
        status: u8,               // Stream status
    }

    /// Treasury resource
    struct Treasury<phantom CoinType> has key {
        owner: address,
        balance: Coin<CoinType>,
        recipients: Table<address, Recipient<CoinType>>,
        recipient_addresses: vector<address>,
    }

    /// Initialize a new treasury
    public entry fun create_treasury<CoinType>(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if treasury already exists
        assert!(!exists<Treasury<CoinType>>(account_addr), error::already_exists(ETREASURY_ALREADY_EXISTS));
        
        // Create empty treasury
        let treasury = Treasury<CoinType> {
            owner: account_addr,
            balance: coin::zero<CoinType>(),
            recipients: table::new(),
            recipient_addresses: vector::empty(),
        };
        
        move_to(account, treasury);
    }

    /// Fund a treasury with tokens
    public entry fun fund_treasury<CoinType>(
        account: &signer,
        amount: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Transfer coins to treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        let coins = coin::withdraw<CoinType>(account, amount);
        coin::merge(&mut treasury.balance, coins);
    }

    /// Add a recipient to the treasury
    public entry fun add_recipient<CoinType>(
        account: &signer,
        recipient_address: address,
        payment_amount: u64,
        payment_frequency: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Validate parameters
        assert!(payment_amount > 0, error::invalid_argument(EINVALID_PAYMENT_AMOUNT));
        assert!(payment_frequency > 0, error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Check if recipient already exists
        assert!(!table::contains(&treasury.recipients, recipient_address), 
            error::already_exists(ERECIPIENT_ALREADY_EXISTS));
        
        // Create recipient and add to treasury
        let recipient = Recipient<CoinType> {
            recipient_address,
            payment_amount,
            payment_frequency,
            last_payment_time: timestamp::now_seconds(),
            status: STATUS_ACTIVE,
        };
        
        table::add(&mut treasury.recipients, recipient_address, recipient);
        vector::push_back(&mut treasury.recipient_addresses, recipient_address);
    }

    /// Remove a recipient from the treasury
    public entry fun remove_recipient<CoinType>(
        account: &signer,
        recipient_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Remove recipient
        table::remove(&mut treasury.recipients, recipient_address);
        
        // Remove from vector
        let (found, index) = vector::index_of(&treasury.recipient_addresses, &recipient_address);
        if (found) {
            vector::remove(&mut treasury.recipient_addresses, index);
        };
    }

    /// Update recipient payment details
    public entry fun update_recipient<CoinType>(
        account: &signer,
        recipient_address: address,
        payment_amount: u64,
        payment_frequency: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Validate parameters
        assert!(payment_amount > 0, error::invalid_argument(EINVALID_PAYMENT_AMOUNT));
        assert!(payment_frequency > 0, error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Update recipient
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        recipient.payment_amount = payment_amount;
        recipient.payment_frequency = payment_frequency;
    }

    /// Pause or resume a recipient's payments
    public entry fun set_recipient_status<CoinType>(
        account: &signer,
        recipient_address: address,
        status: u8
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Validate status
        assert!(status == STATUS_ACTIVE || status == STATUS_PAUSED || status == STATUS_COMPLETED, 
            error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Update recipient status
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        recipient.status = status;
    }

    /// Process payments for a single recipient
    public entry fun process_payment<CoinType>(
        account: &signer,
        recipient_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Get recipient
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        
        // Skip if recipient is not active
        if (recipient.status != STATUS_ACTIVE) {
            return
        };
        
        // Check if payment is due
        let current_time = timestamp::now_seconds();
        let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
        
        assert!(current_time >= next_payment_due, error::invalid_state(ENO_PAYMENT_DUE));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= recipient.payment_amount, 
            error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Make payment
        let payment = coin::extract(&mut treasury.balance, recipient.payment_amount);
        coin::deposit(recipient.recipient_address, payment);
        
        // Update last payment time
        recipient.last_payment_time = current_time;
    }

    /// Process payments for all active recipients
    public entry fun process_all_payments<CoinType>(account: &signer) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        let current_time = timestamp::now_seconds();
        let addresses_len = vector::length(&treasury.recipient_addresses);
        
        let i = 0;
        while (i < addresses_len) {
            let recipient_addr = *vector::borrow(&treasury.recipient_addresses, i);
            let recipient = table::borrow_mut(&mut treasury.recipients, recipient_addr);
            
            // Only process active recipients with due payments
            if (recipient.status == STATUS_ACTIVE) {
                let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
                
                if (current_time >= next_payment_due && coin::value(&treasury.balance) >= recipient.payment_amount) {
                    // Make payment
                    let payment = coin::extract(&mut treasury.balance, recipient.payment_amount);
                    coin::deposit(recipient.recipient_address, payment);
                    
                    // Update last payment time
                    recipient.last_payment_time = current_time;
                };
            };
            
            i = i + 1;
        };
    }

    /// Withdraw funds from treasury (owner only)
    public entry fun withdraw_funds<CoinType>(
        account: &signer,
        amount: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= amount, error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Withdraw funds
        let withdrawal = coin::extract(&mut treasury.balance, amount);
        coin::deposit(account_addr, withdrawal);
    }

    /// Get treasury balance
    #[view]
    public fun get_treasury_balance<CoinType>(owner_address: address): u64 acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        coin::value(&treasury.balance)
    }

    /// Check if a recipient exists in a treasury
    #[view]
    public fun recipient_exists<CoinType>(
        owner_address: address,
        recipient_address: address
    ): bool acquires Treasury {
        if (!exists<Treasury<CoinType>>(owner_address)) {
            return false
        };
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        table::contains(&treasury.recipients, recipient_address)
    }

    /// Get recipient payment details
    #[view]
    public fun get_recipient_details<CoinType>(
        owner_address: address,
        recipient_address: address
    ): (u64, u64, u64, u8) acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        let recipient = table::borrow(&treasury.recipients, recipient_address);
        (
            recipient.payment_amount,
            recipient.payment_frequency,
            recipient.last_payment_time,
            recipient.status
        )
    }

    /// Check if payment is due for a recipient
    #[view]
    public fun is_payment_due<CoinType>(
        owner_address: address,
        recipient_address: address
    ): bool acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        let recipient = table::borrow(&treasury.recipients, recipient_address);
        
        // Not due if recipient is not active
        if (recipient.status != STATUS_ACTIVE) {
            return false
        };
        
        let current_time = timestamp::now_seconds();
        let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
        
        current_time >= next_payment_due
    }
}

module compensate::token_stream_v2 {
    use std::error;
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    
    /// Error codes
    const ETREASURY_ALREADY_EXISTS: u64 = 1;
    const ETREASURY_DOES_NOT_EXIST: u64 = 2;
    const ENOT_TREASURY_OWNER: u64 = 3;
    const ERECIPIENT_ALREADY_EXISTS: u64 = 4;
    const ERECIPIENT_DOES_NOT_EXIST: u64 = 5;
    const EINSUFFICIENT_FUNDS: u64 = 6;
    const EINVALID_PAYMENT_FREQUENCY: u64 = 7;
    const EINVALID_PAYMENT_AMOUNT: u64 = 8;
    const ENO_PAYMENT_DUE: u64 = 9;
    const ENOT_RECIPIENT: u64 = 10;
    const ENOT_TREASURY_MANAGER: u64 = 11;
    const EMANAGER_ALREADY_EXISTS: u64 = 12;
    const EMANAGER_DOES_NOT_EXIST: u64 = 13;

    /// Stream status
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PAUSED: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;

    /// Recipient information
    struct Recipient<phantom CoinType> has store, drop {
        recipient_address: address,
        payment_amount: u64,      // Amount per payment
        payment_frequency: u64,   // Payment frequency in seconds
        last_payment_time: u64,   // Timestamp of last payment
        status: u8,               // Stream status
    }

    /// Treasury resource
    struct Treasury<phantom CoinType> has key {
        owner: address,
        balance: Coin<CoinType>,
        recipients: Table<address, Recipient<CoinType>>,
        recipient_addresses: vector<address>,
        managers: vector<address>, // Authorized managers who can access funds
    }

    /// Initialize a new treasury
    public entry fun create_treasury<CoinType>(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if treasury already exists
        assert!(!exists<Treasury<CoinType>>(account_addr), error::already_exists(ETREASURY_ALREADY_EXISTS));
        
        // Create empty treasury
        let treasury = Treasury<CoinType> {
            owner: account_addr,
            balance: coin::zero<CoinType>(),
            recipients: table::new(),
            recipient_addresses: vector::empty(),
            managers: vector::empty(),
        };
        
        move_to(account, treasury);
    }

    /// Fund a treasury with tokens
    public entry fun fund_treasury<CoinType>(
        account: &signer,
        amount: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Transfer coins to treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        let coins = coin::withdraw<CoinType>(account, amount);
        coin::merge(&mut treasury.balance, coins);
    }

    /// Add a manager to the treasury
    public entry fun add_manager<CoinType>(
        account: &signer,
        manager_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if manager already exists
        let (exists, _) = vector::index_of(&treasury.managers, &manager_address);
        assert!(!exists, error::already_exists(EMANAGER_ALREADY_EXISTS));
        
        // Add manager
        vector::push_back(&mut treasury.managers, manager_address);
    }

    /// Remove a manager from the treasury
    public entry fun remove_manager<CoinType>(
        account: &signer,
        manager_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Check if manager exists
        let (exists, index) = vector::index_of(&treasury.managers, &manager_address);
        assert!(exists, error::not_found(EMANAGER_DOES_NOT_EXIST));
        
        // Remove manager
        vector::remove(&mut treasury.managers, index);
    }

    /// Check if an account is a manager of the treasury
    fun is_manager<CoinType>(treasury: &Treasury<CoinType>, addr: address): bool {
        let (exists, _) = vector::index_of(&treasury.managers, &addr);
        exists
    }

    /// Check if the account is either the owner or a manager of the treasury
    fun is_authorized<CoinType>(treasury: &Treasury<CoinType>, addr: address): bool {
        treasury.owner == addr || is_manager(treasury, addr)
    }

    /// Add a recipient to the treasury
    public entry fun add_recipient<CoinType>(
        account: &signer,
        recipient_address: address,
        payment_amount: u64,
        payment_frequency: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(treasury.owner == account_addr, error::permission_denied(ENOT_TREASURY_OWNER));
        
        // Validate parameters
        assert!(payment_amount > 0, error::invalid_argument(EINVALID_PAYMENT_AMOUNT));
        assert!(payment_frequency > 0, error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Check if recipient already exists
        assert!(!table::contains(&treasury.recipients, recipient_address), 
            error::already_exists(ERECIPIENT_ALREADY_EXISTS));
        
        // Create recipient and add to treasury
        let recipient = Recipient<CoinType> {
            recipient_address,
            payment_amount,
            payment_frequency,
            last_payment_time: timestamp::now_seconds(),
            status: STATUS_ACTIVE,
        };
        
        table::add(&mut treasury.recipients, recipient_address, recipient);
        vector::push_back(&mut treasury.recipient_addresses, recipient_address);
    }

    /// Remove a recipient from the treasury
    public entry fun remove_recipient<CoinType>(
        account: &signer,
        recipient_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner or manager
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Remove recipient
        table::remove(&mut treasury.recipients, recipient_address);
        
        // Remove from vector
        let (found, index) = vector::index_of(&treasury.recipient_addresses, &recipient_address);
        if (found) {
            vector::remove(&mut treasury.recipient_addresses, index);
        };
    }

    /// Update recipient payment details
    public entry fun update_recipient<CoinType>(
        account: &signer,
        recipient_address: address,
        payment_amount: u64,
        payment_frequency: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner or manager
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Validate parameters
        assert!(payment_amount > 0, error::invalid_argument(EINVALID_PAYMENT_AMOUNT));
        assert!(payment_frequency > 0, error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Update recipient
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        recipient.payment_amount = payment_amount;
        recipient.payment_frequency = payment_frequency;
    }

    /// Pause or resume a recipient's payments
    public entry fun set_recipient_status<CoinType>(
        account: &signer,
        recipient_address: address,
        status: u8
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Check if owner or manager
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Validate status
        assert!(status == STATUS_ACTIVE || status == STATUS_PAUSED || status == STATUS_COMPLETED, 
            error::invalid_argument(EINVALID_PAYMENT_FREQUENCY));
        
        // Update recipient status
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        recipient.status = status;
    }

    /// Process payments for a single recipient
    public entry fun process_payment<CoinType>(
        account: &signer,
        recipient_address: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner or manager
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Get recipient
        let recipient = table::borrow_mut(&mut treasury.recipients, recipient_address);
        
        // Skip if recipient is not active
        if (recipient.status != STATUS_ACTIVE) {
            return
        };
        
        // Check if payment is due
        let current_time = timestamp::now_seconds();
        let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
        
        assert!(current_time >= next_payment_due, error::invalid_state(ENO_PAYMENT_DUE));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= recipient.payment_amount, 
            error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Make payment
        let payment = coin::extract(&mut treasury.balance, recipient.payment_amount);
        coin::deposit(recipient.recipient_address, payment);
        
        // Update last payment time
        recipient.last_payment_time = current_time;
    }

    /// Process payments for all active recipients
    public entry fun process_all_payments<CoinType>(account: &signer) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner or manager
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        let current_time = timestamp::now_seconds();
        let addresses_len = vector::length(&treasury.recipient_addresses);
        
        let i = 0;
        while (i < addresses_len) {
            let recipient_addr = *vector::borrow(&treasury.recipient_addresses, i);
            let recipient = table::borrow_mut(&mut treasury.recipients, recipient_addr);
            
            // Only process active recipients with due payments
            if (recipient.status == STATUS_ACTIVE) {
                let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
                
                if (current_time >= next_payment_due && coin::value(&treasury.balance) >= recipient.payment_amount) {
                    // Make payment
                    let payment = coin::extract(&mut treasury.balance, recipient.payment_amount);
                    coin::deposit(recipient.recipient_address, payment);
                    
                    // Update last payment time
                    recipient.last_payment_time = current_time;
                };
            };
            
            i = i + 1;
        };
    }

    /// Allow recipient to claim their own payment
    public entry fun claim_payment<CoinType>(
        account: &signer,
        treasury_owner: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(treasury_owner), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(treasury_owner);
        
        // Check if recipient exists
        assert!(table::contains(&treasury.recipients, account_addr), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        // Get recipient
        let recipient = table::borrow_mut(&mut treasury.recipients, account_addr);
        
        // Verify the claiming account is the recipient
        assert!(recipient.recipient_address == account_addr, error::permission_denied(ENOT_RECIPIENT));
        
        // Skip if recipient is not active
        assert!(recipient.status == STATUS_ACTIVE, error::invalid_state(ENO_PAYMENT_DUE));
        
        // Check if payment is due
        let current_time = timestamp::now_seconds();
        let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
        
        assert!(current_time >= next_payment_due, error::invalid_state(ENO_PAYMENT_DUE));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= recipient.payment_amount, 
            error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Make payment
        let payment = coin::extract(&mut treasury.balance, recipient.payment_amount);
        coin::deposit(account_addr, payment);
        
        // Update last payment time
        recipient.last_payment_time = current_time;
    }

    /// Withdraw funds from treasury (owner or authorized manager)
    public entry fun withdraw_funds<CoinType>(
        account: &signer,
        amount: u64
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner or manager
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= amount, error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Withdraw funds
        let withdrawal = coin::extract(&mut treasury.balance, amount);
        coin::deposit(account_addr, withdrawal);
    }

    /// Manager-specific function to withdraw funds to a specific account
    public entry fun withdraw_funds_to<CoinType>(
        account: &signer,
        amount: u64,
        recipient: address
    ) acquires Treasury {
        let account_addr = signer::address_of(account);
        
        // Check if treasury exists
        assert!(exists<Treasury<CoinType>>(account_addr), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury<CoinType>>(account_addr);
        
        // Check if owner or manager
        assert!(is_authorized(treasury, account_addr), 
            error::permission_denied(ENOT_TREASURY_MANAGER));
        
        // Check if treasury has enough funds
        assert!(coin::value(&treasury.balance) >= amount, error::resource_exhausted(EINSUFFICIENT_FUNDS));
        
        // Withdraw funds to specified recipient
        let withdrawal = coin::extract(&mut treasury.balance, amount);
        coin::deposit(recipient, withdrawal);
    }

    /// Get treasury balance
    #[view]
    public fun get_treasury_balance<CoinType>(owner_address: address): u64 acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        coin::value(&treasury.balance)
    }

    /// Check if a recipient exists in a treasury
    #[view]
    public fun recipient_exists<CoinType>(
        owner_address: address,
        recipient_address: address
    ): bool acquires Treasury {
        if (!exists<Treasury<CoinType>>(owner_address)) {
            return false
        };
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        table::contains(&treasury.recipients, recipient_address)
    }

    /// Check if an account is a manager of the treasury
    #[view]
    public fun is_treasury_manager<CoinType>(
        owner_address: address,
        manager_address: address
    ): bool acquires Treasury {
        if (!exists<Treasury<CoinType>>(owner_address)) {
            return false
        };
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        is_manager(treasury, manager_address)
    }

    /// Get all managers of a treasury
    #[view]
    public fun get_treasury_managers<CoinType>(
        owner_address: address
    ): vector<address> acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        treasury.managers
    }

    /// Get recipient payment details
    #[view]
    public fun get_recipient_details<CoinType>(
        owner_address: address,
        recipient_address: address
    ): (u64, u64, u64, u8) acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        let recipient = table::borrow(&treasury.recipients, recipient_address);
        (
            recipient.payment_amount,
            recipient.payment_frequency,
            recipient.last_payment_time,
            recipient.status
        )
    }

    /// Check if payment is due for a recipient
    #[view]
    public fun is_payment_due<CoinType>(
        owner_address: address,
        recipient_address: address
    ): bool acquires Treasury {
        assert!(exists<Treasury<CoinType>>(owner_address), error::not_found(ETREASURY_DOES_NOT_EXIST));
        
        let treasury = borrow_global<Treasury<CoinType>>(owner_address);
        assert!(table::contains(&treasury.recipients, recipient_address), 
            error::not_found(ERECIPIENT_DOES_NOT_EXIST));
        
        let recipient = table::borrow(&treasury.recipients, recipient_address);
        
        // Not due if recipient is not active
        if (recipient.status != STATUS_ACTIVE) {
            return false
        };
        
        let current_time = timestamp::now_seconds();
        let next_payment_due = recipient.last_payment_time + recipient.payment_frequency;
        
        current_time >= next_payment_due
    }
}