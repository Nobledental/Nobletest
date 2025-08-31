// keep your original quick triage (used elsewhere if needed)
export function getRecommendation({ region, symptoms }) {
  const response = { text:'', level:'🟡 Expert Opinion', source:'', link:'' };
  const has = (s) => symptoms?.includes(s);

  if (has('fever') && has('swelling')) {
    response.text = "⚠️ Swelling with fever may indicate infection (possible abscess). See a dentist or urgent care.";
    response.level = "🟢 Guideline-Backed (ADA)";
    response.source = "ADA Clinical Guidelines";
    response.link = "https://www.ada.org/resources/research/science/clinical-practice-guidelines";
  } else if (has('pain') && has('sensitivity')) {
    response.text = "🦷 Sensitivity + pain can mean enamel wear or early decay. Avoid cold/acidic drinks and book a checkup.";
    response.level = "🟡 Expert Opinion (Oxford Handbook)";
    response.source = "Oxford Handbook of Clinical Dentistry";
    response.link = "https://global.oup.com/academic/product/oxford-handbook-of-clinical-dentistry-9780199679850";
  } else if (has('bleeding')) {
    response.text = "🩸 Bleeding gums commonly signal gingivitis. Brush gently, floss daily, and see your dentist.";
    response.level = "🟢 WHO-backed prevention tip";
    response.source = "WHO Oral Health";
    response.link = "https://www.who.int/health-topics/oral-health";
  } else {
    response.text = "👍 Monitor symptoms. If they worsen or persist beyond 48 hours, see a dental professional.";
    response.level = "🟡 Caution / Self-care only";
    response.source = "Diagnosis & Treatment Planning in Dentistry (4e)";
    response.link = "https://shop.elsevier.com/books/diagnosis-and-treatment-planning-in-dentistry/9780323809757";
  }
  return response;
}

