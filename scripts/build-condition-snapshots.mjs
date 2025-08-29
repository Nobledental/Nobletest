// scripts/build-condition-snapshots.mjs
import fs from 'node:fs';
import path from 'node:path';

/* ================= Site / Author ================= */
const META = {
  author: { name: "Dr Dhivakaran R", lastReviewed: "2025-08-29" },
  site: {
    name: "Noble Dental",
    baseUrl: "https://nobledentalnallagandla.in" // ✅ your real domain
  }
};

/* ================= Bring in your data =================
   OPTION A: Import from a shared module you create (recommended)
   - Create: ./shared/ndn-data.mjs exporting: KB, EXPLAINERS, KB_TO_EX
   - Example exports:
       export const KB = [...];
       export const EXPLAINERS = {...};
       export const KB_TO_EX = {...};
*/
// import { KB, EXPLAINERS, KB_TO_EX } from '../shared/ndn-data.mjs';

/* OPTION B: Paste inline (quick start) — replace the [] and {} with your live data */
const KB = /* paste your KB array here */ [];
const EXPLAINERS = /* paste your EXPLAINERS map here */ {};
const KB_TO_EX = /* paste your KB_TO_EX map here */ {};

/* ================= Helpers ================= */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ================= Page builder ================= */
function pageForCondition(k){
  const exId = KB_TO_EX[k.id];
  const ex = exId && EXPLAINERS[exId] ? EXPLAINERS[exId] : null;

  const title = `${k.name} | ${META.site.name}`;
  const summary = ex?.summary || `Information about ${k.name} from ${META.site.name}.`;

  // JSON-LD
  const ldCondition = {
    "@context":"https://schema.org",
    "@type":"MedicalCondition",
    "name": k.name,
    "description": summary,
    "signOrSymptom": ex?.points?.slice(0,3) || [],
    "possibleTreatment": (k.outcomes || []).slice(0,3),
    "author": {"@type":"Person","name": META.author.name}
  };

  const faq = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":`What is ${k.name}?`,"acceptedAnswer":{"@type":"Answer","text": summary}},
      {"@type":"Question","name":`When should I see a dentist for ${k.name}?`,"acceptedAnswer":{"@type":"Answer","text": (ex?.when||[]).join(' ') || 'Seek professional advice if symptoms persist or worsen.'}},
      {"@type":"Question","name":`What not to do for ${k.name}?`,"acceptedAnswer":{"@type":"Answer","text": (ex?.donts||[]).join(' ') || 'Avoid self-medication.'}}
    ]
  };

  const canonical = `${META.site.baseUrl}/conditions/${slug(k.name)}/`;

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
      <h1>${esc(k.name)}</h1>
      <p class="muted">${esc(summary)}</p>
      <p class="muted">by <strong>${esc(META.author.name)}</strong> · Last reviewed: ${esc(META.author.lastReviewed)}</p>
      <p><a href="${esc(META.site.baseUrl)}">← Back to ${esc(META.site.name)}</a></p>
    </header>

    <section class="card">
      <h2>Key points</h2>
      <ul>${(EXPLAINERS[exId]?.points||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    </section>

    <section class="card">
      <h2>Possible causes (not a diagnosis)</h2>
      <ul>${(k.causes||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    </section>

    <section class="card">
      <h2>Investigations</h2>
      <ul>${(k.investigations||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    </section>

    <section class="card">
      <h2>Home care (authorised)</h2>
      <ul>
        <li>Use medications only as prescribed by a doctor; do not self-medicate antibiotics or analgesics without advice.</li>
        ${(k.home||[]).map(p=>`<li>${esc(p)}</li>`).join('')}
      </ul>
    </section>

    <section class="card">
      <h2>Likely treatment outcomes</h2>
      <ul>${(k.outcomes||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    </section>
  </div>
</body>
</html>`;
}

/* ================= Build all ================= */
const outDir = path.resolve('snapshots');
fs.mkdirSync(outDir, { recursive: true });

if (!KB.length) {
  console.warn("⚠️  KB is empty. Import or paste your KB / EXPLAINERS / KB_TO_EX before running.");
  process.exit(1);
}

for (const k of KB){
  const file = path.join(outDir, `${slug(k.name)}.html`);
  fs.writeFileSync(file, pageForCondition(k), 'utf8');
  console.log('✓', file);
}
console.log('Done. Upload /conditions/<slug>/ to your site and link them.');
