/**
 * 根据UA判断是否是移动端
 * @param ua 
 * @param options 
 * @returns 
 */
export function isMobile(ua, options) {
  options = options || {};
  if (!ua) return false;

  ua = ua.toLowerCase();
  var isIos = !!ua.match(/ip(?:ad|od|hone)/i);
  var isIpad = !!ua.match(/ipad/i);
  var isAndroid = !!ua.match(/(?:android|okhttp)/i);
  var isUcmobile = ua.match(/(ucbrowser|mobile|ucweb)/gi);
  var isWindowsPhone = ua.match(/(Windows Phone)/gi);
  var isMiPad = ua.match(/(MI PAD)/gi);

  return (
    (isIos || isAndroid || isUcmobile || isWindowsPhone) &&
    (!options.excludePad || (!isIpad && !isMiPad))
  );
}