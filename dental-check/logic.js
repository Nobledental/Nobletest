/* logic.js — decision engine
   - getTriageSummary: uses intake + complaints + region → urgency + actions in plain English
   - getDetailedRecommendation: (from earlier) dental sections by complaint buckets/location
*/

export function getTriageSummary({ intake, complaints, region }) {
  const S = [];

  const age = intake.age || 0;
  const isChild = age > 0 && age < 14;
  const isFemaleAdult = intake.gender === 'female' && age >= 18;

  const hx = new Set(intake.history || []);
  const meds = new Set(intake.meds || []);
  const duration = intake.duration || '';
  const flags = intake.flags || { fever:false, spread:false };
  const flow = intake.flow || 'new';
  const postop = intake.postop || { procedure:'', days:0, fever:false };
  const hygiene = new Set(intake.hygiene || []);

  // helpers
  const has = v => complaints.includes(v);
  const urgentRedFlags = [];
  const medicalFirstFlags = [];
  const cautionFlags = [];
  const hygieneTips = [];

  // --- RED FLAGS (urgent dentist / ER) ---
  if (has('swelling_fever') && (flags.fever || flags.spread)) {
    urgentRedFlags.push('Swelling with fever / spreading swelling');
  }
  if (flow === 'postop' && postop.fever) {
    urgentRedFlags.push('Fever after a recent dental procedure');
  }
  // duration + pain escalation
  if (has('tooth_pain_sensitivity') && (duration === '>1w' || duration === '>1m')) {
    cautionFlags.push('Pain lasting more than a week needs a check to avoid worsening.');
  }

  // --- MEDICAL-TEAM FIRST flags (plain English) ---
  if (hx.has('heart')) {
    medicalFirstFlags.push('History of certain heart valve problems can change antibiotic decisions. Do not start/stop any medicine on your own.');
  }
  if (hx.has('stroke')) {
    cautionFlags.push('Past stroke/TIA: you may be on blood thinners. Do not stop them without your doctor’s advice.');
  }
  if (hx.has('ckd')) {
    cautionFlags.push('Kidney disease (CKD): some painkillers are not suitable. Check with your physician for safe options.');
  }
  if (hx.has('bleeding') || meds.has('anticoagulant') || meds.has('antiplatelet')) {
    cautionFlags.push('Bleeding tendency / blood thinners: procedures may need planning. Do not stop medicines unless your doctor says so.');
  }
  if (hx.has('cancer_bisphos') || meds.has('bisphosphonate')) {
    cautionFlags.push('On bisphosphonates/denosumab: extractions/implants need special planning to reduce jaw risks.');
  }
  if (hx.has('immune') || meds.has('chemo_imm') || meds.has('steroid')) {
    cautionFlags.push('Lowered immunity / steroids: infections can spread faster. Treat mouth infections early.');
  }

  // --- Pregnancy/nursing guidance (plain English) ---
  if (isFemaleAdult && intake.pregnancy) {
    if (intake.pregnancy === 'pregnant_confirmed') {
      cautionFlags.push('Pregnancy: dental emergencies are safe to treat; routine X-rays are limited and protective aprons are used; some medicines are avoided.');
    } else if (intake.pregnancy === 'pregnant_planning_unsure') {
      cautionFlags.push('Planning/unsure pregnancy: tell your dentist so the safest options are chosen.');
    }
    if (intake.nursing) {
      cautionFlags.push('Nursing: most dental treatments are fine; some medicines may have timing considerations. Ask your dentist.');
    }
  }

  // --- Pediatric track (<14) ---
  if (isChild) {
    cautionFlags.push('Child under 14: recommendations will be discussed with a parent/guardian, and pediatric-friendly options will be suggested.');
  }

  // --- Post-op common issues (non-urgent) ---
  if (flow === 'postop') {
    if (postop.procedure === 'extraction' && postop.days <= 3) {
      cautionFlags.push('Pain 2–3 days after extraction can be “dry socket.” See dentist if pain is severe.');
    }
    if (postop.procedure === 'root_canal' && postop.days <= 7) {
      cautionFlags.push('Mild tenderness after root canal can be normal. Worsening pain/swelling or fever needs review.');
    }
  }

  // --- Hygiene coaching if patient noted stains/bad breath/plaques ---
  if (hygiene.has('plaque') || hygiene.has('stains') || hygiene.has('bad_breath')) {
    hygieneTips.push(
      `<ul>
        <li>Brush twice daily with fluoride toothpaste for 2 minutes.</li>
        <li>Clean between teeth daily (floss or interdental brush).</li>
        <li>Limit frequent sugary snacks and acidic drinks.</li>
        <li>For stains: reduce coffee/tea/tobacco; consider a professional cleaning.</li>
        <li>For bad breath: brush the tongue; stay hydrated; if persistent, get a dental check.</li>
      </ul>`
    );
  }

  // --- Orthodontics & prosthodontics routing in plain English ---
  if (complaints.includes('alignment_gap')) {
    cautionFlags.push('Teeth alignment/gap: braces or clear aligners can help. We will show pros and cons.');
  }
  if (complaints.includes('missing_tooth')) {
    cautionFlags.push('Missing tooth: options include implant, bridge, or partial denture. We will show pros and cons.');
  }

  // --- Build TRIAGE RESULT bucket ---
  let headline = 'Routine dental evaluation recommended';
  let badge = '🟡';

  if (urgentRedFlags.length) {
    headline = 'Urgent dental attention is recommended';
    badge = '🔴';
  } else if (medicalFirstFlags.length) {
    headline = 'Check with your medical doctor first (then dental visit)';
    badge = '🟠';
  } else if (!complaints.length) {
    headline = 'Watch & home care';
    badge = '🟢';
  }

  // TRIAGE SUMMARY
  S.push({
    title: `${badge} Triage result`,
    content: `
      <p><strong>${headline}</strong></p>
      ${urgentRedFlags.length ? `<p><strong>Why urgent:</strong> ${urgentRedFlags.join('; ')}.</p>` : ''}
      ${medicalFirstFlags.length ? `<p><strong>Medical-team note:</strong> ${medicalFirstFlags.join(' ')}</p>` : ''}
      ${cautionFlags.length ? `<p><strong>Things to keep in mind:</strong> ${cautionFlags.join(' ')}</p>` : ''}
    `
  });

  // WHAT TO DO NOW
  const doList = [];
  if (badge === '🔴') {
    doList.push('Contact a dentist/clinic today. If you have trouble breathing/swallowing or eye swelling, go to emergency care.');
    doList.push('Use cold compress on the outside of the cheek for swelling. Keep hydrated.');
  } else if (badge === '🟠') {
    doList.push('Call your physician to check any medicine interactions or precautions.');
    doList.push('Arrange a dental appointment after medical advice.');
  } else {
    doList.push('Book a dental visit to assess the cause and stop it early.');
  }
  if (has('tooth_pain_sensitivity')) doList.push('Avoid very hot/cold foods; use a desensitizing toothpaste.');
  if (has('gum_periodontal')) doList.push('Keep brushing with a soft brush and floss daily—do not stop if gums bleed.');
  if (isChild) doList.push('Use a pea-sized amount of fluoride toothpaste. Supervise brushing.');
  if (hygieneTips.length) doList.push('Follow the hygiene tips listed below.');

  S.push({
    title: '✅ What to do now',
    content: `<ul>${doList.map(x=>`<li>${x}</li>`).join('')}</ul>`
  });

  // WHAT NOT TO DO
  const donts = [
    'Do not start or stop prescription medicines on your own.',
    'Do not apply heat to a swollen face.',
    'Do not delay care if pain/swelling is worsening.'
  ];
  if (hx.has('ckd')) donts.push('Avoid over-the-counter painkillers unless your physician says they are safe for your kidneys.');
  if (hx.has('heart') || hx.has('stroke') || meds.has('anticoagulant') || meds.has('antiplatelet')) {
    donts.push('Do not stop blood thinners without your doctor’s advice.');
  }

  S.push({
    title: '❌ What not to do',
    content: `<ul>${donts.map(x=>`<li>${x}</li>`).join('')}</ul>`
  });

  // HYGIENE CARD (if relevant)
  if (hygieneTips.length) {
    S.push({
      title: '🧼 Oral hygiene tips',
      content: hygieneTips.join('')
    });
  }

  // ORTHO OPTIONS (if alignment/gap)
  if (complaints.includes('alignment_gap')) {
    S.push({
      title: 'Orthodontic options (pros & cons)',
      content: `
        <ul>
          <li><strong>Braces:</strong> precise control; visible; regular visits.</li>
          <li><strong>Clear aligners:</strong> nearly invisible; removable; need discipline; not for every case.</li>
          <li><strong>Myofunctional therapy:</strong> helpful for tongue/thumb habits in certain cases.</li>
        </ul>
        <p><em>Best choice depends on your goals, tooth/jaw pattern, and hygiene. Age alone doesn’t decide.</em></p>
      `
    });
  }

  // PROSTHO OPTIONS (if missing tooth)
  if (complaints.includes('missing_tooth')) {
    S.push({
      title: 'Missing tooth — treatment options',
      content: `
        <ul>
          <li><strong>Implant:</strong> single-tooth solution; needs good bone & hygiene; surgery cost.</li>
          <li><strong>Bridge:</strong> fixed; faster; trims neighboring teeth.</li>
          <li><strong>Partial denture:</strong> removable; budget-friendly; bulkier; needs maintenance.</li>
        </ul>
        <p><em>We’ll confirm fit after your dental evaluation.</em></p>
      `
    });
  }

  // PEDIATRIC NOTE
  if (isChild) {
    S.push({
      title: 'Pediatric considerations',
      content: `
        <ul>
          <li>Minimize sugary snacks/juices; bedtime bottles only with water.</li>
          <li>Sealants help protect molars from cavities.</li>
          <li>Behavior-friendly, painless options exist (SDF, Hall crowns) depending on case.</li>
        </ul>
      `
    });
  }

  // POST-OP NOTE
  if (flow === 'postop') {
    S.push({
      title: 'Post-op care notes',
      content: `
        <ul>
          <li>Follow the printed instructions from your dentist.</li>
          <li>For extraction: bite on gauze as directed; no spitting/straws/smoking; call if bleeding persists or pain worsens on day 2–3.</li>
          <li>For root canal/crown/filling: mild tenderness is common for a few days. Return if pain increases, swelling, or fever.</li>
        </ul>
      `
    });
  }

  // LIMITATION CARD
  S.push({
    title: 'Limitations & next steps',
    content: `
      <p>This guide explains likely causes and safe next steps in plain language. It is not a diagnosis. Your dentist/doctor will confirm and plan the exact treatment.</p>
    `
  });

  return S;
}

