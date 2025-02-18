# UtahJS SLC demo
Interactive demo for my 2/18/2025 presentation, "Things I Wish Someone Told Me About Earlier", introducing an audience of junior web developers to some concepts that aren't generally taught as basics, but should be.
- Typescript isn't a language
- You don't need a library to serve a website
- You don't need a library to use APIs
- Beware XSS

This app contains multiple intentional vulnerabilities. See if you can exploit them!
## setup
- Create a file named `pfx.mjs` that exports your TLS credentials as a string
- Run `npm install`
## use
1. Run `node --run run`
1. Open https://localhost