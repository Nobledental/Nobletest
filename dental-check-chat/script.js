import { getRecommendation } from './logic.js';

const chat = document.getElementById('chatContainer');

function botMsg(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function userMsg(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startChatFlow() {
  botMsg("👋 Hi! I'm your dental self-check assistant.");
  await delay(1000);

  botMsg("Which region is the issue in?");
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

function runSymptomsStep(regionId) {
  botMsg("What symptoms are you experiencing?");
  const symptoms = ['pain', 'swelling', 'fever', 'bleeding', 'sensitivity'];
  const div = document.createElement('div');
  div.className = 'chat-bubble-group';

  symptoms.forEach(sym => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${sym}"> ${sym}`;
    div.appendChild(label);
  });

  const btn = document.createElement('button');
  btn.textContent = "Continue";
  btn.onclick = () => {
    const selected = Array.from(div.querySelectorAll('input:checked')).map(el => el.value);
    if (selected.length === 0) return alert("Select at least one symptom.");
    userMsg(`Symptoms: ${selected.join(', ')}`);
    div.remove();
    runRecommendation(regionId, selected);
  };

  div.appendChild(btn);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function runRecommendation(region, symptoms) {
  const result = getRecommendation({ region, symptoms });
  setTimeout(() => {
    botMsg("Here's your result:");
    botMsg(`${result.text}\n\n${result.level}\nSource: ${result.source}`);
    addExportButton();
  }, 1000);
}

function addExportButton() {
  const btn = document.createElement('button');
  btn.textContent = "📄 Download This as PDF";
  btn.onclick = () => {
    html2pdf().from(chat).save('dental-chat-check.pdf');
  };
  chat.appendChild(btn);
}

startChatFlow();

