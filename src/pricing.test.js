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
      { centimes: 5, expected: 1.30 },
      { centimes: 10, expected: 1.30 },
      { centimes: 100, expected: 1.0 },
    ];
    testCases.forEach(({ centimes, expected }) => {
      const result = ProductVariantPrice.round(price, centimes);
      expect(result).toBe(expected);
    });
  });
});
