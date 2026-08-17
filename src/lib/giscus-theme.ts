/**
 * The giscus widget's stylesheet, inlined as a string.
 *
 * ## Why a string and not a file in `public/`
 *
 * It was a file, and it silently did nothing. giscus renders in an
 * `https://giscus.app` iframe and loads its theme from there, so a
 * `http://localhost:3003/giscus.css` URL is **blocked mixed content** —
 * and stylesheets are in the always-blocked category, not the
 * warn-and-allow one. The theme never loaded in dev, so the overrides never
 * applied and the widget looked untouched.
 *
 * Pointing at the production https URL fixes that, but only after a deploy:
 * you could never see a theme change before shipping it.
 *
 * A `data:` URL has neither problem. It isn't mixed content, needs no host,
 * and behaves identically in dev and production. giscus passes `data-theme`
 * straight through as the stylesheet href with no validation at all — see
 * `getThemeUrl` in their `lib/utils.ts` — so this is supported by
 * construction rather than by accident.
 *
 * ## What it is
 *
 * giscus's own `transparent_dark` theme inlined, then the overrides. It
 * **replaces** the theme rather than extending one, which is why the entire
 * palette has to be here: drop it and the widget renders unstyled. To
 * refresh, refetch https://giscus.app/themes/transparent_dark.css and
 * re-append the override block at the bottom.
 *
 * Backticks in the comments below are escaped because this is a template
 * literal.
 */
