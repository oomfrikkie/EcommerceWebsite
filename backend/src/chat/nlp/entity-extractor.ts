/**
 * Entity extraction: once the classifier knows *what* the user wants
 * (the intent), these helpers pull the *specifics* out of the raw message —
 * the order number, or the product they're searching for.
 *
 * This is rule-based on purpose: entities like IDs and product keywords are
 * better handled by targeted patterns than by the statistical classifier.
 */

/**
 * Find an order number. Prefers a number that follows an order-ish keyword
 * (e.g. "order 123", "#45", "number 9"); otherwise falls back to the first
 * standalone number in the message.
 */
export function extractOrderId(message: string): number | null {
  const keyworded = message.match(/(?:order|number|no\.?|#)\s*#?\s*(\d+)/i);
  if (keyworded) return parseInt(keyworded[1], 10);

  const anyNumber = message.match(/\b(\d+)\b/);
  if (anyNumber) return parseInt(anyNumber[1], 10);

  return null;
}

/**
 * Words that signal a product search but aren't themselves the product.
 * Stripping them leaves the actual search term: "do you sell red shoes" -> "red shoes".
 */
const SEARCH_STOPWORDS = new Set([
  'do', 'you', 'sell', 'have', 'has', 'any', 'a', 'an', 'the', 'some',
  'i', 'am', 'im', 'looking', 'for', 'want', 'need', 'to', 'buy', 'get',
  'show', 'me', 'find', 'search', 'are', 'there', 'carry', 'stock',
  'your', 'product', 'products', 'please', 'what', 'is', 'in', 'of', 'and',
]);

/**
 * Strip search-trigger words and leave the candidate product term.
 * Returns null when nothing meaningful remains (e.g. "what do you sell"),
 * which the caller treats as "show a general selection / ask for specifics".
 */
export function extractProductTerm(message: string): string | null {
  const term = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !SEARCH_STOPWORDS.has(w))
    .join(' ')
    .trim();

  return term.length > 0 ? term : null;
}