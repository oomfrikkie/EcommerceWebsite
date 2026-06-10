import { tokenize } from './tokenizer';
import { TrainingExample, Intent } from './training-data';

export interface Prediction {
  intent: Intent;
  /** Normalized probability (0-1) that the message belongs to this intent. */
  confidence: number;
}

/**
 * A Multinomial Naive Bayes text classifier, written from scratch.
 *
 * The idea: for each intent, we learn how often each word appears in that
 * intent's training examples. To classify a new message, we ask "which intent
 * makes this exact bag of words most probable?" using Bayes' rule:
 *
 *     P(intent | words) ∝ P(intent) * Π P(word | intent)
 *
 * We work in log-space (adding log-probabilities) to avoid underflow from
 * multiplying many tiny numbers, then convert back with a softmax so the
 * scores read as a 0-1 confidence.
 */
export class NaiveBayesClassifier {
  /** Number of training docs per intent — used for the prior P(intent). */
  private readonly docCounts = new Map<Intent, number>();
  /** word -> intent -> how many times that word appears in the intent. */
  private readonly wordCounts = new Map<Intent, Map<string, number>>();
  /** Total token count per intent (denominator for P(word | intent)). */
  private readonly totalTokens = new Map<Intent, number>();
  /** Every distinct token seen across all training data. */
  private readonly vocabulary = new Set<string>();

  private intents: Intent[] = [];
  private totalDocs = 0;
  /**
   * Smoothing strength. A small fraction (rather than the textbook add-one)
   * keeps unseen words from zeroing out a class, while still letting the words
   * that *are* present dominate the score — important for short messages like
   * "thanks!" where a single token has to carry the decision.
   */
  private readonly alpha = 0.1;

  /** Learn the word statistics from the labeled examples. */
  train(examples: TrainingExample[]): void {
    for (const { text, intent } of examples) {
      this.docCounts.set(intent, (this.docCounts.get(intent) ?? 0) + 1);
      this.totalDocs++;

      if (!this.wordCounts.has(intent)) {
        this.wordCounts.set(intent, new Map());
        this.totalTokens.set(intent, 0);
      }
      const counts = this.wordCounts.get(intent)!;

      for (const token of tokenize(text)) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
        this.totalTokens.set(intent, this.totalTokens.get(intent)! + 1);
        this.vocabulary.add(token);
      }
    }

    this.intents = [...this.docCounts.keys()];
  }

  /**
   * Score a message against every intent and return them sorted best-first.
   * The top entry's `confidence` is what the caller compares to a threshold.
   */
  predict(text: string): Prediction[] {
    const tokens = tokenize(text);
    const vocabSize = this.vocabulary.size;

    // Compute an unnormalized log-probability for each intent.
    const logScores = this.intents.map((intent) => {
      const prior = this.docCounts.get(intent)! / this.totalDocs;
      let logProb = Math.log(prior);

      const counts = this.wordCounts.get(intent)!;
      const denom = this.totalTokens.get(intent)! + this.alpha * vocabSize;

      for (const token of tokens) {
        // Skip words never seen in *any* class — they carry no signal.
        if (!this.vocabulary.has(token)) continue;
        const wordCount = counts.get(token) ?? 0;
        logProb += Math.log((wordCount + this.alpha) / denom);
      }

      return { intent, logProb };
    });

    return this.softmax(logScores).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Convert raw log-scores into a probability distribution that sums to 1.
   * Subtracting the max first keeps the exponentials numerically stable.
   */
  private softmax(
    scores: { intent: Intent; logProb: number }[],
  ): Prediction[] {
    const max = Math.max(...scores.map((s) => s.logProb));
    const exps = scores.map((s) => Math.exp(s.logProb - max));
    const sum = exps.reduce((a, b) => a + b, 0);

    return scores.map((s, i) => ({
      intent: s.intent,
      confidence: exps[i] / sum,
    }));
  }
}