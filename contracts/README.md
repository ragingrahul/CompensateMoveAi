# Compensate: Token Streaming Contract for Aptos

A Move contract for streaming tokens to recipients at defined intervals. This contract allows for creating treasuries, funding them, and automatically paying recipients at regular time intervals.

## Features

- **Treasury Creation**: Create a treasury to manage funds for multiple recipients.
- **Recipient Management**: Add, remove, and update recipients with customizable payment amounts and frequencies.
- **Automated Payments**: Process payments based on predefined schedules for all recipients or individually.
- **Status Controls**: Pause, resume, or complete payment streams to recipients.
- **Treasury Management**: Fund and withdraw from treasuries as needed.
- **View Functions**: Check treasury balances, recipient details, and payment status.

## Contract Structure

The token streaming contract consists of the following main components:

1. **Treasury**: A resource that stores funds and manages recipients
2. **Recipient**: Information about payment recipients, including payment amount and frequency
3. **Token Type**: Generic implementation that works with any Aptos coin type

## Usage

### Creating a Treasury

```move
use compensate::token_stream;

// Create a treasury for AptosCoin
token_stream::create_treasury<AptosCoin>(account);
```

### Funding a Treasury

```move
// Fund treasury with 1 APT (1,000,000 octas)
token_stream::fund_treasury<AptosCoin>(account, 1000000);
```

### Adding Recipients

```move
// Add recipient with daily payments of 0.1 APT
token_stream::add_recipient<AptosCoin>(
    account,
    recipient_address,
    100000,  // 0.1 APT per payment
    86400    // Payment frequency in seconds (1 day)
);
```

### Processing Payments

```move
// Process payments for all eligible recipients
token_stream::process_all_payments<AptosCoin>(account);

// Or process payment for a single recipient
token_stream::process_payment<AptosCoin>(account, recipient_address);
```

### Managing Recipients

```move
// Update recipient payment details
token_stream::update_recipient<AptosCoin>(
    account,
    recipient_address,
    new_payment_amount,
    new_payment_frequency
);

// Pause payments to a recipient
token_stream::set_recipient_status<AptosCoin>(
    account,
    recipient_address,
    1  // STATUS_PAUSED
);

// Resume payments to a recipient
token_stream::set_recipient_status<AptosCoin>(
    account,
    recipient_address,
    0  // STATUS_ACTIVE
);

// Mark a recipient as completed
token_stream::set_recipient_status<AptosCoin>(
    account,
    recipient_address,
    2  // STATUS_COMPLETED
);
```

### Querying Information

```move
// Get treasury balance
let balance = token_stream::get_treasury_balance<AptosCoin>(treasury_owner_address);

// Check if a recipient exists
let exists = token_stream::recipient_exists<AptosCoin>(treasury_owner_address, recipient_address);

// Get recipient payment details
let (amount, frequency, last_payment, status) = token_stream::get_recipient_details<AptosCoin>(
    treasury_owner_address,
    recipient_address
);

// Check if payment is due for a recipient
let is_due = token_stream::is_payment_due<AptosCoin>(treasury_owner_address, recipient_address);
```

## Error Handling

The contract includes comprehensive error handling with specific error codes for various scenarios:

- `ETREASURY_ALREADY_EXISTS`: Attempting to create a treasury that already exists
- `ETREASURY_DOES_NOT_EXIST`: Treasury not found
- `ENOT_TREASURY_OWNER`: Only the treasury owner can perform certain operations
- `ERECIPIENT_ALREADY_EXISTS`: Attempting to add a recipient that's already in the treasury
- `ERECIPIENT_DOES_NOT_EXIST`: Recipient not found in the treasury
- `EINSUFFICIENT_FUNDS`: Treasury doesn't have enough funds for the operation
- `EINVALID_PAYMENT_FREQUENCY`: Invalid payment frequency specified
- `EINVALID_PAYMENT_AMOUNT`: Invalid payment amount specified
- `ENO_PAYMENT_DUE`: No payment is currently due for the recipient

## Testing

A test script is provided in the `scripts` folder to demonstrate the contract's functionality.
