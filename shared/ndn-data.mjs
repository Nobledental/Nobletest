// shared/ndn-data.mjs

/* ========= Knowledge Base (Conditions) =========
   Condensed version of the KB we wired into your widget.
   Each condition has: id, name, urgency, complaints, causes, investigations,
   do/dont/home/outcomes, cite, and treatments (for treatment cards).
*/

export const KB = [
  {
    id:"gingivitis", name:"Gingivitis / Periodontitis", urgency:"soon",
    complaintsAny:["gumBleed","badBreathGum","looseTooth"],
    causes:["Plaque accumulation, calculus","Inflammation of supporting tissues"],
    investigations:["Periodontal charting","Bitewing/OPG for bone levels"],
    do:["Professional scaling & root planing","Daily floss/interdental brushes"],
    dont:["Do not stop brushing because of bleeding"],
    home:["Soft brush, twice daily","Chlorhexidine only if prescribed"],
    outcomes:["Scaling & Root Planing (SRP)","Splinting if mobility; bite adjustment"],
    treatments:["scaling","splinting"]
  },
  {
    id:"pulpitis", name:"Irreversible Pulpitis", urgency:"soon",
    complaintsAny:["lingeringHotCold","chewingPain"],
    causes:["Deep caries reaching pulp","Cracked tooth"],
    investigations:["Periapical X-ray"],
    do:["Book dental visit within 24–72h"],
    dont:["Do not apply heat","Do not place aspirin on gums/teeth"],
    home:["Avoid extreme hot/cold","Warm salt-water rinse"],
    outcomes:["Root Canal Therapy (RCT)","Crown if structure compromised"],
    treatments:["rct","crown"]
  },
  {
    id:"abscess", name:"Acute Dental Abscess", urgency:"urgent",
    complaintsAll:["swellingFace","fever"],
    causes:["Periapical infection","Fascial space infection"],
    investigations:["Periapical X-ray","OPG / CBCT if spread suspected"],
    do:["Urgent dental care TODAY","Maintain hydration"],
    dont:["Do not apply heat","Do not start antibiotics without prescription"],
    home:["Cold compress outside cheek","Sit up if breathing difficulty"],
    outcomes:["Drainage + antibiotics","Root canal or extraction"],
    treatments:["drainage","rct","extraction"]
  },
  {
    id:"cracked", name:"Cracked Tooth / High Bite", urgency:"soon",
    complaintsAny:["chewingPain"],
    causes:["Crack line / high occlusal contact","Fractured cusp"],
    investigations:["Periapical X-ray","Bite test"],
    do:["See dentist within 24–72h","Avoid chewing on that side"],
    dont:["Avoid hard foods (ice, nuts)"],
    home:["Keep tooth clean; avoid triggers"],
    outcomes:["Occlusal adjustment","Crown; RCT if pulp involved"],
    treatments:["crown","rct"]
  },
  {
    id:"pericoronitis", name:"Pericoronitis (Wisdom Tooth)", urgency:"soon",
    complaintsAny:["wisdomArea"],
    causes:["Gum flap inflammation over erupting molar"],
    investigations:["OPG (panoramic X-ray)"],
    do:["Assessment within 24–72h","Meticulous cleaning around wisdom area"],
    dont:["No smoking; avoid food impaction"],
    home:["Warm salt-water rinses","Irrigate gently if advised"],
    outcomes:["Irrigation/cleaning ± antibiotics","Extraction if recurrent/impacted"],
    treatments:["wisdomExtract","irrigation"]
  },
  {
    id:"tmj", name:"TMJ Disorder / Bruxism", urgency:"routine",
    complaintsAny:["tmjPainClick"],
    causes:["Parafunctional habits (bruxism)","TMJ internal derangement"],
    investigations:["Clinical exam; imaging only if indicated"],
    do:["Custom night guard if bruxism","Physiotherapy / habit reversal"],
    dont:["Avoid gum chewing and wide yawns"],
    home:["Soft diet; jaw rest","Warm compress on muscles","Stress reduction, sleep hygiene"],
    outcomes:["Occlusal guard","Physiotherapy"],
    treatments:["nightGuard","physio"]
  },
  {
    id:"xerostomia", name:"Dry Mouth (Xerostomia)", urgency:"routine",
    complaintsAny:["dryMouth"],
    causes:["Medications; dehydration; systemic disease"],
    investigations:["Review meds; salivary tests if indicated"],
    do:["Discuss meds with doctor/dentist"],
    dont:["Avoid tobacco and alcohol mouthwashes"],
    home:["Sip water frequently; sugar-free gum","High-fluoride toothpaste if prescribed"],
    outcomes:["Saliva substitutes; fluoride regimen"],
    treatments:["salivaSub","fluoride"]
  },
  {
    id:"ulcer", name:"Oral Ulcer (>2 weeks)", urgency:"soon",
    complaintsAny:["ulcer2w"],
    causes:["Aphthous / traumatic; rule out pathology"],
    investigations:["Clinical exam; biopsy if non-healing"],
    do:["Dental/OMFS review if >2 weeks","Identify triggers (diet, stress)"],
    dont:["Avoid repeated trauma / irritants"],
    home:["Avoid spicy/acidic foods","Topical soothing gels as prescribed"],
    outcomes:["Topical meds; biopsy if suspicious"],
    treatments:["softTissueCare"]
  },
  {
    id:"avulsion", name:"Avulsed Permanent Tooth", urgency:"urgent",
    complaintsAny:["avulsed"],
    causes:["Trauma with tooth out of socket"],
    investigations:["Periapical X-ray post-reimplantation"],
    do:["Immediate emergency dental care","Reinsert if possible or store in milk/saliva"],
    dont:["Do not scrub the root","Do not let tooth dry"],
    home:["Handle by crown only; rinse gently if dirty"],
    outcomes:["Reimplantation + splint; RCT later"],
    treatments:["reimplant","splint","rct"]
  }
];

