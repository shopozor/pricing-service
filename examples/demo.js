const {PricingPolicy, ProductVariantPrice} = require("../src/pricing")

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