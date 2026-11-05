// Top nav. `children` render as a dropdown on desktop and a flat indented list on mobile;
// every child is a real <a> in the HTML so crawlers see all links on every page.
export const primaryNavLinks = [
  {
    href: '/games/tidy/', label: 'tidy', badge: 'new',
    children: [
      { href: '/tidy/', label: 'about tidy' },
      { href: '/games/tidy/', label: 'tidy (english)' },
      { href: '/games/tidy-es/', label: 'tidy en español' },
      { href: '/games/tidy-ja/', label: 'tidy 日本語 (romaji)' },
      { href: '/games/tidy-ms/', label: 'tidy bahasa melayu' },
      { href: '/games/tidy-zh/', label: 'tidy 简体中文 (pinyin)' }
    ]
  },
  { href: '/games/', label: 'games' },
  {
    href: '/learn-spanish/', label: 'learn',
    children: [
      { href: '/learn-spanish/', label: 'spanish typing practice' },
      { href: '/learn-japanese/', label: 'japanese typing practice' },
      { href: '/learn-chinese/', label: 'chinese typing practice' },
      { href: '/learn-malay/', label: 'malay typing game' },
      { href: '/type-accents/', label: 'type accents online' }
    ]
  },
  { href: '/blog/', label: 'blog' },
  { href: '/about/', label: 'about' }
];
