(function () {
  'use strict';
  const offer = Object.freeze({
    startsAt: Date.parse('2026-10-19T00:00:00-07:00'),
    endsAt: Date.parse('2026-10-26T00:00:00-07:00'),
    deadlineLabel: 'Sunday, October 25, 2026',
    discount: 50
  });
  const isOfferActive = (now = Date.now()) => now >= offer.startsAt && now < offer.endsAt;
  function calculate({ bedrooms, bathrooms, size, service, now = Date.now() }) {
    const custom = service === 'move' || size > 2300 || bedrooms >= 5 || bathrooms >= 4;
    const sizeExtra = Math.max(0, Math.ceil((size - 1500) / 500)) * 40;
    const regular = Math.round(99 + 20 * bedrooms + 16 * bathrooms + sizeExtra);
    const normalDeep = Math.round(209 + 30 * bedrooms + 28 * bathrooms + sizeExtra);
    const promotionApplied = !custom && isOfferActive(now) && bedrooms === 3 && bathrooms === 2.5 && size >= 1000 && size <= 1500;
    const deep = normalDeep - (promotionApplied ? offer.discount : 0);
    return { regular, normalDeep, deep, standalone: deep, custom, promotionApplied };
  }
  const pricing = Object.freeze({ offer, isOfferActive, calculate });
  if (typeof module !== 'undefined' && module.exports) module.exports = pricing;
  else window.StillHomePricing = pricing;
})();
