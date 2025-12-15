---
applyTo: '**'
---
For different projects, use different urls but essentially for deployment

Deployment
Platform: GitHub Pages
URL: https://fddvisuals.github.io/nuclear-flowchart/
Workflow: .github/workflows/deploy.yml (auto-deploys on push to main)
Important: vite.config.ts must have base: '/nuclear-flowchart/' for GitHub Pages