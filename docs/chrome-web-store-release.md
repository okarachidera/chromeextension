# Chrome Web Store Release Checklist

## 1) Pre-release checks

1. Run `npm run check`.
2. Run `npm test`.
3. Run `npm run package`.

## 2) Store listing assets

Prepare the following:

- Extension name: `Lead Vault`
- Short description (<= 132 chars)
- Detailed description (features + privacy stance)
- At least 1 screenshot of the popup UI
- Optional promotional tile/video
- 128x128 icon (already present as `icon.png`)

## 3) Upload steps

1. Go to Chrome Web Store Developer Dashboard.
2. Create a new item.
3. Upload `dist/lead-vault-extension.zip`.
4. Fill listing metadata and screenshots.
5. Complete privacy and single-purpose declarations.
6. Submit for review.

## 4) Post-release

1. Add Web Store URL to `README.md`.
2. Add Web Store badge to portfolio page.
3. Track user feedback and ship patch releases.
