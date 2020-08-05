const { PricingPolicy, ProductVariantPrice } = require("./pricing");

describe("round() rounds correctly", () => {
  test("round 1.234 to 1, 5, 10 and 100 centimes", () => {
    const price = 1.234;
    const testCases = [
      { centimes: 1, expected: 1.23 },
      { centimes: 5, expected: 1.25 },
      { centimes: 10, expected: 1.2 },
      { centimes: 100, expected: 1.0 },
    ];
    testCases.forEach(({ centimes, expected }) => {
      const result = ProductVariantPrice.round(price, centimes);
      expect(result).toBe(expected);
    });
  });

  test("round 1.277 to 1, 5, 10 and 100 centimes", () => {
    const price = 1.277;
    const testCases = [
      { centimes: 1, expected: 1.28 },
      { centimes: 5, expected: 1.3 },
      { centimes: 10, expected: 1.3 },
      { centimes: 100, expected: 1.0 },
    ];
    testCases.forEach(({ centimes, expected }) => {
      const result = ProductVariantPrice.round(price, centimes);
      expect(result).toBe(expected);
    });
  });
});

describe("PricingPolicy", () => {
  test("default PricingPolicy is 5% for every participation level", () => {
    const pricingPolicy = new PricingPolicy();

    expect(pricingPolicy.managerIncomeRate).toBe(0.05);
    expect(pricingPolicy.rexIncomeRate).toBe(0.05);
    expect(pricingPolicy.softozorIncomeRate).toBe(0.05);
  });

  test("budzonneryIncomeRate is the sum of every participating level part", () => {
    const pricingPolicy = new PricingPolicy();

    expect(pricingPolicy.budzonneryIncomeRate).toBeCloseTo(0.05 * 3);
  });

  test("ProducerIncomeRate is 1 - budzonneryRate", () => {
    const pricingPolicy = new PricingPolicy(0);

    expect(pricingPolicy.producerIncomeRate).toBeCloseTo(
      1 - pricingPolicy.budzonneryIncomeRate
    );
  });

  test("custom PricingPolicy", () => {
    const pricingPolicy = new PricingPolicy(0.08, 0.04, 0.06);

    expect(pricingPolicy.managerIncomeRate).toBe(0.08);
    expect(pricingPolicy.rexIncomeRate).toBe(0.04);
    expect(pricingPolicy.softozorIncomeRate).toBe(0.06);
  });
});
