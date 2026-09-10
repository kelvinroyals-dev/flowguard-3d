# FlowGuard Interactive Demo (demo.flowguardsolutions.com.ng)

A branded wrapper page that hosts the 3D estate render in a full-screen iframe,
plus the render itself. Deploys as its own Netlify site on the `demo.flowguardsolutions.com.ng`
subdomain. The marketing site's "See How It Works" button links here.

## Layout
    index.html        ← branded wrapper (FlowGuard header + full-screen iframe)
    fg-logo-dark.png ← logo used in the wrapper header
    netlify.toml      ← headers / CSP tuned for a WebGL build
    render/           ← YOUR 3D render goes here (render/index.html must exist)

## 1. Add the render
Unzip your 3D render into `render/` so `render/index.html` exists (see
`render/PUT-RENDER-HERE.md`), then delete that placeholder.

## 2. Deploy to Netlify (new site)
    cd flowguard-demo
    git init && git add -A && git commit -m "FlowGuard interactive demo"
    # create a new GitHub repo (e.g. flowguard-demo) and push:
    git remote add origin https://github.com/kelvinroyals-dev/flowguard-demo.git
    git branch -M main && git push -u origin main
Then in Netlify: **Add new site → Import from Git → flowguard-demo** (build
command: none, publish dir: `.`).

Or drag-and-drop this folder onto Netlify (Sites → deploy manually).

## 3. Point the subdomain
- Netlify site → **Domain settings → Add custom domain → `demo.flowguardsolutions.com.ng`**.
- At your DNS host, add the record Netlify shows — typically a **CNAME**
  `demo` → `<your-site>.netlify.app` (Netlify DNS uses a NETLIFY alias instead).
- Netlify provisions the TLS certificate automatically once DNS resolves.

## 4. It's already linked
The marketing homepage "See How It Works" button now points to
`https://demo.flowguardsolutions.com.ng`, so once the subdomain is live the flow works.

## Notes
- The CSP in `netlify.toml` is deliberately permissive so the third-party render
  runs unmodified. If the render fails to load, check the browser console — a
  blocked resource means a domain needs adding to the CSP. Tell me the console
  error and I'll tighten/adjust it precisely.
- The wrapper shows a loading spinner until the iframe fires `load`, with a 20s
  safety timeout so a visitor is never stuck behind it.
