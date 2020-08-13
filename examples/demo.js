const {PricingPolicy, ProductVariantPrice, addPrices} = require("../src/pricing")

const price = new ProductVariantPrice(12.532)
console.log(price.grossCostPrice.round(centimes=1)) // 12.53
console.log(price.grossCostPrice.round(centimes=5)) // 12.55
// by default, .round() rounds to 1 centime
console.log(price.producerIncomeInclVat.round()) // 12.532 * 0.85 => 10.65
console.log(price.budzonneryIncomeInclVat.round()) // 12.532 * 0.15 => 1.9
console.log(price.rexIncomeInclVat.round()) // 12.532 * 0.05 => 0.63

// grossCostPrice can be modified
price.grossCostPrice = 100
console.log(price.rexIncomeInclVat.round())  // 5.00

// properties can be set and the grossCostPrice is recomputed (the recalculation
// of all other is implied)
price.producerIncomeInclVat = 120
console.log(price.rexIncomeInclVat.round()) // = 120 / 0.85 * 0.05 = 7.06

// changing the pricing policy
const customPricingPolicy = new PricingPolicy(
    managerIncomeRate=0.04,
    rexIncomeRate=0.06,
    softozorIncomeRate=0.07
)
console.log(customPricingPolicy.budzonneryIncomeRate) // 0.17
console.log(customPricingPolicy.rexIncomeRate) // 0.06

const price2 = new ProductVariantPrice(100, customPricingPolicy)
console.log(price2.budzonneryIncomeInclVat.round()) // 17
console.log(price2.producerIncomeInclVat.round()) // 83
console.log(price2.rexIncomeInclVat.round()) // 6


// adding products together and getting the price
const prices = [1.23, 2.34, 3.45]
let products, total

// this builds a list of fake "ProductVariant" objects
products = prices.map((p) => ({
  someproperty: "some value",
  grossCostPrice: new ProductVariantPrice(p),
}))
// when adding up the product variants, we get the total price as a MoneyAmount
// object
console.log(products)
total = addPrices(products)
console.log(total.round(1))

// instead of getting the total price as a MoneyAmount, we can also get it as a
// 5 centimes rounded float
let roundedTotal = addPricesToDisplayFormat(products)
console.log(roundedTotal)


// The same can be done with a list of objects where the grossCostPrice is
// stored in a funky strange property
products = prices.map((p) => ({
  someproperty: "some value",
  funkyProperty: new ProductVariantPrice(p),
}));
console.log(products)
const mapObjectToPrice = (p) => p.funkyProperty
total = addPrices(products, mapObjectToPrice)
console.log(total.round(1))


