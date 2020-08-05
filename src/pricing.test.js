const {
  PricingPolicy,
  ProductVariantPrice,
  MoneyAmount,
} = require("./pricing");
// const { decorator } = require("babel-types");

describe("class MoneyAmount", () => {
  test("the raw amount can be set", () => {
    const price = new MoneyAmount(100);
    price.amount = 200;
    expect(price.amount).toBe(price._rawAmount);
  });
  describe("round() method rounds correctly", () => {
    test("round 1.234 to 1, 5, 10 and 100 centimes", () => {
      const amount = new MoneyAmount(1.234);
      const testCases = [
        { centimes: 1, expected: 1.23 },
        { centimes: 5, expected: 1.25 },
        { centimes: 10, expected: 1.2 },
        { centimes: 100, expected: 1.0 },
      ];
      testCases.forEach(({ centimes, expected }) => {
        const result = amount.round(centimes);
        expect(result).toBe(expected);
      });
    });

    test("round 1.277 to 1, 5, 10 and 100 centimes", () => {
      const amount = new MoneyAmount(1.277);
      const testCases = [
        { centimes: 1, expected: 1.28 },
        { centimes: 5, expected: 1.3 },
        { centimes: 10, expected: 1.3 },
        { centimes: 100, expected: 1.0 },
      ];
      testCases.forEach(({ centimes, expected }) => {
        const result = amount.round(centimes);
        expect(result).toBe(expected);
      });
    });
  });

  describe("ValueOf MoneyAmount can be used directly in calculations", () => {
    test("Numbers can be added to MoneyAmount instance", () => {
      expect(new MoneyAmount(1.5) + 1).toBeCloseTo(2.5);
    });
    test("MoneyAmount can be multiplied by a number", () => {
      expect(new MoneyAmount(1.5) * 3).toBeCloseTo(4.5);
    });
  });
});

describe("class PricingPolicy", () => {
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
    const pricingPolicy = new PricingPolicy();

    expect(pricingPolicy.producerIncomeRate).toBeCloseTo(
      1 - pricingPolicy.budzonneryIncomeRate
    );
  });

  test("custom PricingPolicy", () => {
    const pricingPolicy = new PricingPolicy(
      (managerIncomeRate = 0.08),
      (rexIncomeRate = 0.04),
      (softozorIncomeRate = 0.06)
    );

    expect(pricingPolicy.managerIncomeRate).toBe(0.08);
    expect(pricingPolicy.rexIncomeRate).toBe(0.04);
    expect(pricingPolicy.softozorIncomeRate).toBe(0.06);
  });
});

describe("class ProductVariantPrice", () => {
  describe("ProducerIncome", () => {
    test("Producer income is computed based on grossCostPrice and pricingPolicy", () => {
      const pricingPolicy = new PricingPolicy();
      const productPrice = new ProductVariantPrice(100, pricingPolicy);
      expect(productPrice.producerIncomeInclVat.amount).toBeCloseTo(
        productPrice.grossCostPrice * pricingPolicy.producerIncomeRate
      );
    });

    test("grossCostPrice and all other costs are automatically adapted when ProducerIncomeInclVat is set", () => {
      const pricingPolicy = new PricingPolicy();
      const productPrice = new ProductVariantPrice(100, pricingPolicy);
      productPrice.producerIncomeInclVat = 120;
      expect(productPrice.grossCostPrice.amount).toBeCloseTo(
        productPrice.producerIncomeInclVat / pricingPolicy.producerIncomeRate
      );

      // TODO: add more tests for other priceViews

    });
  });
});
