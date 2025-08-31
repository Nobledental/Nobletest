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
