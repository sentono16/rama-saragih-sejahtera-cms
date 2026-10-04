export function cleanHtmlClientLink(value: string) {
  return (
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value) ||
    (/^\/(?!\/)/.test(value) && !/[\s\\]/.test(value))
  );
}
