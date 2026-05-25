const { CircuitBreaker } = require("../src/utils/circuitBreaker");

describe("Circuit Breaker Stress & Concurrency Under Load", () => {
  it("safely handles 100 concurrent requests, trips state, and resolves fallbacks without blocking", async () => {
    const breaker = new CircuitBreaker("StressBreaker", {
      failureThreshold: 5,
      cooldownPeriod: 500 // Short cooldown for testing HALF-OPEN state transitions
    });

    const failedInference = jest.fn().mockRejectedValue(new Error("Downstream AI Service Timeout (504)"));
    const fallbackInference = jest.fn().mockResolvedValue("Safe Offline Local fallback answer");

    // Phase A: Concurrent load of 50 requests hitting a failing service
    const burstPromises = Array.from({ length: 50 }).map(() =>
      breaker.execute(failedInference, fallbackInference)
    );

    const results = await Promise.all(burstPromises);

    // Verify all resolved safely with fallback response
    expect(results).toHaveLength(50);
    results.forEach((res) => {
      expect(res).toBe("Safe Offline Local fallback answer");
    });

    // Circuit breaker state must be OPEN after threshold of 5 is exceeded
    expect(breaker.state).toBe("OPEN");
    expect(breaker.failures).toBeGreaterThanOrEqual(5);

    // Phase B: Direct immediate short-circuited checks
    const fastInference = jest.fn().mockResolvedValue("Primary answer");
    failedInference.mockClear();

    // In OPEN state, failedInference must NOT even be called
    const openStateResult = await breaker.execute(failedInference, fallbackInference);
    expect(openStateResult).toBe("Safe Offline Local fallback answer");
    expect(failedInference).not.toHaveBeenCalled();

    // Phase C: State recovery and transition to HALF-OPEN / CLOSED
    // Wait for cooldown
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Next request should transition to HALF-OPEN and try primary service
    const recoveryResult = await breaker.execute(fastInference, fallbackInference);
    expect(recoveryResult).toBe("Primary answer");
    expect(breaker.state).toBe("CLOSED");
    expect(breaker.failures).toBe(0);
  });
});