/* ========= Explainers =========
   Short plain-English explanations for each condition, used both in widget and pre-render snapshots.
   Keep in sync with KB ids.
*/
export const EXPLAINERS = {
  gingivitis: {
    name:"Gingivitis / Periodontitis",
    summary:"Inflammation of gum and supporting tissues from plaque/calculus. Early treatment prevents bone loss.",
    points:["Bleeding on brushing is a sign of inflammation","Plaque hardens to calculus","Scaling and home care reverses gingivitis"],
    when:["Book scaling & evaluation within 24–72h if bleeding persists"],
    donts:["Don’t stop brushing due to bleeding"]
  },
  pulpitis: {
    name:"Irreversible Pulpitis",
    summary:"Deep decay or crack inflames the tooth nerve causing lingering hot/cold pain.",
    points:["Pain lingers after stimulus","Often due to deep caries or cracks","Timely care can save tooth with RCT"],
    when:["Dental visit within 24–72h"],
    donts:["Don’t place aspirin on gums/teeth","Avoid heat packs on face"]
  },
  abscess: {
    name:"Acute Dental Abscess",
    summary:"Infection spreads from the tooth to surrounding tissues causing swelling, pain and fever.",
    points:["Facial/gum swelling with throbbing pain","Often from untreated decay","Needs drainage plus definitive treatment"],
    when:["TODAY if swelling with fever or trismus","Hospital if breathing/swallowing difficulty"],
    donts:["Do not apply heat","Do not self-start antibiotics"]
  },
  cracked: {
    name:"Cracked Tooth / High Bite",
    summary:"Crack lines or a high contact cause sharp pain on chewing or release.",
    points:["Pain on biting indicates crack","X-ray + bite test help confirm","Crown often needed; RCT if pulp affected"],
    when:["Dental visit within 24–72h"],
    donts:["Avoid chewing hard foods"]
  },
  pericoronitis: {
    name:"Pericoronitis (Wisdom Tooth)",
    summary:"Inflamed gum flap over a partially erupted wisdom tooth; can recur or spread.",
    points:["Irrigation/cleaning improves symptoms","Extraction if recurrent or impacted","OPG helps assess position"],
    when:["Assessment within 24–72h; urgent if swelling/fever"],
    donts:["No smoking; avoid food impaction"]
  },
  tmj: {
    name:"TMJ Disorder / Bruxism",
    summary:"Jaw joint/muscle overload from bruxism or internal derangement causes pain/clicking.",
    points:["Pain/click around joint; morning stiffness","Responds to night guard and habit change","Imaging only if red flags"],
    when:["Routine review; sooner if locking or trauma"],
    donts:["Avoid wide yawns and gum chewing"]
  },
  xerostomia: {
    name:"Dry Mouth (Xerostomia)",
    summary:"Reduced saliva from medicines or dehydration increases decay and discomfort.",
    points:["Sip water and sugar-free gum help","High-fluoride regimen may be prescribed","Review causative medications"],
    when:["Routine dental/medical review; sooner if rampant decay"],
    donts:["Avoid tobacco and alcohol mouthwashes"]
  },
  ulcer: {
    name:"Oral Ulcer (>2 weeks)",
    summary:"Non-healing ulcer needs professional evaluation to rule out pathology.",
    points:["Avoid spicy/acidic foods and trauma","Topical gels only if prescribed","Biopsy if persistent/suspicious"],
    when:["Book review if >2 weeks or concerning features"],
    donts:["Don’t repeatedly irritate the area"]
  },
  avulsion: {
    name:"Avulsed Permanent Tooth",
    summary:"A tooth knocked out of its socket can be saved if handled correctly and replanted quickly.",
    points:["Handle by crown only","Reinsert if possible or store in milk/saliva","Seek dentist immediately"],
    when:["Immediate emergency care"],
    donts:["Do not scrub the root","Do not let the tooth dry"]
  }
};

/* ========= Mapping KB id -> Explainer id ========= */
export const KB_TO_EX = {
  gingivitis:"gingivitis",
  pulpitis:"pulpitis",
  abscess:"abscess",
  cracked:"cracked",
  pericoronitis:"pericoronitis",
  tmj:"tmj",
  xerostomia:"xerostomia",
  ulcer:"ulcer",
  avulsion:"avulsion"
};
