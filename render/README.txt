FlowGuard estate demo — dedicated controls revision

Upload all contents of flowguard-website/ together to your demo site's web directory. Replace existing files and clear the site/browser cache. Keep assets/ and vendor/ beside index.html.

Local preview: in flowguard-website run python3 -m http.server 8000, then open http://localhost:8000. Do not double-click index.html.

Controls are in a dedicated left panel. The left rail opens/closes it and jumps to simulation, navigation, network or status. On mobile the panel starts collapsed. The panel resizes the scene; it does not cover it.

26 devices: 3 per residential street, 4 per side avenue, 2 on the entrance road, 2 at outfall access and 2 at the north boundary. Physical Sentinel devices use the supplied model. Click a device for readings in the left panel.

Floodwater extends from the channel over its lip into the street. Disconnected junction puddles were removed. Clear blockage simulates gradual recovery. All readings and flooding are illustrative simulations, not engineering predictions.

For embedding, allow fullscreen on the iframe and provide sufficient height, e.g. 85dvh. This package does not change your parent site's header.

Automated telemetry, interaction state, road coverage, sensor placement, spill continuity and document structure checks passed. Real Safari/Chrome touch, layout and WebGL performance testing remain unverified in this revision.
