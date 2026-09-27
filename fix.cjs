const fs = require('fs');
let content = fs.readFileSync('app/(dashboard)/admin/page.jsx', 'utf8');
content = content.replace(/\{loading \? "\.\.\." : `[^$]*\$\{metrics\.gmvTotal/, '{loading ? "..." : `₹${metrics.gmvTotal');
fs.writeFileSync('app/(dashboard)/admin/page.jsx', content, 'utf8');
