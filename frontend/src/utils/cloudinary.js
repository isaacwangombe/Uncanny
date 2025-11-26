export function optimizeImage(url, width = 600) {
  if (!url || !url.includes("/upload/")) return url;

  return url.replace("/upload/", `/upload/w_${width},q_auto:good,f_auto/`);
}
