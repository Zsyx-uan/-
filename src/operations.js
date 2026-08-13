export const OPS_STORAGE_KEY = 'gulangyu-operations-v1'

const zh = (value) => value

const seed = {
  version: 1,
  merchants: [
    { id: 'coffee', name: zh('旧时光咖啡馆'), category: zh('百年洋楼里的咖啡馆'), contact: '13800000001', status: 'active', routeId: 'art', note: zh('下午3点窗边阳光最好。') },
    { id: 'craft', name: zh('有光手作所'), category: zh('把海风做成纪念品'), contact: '13800000002', status: 'active', routeId: 'art', note: zh('可预约 60 分钟手作体验。') },
    { id: 'dining', name: zh('海边小馆'), category: zh('看完日落再吃饭'), contact: '13800000003', status: 'active', routeId: 'food', note: zh('每天按渔获更新菜单。') }
  ],
  routes: [
    { id: 'art', title: zh('文艺漫游线'), duration: zh('3.5 小时'), status: 'active', stops: 4 },
    { id: 'love', title: zh('恋人取景线'), duration: zh('2.5 小时'), status: 'active', stops: 3 },
    { id: 'food', title: zh('岛味寻鲜线'), duration: zh('4 小时'), status: 'active', stops: 5 },
    { id: 'family', title: zh('亲子轻松线'), duration: zh('3 小时'), status: 'active', stops: 4 }
  ],
  offers: [
    { id: 'offer-coffee', merchantId: 'coffee', routeId: 'art', title: zh('下午茶路线专享'), price: 58, originalPrice: 68, active: true, quota: 80 },
    { id: 'offer-craft', merchantId: 'craft', routeId: 'art', title: zh('手作体验九折'), price: 108, originalPrice: 120, active: true, quota: 40 },
    { id: 'offer-dining', merchantId: 'dining', routeId: 'food', title: zh('海景双人餐'), price: 168, originalPrice: 198, active: true, quota: 50 }
  ],
  coupons: [],
  visits: 1286,
  navigationClicks: 314
}

const clone = (item) => JSON.parse(JSON.stringify(item))
export function getOperations() {
  try {
    const stored = JSON.parse(localStorage.getItem(OPS_STORAGE_KEY))
    if (stored?.version === 1) { let dirty=false; stored.merchants=stored.merchants.map((m)=>{ if(!('accessStatus' in m)){ dirty=true; return {...m,accessStatus:m.id==='coffee'?'approved':'pending',accessToken:m.id==='coffee'?'gyl-9r7m-coffee':''} } return m }); if(dirty)localStorage.setItem(OPS_STORAGE_KEY,JSON.stringify(stored)); return stored }
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
  if (!offer) throw new Error('当前没有可领取的优惠。')
  const coupon = { id: `coupon-${Date.now()}`, code: couponCode(), phone, visitor, offerId: offer.id, merchantId: offer.merchantId, status: 'active', createdAt: new Date().toISOString(), redeemedAt: null }
  data.coupons.unshift(coupon)
  saveOperations(data)
  return { coupon, offer }
}
export function redeemCoupon(code) {
  const data = getOperations()
  const coupon = data.coupons.find((item) => item.code.trim().toUpperCase() === code.trim().toUpperCase())
  if (!coupon) return { ok: false, reason: '未找到这个优惠码。' }
  if (coupon.status === 'redeemed') return { ok: false, reason: '该优惠码已于之前核销。', coupon }
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
  const merchant = { id, name: input.name, category: input.category || '特色岛上小店', contact: input.contact || '', status: 'active', routeId: input.routeId || data.routes[0]?.id || '', note: input.note || '' }
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
  const route = { id, title: input.title, duration: input.duration || '待定', stops: Number(input.stops || 0), status: 'active' }
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

export function makeMerchantAccessToken(merchantId) { const data=getOperations(); const merchant=data.merchants.find((item)=>item.id===merchantId); if(!merchant) return null; merchant.accessStatus='approved'; merchant.accessToken=`gyl-${Math.random().toString(36).slice(2,8)}-${String(Date.now()).slice(-5)}`; saveOperations(data); return merchant.accessToken }
export function revokeMerchantAccess(merchantId) { return updateMerchant(merchantId,{accessStatus:'pending',accessToken:''}) }
export function findMerchantByAccessToken(token) { const data=getOperations(); return data.merchants.find((item)=>item.accessStatus==='approved' && item.accessToken===token) || null }
