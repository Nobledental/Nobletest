import { getDetailedRecommendation } from './logic.js';

const chat = document.getElementById('chatContainer');

function createMsg(text, type = 'bot', isHTML = false) {
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  if (isHTML) {
    div.innerHTML = text;
  } else {
    div.textContent = text;
  }
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function botMsg(text, delayMs = 800, isHTML = false) {
  return new Promise(resolve => {
    const typing = document.createElement('div');
    typing.className = 'typing-dots bot';
    typing.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      typing.remove();
      createMsg(text, 'bot', isHTML);
      resolve();
    }, delayMs);
  });
}

function userMsg(text) {
  createMsg(text, 'user');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startChatFlow() {
  await botMsg("👋 Hi! I'm your dental self-check assistant.");
  await delay(1000);
  await botMsg("Let's start with where you feel the issue. Please click on the jaw map:");

  const svgWrapper = document.createElement('object');
  svgWrapper.data = '../assets/jaw-map.svg';
  svgWrapper.type = 'image/svg+xml';
  svgWrapper.id = 'jawSvg';
  chat.appendChild(svgWrapper);

  svgWrapper.addEventListener('load', () => {
    const svgDoc = svgWrapper.contentDocument;
    fetch('../assets/regions.json')
      .then(res => res.json())
      .then(regions => {
        Object.keys(regions).forEach(id => {
          const el = svgDoc.getElementById(id);
          if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
              const regionName = regions[id].name;
              userMsg(regionName);
              svgWrapper.remove();
              runSymptomsStep(id);
            });
          }
        });
      });
  });
}

async function runSymptomsStep(regionId) {
  await botMsg("Now, please select the complaints you are experiencing:");

  const complaintOptions = [
    { value: 'tooth_pain_sensitivity', label: '🦷 Tooth pain & sensitivity' },
    { value: 'swelling_fever', label: '⚠️ Swelling / Fever / Emergency' },
    { value: 'gum_periodontal', label: '🪥 Gum & periodontal issues' },
    { value: 'tmj_muscle', label: '🤐 TMJ / muscle / habits' },
    { value: 'mucosa_others', label: '👄 Mucosa & other issues' }
  ];

  const div = document.createElement('div');
  div.className = 'chat-bubble-group';

  complaintOptions.forEach(opt => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${opt.value}"> ${opt.label}`;
    div.appendChild(label);
  });

  const btn = document.createElement('button');
  btn.textContent = "Continue";
  btn.onclick = () => {
    const selected = Array.from(div.querySelectorAll('input:checked')).map(el => el.value);
    if (selected.length === 0) return alert("Please select at least one complaint.");
    userMsg(`Selected: ${selected.join(', ')}`);
    div.remove();
    runRecommendation(regionId, selected);
  };

  div.appendChild(btn);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function runRecommendation(region, complaints) {
  await botMsg("Analyzing your inputs...");

  const sections = getDetailedRecommendation({ region, complaints });

  await botMsg("Here’s your personalized dental self-check result:");

  for (const sec of sections) {
    await botMsg(`<h4>${sec.title}</h4>${sec.content}`, 1200, true);
  }

  addExportButton();
}

function addExportButton() {
  const btn = document.createElement('button');
  btn.textContent = "📄 Download Results as PDF";
  btn.onclick = () => {
    html2pdf().from(chat).save('dental-chat-check.pdf');
  };
  chat.appendChild(btn);
}

startChatFlow();

