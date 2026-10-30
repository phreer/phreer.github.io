# phreer.github.io

It is my personal blog greatly inspired by the jekyll theme [Type-on-Strap](https://github.com/sylhare/Type-on-Strap).

I like the simpleness of Type-on-Strap and have adapted it to a Chinese Language, anyone like it can fork this repository and modify it with MIT lisense.

## Theme

The site uses a compact journal layout with a neutral paper background, teal
accents, serif reading typography, and matching dark colors. Homepage entries
keep their full titles and show at most two lines of excerpt; the full article
content is unchanged.

The appearance selector offers **System**, **Light**, and **Dark** (shown in
Chinese on the site). First visits follow the operating system. An explicit
choice is saved in `localStorage` under `phreer-color-mode`; selecting System
removes that override. If storage is unavailable, the current page still
switches and displays a persistence warning. Without JavaScript, CSS follows
the system appearance.

Articles with at least two h2/h3 headings have a sticky desktop table of
contents. At widths up to 768px it moves above the article and is initially
collapsed. Heading anchors, previous/next links, tags, search, and RSS remain
available. Images and third-party embeds are not forcibly inverted.

### Customizing the design

- [Theme colors](_sass/base/_themes.scss): semantic light/dark colors, including
  code highlighting.
- [Typography defaults](_sass/base/_variables.scss) and
  [global styles](_sass/base/_global.scss): font stacks and shared elements.
- [Homepage styles](_sass/layouts/_index.scss): 12px entry padding, 21px titles,
  and two-line excerpts.
- [Article styles](_sass/layouts/_posts.scss): reading width and table of contents.
- [Site settings](_config.yml): navigation labels, appearance labels, feature
  flags, the original introduction, and footer text.
- [Appearance script](assets/js/theme.js): runs before the main stylesheet to
  apply the stored preference without a light-mode flash. Navigation loads
  [navbar.js](assets/js/navbar.js) directly; no JavaScript bundling step is needed.

Noto Serif SC is self-hosted using the existing variable-font subsets from
`@fontsource-variable/noto-serif-sc` 5.3.1. The font is licensed under
[SIL Open Font License 1.1](assets/fonts/noto-serif-sc/OFL.txt). The
[font declarations](_sass/base/_fonts.scss) retain `unicode-range` and
`font-display: swap`: browsers request needed subsets while system serif fonts
remain readable during loading. Keep the license with the font files. External
Google Fonts loading is disabled by default.

## Local development

Use Ruby 3.3, matching the existing GitHub Pages workflow, and install the locked
gems:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/`. To check the production build:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

For theme changes, check both appearances at desktop and mobile widths, search
results and empty states, long code/formulas, keyboard navigation, and the
collapsible directory. The existing MathJax CDN and Disqus integration depend
on external services; distinguish their network failures from local theme
errors.
