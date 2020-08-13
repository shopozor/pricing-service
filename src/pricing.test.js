const {
  PricingPolicy,
  ProductVariantPrice,
  MoneyAmount,
  addPrices,
  addPricesToDisplayFormat,
} = require("./pricing");
const { PRIORITY_ABOVE_NORMAL } = require("constants");
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
  describe("display() method rounds and returns a string with 2 decimals fixed precision", () => {
    test("display 1.234 defaults to 1.25", () => {
      const amount = new MoneyAmount(1.234);
      const result = amount.display();
      expect(result).toBe("1.25");
    });

    test("display 1.234 to 1, 5, 10 and 100 centimes", () => {
      const amount = new MoneyAmount(1.234);
      const testCases = [
        { centimes: 1, expected: "1.23" },
        { centimes: 5, expected: "1.25" },
        { centimes: 10, expected: "1.20" },
        { centimes: 100, expected: "1.00" },
      ];
      testCases.forEach(({ centimes, expected }) => {
        const result = amount.display(centimes);
        expect(result).toBe(expected);
      });
    });

    test("round 1.277 to 1, 5, 10 and 100 centimes", () => {
      const amount = new MoneyAmount(1.277);
      const testCases = [
        { centimes: 1, expected: "1.28" },
        { centimes: 5, expected: "1.30" },
        { centimes: 10, expected: "1.30" },
        { centimes: 100, expected: "1.00" },
      ];
      testCases.forEach(({ centimes, expected }) => {
        const result = amount.display(centimes);
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
  describe("all other price Views are calculated based upon grossCostPrice", () => {
    const productPrice = new ProductVariantPrice(100);
    const testCases = [
      {
        conversion: "budzonneryIncomeInclVat",
        expected: 15,
      },
      {
        conversion: "producerIncomeInclVat",
        expected: 85,
      },
      {
        conversion: "rexIncomeInclVat",
        expected: 5,
      },
      {
        conversion: "managerIncomeInclVat",
        expected: 5,
      },
      {
        conversion: "softozorIncomeInclVat",
        expected: 5,
      },
    ];

    testCases.forEach(({ conversion, expected }) => {
      test(`For grossCostPrice = 100, ${conversion} returns ${expected}`, () => {
        expect(productPrice[conversion].amount).toBeCloseTo(expected);
      });
    });
  });

  test("grossCostPrice is a property that can be set", () => {
    const price = new ProductVariantPrice(100.003);
    expect(price.grossCostPrice.round()).toBeCloseTo(100.0);
    price.grossCostPrice = 200;
    expect(price.grossCostPrice.round()).toBeCloseTo(200.0);
    expect(price.budzonneryIncomeInclVat.round()).toBeCloseTo(30);
  });

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

      // before producerIncomeIncVat update, budzonnery earnes 15
      expect(productPrice.budzonneryIncomeInclVat.amount).toBeCloseTo(15);

      productPrice.producerIncomeInclVat = 120;

      expect(productPrice.grossCostPrice.amount).toBeCloseTo(
        // equals 141.176
        productPrice.producerIncomeInclVat / pricingPolicy.producerIncomeRate
      );

      // TODO: just for demonstration purposes, this case is implied by all
      // properties beeing calculated based upon grossCostPrice. After updating
      // producerIncomeInclVat, budzonnery earnings are automatically updated as
      // well.
      expect(productPrice.budzonneryIncomeInclVat.amount).toBeCloseTo(
        // equals 21.176
        productPrice.grossCostPrice * pricingPolicy.budzonneryIncomeRate
      );
    });
  });

  describe("ProductVariants are converted to grossCostPrice implicitely when needed", () => {
    test("ProductVariants can be simply added together", () => {
      const p1 = new ProductVariantPrice(12.23);
      const p2 = new ProductVariantPrice(5.79);

      const result = p1 + p2;
      const expected = p1.grossCostPrice.amount + p2.grossCostPrice.amount;

      expect(result).toBe(expected);
    });
  });
});

describe("addPrices adds ProductVariants together with exact computation up to 1 centime", () => {
  test("addPrices adds product variant gross price correctly with standard property", () => {
    const prices = [1.23, 2.34, 3.45];

    // this builds a list of fake "ProductVariant" objects
    const products = prices.map((p) => ({
      someproperty: "some value",
      grossCostPrice: new ProductVariantPrice(p),
    }));

    const result = addPrices(products);
    const expected = (123 + 234 + 345) / 100;

    expect(result).toBeInstanceOf(MoneyAmount);
    expect(result.amount).toBe(expected);
  });

  test("addPrices adds product variant gross price correctly with custom property", () => {
    const prices = [1.23, 2.34, 3.45];

    // this builds a list of fake "ProductVariant" objects
    const products = prices.map((p) => ({
      someproperty: "some value",
      funkyProperty: new ProductVariantPrice(p),
    }));

    const mapObjectToPrice = (product) => product.funkyProperty;
    const result = addPrices(products, mapObjectToPrice);
    const expected = (123 + 234 + 345) / 100;

    expect(result).toBeInstanceOf(MoneyAmount);
    expect(result.amount).toBe(expected);
  });
});

describe("addPricesToDisplayFormat adds ProductVariants together with exact computation up to 1 centime and rounds to 5 centimes with fixed number of decimals", () => {
  test("addPrices adds product variant gross price correctly with standard property", () => {
    const prices = [1.23, 2.34, 3.45];

    // this builds a list of fake "ProductVariant" objects
    const products = prices.map((p) => ({
      someproperty: "some value",
      grossCostPrice: new ProductVariantPrice(p),
    }));

    const result = addPricesToDisplayFormat(products);
    // 7.02 => 7.00
    const expected = "7.00";
    
    expect(typeof result).toBe("string");
    expect(result.split(".")[1].length).toBe(2);
    expect(result).toBe(expected);
  });
  
  test("addPrices adds product variant gross price correctly with custom property", () => {
    const prices = [1.23, 2.34, 3.45];
    
    // this builds a list of fake "ProductVariant" objects with price as a funky
    // property
    const products = prices.map((p) => ({
      someproperty: "some value",
      funkyProperty: new ProductVariantPrice(p),
    }));
    
    const mapObjectToPrice = (product) => product.funkyProperty;
    const result = addPricesToDisplayFormat(products, mapObjectToPrice);
    // 7.02 => 7.00
    const expected = "7.00";

    expect(typeof result).toBe("string");
    expect(result.split(".")[1].length).toBe(2);
    expect(result).toBe(expected);
  });
});