/* --------------------
   getDetailedRecommendation
   (Keep your enriched version; trimmed header below)
--------------------- */

function section(title, html) { return { title, content: html }; }

function mapRegionFamily(regionId = "") {
  const id = (regionId || "").toLowerCase();
  const m = id.match(/tooth_(\d{2})/);
  if (m) {
    const n = parseInt(m[1], 10);
    const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
    if (!isPrimary) {
      if ([11,12,13,21,22,23,31,32,33,41,42,43].includes(n)) return "front_teeth";
      if ([18,28,38,48].includes(n)) return "wisdom_teeth";
      return "back_teeth";
    } else {
      if ([51,52,53,61,62,63,71,72,73,81,82,83].includes(n)) return "front_teeth";
      return "back_teeth";
    }
  }
  if (id.startsWith('gum_') || id.startsWith('gingiva_')) return "gum_teeth";
  if (id.includes("upper")) return "upper_quadrant";
  if (id.includes("lower")) return "lower_quadrant";
  return "general";
}

export function getDetailedRecommendation({ region, complaints = [] }) {
  const fam = mapRegionFamily(region);
  const S = [];

  // (Use the rich sections we built earlier—Possible causes / Investigations / Do & Don’ts / Treatments,
  // plus differentiators and location-specific notes. To keep this snippet concise here, I’m including
  // a representative subset; your previous full logic.js version can be merged directly.)

  if (complaints.includes("tooth_pain_sensitivity")) {
    S.push(section("Possible causes (not a diagnosis)",
      `<p>Common reasons: tooth decay (cavities), nerve inflammation (pulpitis), enamel wear/sensitivity, cracked tooth, or a high bite.</p>`));

    S.push(section("Investigations",
      `<ul><li>Dental exam, bite tests (pain on release suggests a crack).</li><li>Pulp tests (cold/heat), X-rays; sometimes CBCT.</li></ul>`));

    S.push(section("Do & Don’ts",
      `<p>✅ Use desensitizing toothpaste; avoid very hot/cold drinks.<br>❌ Don’t start antibiotics on your own; don’t ignore lingering pain.</p>`));

    S.push(section("Recommended professional treatments",
      `<p>Filling for decay; root canal if the nerve is involved; fluoride/desensitizers for sensitivity; onlay/crown for cracks.</p>`));

    if (fam === "back_teeth" || fam === "upper_quadrant") {
      S.push(section("Upper molar pain vs sinus pressure",
        `<p>Upper back tooth pain with nasal congestion/pressure can be sinus-related. Your dentist will differentiate with tests and history.</p>`));
    }
  }

  if (complaints.includes("swelling_fever")) {
    S.push(section("Possible causes (not a diagnosis)",
      `<p>Tooth infection/abscess or gum infection. Fever or rapidly spreading swelling is a red flag.</p>`));
    S.push(section("Investigations",
      `<ul><li>Urgent dental exam; X-rays/CBCT if needed.</li></ul>`));
    S.push(section("Do & Don’ts",
      `<p>✅ Cold compress outside the cheek; stay hydrated.<br>❌ Do not apply heat; do not delay care.</p>`));
    S.push(section("Recommended professional treatments",
      `<p>Drainage + treating the source (root canal or extraction). Antibiotics are used when there are whole-body signs.</p>`));
  }

  if (complaints.includes("gum_periodontal")) {
    S.push(section("Possible causes",
      `<p>Gingivitis (bleeding/red gums) or periodontitis (bone loss, loose teeth).</p>`));
    S.push(section("Investigations",
      `<ul><li>Gum measurements (pockets), bleeding index, X-rays.</li></ul>`));
    S.push(section("Do & Don’ts",
      `<p>✅ Keep brushing with a soft brush + floss; get a professional cleaning.<br>❌ Don’t brush aggressively; don’t stop cleaning if gums bleed.</p>`));
    S.push(section("Recommended professional treatments",
      `<p>Scaling & root planing (deep cleaning); surgery if advanced; 3–6 month maintenance.</p>`));
  }

  if (complaints.includes("tmj_muscle")) {
    S.push(section("Possible causes",
      `<p>Jaw joint/muscle strain (TMD), often with grinding/clenching.</p>`));
    S.push(section("Investigations",
      `<ul><li>Jaw range of motion, muscle/joint tenderness; imaging only if needed.</li></ul>`));
    S.push(section("Do & Don’ts",
      `<p>✅ Soft diet, warm compress, jaw relaxation.<br>❌ Avoid wide yawns, chewing gum.</p>`));
    S.push(section("Recommended professional treatments",
      `<p>Night guard, exercises/physio, short-term anti-inflammatories, stress management.</p>`));
  }

  if (complaints.includes("mucosa_others")) {
    S.push(section("Possible causes",
      `<p>Ulcers, fungal infection, or trauma. Patches/sores lasting >2 weeks need a check (sometimes a biopsy).</p>`));
    S.push(section("Investigations",
      `<ul><li>Oral exam, swab for fungal infections, biopsy if suspicious.</li></ul>`));
    S.push(section("Do & Don’ts",
      `<p>✅ Saltwater/mild antiseptic rinses; avoid spicy/acidic irritants.<br>❌ Don’t ignore non-healing sores; stop tobacco.</p>`));
    S.push(section("Recommended professional treatments",
      `<p>Topical gels for ulcers; antifungals for thrush; referral/biopsy when indicated.</p>`));
  }

  return S;
}
