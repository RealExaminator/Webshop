const MOCK_IMAGES = [
  { test: /tote|shopper|\bbag\b/i, src: '/mock-products/mock-tote.jpg' },
  { test: /mug|\bcup\b/i, src: '/mock-products/mock-mug.jpg' },
  { test: /sneaker|trainer|\bshoe/i, src: '/mock-products/mock-sneakers.jpg' },
  { test: /lamp|\blight\b/i, src: '/mock-products/mock-lamp.jpg' },
  { test: /headphone/i, src: '/mock-products/mock-headphones.jpg' },
  { test: /plant|greenery/i, src: '/mock-products/mock-plant.jpg' },
  { test: /watch/i, src: '/mock-products/mock-watch.jpg' },
  { test: /book|journal|hardcover|notebook/i, src: '/mock-products/mock-book.jpg' },
];

const FALLBACK_IMAGES = MOCK_IMAGES.map((entry) => entry.src);

export function itemImage(item) {
  const title = String(item?.title || '');
  const match = MOCK_IMAGES.find((entry) => entry.test.test(title));
  if (match) return match.src;

  const key = String(item?.id ?? (title || 'item'));
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}
