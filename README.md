# Pricing service

## Usage

The whole thing is based on the `MoneyAmount` class that is used to represent
financial amounts.

```js
const { MoneyAmount } = require("./pricing")

// Financial amounts are represented by the class MoneyAmount
let price = new MoneyAmount(1.02)
// Money amounts can be rounded to n centimes (here 5)
console.log(price.round(5)) // 1.02 => 1
// and converted to display format string
console.log(price.display(5)) // 1.02 => 1 => '1.00'

// Money amounts can be added together
const p1 = new MoneyAmount(1.02)
const p2 = new MoneyAmount(2.07)
console.log(p1 + p2) // 3.09

// to be able to further work with the sum as a MoneyAmount, use the MoneyAmount constructor
const total = new MoneyAmount(p1 + p2)
console.log(total.display()) // 3.09 => ... => '3.10'
```

## `ProductVariantPrice` class

To hande product prices, instantiate the `ProductVariantPrice` class passing the
`grossCostPrice` as an argument. All other conversions can then be accessed
automatically through properties that are automatically updated accordingly.

```js
const {PricingPolicy, ProductVariantPrice} = require("./pricing")

const price = new ProductVariantPrice(12.532)
price.round(centimes=1) // 12.53
price.round(centimes=5) // 12.55
price.producerIncomeInclVat.round() // 12.532 * 0.85
price.budzonneryIncomeInclVat.round() // 12.532 * 0.15
price.rexIncomeInclVat.round() // 12.532 * 0.05
```

The properties are also writable an will affect the property `grossCostPrice`
which all other properties are based upon:

```js
const {PricingPolicy, ProductVariantPrice} = require("./pricing")

const price = new ProductVariantPrice(100)
price.round() // 100.00
price.rexIncomeInclVat.round() // 5.00
price.producerIncomeInclVat = 120
// all prices are automagically recomputed
price.rexIncomeInclVat.round() // = 120 / 0.85 * 0.05 = 7.06
```

### Custom pricing policy

The same can be done with a custom earning shares policy

```js
const {PricingPolicy, ProductVariantPrice} = require("./pricing")

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

```