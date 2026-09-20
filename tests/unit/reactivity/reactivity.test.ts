import type { Log, PublicClient } from "viem";
import { describe, expect, it, vi } from "vitest";
import { ReactivityError, ValidationError } from "../../../src/errors/index";
import { subscribe } from "../../../src/reactivity/client";

describe("reactivity/client", () => {
  const validAddress = "0x1234567890123456789012345678901234567890";
  const dummyAbi = [
    {
      type: "event",
      name: "Transfer",
      inputs: [
        { type: "address", name: "from", indexed: true },
        { type: "address", name: "to", indexed: true },
        { type: "uint256", name: "value", indexed: false },
      ],
    },
  ];

  it("throws ValidationError for invalid contract address", () => {
    const mockPublicClient = {
      watchContractEvent: vi.fn(),
    } as unknown as PublicClient;

    expect(() =>
      subscribe(mockPublicClient, { address: "invalid-address", abi: dummyAbi }, () => {}),
    ).toThrow(ValidationError);
  });

  it("creates a subscription and dispatches received logs to onEvent", () => {
    let capturedOnLogs: ((logs: Log[]) => void) | undefined;
    const mockUnwatch = vi.fn();

    const mockPublicClient = {
      watchContractEvent: vi.fn().mockImplementation(({ onLogs }) => {
        capturedOnLogs = onLogs;
        return mockUnwatch;
      }),
    } as unknown as PublicClient;

    const onEvent = vi.fn();
    const onError = vi.fn();

    const sub = subscribe(
      mockPublicClient,
      { address: validAddress, abi: dummyAbi, eventName: "Transfer" },
      onEvent,
      onError,
    );

    expect(sub.id).toMatch(/^rxn_\d+_\d+$/);
    expect(sub.closed).toBe(false);

    // Simulate incoming logs
    const mockLog = {
      address: validAddress,
      topics: ["0x123"],
      data: "0x456",
    } as unknown as Log;

    capturedOnLogs?.([mockLog]);

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        log: mockLog,
        subscriptionId: sub.id,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it("captures synchronous errors in onEvent and forwards to onError", () => {
    let capturedOnLogs: ((logs: Log[]) => void) | undefined;
    const mockPublicClient = {
      watchContractEvent: vi.fn().mockImplementation(({ onLogs }) => {
        capturedOnLogs = onLogs;
        return vi.fn();
      }),
    } as unknown as PublicClient;

    const onEvent = vi.fn().mockImplementation(() => {
      throw new Error("handler failed synchronously");
    });
    const onError = vi.fn();

    subscribe(mockPublicClient, { address: validAddress, abi: dummyAbi }, onEvent, onError);

    capturedOnLogs?.([{} as Log]);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "handler failed synchronously",
      }),
    );
  });

  it("captures async promise rejections in onEvent and forwards to onError", async () => {
    let capturedOnLogs: ((logs: Log[]) => void) | undefined;
    const mockPublicClient = {
      watchContractEvent: vi.fn().mockImplementation(({ onLogs }) => {
        capturedOnLogs = onLogs;
        return vi.fn();
      }),
    } as unknown as PublicClient;

    const onEvent = vi.fn().mockRejectedValue(new Error("async failure in handler"));
    const onError = vi.fn();

    subscribe(mockPublicClient, { address: validAddress, abi: dummyAbi }, onEvent, onError);

    capturedOnLogs?.([{} as Log]);

    // Allow promise microtask to resolve
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "async failure in handler",
      }),
    );
  });

  it("forwards client watch errors to onError", () => {
    let capturedOnError: ((err: Error) => void) | undefined;
    const mockPublicClient = {
      watchContractEvent: vi.fn().mockImplementation(({ onError }) => {
        capturedOnError = onError;
        return vi.fn();
      }),
    } as unknown as PublicClient;

    const onError = vi.fn();
    subscribe(mockPublicClient, { address: validAddress, abi: dummyAbi }, vi.fn(), onError);

    const clientErr = new Error("WebSocket disconnected");
    capturedOnError?.(clientErr);

    expect(onError).toHaveBeenCalledWith(clientErr);
  });

  it("unsubscribes cleanly and is idempotent", async () => {
    const mockUnwatch = vi.fn();
    const mockPublicClient = {
      watchContractEvent: vi.fn().mockReturnValue(mockUnwatch),
    } as unknown as PublicClient;

    const sub = subscribe(mockPublicClient, { address: validAddress, abi: dummyAbi }, vi.fn());

    expect(sub.closed).toBe(false);
    await sub.unsubscribe();
    expect(sub.closed).toBe(true);
    expect(mockUnwatch).toHaveBeenCalledTimes(1);

    // Call again, should not call unwatch again
    await sub.unsubscribe();
    expect(mockUnwatch).toHaveBeenCalledTimes(1);
  });

  it("wraps watchContractEvent failure in ReactivityError", () => {
    const mockPublicClient = {
      watchContractEvent: vi.fn().mockImplementation(() => {
        throw new Error("transport failure");
      }),
    } as unknown as PublicClient;

    expect(() =>
      subscribe(mockPublicClient, { address: validAddress, abi: dummyAbi }, vi.fn()),
    ).toThrow(ReactivityError);
  });
});
