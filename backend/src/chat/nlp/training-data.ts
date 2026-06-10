/**
 * The training set for the mini AI.
 *
 * Each intent has a list of example phrases a real user might type. The
 * Naive Bayes classifier learns, from word frequencies across these examples,
 * which words are evidence for which intent — so it can then classify *new*
 * phrasings it has never seen ("where's my package?" -> order_status) without
 * any of them being hard-coded.
 *
 * To make the bot smarter, add more (and more varied) examples here. More data
 * = better generalization. This is the one file you'll tune the most.
 */

export type Intent =
  | 'order_status'
  | 'my_orders'
  | 'product_search'
  | 'greeting'
  | 'goodbye'
  | 'thanks'
  | 'help';

export interface TrainingExample {
  text: string;
  intent: Intent;
}

export const TRAINING_DATA: TrainingExample[] = [
  // --- order_status: asking about one specific order ---
  { text: 'what is the status of order 123', intent: 'order_status' },
  { text: 'where is my order 45', intent: 'order_status' },
  { text: 'track order number 88', intent: 'order_status' },
  { text: 'has order 12 shipped yet', intent: 'order_status' },
  { text: 'when will order 9 arrive', intent: 'order_status' },
  { text: 'did my package for order 200 ship', intent: 'order_status' },
  { text: 'status of order #56', intent: 'order_status' },
  { text: 'is order 77 delivered', intent: 'order_status' },
  { text: 'check order 33 for me', intent: 'order_status' },
  { text: 'order 101 update please', intent: 'order_status' },
  { text: 'where is my package', intent: 'order_status' },
  { text: 'has my stuff been sent', intent: 'order_status' },
  { text: 'is my delivery on the way', intent: 'order_status' },
  { text: 'i want to track my shipment', intent: 'order_status' },

  // --- my_orders: list of the logged-in user's orders ---
  { text: 'show me my orders', intent: 'my_orders' },
  { text: 'what orders do i have', intent: 'my_orders' },
  { text: 'list all my orders', intent: 'my_orders' },
  { text: 'my recent orders', intent: 'my_orders' },
  { text: 'show my order history', intent: 'my_orders' },
  { text: 'what have i ordered', intent: 'my_orders' },
  { text: 'see my purchases', intent: 'my_orders' },
  { text: 'all of my orders', intent: 'my_orders' },
  { text: 'do i have any orders', intent: 'my_orders' },
  { text: 'view my orders', intent: 'my_orders' },
  { text: 'show me everything i bought', intent: 'my_orders' },
  { text: 'what did i purchase', intent: 'my_orders' },
  { text: 'show me what i bought', intent: 'my_orders' },

  // --- product_search: looking for products in the catalog ---
  { text: 'do you sell headphones', intent: 'product_search' },
  { text: 'do you have any laptops', intent: 'product_search' },
  { text: 'i am looking for a phone', intent: 'product_search' },
  { text: 'show me your shoes', intent: 'product_search' },
  { text: 'what products do you have', intent: 'product_search' },
  { text: 'find me a watch', intent: 'product_search' },
  { text: 'search for a backpack', intent: 'product_search' },
  { text: 'i want to buy a camera', intent: 'product_search' },
  { text: 'are there any keyboards', intent: 'product_search' },
  { text: 'looking for a jacket', intent: 'product_search' },
  { text: 'what do you sell', intent: 'product_search' },
  { text: 'do you carry monitors', intent: 'product_search' },
  { text: 'show me products', intent: 'product_search' },
  { text: 'i need a charger', intent: 'product_search' },

  // --- greeting ---
  { text: 'hello', intent: 'greeting' },
  { text: 'hi there', intent: 'greeting' },
  { text: 'hey', intent: 'greeting' },
  { text: 'good morning', intent: 'greeting' },
  { text: 'good evening', intent: 'greeting' },
  { text: 'how are you', intent: 'greeting' },
  { text: 'hi can you help me', intent: 'greeting' },
  { text: 'hey there', intent: 'greeting' },
  { text: 'hello there', intent: 'greeting' },
  { text: 'yo', intent: 'greeting' },
  { text: 'hiya', intent: 'greeting' },

  // --- goodbye ---
  { text: 'bye', intent: 'goodbye' },
  { text: 'goodbye', intent: 'goodbye' },
  { text: 'see you later', intent: 'goodbye' },
  { text: 'see ya', intent: 'goodbye' },
  { text: 'catch you later', intent: 'goodbye' },
  { text: 'i am done', intent: 'goodbye' },

  // --- thanks ---
  { text: 'thank you', intent: 'thanks' },
  { text: 'thanks', intent: 'thanks' },
  { text: 'thanks a lot', intent: 'thanks' },
  { text: 'thank you so much', intent: 'thanks' },
  { text: 'appreciate it', intent: 'thanks' },
  { text: 'much appreciated', intent: 'thanks' },
  { text: 'cheers', intent: 'thanks' },

  // --- help: what can this bot do ---
  { text: 'what can you do', intent: 'help' },
  { text: 'help', intent: 'help' },
  { text: 'how does this work', intent: 'help' },
  { text: 'what can you help me with', intent: 'help' },
  { text: 'what are your features', intent: 'help' },
];