export const OPS_STORAGE_KEY = 'gulangyu-operations-v1'

const zh = (value) => value

const seed = {
  version: 1,
  merchants: [
    { id: 'coffee', name: zh('\u65e7\u65f6\u5149\u5496\u5561\u9986'), category: zh('\u767e\u5e74\u6d0b\u697c\u91cc\u7684\u5496\u5561\u9986'), contact: '13800000001', status: 'active', routeId: 'art', note: zh('\u4e0b\u53483\u70b9\u7a97\u8fb9\u9633\u5149\u6700\u597d\u3002') },
    { id: 'craft', name: zh('\u6709\u5149\u624b\u4f5c\u6240'), category: zh('\u628a\u6d77\u98ce\u505a\u6210\u7eaa\u5ff5\u54c1'), contact: '13800000002', status: 'active', routeId: 'art', note: zh('\u53ef\u9884\u7ea6 60 \u5206\u949f\u624b\u4f5c\u4f53\u9a8c\u3002') },
    { id: 'dining', name: zh('\u6d77\u8fb9\u5c0f\u9986'), category: zh('\u770b\u5b8c\u65e5\u843d\u518d\u5403\u996d'), contact: '13800000003', status: 'active', routeId: 'food', note: zh('\u6bcf\u5929\u6309\u6e14\u83b7\u66f4\u65b0\u83dc\u5355\u3002') }
  ],
  routes: [
    { id: 'art', title: zh('\u6587\u827a\u6f2b\u6e38\u7ebf'), duration: zh('3.5 \u5c0f\u65f6'), status: 'active', stops: 4 },
    { id: 'love', title: zh('\u604b\u4eba\u53d6\u666f\u7ebf'), duration: zh('2.5 \u5c0f\u65f6'), status: 'active', stops: 3 },
    { id: 'food', title: zh('\u5c9b\u5473\u5bfb\u9c9c\u7ebf'), duration: zh('4 \u5c0f\u65f6'), status: 'active', stops: 5 },
    { id: 'family', title: zh('\u4eb2\u5b50\u8f7b\u677e\u7ebf'), duration: zh('3 \u5c0f\u65f6'), status: 'active', stops: 4 }
  ],
  offers: [
    { id: 'offer-coffee', merchantId: 'coffee', routeId: 'art', title: zh('\u4e0b\u5348\u8336\u8def\u7ebf\u4e13\u4eab'), price: 58, originalPrice: 68, active: true, quota: 80 },
    { id: 'offer-craft', merchantId: 'craft', routeId: 'art', title: zh('\u624b\u4f5c\u4f53\u9a8c\u4e5d\u6298'), price: 108, originalPrice: 120, active: true, quota: 40 },
    { id: 'offer-dining', merchantId: 'dining', routeId: 'food', title: zh('\u6d77\u666f\u53cc\u4eba\u9910'), price: 168, originalPrice: 198, active: true, quota: 50 }
  ],
  coupons: [],
  visits: 1286,
  navigationClicks: 314
}

const clone = (item) => JSON.parse(JSON.stringify(item))
export function getOperations() {
  try {
    const stored = JSON.parse(localStorage.getItem(OPS_STORAGE_KEY))
    if (stored?.version === 1) return stored
  } catch (_) {}
  const initial = clone(seed)
  localStorage.setItem(OPS_STORAGE_KEY, JSON.stringify(initial))
  return initial
}
export function saveOperations(data) {
  localStorage.setItem(OPS_STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('gulangyu-operations-change'))
  return data
}
export function resetOperations() { return saveOperations(clone(seed)) }
export function couponCode() {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GY-${part}-${String(Date.now()).slice(-4)}`
}
export function issueCoupon({ phone, offerId = 'offer-coffee', visitor = '' }) {
  const data = getOperations()
  const offer = data.offers.find((item) => item.id === offerId && item.active) || data.offers[0]
  if (!offer) throw new Error('\u5f53\u524d\u6ca1\u6709\u53ef\u9886\u53d6\u7684\u4f18\u60e0\u3002')
  const coupon = { id: `coupon-${Date.now()}`, code: couponCode(), phone, visitor, offerId: offer.id, merchantId: offer.merchantId, status: 'active', createdAt: new Date().toISOString(), redeemedAt: null }
  data.coupons.unshift(coupon)
  saveOperations(data)
  return { coupon, offer }
}
export function redeemCoupon(code) {
  const data = getOperations()
  const coupon = data.coupons.find((item) => item.code.trim().toUpperCase() === code.trim().toUpperCase())
  if (!coupon) return { ok: false, reason: '\u672a\u627e\u5230\u8fd9\u4e2a\u4f18\u60e0\u7801\u3002' }
  if (coupon.status === 'redeemed') return { ok: false, reason: '\u8be5\u4f18\u60e0\u7801\u5df2\u4e8e\u4e4b\u524d\u6838\u9500\u3002', coupon }
  coupon.status = 'redeemed'
  coupon.redeemedAt = new Date().toISOString()
  saveOperations(data)
  return { ok: true, coupon }
}
export function updateMerchant(id, patch) {
  const data = getOperations(); const merchant = data.merchants.find((item) => item.id === id)
  if (!merchant) return null
  Object.assign(merchant, patch); saveOperations(data); return merchant
}
export function addMerchant(input) {
  const data = getOperations(); const id = `merchant-${Date.now()}`
  const merchant = { id, name: input.name, category: input.category || '\u7279\u8272\u5c9b\u4e0a\u5c0f\u5e97', contact: input.contact || '', status: 'active', routeId: input.routeId || data.routes[0]?.id || '', note: input.note || '' }
  data.merchants.unshift(merchant); saveOperations(data); return merchant
}
export function updateOffer(id, patch) {
  const data = getOperations(); const offer = data.offers.find((item) => item.id === id)
  if (!offer) return null
  Object.assign(offer, patch); saveOperations(data); return offer
}
export function addOffer(input) {
  const data = getOperations(); const id = `offer-${Date.now()}`
  const offer = { id, merchantId: input.merchantId, routeId: input.routeId, title: input.title, price: Number(input.price || 0), originalPrice: Number(input.originalPrice || 0), quota: Number(input.quota || 0), active: true }
  data.offers.unshift(offer); saveOperations(data); return offer
}
export function addRoute(input) {
  const data = getOperations(); const id = `route-${Date.now()}`
  const route = { id, title: input.title, duration: input.duration || '\u5f85\u5b9a', stops: Number(input.stops || 0), status: 'active' }
  data.routes.unshift(route); saveOperations(data); return route
}
export function updateRoute(id, patch) {
  const data = getOperations(); const route = data.routes.find((item) => item.id === id)
  if (!route) return null
  Object.assign(route, patch); saveOperations(data); return route
}
export const merchantFor = (data, id) => data.merchants.find((item) => item.id === id)
export const routeFor = (data, id) => data.routes.find((item) => item.id === id)
export const offerFor = (data, id) => data.offers.find((item) => item.id === id)
