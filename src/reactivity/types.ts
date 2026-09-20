/**
 * Off-chain Reactivity types.
 *
 * Source: https://docs.somnia.network/developer/reactivity
 * Verified: 2026-09-20
 *
 * Somnia Reactivity provides push-based WebSocket subscriptions to contract events.
 * Clients subscribe via the `somnia_subscribe` / `somnia_watch` RPC methods and
 * receive events without polling.
 */

import type { Abi, AbiEvent, Log } from "viem";

export interface ReactivitySubscriptionOptions {
  /** Contract address to watch. */
  address: string;
  /** ABI of the contract (or the specific event). */
  abi: Abi | readonly AbiEvent[];
  /** Event name to subscribe to. If omitted, subscribes to all events in the ABI. */
  eventName?: string;
  /** Optional indexed argument filters. */
  args?: Record<string, unknown>;
}

export interface ReactivityEvent<TLog = Log> {
  /** The raw log entry. */
  log: TLog;
  /** Timestamp when the event was received by the client. */
  receivedAt: number;
  /** The subscription ID that produced this event. */
  subscriptionId: string;
}

export type ReactivityEventHandler<TLog = Log> = (
  event: ReactivityEvent<TLog>,
) => void | Promise<void>;

export type ReactivityErrorHandler = (error: Error) => void;

export interface ReactivitySubscription {
  /** Unique subscription identifier. */
  id: string;
  /** Unsubscribe and close this subscription. */
  unsubscribe(): Promise<void>;
  /** Whether the subscription has been closed. */
  readonly closed: boolean;
}
