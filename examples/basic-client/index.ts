/**
 * Minimal SomniaClient standalone example.
 *
 * Demonstrates:
 * 1. Client instantiation with network selection
 * 2. Explicit lifecycle connect() and close()
 * 3. Native balance query & human-readable formatting
 * 4. Explorer link generation
 * 5. Structured error handling
 */

import {
  SomniaError,
  SomniaClient,
  consoleLogger,
  formatNativeAmount,
  truncateAddress,
} from "somnia-client";

async function main() {
  console.log("=== Somnia Client Basic Example ===");

  // 1. Initialize client for Shannon Testnet with console logging
  const client = new SomniaClient({
    network: "testnet",
    logger: consoleLogger,
  });

  // 2. Explicit connection lifecycle
  client.connect();
  console.log(`Connected to: ${client.chain.name} (Chain ID: ${client.chain.id})`);

  // 3. Inspect target address (Somnia test address or standard vanity address)
  const targetAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  console.log(`\nQuerying address: ${truncateAddress(targetAddress)} (${targetAddress})`);

  try {
    // 4. Query native balance (returns BigInt in wei)
    const balanceWei = await client.wallet.getBalance(targetAddress);
    console.log(`Raw Balance (wei): ${balanceWei}n`);
    console.log(`Formatted Balance: ${formatNativeAmount(balanceWei, "STT")}`);

    // 5. Explorer Links
    console.log(`Address Explorer:  ${client.explorer.address(targetAddress)}`);
    console.log(`Latest Block Link: ${client.explorer.block(1000)}`);
  } catch (error) {
    if (error instanceof SomniaError) {
      console.error(`Somnia Error [${error.code}] in ${error.operation}: ${error.message}`);
    } else {
      console.error("Unexpected error:", error);
    }
  } finally {
    // 6. Clean lifecycle shutdown
    await client.close();
    console.log("\nClient disconnected cleanly.");
  }
}

main().catch(console.error);
