/**
 * 根据ua判断是否是微信
 * @param ua
 * @returns
 */
export function isWechat(ua: string) {
  return ua.toLowerCase().includes("micromessenger");
}