// rich, SEO/E-E-A-T content used by the visual tool
export function getDetailedRecommendation({ region, complaints = [] }) {
  const S = [];

  const push = (title, html) => S.push({ title, content: html });

  // Tooth pain & sensitivity
  if (complaints.includes('tooth_pain_sensitivity')) {
    push('Possible causes (not a diagnosis)',
      `<p><strong>Toothache</strong> or <strong>sensitivity</strong> often comes from <strong>cavities (dental caries)</strong>, <strong>pulpitis</strong>, <strong>worn enamel / exposed dentin</strong>, or a <strong>cracked tooth</strong>.</p>
       <p><em>Sources:</em> <a href="https://www.mayoclinic.org/diseases-conditions/toothache/symptoms-causes/syc-20350901" target="_blank" rel="noopener">Mayo Clinic</a>; <a href="https://my.clevelandclinic.org/health/diseases/22240-tooth-sensitivity" target="_blank" rel="noopener">Cleveland Clinic</a></p>`);

    push('Investigations',
      `<ul>
        <li>Clinical exam & history</li>
        <li>Pulp vitality tests</li>
        <li>Dental X-rays to find hidden decay or cracks</li>
      </ul>`);

    push('Do & Don’ts',
      `<p>✅ Use <strong>desensitizing toothpaste</strong>. Limit very cold/acidic drinks.<br>
         ❌ Don’t self-medicate antibiotics. Don’t delay >48h if pain persists.</p>`);

    push('Recommended professional treatments',
      `<p>Fillings for cavities · <strong>Root canal</strong> for nerve infection · <strong>Fluoride varnish</strong> for sensitivity · <strong>Crown</strong> for cracks.</p>`);
  }

  // Swelling / fever / emergency
  if (complaints.includes('swelling_fever')) {
    push('Possible causes (not a diagnosis)',
      `<p><strong>Facial/gum swelling with fever</strong> suggests a <strong>dental abscess</strong> or spreading infection (cellulitis) and needs urgent care.</p>
       <p><em>Sources:</em> <a href="https://www.ada.org/resources/research/science/clinical-practice-guidelines" target="_blank" rel="noopener">ADA Guidelines</a>; <a href="https://www.who.int/health-topics/oral-health" target="_blank" rel="noopener">WHO Oral Health</a></p>`);

    push('Investigations',
      `<ul>
        <li>Urgent dental assessment</li>
        <li>X-rays / CBCT for spread</li>
        <li>Blood tests if systemic involvement suspected</li>
      </ul>`);

    push('Do & Don’ts',
      `<p>✅ Cold compress outside the face; seek urgent care if fever is present.<br>
         ❌ Don’t apply heat; don’t delay — infection can spread.</p>`);

    push('Recommended professional treatments',
      `<p><strong>Drainage</strong> of abscess · <strong>Antibiotics</strong> only if systemic signs (per ADA 2019) · <strong>Root canal or extraction</strong> of the source tooth · Hospital care if airway risk.</p>`);
  }

  // Gum & periodontal
  if (complaints.includes('gum_periodontal')) {
    push('Possible causes (not a diagnosis)',
      `<p><strong>Bleeding, red or puffy gums</strong> = likely <strong>gingivitis</strong> or, if bone is affected, <strong>periodontitis</strong>. Over-brushing can also irritate gums.</p>
       <p><em>Source:</em> <a href="https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" target="_blank" rel="noopener">ADA: Gum disease</a></p>`);

    push('Investigations',
      `<ul>
        <li>Periodontal probing (gum pocket depths)</li>
        <li>X-rays for bone levels</li>
        <li>Plaque & bleeding scores</li>
      </ul>`);

    push('Do & Don’ts',
      `<p>✅ Brush twice daily + floss; regular professional cleaning.<br>
         ❌ Don’t brush too hard; don’t ignore persistent bleeding.</p>`);

    push('Recommended professional treatments',
      `<p><strong>Scaling & root planing</strong> · Periodontal surgery if advanced · 3–6-month maintenance.</p>`);
  }

  // TMJ / muscle / habits
  if (complaints.includes('tmj_muscle')) {
    push('Possible causes (not a diagnosis)',
      `<p><strong>Jaw pain, clicking, headaches</strong> may be <strong>TMJ disorders</strong> or <strong>bruxism (grinding)</strong>, worsened by habits (gum chewing, nail biting).</p>
       <p><em>Sources:</em> <a href="https://www.nidcr.nih.gov/health-info/tmd" target="_blank" rel="noopener">NIDCR</a>; <a href="https://www.mayoclinic.org/diseases-conditions/tmj/symptoms-causes/syc-20350941" target="_blank" rel="noopener">Mayo Clinic</a></p>`);

    push('Investigations',
      `<ul>
        <li>Jaw exam (range of motion, tenderness)</li>
        <li>X-rays / MRI if symptoms persist or worsen</li>
      </ul>`);

    push('Do & Don’ts',
      `<p>✅ Soft diet, warm/cold compresses, jaw relaxation exercises.<br>
         ❌ Avoid gum chewing, clenching, extreme mouth opening.</p>`);

    push('Recommended professional treatments',
      `<p><strong>Night guard</strong> for grinding · Physiotherapy/exercises · Short-term anti-inflammatories · Specialist referral if chronic.</p>`);
  }

  // Mucosa & others
  if (complaints.includes('mucosa_others')) {
    push('Possible causes (not a diagnosis)',
      `<p><strong>Ulcers or white/red patches</strong> may be <strong>aphthous ulcers</strong>, <strong>oral thrush</strong> or trauma. Lesions that don’t heal in 2 weeks need review to rule out serious disease.</p>
       <p><em>Sources:</em> <a href="https://www.who.int/health-topics/oral-health" target="_blank" rel="noopener">WHO Oral Health</a>; <a href="https://global.oup.com/academic/product/oxford-handbook-of-clinical-dentistry-9780199679850" target="_blank" rel="noopener">Oxford Handbook</a></p>`);

    push('Investigations',
      `<ul>
        <li>Oral examination</li>
        <li>Swab/smear for candidiasis</li>
        <li>Biopsy if non-healing > 2 weeks or suspicious</li>
      </ul>`);

    push('Do & Don’ts',
      `<p>✅ Saltwater or mild antiseptic rinses; keep excellent oral hygiene.<br>
         ❌ Don’t ignore persistent ulcers; avoid spicy/acidic irritants.</p>`);

    push('Recommended professional treatments',
      `<p>Topical gels for ulcers · <strong>Antifungals</strong> for thrush · <strong>Biopsy & referral</strong> for suspicious lesions · Lifestyle counseling (tobacco/alcohol).</p>`);
  }

  return S;
}

