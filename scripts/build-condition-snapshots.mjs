// ESM only. Run with: node scripts/build-condition-snapshots.mjs --out public --sitemap
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// ---------- CONFIG ----------
const META = {
  author: { name: "Dr Dhivakaran R", lastReviewed: "2025-08-29" },
  site: {
    name: "Noble Dental",
    baseUrl: "https://nobledentalnallagandla.in" // ✅ your real domain
  }
};

// Optional: list localized city landing pages to include in sitemap (edit or leave empty)
const CITY_PAGES = [
  // `${META.site.baseUrl}/en-in/chennai/`,
  // `${META.site.baseUrl}/en-in/coimbatore/`
];

// ---------- DATA IMPORT (one source of truth) ----------
// Make sure shared/ndn-data.mjs exports: KB, EXPLAINERS, KB_TO_EX, TREATMENTS
import { KB, EXPLAINERS, KB_TO_EX, TREATMENTS } from "../shared/ndn-data.mjs";

// ---------- CLI ARGS ----------
const argv = process.argv.slice(2);
const OUT_ROOT = argValue("--out") || "snapshots";  // default output folder
const MAKE_SITEMAP = argv.includes("--sitemap");

// ---------- UTILS ----------
function argValue(flag) {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : null;
}
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const ensureDir = p => fs.mkdirSync(p, { recursive: true });

// ---------- TEMPLATES ----------
function htmlForCondition(cond) {
  const exId = KB_TO_EX[cond.id];
  const ex = exId && EXPLAINERS[exId] ? EXPLAINERS[exId] : null;

  const title = `${cond.name} | ${META.site.name}`;
  const summary = ex?.summary || `Information about ${cond.name} from ${META.site.name}.`;

  // JSON-LD: MedicalCondition
  const ldCondition = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": cond.name,
    "description": summary,
    "signOrSymptom": ex?.points?.slice(0, 3) || [],
    "possibleTreatment": (cond.outcomes || []).slice(0, 3),
    "author": { "@type": "Person", "name": META.author.name }
  };

  // JSON-LD: FAQPage (simple)
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${cond.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": summary }
      },
      {
        "@type": "Question",
        "name": `When should I see a dentist for ${cond.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": (ex?.when || []).join(" ") || "Seek professional advice if symptoms persist or worsen." }
      },
      {
        "@type": "Question",
        "name": `What not to do for ${cond.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": (ex?.donts || []).join(" ") || "Avoid self-medication." }
      }
    ]
  };

  const canonical = `${META.site.baseUrl}/conditions/${slug(cond.name)}/`;

  // Build recommended treatments list (title + desc from TREATMENTS)
  const recTreatments = (cond.treatments || [])
    .map(key => {
      const t = TREATMENTS[key];
      if (!t) return null;
      return `<li><strong>${esc(t.title)}</strong> — ${esc(t.desc)}</li>`;
    })
    .filter(Boolean)
    .join("");

  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(summary)}">
  <link rel="canonical" href="${canonical}">
  <style>
    body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#0a0f1a;color:#e6eefc;margin:0}
    .wrap{max-width:880px;margin:0 auto;padding:24px}
    .card{background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px;margin:14px 0}
    h1,h2,h3{margin:.4rem 0}
    ul{margin:.3rem 0 0 1.1rem}
    .muted{color:#9fb0d7}
    a{color:#a5b4fc}
  </style>
  <script type="application/ld+json">${JSON.stringify(ldCondition)}</script>
  <script type="application/ld+json">${JSON.stringify(faq)}</script>
</head>
<body>
  <div class="wrap">
    <header class="card">
      <h1>${esc(cond.name)}</h1>
      <p class="muted">${esc(summary)}</p>
      <p class="muted">by <strong>${esc(META.author.name)}</strong> · Last reviewed: ${esc(META.author.lastReviewed)}</p>
      <p><a href="${esc(META.site.baseUrl)}">← Back to ${esc(META.site.name)}</a></p>
    </header>

    ${section("Key points", (EXPLAINERS[exId]?.points || []))}
    ${section("Possible causes (not a diagnosis)", (cond.causes || []))}
    ${section("Investigations", (cond.investigations || []))}
    ${section("Home care (authorised)", [
      "Use medications only as prescribed by a doctor; do not self-medicate antibiotics or analgesics without advice.",
      ...(cond.home || [])
    ])}
    ${section("Likely treatment outcomes", (cond.outcomes || []))}
    ${sectionHTML("Recommended professional treatments",
      recTreatments || "<li>Your dentist will advise the safest, evidence-based option after examination.</li>"
    )}
  </div>
</body>
</html>`;
}

function section(title, items) {
  return `
  <section class="card">
    <h2>${esc(title)}</h2>
    <ul>${(items || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>
  </section>`;
}
function sectionHTML(title, htmlListItems) {
  return `
  <section class="card">
    <h2>${esc(title)}</h2>
    <ul>${htmlListItems}</ul>
  </section>`;
}

// ---------- WRITE FILES ----------
function writeConditionPage(outRoot, cond) {
  const s = slug(cond.name);
  const dir = path.resolve(outRoot, "conditions", s);
  ensureDir(dir);
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, htmlForCondition(cond), "utf8");
  return `${META.site.baseUrl}/conditions/${s}/`;
}

// ---------- SITEMAP ----------
function buildSitemap(urls) {
  const now = new Date().toISOString();
  const body = urls.map(u => `
  <url>
    <loc>${esc(u)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${body}
</urlset>`;
}

// ---------- MAIN ----------
(async function main(){
  if (!Array.isArray(KB) || !KB.length) {
    console.error("⚠️  KB is empty. Ensure shared/ndn-data.mjs exports KB / EXPLAINERS / KB_TO_EX / TREATMENTS.");
    process.exit(1);
  }

  const outRootAbs = path.resolve(__dirname, "..", OUT_ROOT);
  ensureDir(outRootAbs);

  const urls = [];
  for (const cond of KB) {
    const url = writeConditionPage(outRootAbs, cond);
    urls.push(url);
    console.log("✓", url);
  }

  if (MAKE_SITEMAP) {
    const all = [...urls, ...CITY_PAGES];
    const sm = buildSitemap(all);
    const smPath = path.join(outRootAbs, "sitemap.xml");
    fs.writeFileSync(smPath, sm, "utf8");
    console.log("✓ sitemap:", smPath);
  }

  console.log(`Done. Files written to: ${outRootAbs}`);
})();
