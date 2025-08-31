export function getRecommendation({ region, symptoms }) {
  const response = {
    text: '',
    level: '🟡 Expert Opinion',
    source: '',
    link: ''
  };

  const has = (symptom) => symptoms.includes(symptom);

  if (has('fever') && has('swelling')) {
    response.text = "⚠️ Swelling with fever may indicate infection (possible abscess). Immediate dentist consultation advised.";
    response.level = "🟢 Guideline-Backed (ADA)";
    response.source = "ADA Clinical Practice Guideline";
    response.link = "https://www.ada.org/resources/research/science/clinical-practice-guidelines";
  } else if (has('pain') && has('sensitivity')) {
    response.text = "🦷 Sensitivity and pain may suggest enamel loss or early caries. Rinse, avoid cold drinks, and schedule a checkup.";
    response.level = "🟡 Expert Opinion (Oxford Handbook)";
    response.source = "Oxford Handbook of Clinical Dentistry";
    response.link = "https://global.oup.com/academic/product/oxford-handbook-of-clinical-dentistry-9780199679850";
  } else if (has('bleeding')) {
    response.text = "🩸 Bleeding gums are often an early sign of gingivitis. Brush gently, floss daily, and follow up with a dentist.";
    response.level = "🟢 WHO-backed prevention tip";
    response.source = "WHO Oral Health";
    response.link = "https://www.who.int/news-room/fact-sheets/detail/oral-health";
  } else {
    response.text = "👍 Monitor your symptoms. If they worsen or persist beyond 48h, consult a professional.";
    response.level = "🟡 Caution / Self-care only";
    response.source = "Diagnosis and Treatment Planning in Dentistry (4e)";
    response.link = "https://www.elsevier.com/books/diagnosis-and-treatment-planning-in-dentistry/stefanac/978-0-323-80975-7";
  }

  return response;
}

