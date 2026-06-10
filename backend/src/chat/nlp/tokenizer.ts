/**
 * Turns a raw message into a normalized list of tokens.
 *
 * The classifier only ever sees the output of this function — both during
 * training and at prediction time — so the exact rules here don't need to
 * produce "real" words, they just need to be applied *consistently*. That's
 * why the stemming below is deliberately crude: "shipped" and "shipping" both
 * collapse to "ship", which lets the model treat them as the same signal.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // replace anything that isn't a letter or digit with a space
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(stem);
}

/**
 * A tiny suffix-stripping stemmer. Only strips when the remaining word stays
 * long enough to still be meaningful, so we don't mangle short words.
 */
function stem(word: string): string {
  if (word.length <= 3) return word;

  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}