# Desktop UI localization

The desktop defaults to `zh-CN` and supports `en`. The Rust application
preferences own persistence. The entry point loads that preference before
mounting React; the Appearance settings pane saves it before calling `setLocale`.

- Add semantic keys to both `en.ts` and `zh-CN.ts`. Keep interpolation names identical.
- Use `t(key, parameters)` for copy and `useLocale()` in mounted components that
  consume it. Language changes update subscribers without changing React keys.
- Use `localize` at presentation boundaries for existing English metadata. For
  ambiguous words, use a contextual key, such as `shapes.star`.
- Keep model IDs, enum values, keybindings, prompt references and user content
  unchanged. Some legacy prompt pickers also use English option labels as values;
  their popover renders translations while the original option object stays intact.
- Avoid translating at module initialization or caching the resulting string in
  a memo without the current locale. Presentation getters can resolve it when read.

From `frontend`, run `node tools/testing/localization-audit.mjs` and
`npm run test:localization`. The browser and native smoke scripts accept an
`ARTCRAFT_LOCALIZATION_OUTPUT` directory outside the repository for screenshots.
