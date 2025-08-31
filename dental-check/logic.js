/* logic.js
 * Evidence-backed, location-aware recommendations.
 * Consumed by script.js -> getDetailedRecommendation({ region, complaints })
 *
 * SOURCES (key):
 * - ADA 2019 Antibiotics for Dental Pain & Swelling: https://www.ada.org/resources/research/science/evidence-based-dental-research/antibiotics-for-dental-pain-and-swelling
 * - ADA Chairside guide PDF: https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/ada_chairside_guide_antibiotics_ta.pdf
 * - WHO Oral Health fact sheet: https://www.who.int/news-room/fact-sheets/detail/oral-health
 * - Mayo Clinic: Cavities; Toothache first aid; Tooth abscess
 * - NIDCR: Temporomandibular Disorders (TMD) overview & treatment
 * - IADT: Avulsion (trauma) guideline
 * - Cleveland Clinic: Sinusitis & sinus pressure referring to upper molars
 * - StatPearls/PMC: Cracked tooth syndrome (pain on bite/release)
 */

const SRC = {
  ADA_2019: `<em>ADA 2019 Antibiotics Guideline</em> (<a href="https://www.ada.org/resources/research/science/evidence-based-dental-research/antibiotics-for-dental-pain-and-swelling" target="_blank" rel="noopener">ADA</a>)`,
  ADA_PDF: `<em>ADA Chairside guide</em> (<a href="https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/ada_chairside_guide_antibiotics_ta.pdf" target="_blank" rel="noopener">ADA PDF</a>)`,
  WHO: `<em>WHO Oral Health</em> (<a href="https://www.who.int/news-room/fact-sheets/detail/oral-health" target="_blank" rel="noopener">WHO</a>)`,
  MAYO_CARIES: `<em>Mayo Clinic – Cavities</em> (<a href="https://www.mayoclinic.org/diseases-conditions/cavities/symptoms-causes/syc-20352892" target="_blank" rel="noopener">Mayo</a>)`,
  MAYO_ABS: `<em>Mayo Clinic – Tooth abscess</em> (<a href="https://www.mayoclinic.org/diseases-conditions/tooth-abscess/symptoms-causes/syc-20350901" target="_blank" rel="noopener">Mayo</a>)`,
  MAYO_TOOTHACHE: `<em>Mayo Clinic – Toothache first aid</em> (<a href="https://www.mayoclinic.org/first-aid/first-aid-toothache/basics/art-20056628" target="_blank" rel="noopener">Mayo</a>)`,
  NIDCR_TMD: `<em>NIDCR – TMD overview</em> (<a href="https://www.nidcr.nih.gov/health-info/tmd" target="_blank" rel="noopener">NIDCR</a>)`,
  IADT_AVUL: `<em>IADT – Avulsion guideline</em> (<a href="https://iadt-dentaltrauma.org/guidelines-and-resources/guidelines/" target="_blank" rel="noopener">IADT</a>)`,
  CLEV_SINUS: `<em>Cleveland Clinic – Sinusitis & tooth pain</em> (<a href="https://my.clevelandclinic.org/health/symptoms/24690-sinus-pressure" target="_blank" rel="noopener">Cleveland Clinic</a>)`,
  STAT_CTS: `<em>Cracked Tooth Syndrome</em> (<a href="https://www.ncbi.nlm.nih.gov/books/NBK606115/" target="_blank" rel="noopener">StatPearls</a>; <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3467890/" target="_blank" rel="noopener">PMC</a>)`
};

/* --- Utility: location families from region id (you can expand mapping to individual teeth later) --- */
function mapRegionFamily(regionId = "") {
  const id = (regionId || "").toLowerCase();
  const m = id.match(/tooth_(\d{2})/);
  if (m) {
    const n = parseInt(m[1], 10);
    const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
    const unit = n % 10;
    if (!isPrimary) {
      if ([11,12,13,21,22,23,31,32,33,41,42,43].includes(n)) return "front_teeth";
      if ([18,28,38,48].includes(n)) return "wisdom_teeth";
      return "back_teeth"; // premolars/molars except wisdoms
    } else {
      if ([51,52,53,61,62,63,71,72,73,81,82,83].includes(n)) return "front_teeth";
      return "back_teeth"; // primary molars (no wisdoms in primary)
    }
  }
  if (id.startsWith('gum_') || id.startsWith('gingiva_')) return "gum_teeth";
  // fallback quadrants
  if (id.includes("upper")) return "upper_quadrant";
  if (id.includes("lower")) return "lower_quadrant";
  return "general";
}
/* --- Block builders --- */
function section(title, html) {
  return { title, content: html };
}

