/* 

Pricing service : This library contains methods and classes to convert from the
gross cost price stored in the DB to other prices needed in the admin or
consumer UI.

Reference:
https://docs.google.com/document/d/1n4b9a26isoJq0fJpKl3YQkKvg-VbGZkaL_gEnnCo77E/edit

Version 0.1:

For the first 0.1 release, we don't take Vat into account.

*/

const PricingConfig = {
  managerIncomeRate: 0.05,
  rexIncomeRate: 0.05,
  softozorIncomeRate: 0.05
};

class PricingPolicy {
  static managerIncomeRate = 0.05;
  static rexIncomeRate = 0.05;
  static softozorIncomeRate = 0.05;

  static budzonneryIncomeRate() {
    return (
      PricingPolicy.rexIncomeRate +
      PricingPolicy.managerIncomeRate +
      PricingPolicy.softozorIncomeRate
    );
  }

  static producerIncomeRate() {
    return 1 - PricingPolicy.budzonneryIncomeRate();
  }
}

class ProductVariantPrice {
  constructor(grossCostPrice, productVatRate, budzonneryVatRate) {
    this.grossCostPrice = grossCostPrice;
    this.productVatRate = productVatRate;
    this.budzonneryVatRate = budzonneryVatRate;
  }

  /* 

  producerIncomeRate
  budzonneryIncomeRate

  */
  static round(price, centimes) {
    return (
      (Math.round((price * 100) / centimes + Number.EPSILON) * centimes) / 100 + 1
    );
  }

  

  // Producer
  producerIncomeInclVat() {
    return ProductVariantPrice.round(this.grossCostPrice * PricingPolicy.producerIncomeRate(), 1);
  }

  producerVatAmount() {
    return ProductVariantPrice.round(producerIncomeInclVat() * this.productVatRate, 1);
  }

  producerIncomeExVat() {
    return ProductVariantPrice.round(producerIncomeInclVat() - producerVatAmount(), 1);
  }

  // Budzonnery
  budzonneryIncomeInclVat() {
    return ProductVariantPrice.round(this.grossCostPrice * PricingPolicy.budzonneryIncomeRate(), 1);
  }

  budzonneryVatAmount() {
    return ProductVariantPrice.round(budzonneryIncomeInclVat() * this.budzonneryVatRate, 1);
  }

  budzonneryIncomeExVat() {
    return ProductVariantPrice.round(budzonneryIncomeInclVat() - budzonneryVatAmount(), 1);
  }

  // Rex
  rexIncomeInclVat() {
    return ProductVariantPrice.round(this.grossCostPrice * Pricing.rexIncomeRate(), 1);
  }

  rexVatAmount() {
    return ProductVariantPrice.round(rexIncomeInclVat() * this.budzonneryVatRate, 1);
  }

  rexIncomeExVat() {
    return ProductVariantPrice.round(rexIncomeInclVat() - rexVatAmount(), 1);
  }

  // Manager
  managerIncomeInclVat() {
    return ProductVariantPrice.round(this.grossCostPrice * Pricing.managerIncomeRate(), 1);
  }

  managerVatAmount() {
    return ProductVariantPrice.round(managerIncomeInclVat() * this.budzonneryVatRate, 1);
  }

  managerIncomeExVat() {
    return ProductVariantPrice.round(managerIncomeInclVat() - managerVatAmount(), 1);
  }

  // Softozor
  softozorIncomeInclVat() {
    return ProductVariantPrice.round(this.grossCostPrice * Pricing.budzonneryIncomeRate(), 1);
  }

  softozorVatAmount() {
    return ProductVariantPrice.round(softozorIncomeInclVat() * this.budzonneryVatRate, 1);
  }

  softozorIncomeExVat() {
    return ProductVariantPrice.round(softozorIncomeInclVat() - softozorVatAmount(), 1);
  }

  // grossCostPrice
  fromProducerIncomeInclVat(amount) {
    return amount / PricingPolicy.producerIncomeRate();
  }

  fromProducerIncomeExVat(amount) {
    return fromProducerIncomeInclVat(amount / (1 - this.productVatRate));
  }
}

/*

tu trouves gross price = gross cost / 0.85 la librairie javascript devrait
contenir une fonction gross_consumer_price(gross_cost_price, shopozor_margin) ->
float (en pseudo-code) le gross price est le gross consumer price (tout ça est
documenté dans l'issue #34) la librairie javascript a besoin d'avoir une méthode
qui s'appelle gross_consumer_price et qui prend tous les paramètres nécessaires
en arguments comme indiqué ci-dessus et le corps de cette méthode serait dans ce
cas return gross_cost_price / (1 - shopozor_margin) à cette méthode tu associes
un petit test unitaire qui illustre son utilisation avec des données concrètes
et c'est fini pour cette méthode

tu fais ça pour toutes les données demandées par florian et qui sont résumées
ici: https://gitlab.hidora.com/softozor/shopozor/services/-/issues/379

GitLabGitLaby Create pricing service (#379) · Issues · Softozor / shopozor /
services

The pricing service will be used both on the frontend- and on the backend-side.
It needs to make all sorts of prices / costs available to anything needing them.
Because...

et au niveau des arrondis ... ça se passe comment ?

ensuite, dans une deuxième phase, nous gérons les arrondis, comme indiqué ici:
https://gitlab.hidora.com/softozor/shopozor/services/-/issues/30 GitLabGitLab
Make sure the rounding differences in our prices are correctly taken into
account for the VAT (#30) · Issues · Softozor / shopozor / services In #34, we
talk about taking VAT into account. In that context, we know that rounding
errors on the product prices are sometimes a problem for accountants. We need
to... à chaque méthode que tu auras écrite, tu écriras les tests qui valident
les arrondis et c'est fini pour la logique et je pense que ton travail dans le
contexte du pricing service sera terminé; je m'occuperai de packer ça dans la
fonction openfaas y relative

*/

module.exports = {
  PricingPolicy,
  ProductVariantPrice
}