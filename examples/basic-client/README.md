# Basic Client Example

Minimal standalone Node.js script demonstrating how to use `somnia-client` to query balances, format amounts, build explorer links, and cleanly manage client lifecycles.

---

## Running the Example

From the root of this example:

```bash
# Run directly with tsx or node
npx tsx index.ts
```

Output:
```text
=== Somnia Client Basic Example ===
[somnia-client] Connected to Somnia Shannon Testnet (chain 50312)
Connected to: Somnia Shannon Testnet (Chain ID: 50312)

Querying address: 0xd8dA...6045 (0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)
Raw Balance (wei): 0n
Formatted Balance: 0 STT
Address Explorer:  https://shannon-explorer.somnia.network/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Latest Block Link: https://shannon-explorer.somnia.network/block/1000

[somnia-client] Client closed
Client disconnected cleanly.
```
