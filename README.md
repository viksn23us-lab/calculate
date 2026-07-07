# Calculator

A mobile-first PWA calculator published with GitHub Pages and GitHub Actions.

## Local use

Install dependencies and build the app:

```powershell
npm ci
npm test
npm run build
```

The production files are written to `dist/`.

## GitHub Pages

After this repository is pushed to GitHub, Pages can serve the app at:

`https://viksn23us-lab.github.io/calculate/`

The repository uses GitHub Actions. In the repository settings, Pages must be set to:

- Source: `GitHub Actions`

The workflow builds the app and deploys the `dist/` artifact.
