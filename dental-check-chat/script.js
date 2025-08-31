function botMsg(text, delayMs = 1000) {
  return new Promise(resolve => {
    const typing = document.createElement('div');
    typing.className = 'typing-dots bot';
    typing.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
      resolve();
    }, delayMs);
  });
}

function speak(text) {
  const audioEnabled = document.getElementById('enableVoice')?.checked;
  if ('speechSynthesis' in window && audioEnabled) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }
}

function botMsg(text, delayMs = 1000) {
  return new Promise(resolve => {
    const typing = document.createElement('div');
    typing.className = 'typing-dots bot';
    typing.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
      speak(text);
      resolve();
    }, delayMs);
  });
}