export const GISCUS_THEME_CSS = `/*! Modified from GitHub's dark theme in primer/primitives.
 * MIT License
 * Copyright (c) 2018 GitHub Inc.
 * https://github.com/primer/primitives/blob/main/LICENSE
 */main{--color-prettylights-syntax-comment:#8b949e;--color-prettylights-syntax-constant:#79c0ff;--color-prettylights-syntax-entity:#d2a8ff;--color-prettylights-syntax-storage-modifier-import:#c9d1d9;--color-prettylights-syntax-entity-tag:#7ee787;--color-prettylights-syntax-keyword:#ff7b72;--color-prettylights-syntax-string:#a5d6ff;--color-prettylights-syntax-variable:#ffa657;--color-prettylights-syntax-brackethighlighter-unmatched:#f85149;--color-prettylights-syntax-invalid-illegal-text:#f0f6fc;--color-prettylights-syntax-invalid-illegal-bg:#8e1519;--color-prettylights-syntax-carriage-return-text:#f0f6fc;--color-prettylights-syntax-carriage-return-bg:#b62324;--color-prettylights-syntax-string-regexp:#7ee787;--color-prettylights-syntax-markup-list:#f2cc60;--color-prettylights-syntax-markup-heading:#1f6feb;--color-prettylights-syntax-markup-italic:#c9d1d9;--color-prettylights-syntax-markup-bold:#c9d1d9;--color-prettylights-syntax-markup-deleted-text:#ffdcd7;--color-prettylights-syntax-markup-deleted-bg:#67060c;--color-prettylights-syntax-markup-inserted-text:#aff5b4;--color-prettylights-syntax-markup-inserted-bg:#033a16;--color-prettylights-syntax-markup-changed-text:#ffdfb6;--color-prettylights-syntax-markup-changed-bg:#5a1e02;--color-prettylights-syntax-markup-ignored-text:#c9d1d9;--color-prettylights-syntax-markup-ignored-bg:#1158c7;--color-prettylights-syntax-meta-diff-range:#d2a8ff;--color-prettylights-syntax-brackethighlighter-angle:#8b949e;--color-prettylights-syntax-sublimelinter-gutter-mark:#484f58;--color-prettylights-syntax-constant-other-reference-link:#a5d6ff;--color-btn-text:#c9d1d9;--color-btn-bg:#2d333bcc;--color-btn-border:#f0f6fc1a;--color-btn-shadow:0 0 #0000;--color-btn-inset-shadow:0 0 #0000;--color-btn-hover-bg:#2d333b80;--color-btn-hover-border:#8b949e;--color-btn-active-bg:#282e3380;--color-btn-active-border:#6e7681;--color-btn-selected-bg:#2d333b80;--color-btn-primary-text:#fff;--color-btn-primary-bg:#238636;--color-btn-primary-border:#f0f6fc1a;--color-btn-primary-shadow:0 0 #0000;--color-btn-primary-inset-shadow:0 0 #0000;--color-btn-primary-hover-bg:#2ea043;--color-btn-primary-hover-border:#f0f6fc1a;--color-btn-primary-selected-bg:#238636;--color-btn-primary-selected-shadow:0 0 #0000;--color-btn-primary-disabled-text:#f0f6fc80;--color-btn-primary-disabled-bg:#23863699;--color-btn-primary-disabled-border:#f0f6fc1a;--color-action-list-item-default-hover-bg:#909dab1f;--color-segmented-control-bg:#636e7b1a;--color-segmented-control-button-bg:#0000;--color-segmented-control-button-selected-border:#636e7b;--color-fg-default:#c9d1d9;--color-fg-muted:#8b949e;--color-fg-subtle:#484f58;--color-canvas-default:#0000;--color-canvas-overlay:#161b22e6;--color-canvas-inset:#0000;--color-canvas-subtle:#0000;--color-border-default:#30363d;--color-border-muted:#21262d;--color-neutral-muted:#6e76810d;--color-neutral-subtle:#6e76811a;--color-accent-fg:#58a6ff;--color-accent-emphasis:#1f6feb;--color-accent-muted:#388bfd66;--color-accent-subtle:#4184e41a;--color-success-fg:#3fb950;--color-attention-fg:#c69026;--color-attention-muted:#ae7c1466;--color-attention-subtle:#ae7c1426;--color-danger-fg:#f85149;--color-danger-muted:#e5534b66;--color-danger-subtle:#e5534b1a;--color-primer-shadow-inset:0 0 #0000;--color-scale-gray-7:#21262d;--color-scale-blue-8:#0c2d6b;

  /*! Extensions from @primer/css/alerts/flash.scss */--color-social-reaction-bg-hover:var(--color-scale-gray-7);--color-social-reaction-bg-reacted-hover:var(--color-scale-blue-8)}main .pagination-loader-container{background-image:url(https://github.com/images/modules/pulls/progressive-disclosure-line-dark.svg)}.gsc-pagination-button{background-color:var(--color-btn-bg)}.gsc-homepage-bg{animation:gradient 21s ease infinite;background:linear-gradient(135deg,#05485c,#032e58,#2f0154);background-size:600% 600%}@keyframes gradient{0%{background-position:2% 0}50%{background-position:99% 100%}to{background-position:2% 0}}main .gsc-loading-image{background-image:url(https://github.githubassets.com/images/mona-loading-dark.gif)}

/* ------------------------------------------------------------------ *
 * Overrides. Everything above is giscus's own theme, untouched.
 * ------------------------------------------------------------------ */

/*
 * Reactions to the bottom.
 *
 * giscus renders \`.gsc-reactions\` as the first child of \`.gsc-main\`, above
 * the comment count and the box. Reordering is the one structural change CSS
 * can make from outside the iframe — the DOM isn't reachable, but flex order
 * is. \`.gsc-main\` isn't a flex container by default, hence declaring it here.
 *
 * Explicit orders on both children rather than one: an unordered flex item
 * defaults to 0 and would sort ahead of anything positive, so setting only
 * the reactions would work by accident and break the moment giscus added a
 * third child.
 */
.gsc-main {
  display: flex;
  flex-direction: column;
}

.gsc-comments {
  order: 1;
}

.gsc-reactions {
  order: 2;
  /* It's a footer now, so it wants space above it rather than below. */
  margin-top: 1.25rem;
  margin-bottom: 0;
}

/*
 * "Powered by giscus".
 *
 * It has no class of its own — it's a bare \`<em>\` inside \`.gsc-left-header\`,
 * next to the comment and reply counts, which are \`<h4>\`s. So the element
 * type is the only handle, and it's specific enough: nothing else in that
 * header is emphasised text.
 */
.gsc-left-header > em {
  display: none;
}
`;
