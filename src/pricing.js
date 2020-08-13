/* 

Pricing service : This library contains methods and classes to convert from the
gross cost price stored in the DB to other prices needed in the admin or
consumer UI.

Reference:
https://docs.google.com/document/d/1n4b9a26isoJq0fJpKl3YQkKvg-VbGZkaL_gEnnCo77E/edit

Version 0.1:

For the first 0.1 release, we don't take Vat into account.

*/

class MoneyAmount {
  constructor(amount) {
    this._rawAmount = amount;
  }

  get amount() {
    return this._rawAmount;
  }
  set amount(amount) {
    this._rawAmount = amount;
  }
  // this is a magic method automatically called by JS whenever the MoneyAmount
  // needs to be converted to a primitive type (for example to add MoneyAmounts
  // together or to multiply by a number)
  valueOf() {
    return this._rawAmount;
  }

  round(centimes=1) {
    return (
      (Math.round((this._rawAmount * 100) / centimes + Number.EPSILON) *
        centimes) /
      100
    );
  }

  display(centimes=5) {
    return parseFloat(this.round(centimes)).toFixed(2)
  }
}

class PricingPolicy {
  constructor(
    managerIncomeRate = 0.05,
    rexIncomeRate = 0.05,
    softozorIncomeRate = 0.05
  ) {
    this.managerIncomeRate = managerIncomeRate;
    this.rexIncomeRate = rexIncomeRate;
    this.softozorIncomeRate = softozorIncomeRate;
  }

  get budzonneryIncomeRate() {
    return (
      this.rexIncomeRate + this.managerIncomeRate + this.softozorIncomeRate
    );
  }

  get producerIncomeRate() {
    return 1 - this.budzonneryIncomeRate;
  }
}

class ProductVariantPrice {
  constructor(grossCostPrice, pricingPolicy) {
    this.pricingPolicy = pricingPolicy || new PricingPolicy();
    this._grossCostPrice = new MoneyAmount(grossCostPrice);
  }

  get grossCostPrice() {
    return this._grossCostPrice
  }
  set grossCostPrice(amount) {
    this._grossCostPrice = new MoneyAmount(amount)
  }

  // Producer prices
  get producerIncomeInclVat() {
    return new MoneyAmount(
      this._grossCostPrice * this.pricingPolicy.producerIncomeRate
    );
  }
  set producerIncomeInclVat(amount) {
    const newAmount = amount / this.pricingPolicy.producerIncomeRate;
    this._grossCostPrice.amount = newAmount;
    return newAmount;
  }

  get producerVatAmount() {
    return ProductVariantPrice.round(
      producerIncomeInclVat() * this.productVatRate,
      1
    );
  }

  // Budzonnery
  get budzonneryIncomeInclVat() {
    return new MoneyAmount(
      this._grossCostPrice * this.pricingPolicy.budzonneryIncomeRate
    )
  }
  
  // Rex
  get rexIncomeInclVat() {
    return new MoneyAmount(
      this._grossCostPrice * this.pricingPolicy.rexIncomeRate
    )
  }

  // Manager
  get managerIncomeInclVat() {
    return new MoneyAmount(
      this._grossCostPrice * this.pricingPolicy.managerIncomeRate
    )
  }

  // Softozor
  get softozorIncomeInclVat() {
    return new MoneyAmount(
      this._grossCostPrice * this.pricingPolicy.softozorIncomeRate
    )
  }

  // Utility methods
  valueOf() {
    return this._grossCostPrice.amount
  }
}

const addPrices = (products, mapProductToPrice) => {
  mapProductToPrice = mapProductToPrice || ((product) => product.grossCostPrice)
  return new MoneyAmount(products.map(mapProductToPrice).reduce((a, b) => (100 * a + 100 * b) / 100, 0))
}

const addPricesToDisplayFormat = (products, mapProductToPrice) => {
  return addPrices(products, mapProductToPrice).display()
}

module.exports = {
  PricingPolicy,
  ProductVariantPrice,
  MoneyAmount,
  addPrices,
  addPricesToDisplayFormat
};