function chips(arr) {
  return `<p>${arr.map(x => `<span class="chip">${x}</span>`).join(" ")}</p>`;
}

/* --- Core recommendation builder --- */
export function getDetailedRecommendation({ region, complaints = [] }) {
  const fam = mapRegionFamily(region);
  const S = [];

  /* =============================
     0) Global red-flags + systemic clues
     ============================= */
  const systemic = `
    <ul>
      <li><strong>Fever / malaise</strong> → infection red flag; seek urgent care (${SRC.ADA_2019}).</li>
      <li><strong>Skin warmth over swelling</strong> → active inflammation (${SRC.MAYO_ABS}).</li>
      <li><strong>Upper back teeth + sinus pressure / congestion</strong> → could be <em>sinusitis</em> referring pain (${SRC.CLEV_SINUS}).</li>
      <li><strong>Burning when passing urine</strong> → may signal a non-dental systemic issue; tell your dentist/physician before antibiotics (${SRC.ADA_PDF}).</li>
    </ul>`;

  S.push(section("Systemic & red-flag symptoms to note", systemic));

  /* =============================
     1) Tooth pain & sensitivity
     ============================= */
  if (complaints.includes("tooth_pain_sensitivity")) {
    const areaNote =
      fam === "front_teeth"
        ? "<p><strong>Front teeth (incisors/canines):</strong> chips/wear from bruxism or acid erosion (e.g., reflux/eating disorders); smooth surfaces get fewer cavities but still possible.</p>"
        : fam === "back_teeth" || fam === "upper_quadrant" || fam === "lower_quadrant"
        ? "<p><strong>Back teeth (premolars/molars):</strong> grooves & pits trap plaque → cavities & cracked-tooth syndrome more common.</p>"
        : "";

    S.push(section(
      "Possible causes (not a diagnosis)",
      `
      ${areaNote}
      <p>Common reasons: <strong>dental caries (cavities)</strong>, <strong>reversible/irreversible pulpitis</strong>, <strong>enamel wear & dentin exposure</strong>, <strong>cracked tooth</strong>, <strong>high bite</strong>.</p>
      <p>${SRC.MAYO_CARIES} · ${SRC.MAYO_TOOTHACHE} · ${SRC.STAT_CTS}</p>
      `
    ));

    S.push(section(
      "Investigations",
      `<ul>
        <li>Clinical exam; bite tests (pain on <em>release</em> → cracked tooth) (${SRC.STAT_CTS}).</li>
        <li>Pulp vitality tests (cold/heat/electric).</li>
        <li>Dental X-rays; for cracks, consider CBCT/selective tests (${SRC.STAT_CTS}).</li>
      </ul>`
    ));

    S.push(section(
      "Do & Don’ts",
      `<p>✅ Desensitizing toothpaste; avoid very hot/cold/acidic drinks; temporary OTC analgesics as directed (${SRC.MAYO_TOOTHACHE}).<br>
         ❌ No self-antibiotics; don’t ignore pain that lingers &gt;48h (${SRC.ADA_2019}).</p>`
    ));

    S.push(section(
      "Recommended professional treatments",
      `<p><strong>Fillings</strong> for cavities; <strong>RCT</strong> if nerve involved; <strong>fluoride/desensitizers</strong> for sensitivity; <strong>onlay/crown</strong> for cracks (${SRC.MAYO_CARIES}; ${SRC.STAT_CTS}).</p>`
    ));

    // Mini differential within the section
    S.push(section(
      "How to tell common causes apart",
      `<ul>
        <li><em>Short, sharp to cold/sweet</em> → sensitivity/enamel wear.</li>
        <li><em>Lingering hot/cold &gt;30s</em> → pulpitis (nerve inflammation).</li>
        <li><em>Bite pain esp. on release</em> → cracked tooth (${SRC.STAT_CTS}).</li>
        <li><em>Night/spontaneous pain</em> → deeper pulp involvement.</li>
      </ul>`
    ));

    if (fam === "upper_quadrant" || fam === "back_teeth") {
      S.push(section(
        "Upper molar pain vs sinusitis (referred pain)",
        `<p>Upper back tooth pain with <strong>nasal congestion/pressure</strong> can be from <strong>sinusitis</strong>. Dental exam + sinus history help differentiate. ${SRC.CLEV_SINUS}</p>`
      ));
    }
  }

  /* =============================
     2) Swelling / fever / emergency
     ============================= */
  if (complaints.includes("swelling_fever")) {
    const wisdomNote =
      fam === "wisdom_teeth" || (fam === "back_teeth" && region?.toLowerCase().includes("upper"))
        ? "<p><strong>Wisdom teeth:</strong> consider <em>pericoronitis</em> if partially erupted: pain on closing, bad taste, swelling.</p>"
        : "";

    S.push(section(
      "Possible causes (not a diagnosis)",
      `
      ${wisdomNote}
      <p><strong>Dental abscess</strong> (periapical/periodontal), cellulitis if spreading. Fever, bad taste, tender nodes are red flags.</p>
      <p>${SRC.MAYO_ABS} · ${SRC.ADA_2019}</p>
      `
    ));

    S.push(section(
      "Investigations",
      `<ul>
        <li>Urgent dental assessment.</li>
        <li>Dental X-rays / CBCT to see spread/source.</li>
        <li>Vitals; systemic review when fever present.</li>
      </ul>`
    ));

    S.push(section(
      "Do & Don’ts",
      `<p>✅ Cold compress outside; hydrate; seek urgent dental care.<br>
         ❌ Do <strong>not</strong> apply heat; do not delay (${SRC.ADA_2019}).</p>`
    ));

    S.push(section(
      "Recommended professional treatments",
      `<p><strong>Drainage</strong> + source control (<strong>RCT</strong> or <strong>extraction</strong>); <strong>antibiotics only with systemic signs</strong> (ADA 2019). ${SRC.ADA_2019} · ${SRC.ADA_PDF}</p>`
    ));
  }

  /* =============================
     3) Gum & periodontal
     ============================= */
  if (complaints.includes("gum_periodontal")) {
    S.push(section(
      "Possible causes (not a diagnosis)",
      `<p><strong>Gingivitis</strong> (bleeding, redness) → reversible with care. <strong>Periodontitis</strong> (bone loss, mobility) → needs professional therapy.</p>
       <p>${SRC.WHO}</p>`
    ));

    S.push(section(
      "Investigations",
      `<ul>
        <li>Periodontal probing (pocket depths); bleeding & plaque indices.</li>
        <li>X-rays for bone levels.</li>
      </ul>`
    ));

    S.push(section(
      "Do & Don’ts",
      `<p>✅ Brush twice daily + floss; soft brush; professional cleaning.<br>
         ❌ Don’t brush aggressively; don’t ignore persistent bleeding.</p>`
    ));

    S.push(section(
      "Recommended professional treatments",
      `<p><strong>Scaling & root planing</strong>; periodontal surgery if advanced; 3–6-month maintenance recalls. ${SRC.WHO}</p>`
    ));
  }

  /* =============================
     4) TMJ / muscle / habits
     ============================= */
  if (complaints.includes("tmj_muscle")) {
    S.push(section(
      "Possible causes (not a diagnosis)",
      `<p><strong>TMD (TMJ disorders)</strong>: muscle strain/myofascial pain, disc issues; often linked to bruxism, stress. ${SRC.NIDCR_TMD}</p>`
    ));

    S.push(section(
      "Investigations",
      `<ul>
        <li>Jaw exam (range, tenderness, noises).</li>
        <li>Imaging (X-ray/MRI) if persistent/atypical.</li>
      </ul>`
    ));

    S.push(section(
      "Do & Don’ts",
      `<p>✅ Soft diet, warm/cold compress, jaw relaxation; sleep hygiene.<br>
         ❌ Avoid gum chewing, clenching, extreme opening.</p>`
    ));

    S.push(section(
      "Recommended professional treatments",
      `<p><strong>Occlusal splint (night guard)</strong>; physiotherapy/exercises; short-term anti-inflammatories; stress management. ${SRC.NIDCR_TMD}</p>`
    ));
  }

  /* =============================
     5) Mucosa & others (ulcers, patches, dry mouth)
     ============================= */
  if (complaints.includes("mucosa_others")) {
    S.push(section(
      "Possible causes (not a diagnosis)",
      `<p><strong>Aphthous ulcers</strong>; <strong>oral candidiasis</strong>; <strong>traumatic lesions</strong>. Persistent white/red patches or ulcers &gt;2 weeks need assessment/biopsy (rule out malignancy).</p>
       <p>${SRC.WHO}</p>`
    ));

    S.push(section(
      "Investigations",
      `<ul>
        <li>Oral examination; photos for monitoring.</li>
        <li>Swab/smear for candidiasis.</li>
        <li>Biopsy if suspicious or non-healing.</li>
      </ul>`
    ));

    S.push(section(
      "Do & Don’ts",
      `<p>✅ Saltwater/mild antiseptic rinses; maintain hygiene; identify triggers.<br>
         ❌ Don’t ignore non-healing ulcers; avoid spicy/acidic irritants; stop tobacco.</p>`
    ));

    S.push(section(
      "Recommended professional treatments",
      `<p>Topical gels for ulcers; <strong>antifungals</strong> for thrush; biopsy & referral when indicated. ${SRC.WHO}</p>`
    ));
  }

  /* =============================
     6) Location-specific add-ons from your dataset
     ============================= */

  // Front teeth: chips/wear, acid erosion (bulimia/GERD), less caries but possible
  if (["front_teeth"].includes(fam)) {
    S.push(section(
      "Front teeth (incisors/canines): typical issues",
      `<ul>
        <li><strong>Chips & wear</strong>: trauma, bruxism, acid erosion (e.g., reflux/eating disorders) → bonding/crown; night guard; medical referral if eating disorder suspected.</li>
        <li><strong>Smooth-surface caries</strong>: less common than molars but possible, especially with frequent sugar exposure (${SRC.MAYO_CARIES}).</li>
      </ul>`
    ));
  }

  // Back teeth: caries, pulpitis, abscess, cracked tooth, wear
  if (["back_teeth","upper_quadrant","lower_quadrant"].includes(fam)) {
    S.push(section(
      "Back teeth (premolars/molars): typical issues",
      `<ul>
        <li><strong>Cavities</strong> in pits/fissures → fillings/ sealants (${SRC.MAYO_CARIES}; ${SRC.WHO}).</li>
        <li><strong>Pulpitis/abscess</strong> if untreated → RCT or extraction (${SRC.MAYO_ABS}).</li>
        <li><strong>Cracked tooth</strong> from heavy bite → bite-release pain (${SRC.STAT_CTS}).</li>
        <li><strong>Attrition</strong> from bruxism → guard & occlusal care.</li>
      </ul>`
    ));
  }

  // Wisdom teeth: impaction, pericoronitis, cysts, decay due to access
  if (fam === "wisdom_teeth") {
    S.push(section(
      "Wisdom teeth (third molars): typical issues",
      `<ul>
        <li><strong>Impaction</strong> with pain/swelling; <strong>pericoronitis</strong> if partially erupted (rinses, irrigation; antibiotics if systemic signs; extraction if recurrent).</li>
        <li><strong>Caries</strong> (cleaning difficulty); <strong>cysts</strong> around impacted teeth (requires evaluation).</li>
      </ul>`
    ));
  }

  // Trauma / knocked-out tooth quick reference
  S.push(section(
    "If a permanent tooth is knocked out (avulsion)",
    `<p>Handle by the <strong>crown</strong> only, gently rinse, reinsert if possible or store in milk/saliva, and see a dentist immediately. ${SRC.IADT_AVUL}</p>`
  ));

  // Prevention wrap-up
  S.push(section(
    "Prevention at a glance",
    `<ul>
      <li>Fluoride toothpaste; limit sugary snacks/drinks; regular dental check-ups (${SRC.MAYO_CARIES}; ${SRC.WHO}).</li>
      <li>Night guard for bruxism; sports mouthguard for contact activities.</li>
      <li>Tobacco/alcohol cessation; monitor lesions that don’t heal &gt; 2 weeks.</li>
    </ul>`
  ));

  return S;
}

/* (Optional) Keep your original quick triage function if used elsewhere
export function getRecommendation({ region, symptoms }) { ... }
*/