export function getDetailedRecommendation({ region, complaints }) {
  const sections = [];

  // 🦷 Tooth Pain & Sensitivity
  if (complaints.includes('tooth_pain_sensitivity')) {
    sections.push({
      title: 'Possible Causes',
      content: `<p>Tooth pain and sensitivity often happen because of <strong>tooth decay (cavities)</strong>, <strong>inflamed tooth nerves (pulpitis)</strong>, <strong>worn enamel</strong>, or a <strong>cracked tooth</strong>. These are some of the most common reasons people visit the dentist worldwide.</p>
      <p><em>Source: <a href="https://www.mayoclinic.org/diseases-conditions/dental-caries/symptoms-causes/syc-20352892" target="_blank">Mayo Clinic</a>, <a href="https://www.clevelandclinic.org/" target="_blank">Cleveland Clinic</a></em></p>`
    });
    sections.push({
      title: 'Investigations',
      content: `<ul>
        <li>Dental examination and history</li>
        <li>Pulp vitality tests</li>
        <li>X-rays to check for hidden decay or cracks</li>
      </ul>`
    });
    sections.push({
      title: 'Do’s & Don’ts',
      content: `<p>✅ Use <strong>desensitizing toothpaste</strong> daily<br>
      ✅ Avoid very cold, hot, or acidic foods<br>
      ❌ Don’t wait more than 48 hours if pain persists<br>
      ❌ Avoid self-medicating with antibiotics</p>`
    });
    sections.push({
      title: 'Recommended Professional Treatments',
      content: `<p>- <strong>Dental fillings</strong> for cavities<br>
      - <strong>Root canal treatment</strong> for infected nerves<br>
      - <strong>Fluoride varnish</strong> for sensitivity<br>
      - <strong>Crown</strong> for cracked teeth</p>`
    });
  }

  // ⚠️ Swelling / Fever / Emergency
  if (complaints.includes('swelling_fever')) {
    sections.push({
      title: 'Possible Causes',
      content: `<p>Swelling of the face, gums, or jaw with fever is often linked to a <strong>dental abscess</strong>, <strong>gum infection</strong>, or in rare cases, <strong>serious cellulitis</strong>. This can spread quickly and should be treated as urgent.</p>
      <p><em>Source: <a href="https://www.ada.org/resources/research/science/clinical-practice-guidelines" target="_blank">ADA Emergency Guidelines</a>, <a href="https://www.who.int/news-room/fact-sheets/detail/oral-health" target="_blank">WHO Oral Health</a></em></p>`
    });
    sections.push({
      title: 'Investigations',
      content: `<ul>
        <li>Dental examination</li>
        <li>X-rays or CBCT scan to check abscess spread</li>
        <li>Blood tests if systemic infection suspected</li>
      </ul>`
    });
    sections.push({
      title: 'Do’s & Don’ts',
      content: `<p>✅ Apply a <strong>cold compress</strong> on swollen area<br>
      ✅ Go to a dentist or ER if swelling + fever<br>
      ❌ Do not apply heat (can worsen infection)<br>
      ❌ Do not delay care — infection may spread</p>`
    });
    sections.push({
      title: 'Recommended Professional Treatments',
      content: `<p>- <strong>Drainage of abscess</strong><br>
      - <strong>Antibiotics</strong> (only with systemic infection, per ADA 2019)<br>
      - <strong>Root canal or extraction</strong> of infected tooth<br>
      - Hospital care if severe swelling compromises breathing</p>`
    });
  }

  // 🪥 Gum & Periodontal
  if (complaints.includes('gum_periodontal')) {
    sections.push({
      title: 'Possible Causes',
      content: `<p>Bleeding or swollen gums usually signal <strong>gingivitis</strong> (early gum disease) or <strong>periodontitis</strong> (advanced disease with bone loss). It can also happen from brushing too hard.</p>
      <p><em>Source: <a href="https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" target="_blank">ADA Gum Disease Guide</a></em></p>`
    });
    sections.push({
      title: 'Investigations',
      content: `<ul>
        <li>Periodontal probing (gum pocket measurement)</li>
        <li>X-rays to check bone levels</li>
        <li>Bleeding and plaque scoring</li>
      </ul>`
    });
    sections.push({
      title: 'Do’s & Don’ts',
      content: `<p>✅ Brush twice daily + floss once<br>
      ✅ Regular professional cleanings<br>
      ❌ Don’t brush aggressively<br>
      ❌ Don’t ignore persistent bleeding</p>`
    });
    sections.push({
      title: 'Recommended Professional Treatments',
      content: `<p>- <strong>Scaling and root planing</strong><br>
      - <strong>Periodontal surgery</strong> if severe<br>
      - <strong>Maintenance cleanings</strong> every 3–6 months</p>`
    });
  }

  // 🤐 TMJ / Muscle / Habits
  if (complaints.includes('tmj_muscle')) {
    sections.push({
      title: 'Possible Causes',
      content: `<p>Jaw pain, clicking, or headaches may indicate <strong>TMJ disorders</strong>, <strong>bruxism (grinding)</strong>, or habits like <strong>gum chewing</strong> and <strong>nail biting</strong>.</p>
      <p><em>Source: <a href="https://www.nidcr.nih.gov/health-info/tmd" target="_blank">NIDCR</a>, <a href="https://www.mayoclinic.org/diseases-conditions/tmj/symptoms-causes/syc-20350941" target="_blank">Mayo Clinic</a></em></p>`
    });
    sections.push({
      title: 'Investigations',
      content: `<ul>
        <li>Physical exam (jaw movement, palpation)</li>
        <li>X-rays or MRI if symptoms persist</li>
      </ul>`
    });
    sections.push({
      title: 'Do’s & Don’ts',
      content: `<p>✅ Eat soft diet, practice jaw relaxation<br>
      ✅ Apply warm or cold compress<br>
      ❌ Avoid gum chewing or excessive yawning<br>
      ❌ Don’t clench your teeth</p>`
    });
    sections.push({
      title: 'Recommended Professional Treatments',
      content: `<p>- <strong>Night guard</strong> for grinding<br>
      - <strong>Physiotherapy</strong> or jaw exercises<br>
      - <strong>Medications</strong> (NSAIDs, short-term relaxants)<br>
      - Referral to TMJ specialist if chronic</p>`
    });
  }

  // 👄 Mucosa & Others
  if (complaints.includes('mucosa_others')) {
    sections.push({
      title: 'Possible Causes',
      content: `<p>Oral ulcers or white/red patches may be due to <strong>aphthous ulcers</strong>, <strong>oral thrush (candidiasis)</strong>, or trauma. Rarely, it may signal <strong>precancerous or cancerous lesions</strong>.</p>
      <p><em>Source: <a href="https://www.who.int/news-room/fact-sheets/detail/oral-health" target="_blank">WHO Oral Health</a>, <a href="https://global.oup.com/academic/product/oxford-handbook-of-clinical-dentistry-9780199679850" target="_blank">Oxford Handbook</a></em></p>`
    });
    sections.push({
      title: 'Investigations',
      content: `<ul>
        <li>Oral examination</li>
        <li>Swab or smear for candidiasis</li>
        <li>Biopsy if ulcer lasts >2 weeks</li>
      </ul>`
    });
    sections.push({
      title: 'Do’s & Don’ts',
      content: `<p>✅ Rinse with saltwater or mild antiseptic<br>
      ✅ Maintain oral hygiene<br>
      ❌ Don’t ignore non-healing ulcers<br>
      ❌ Avoid spicy or acidic irritants</p>`
    });
    sections.push({
      title: 'Recommended Professional Treatments',
      content: `<p>- <strong>Topical gels</strong> for ulcers<br>
      - <strong>Antifungal therapy</strong> for thrush<br>
      - <strong>Biopsy & referral</strong> for suspicious lesions<br>
      - Lifestyle counseling (stop smoking/tobacco)</p>`
    });
  }

  return sections;
}
