/**
 * Input validation utilities.
 */

import { isAddress, isHex } from "viem";
import { ValidationError } from "../errors/index.js";

/**
 * Validates that a string is a valid Ethereum/Somnia address.
 * Returns the address if valid, throws ValidationError if not.
 */
export function validateAddress(address: string, label = "address"): `0x${string}` {
  if (!address || typeof address !== "string") {
    throw new ValidationError(`${label} is required`, { operation: "validateAddress" });
  }
  if (!isAddress(address)) {
    throw new ValidationError(`Invalid ${label}: ${address}`, { operation: "validateAddress" });
  }
  return address as `0x${string}`;
}

/**
 * Validates that a string is a valid transaction hash (66 chars, 0x-prefixed hex).
 */
export function validateTxHash(hash: string): `0x${string}` {
  if (!hash || typeof hash !== "string") {
    throw new ValidationError("Transaction hash is required", { operation: "validateTxHash" });
  }
  if (!isHex(hash) || hash.length !== 66) {
    throw new ValidationError(`Invalid transaction hash: ${hash}`, {
      operation: "validateTxHash",
    });
  }
  return hash as `0x${string}`;
}

/**
 * Validates that a bigint amount is non-negative.
 */
export function validateAmount(amount: bigint, label = "amount"): bigint {
  if (typeof amount !== "bigint") {
    throw new ValidationError(`${label} must be a bigint`, { operation: "validateAmount" });
  }
  if (amount < 0n) {
    throw new ValidationError(`${label} must be non-negative`, { operation: "validateAmount" });
  }
  return amount;
}
