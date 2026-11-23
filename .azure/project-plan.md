# ASU Shopping Flow Prototype

## Goal

Build a front-end-only React/Vite prototype that presents a simplified Amazon-style purchase journey, beginning at search and ending at a purchase confirmation. It must deploy to GitHub Pages and use hash routes so direct links and refreshes work on static hosting.

## Routes

- `/#/`: a small menu linking to the three variants.
- `/#/original`: the complete search-to-purchase flow.
- `/#/redesign`: initially the same flow and behavior as `original`.
- `/#/refined`: visible but disabled.

## User journey

1. **Search:** Start with `ASU shirt` in the search bar. Show non-functional filter controls, one or two sponsored products, detailed ASU products, and surface-level products from other schools.
2. **Item detail:** Show photos, selectable available variants, price, product details, and mock reviews. Links without a local destination return to the current page.
3. **Cart:** Support adding/removing items and changing quantities. Persist cart data locally so navigation and refresh retain it.
4. **Shipping and payment:** Collect mock shipping/payment form data, validate required fields, and clearly state that no real order/payment is processed.
5. **Success:** Confirm completion and provide a way to return to search.

## Catalog and assets

- Keep shared catalog data in JSON under `public/shop-data/`.
- Include ASU tees, hoodies, and quarter-zips in maroon, black, gold, and white where each style is offered; make some style/color combinations unavailable.
- Include at least one single-variant, surface-level product for another school.
- Store local product images under `public/product-imgs/` and reference them from the JSON.

## Implementation

- React, TypeScript, and Vite, with client-side hash routing for GitHub Pages compatibility.
- Keep independent flow implementations in `src/original/OriginalApp.tsx` and `src/redesign/RedesignApp.tsx`; share only catalog data and types from `src/shared`.
- Configure Vite for deployment under a GitHub Pages repository subpath.
- Use local state/storage only; no backend, real order submission, or payment processing.

## Acceptance checks

- The root menu opens each enabled variant; `refined` cannot be opened.
- Search, product options, cart, checkout, and success work end-to-end in both enabled variants.
- Cart contents persist after refresh.
  - An option on the root menu exists to clear the shopping cart.
- Catalog JSON and referenced images load from the deployed static base path.
- Build succeeds for static deployment.
