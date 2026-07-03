# @merzsebastian/vue-components

A small collection of flexible Vue 3 components. First up: `BeforeAfterSlider`, an
accessible before/after image comparison slider (horizontal or vertical, touch +
keyboard support, click-to-move, custom handle/labels via slots).

📖 **[Component docs / Storybook](https://merzsebastian.github.io/vue-components/)**

## Install

This package is published to **GitHub Packages**, not npmjs.com. Every
consumer needs a GitHub personal access token with `read:packages` scope to
install it (their own free token — anyone can generate one at
[github.com/settings/tokens](https://github.com/settings/tokens), no special
access to this repo required, it's just how GitHub Packages' npm registry
works even for public packages).

Add to `.npmrc` (project-level or `~/.npmrc`):

```
@merzsebastian:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<YOUR_GITHUB_TOKEN>
```

Then:

```sh
npm install @merzsebastian/vue-components
```

```ts
import { BeforeAfterSlider } from '@merzsebastian/vue-components'
import '@merzsebastian/vue-components/style.css'
```

```vue
<BeforeAfterSlider before-src="/before.jpg" after-src="/after.jpg" before-label="Before" after-label="After" />
```

See the Storybook docs above for the full prop/slot/event reference and live examples
(orientation, `v-model`, auto-animate, custom handle, disabled, etc.).

## Development

This repo has no separate demo app — components are developed and documented
directly through Storybook.

```sh
npm install
npm run storybook    # http://localhost:6006
```

Other scripts:

| Script | Purpose |
| --- | --- |
| `npm run build:lib` | Build the publishable package into `dist/` |
| `npm run build-storybook` | Build the static Storybook site into `storybook-static/` |
| `npm run typecheck` | Type-check the whole project |

### Adding a new component

1. Create a folder under `src/components/<Name>` with `<Name>.vue` and an
   `index.ts` barrel (see `BeforeAfterSlider` for the pattern).
2. Add a `<Name>.stories.ts` next to it for Storybook.
3. Re-export it from `src/index.ts`.

Styling uses Tailwind utility classes; `src/tailwind.css` scans `src/components`
and is bundled into the single `dist/vue-components.css` shipped with the package.

## CI/CD

- **Storybook → GitHub Pages**: every push to `main` builds and deploys Storybook
  via `.github/workflows/storybook-pages.yml`. Enable Pages once in the repo
  settings (Settings → Pages → Source: GitHub Actions).
- **Publish to GitHub Packages**: publishing a GitHub Release triggers
  `.github/workflows/publish-npm.yml`, which builds and runs `npm publish`
  against `npm.pkg.github.com`. Uses the workflow's built-in `GITHUB_TOKEN`
  (already scoped with `packages: write` in the workflow) — no manual secret
  setup required.

To ship a new version: bump `version` in `package.json`, commit, then create a
GitHub Release (tag `vX.Y.Z`) — the publish workflow does the rest.
