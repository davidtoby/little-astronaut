'use strict';
const astroI18n = (() => {
  const translations = window.ASTRO_TRANSLATIONS;
  let language = 'zh';
  try { if (localStorage.getItem('astro-language') === 'en') language = 'en'; } catch (_) {}
  const textNodes = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/[\u3400-\u9fff]/.test(node.nodeValue) && !node.parentElement.closest('script,style')) {
      textNodes.push({ node, original: node.nodeValue });
    }
  }
  const attributes = [];
  document.querySelectorAll('[aria-label],[title]').forEach(element => {
    for (const name of ['aria-label', 'title']) {
      const original = element.getAttribute(name);
      if (original && /[\u3400-\u9fff]/.test(original)) attributes.push({ element, name, original });
    }
  });
  function translate(value, variables = {}) {
    let result = language === 'en' ? translations[value] ?? value : value;
    for (const [name, replacement] of Object.entries(variables)) result = result.replaceAll(`{${name}}`, replacement);
    return result;
  }
  function apply() {
    document.documentElement.lang = language === 'en' ? 'en-GB' : 'zh-CN';
    textNodes.forEach(({ node, original }) => {
      if (node.isConnected) node.nodeValue = original.replace(original.trim(), translate(original.trim()));
    });
    attributes.forEach(({ element, name, original }) => {
      if (element.isConnected) element.setAttribute(name, translate(original));
    });
    document.getElementById('language').value = language;
  }
  function setLanguage(value) {
    if (!['zh', 'en'].includes(value) || value === language) return;
    language = value;
    try { localStorage.setItem('astro-language', value); } catch (_) {}
    apply();
    document.dispatchEvent(new CustomEvent('astro-language-change'));
  }
  document.getElementById('language').onchange = event => setLanguage(event.target.value);
  apply();
  return { translate, setLanguage, apply, get language() { return language; } };
})();
function t(value, variables) { return astroI18n.translate(value, variables); }
