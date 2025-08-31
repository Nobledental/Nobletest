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
