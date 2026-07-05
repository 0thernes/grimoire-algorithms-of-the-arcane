async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const runtimeUrls = performance.getEntriesByType('resource').map(entry => entry.name);
    const externalRuntimeUrls = runtimeUrls.filter(url => /^https?:\/\//.test(url) && !url.startsWith(location.origin + '/'));
    const rootRelativeAttrs = [...document.querySelectorAll('[src], [href]')]
      .map(node => ({
        tag: node.tagName.toLowerCase(),
        attr: node.getAttribute('src') || node.getAttribute('href') || ''
      }))
      .filter(item => item.attr.startsWith('/'));
    const httpAttrs = [...document.querySelectorAll('[src], [href]')]
      .map(node => ({
        tag: node.tagName.toLowerCase(),
        attr: node.getAttribute('src') || node.getAttribute('href') || ''
      }))
      .filter(item => /^https?:\/\//.test(item.attr));
    return {
      generatedAt: new Date().toISOString(),
      url: location.href,
      resourceCount: runtimeUrls.length,
      runtimeUrls,
      externalRuntimeUrls,
      httpAttrs,
      rootRelativeAttrs,
      issues: []
    };
  });

  if (result.externalRuntimeUrls.length) result.issues.push('external runtime resource requests found');
  if (result.httpAttrs.length) result.issues.push('http(s) asset/link attributes found in runtime document');
  if (result.rootRelativeAttrs.length) result.issues.push('root-relative asset paths found');
  return JSON.stringify(result, null, 2);
}
