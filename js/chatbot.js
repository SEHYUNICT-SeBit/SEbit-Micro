(function () {
  "use strict";

  // ── Configuration ──
  var CONFIG = {
    apiUrl: "https://sebit-micro-api.sh1stzfold7.workers.dev/api/chat",
    maxMessages: 30,
    sendCooldown: 2000,
    welcomeMessage:
      "안녕하세요! SEbit AI 상담 챗봇입니다.\n세현ICT의 AI, 모바일, 공간정보 솔루션에 대해 궁금하신 점을 물어보세요.",
    allSuggestions: [
      "SEbit AI가 뭔가요?",
      "LUMO 모바일 플랫폼 소개",
      "GeoAxis는 어떤 솔루션인가요?",
      "Agen-D는 어떤 솔루션인가요?",
      "Safety AI는 어떤 기능이 있나요?",
      "SmartGeoKit 제품군 소개해 주세요",
      "세현ICT는 어떤 회사인가요?",
      "LUMO Push 서비스가 뭔가요?",
      "Chatbot AI는 어떻게 활용하나요?",
      "세현ICT의 주요 사업 영역은?",
    ],
    storageKey: "sebit_chat_history",
    countKey: "sebit_chat_count",
  };

  // ── State ──
  var isOpen = false;
  var isLoading = false;
  var lastSendTime = 0;
  var messages = []; // Array of { role, content }

  // ── DOM references ──
  var fabBtn, chatPanel, messagesContainer, inputField, sendBtn, typingIndicator;

  // ── Initialize ──
  function init() {
    loadMessages();
    createDOM();
    attachEvents();
    if (messages.length === 0) {
      addBotMessage(CONFIG.welcomeMessage);
      showSuggestions();
    } else {
      renderAllMessages();
    }
  }

  // ── Persistence ──
  function loadMessages() {
    try {
      var stored = sessionStorage.getItem(CONFIG.storageKey);
      if (stored) messages = JSON.parse(stored);
    } catch (e) {
      messages = [];
    }
  }

  function saveMessages() {
    try {
      sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
    } catch (e) {
      // sessionStorage full or unavailable
    }
  }

  // ── DOM Creation ──
  function createDOM() {
    // FAB button
    fabBtn = document.createElement("button");
    fabBtn.className = "sebit-chat-fab";
    fabBtn.setAttribute("aria-label", "AI 상담 채팅 열기");
    fabBtn.innerHTML = '<i class="xi-chat xi-2x"></i>';

    // Chat panel
    chatPanel = document.createElement("div");
    chatPanel.className = "sebit-chat-panel";
    chatPanel.innerHTML =
      '<div class="sebit-chat-header">' +
      '  <span class="sebit-chat-title">SEbit AI 상담</span>' +
      '  <button class="sebit-chat-close" aria-label="닫기"><i class="xi-close"></i></button>' +
      "</div>" +
      '<div class="sebit-chat-messages"></div>' +
      '<div class="sebit-chat-typing">' +
      "  <span></span><span></span><span></span>" +
      "</div>" +
      '<div class="sebit-chat-input-bar">' +
      '  <input type="text" class="sebit-chat-input" placeholder="메시지를 입력하세요..." maxlength="500" />' +
      '  <button class="sebit-chat-send" aria-label="전송"><i class="xi-arrow-right"></i></button>' +
      "</div>";

    document.body.appendChild(fabBtn);
    document.body.appendChild(chatPanel);

    // Cache references
    messagesContainer = chatPanel.querySelector(".sebit-chat-messages");
    inputField = chatPanel.querySelector(".sebit-chat-input");
    sendBtn = chatPanel.querySelector(".sebit-chat-send");
    typingIndicator = chatPanel.querySelector(".sebit-chat-typing");
  }

  // ── Event Handlers ──
  function attachEvents() {
    fabBtn.addEventListener("click", toggleChat);
    chatPanel
      .querySelector(".sebit-chat-close")
      .addEventListener("click", toggleChat);
    sendBtn.addEventListener("click", handleSend);
    inputField.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatPanel.classList.add("open");
      fabBtn.classList.add("hidden");
      inputField.focus();
      scrollToBottom();
    } else {
      chatPanel.classList.remove("open");
      fabBtn.classList.remove("hidden");
    }
  }

  // ── Send Message ──
  function handleSend() {
    var text = inputField.value.trim();
    if (!text || isLoading) return;

    // Cooldown check
    var now = Date.now();
    if (now - lastSendTime < CONFIG.sendCooldown) return;
    lastSendTime = now;

    // Message count check
    var count = parseInt(sessionStorage.getItem(CONFIG.countKey) || "0", 10);
    if (count >= CONFIG.maxMessages) {
      addBotMessage(
        "세션당 최대 메시지 수에 도달했습니다.\n추가 문의는 070-4047-8955 또는 asset.manager@sehyunict.com으로 연락해 주세요."
      );
      return;
    }
    sessionStorage.setItem(CONFIG.countKey, String(count + 1));

    // Add user message
    addUserMessage(text);
    inputField.value = "";
    isLoading = true;
    sendBtn.disabled = true;
    showTyping(true);

    // Build API messages (exclude system-level messages)
    var apiMessages = messages
      .filter(function (m) {
        return m.role === "user" || m.role === "assistant";
      })
      .slice(-20);

    // Fetch with streaming
    fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("API error: " + response.status);
        return handleStream(response);
      })
      .catch(function () {
        addBotMessage(
          "죄송합니다. 일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요."
        );
      })
      .finally(function () {
        isLoading = false;
        sendBtn.disabled = false;
        showTyping(false);
      });
  }

  // ── SSE Stream Handler ──
  function handleStream(response) {
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var assistantText = "";
    var buffer = "";

    // Create empty bot message bubble
    var msgEl = createMessageElement("assistant", "");
    messagesContainer.appendChild(msgEl);
    var textEl = msgEl.querySelector(".sebit-msg-text");
    scrollToBottom();

    function read() {
      return reader.read().then(function (result) {
        if (result.done) {
          // Save final message + URL을 클릭 가능 링크로 변환
          if (assistantText) {
            messages.push({ role: "assistant", content: assistantText });
            saveMessages();
            textEl.innerHTML = linkify(assistantText);
          }
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf("data: ") === 0) {
            var data = line.slice(6);
            if (data === "[DONE]") {
              if (assistantText) {
                textEl.innerHTML = linkify(assistantText);
              }
              return;
            }
            try {
              var parsed = JSON.parse(data);
              if (parsed.text) {
                assistantText += parsed.text;
                textEl.textContent = assistantText;
                scrollToBottom();
              }
            } catch (e) {
              // skip
            }
          }
        }

        return read();
      });
    }

    return read();
  }

  // ── Message Helpers ──
  function addUserMessage(text) {
    messages.push({ role: "user", content: text });
    var el = createMessageElement("user", text);
    messagesContainer.appendChild(el);
    scrollToBottom();
    saveMessages();
  }

  function addBotMessage(text) {
    messages.push({ role: "assistant", content: text });
    var el = createMessageElement("assistant", text);
    messagesContainer.appendChild(el);
    scrollToBottom();
    saveMessages();
  }

  var BADGE_HTML = '<div style="margin-top:8px;"><a href="/#ContactUS" style="display:inline-block;background:#48c5ff;color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;text-decoration:none;cursor:pointer;">&#x1F4E9; 상세 문의하기</a></div>';

  // 텍스트를 안전한 HTML로 변환 + 모든 봇 답변 끝에 배지 자동 추가
  function linkify(text) {
    var escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // AI가 출력한 [상세 문의하기] 텍스트 및 관련 안내문 제거 (배지로 대체)
    escaped = escaped.replace(/추가 문의사항은 \[상세 문의하기\]를 이용해 주세요\.?\s*/g, "");
    escaped = escaped.replace(/\[상세 문의하기\]/g, "");
    // URL 노출 대비
    escaped = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:#48c5ff;text-decoration:underline;">$1</a>');
    // 항상 끝에 배지 추가
    return escaped.trim() + BADGE_HTML;
  }

  function createMessageElement(role, text) {
    var div = document.createElement("div");
    div.className = "sebit-msg " + role;
    var span = document.createElement("span");
    span.className = "sebit-msg-text";
    if (role === "assistant") {
      span.innerHTML = linkify(text);
    } else {
      span.textContent = text;
    }
    div.appendChild(span);
    return div;
  }

  function renderAllMessages() {
    messagesContainer.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var el = createMessageElement(m.role, m.content);
      messagesContainer.appendChild(el);
    }
    scrollToBottom();
  }

  function showSuggestions() {
    // 10개 중 랜덤 3개 선택
    var pool = CONFIG.allSuggestions.slice();
    var picked = [];
    for (var j = 0; j < 3 && pool.length > 0; j++) {
      var idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    var wrap = document.createElement("div");
    wrap.className = "sebit-chat-suggestions";
    for (var i = 0; i < picked.length; i++) {
      (function (text) {
        var chip = document.createElement("button");
        chip.className = "sebit-chat-chip";
        chip.textContent = text;
        chip.addEventListener("click", function () {
          wrap.remove();
          inputField.value = text;
          handleSend();
        });
        wrap.appendChild(chip);
      })(picked[i]);
    }
    messagesContainer.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping(show) {
    if (show) {
      typingIndicator.classList.add("active");
    } else {
      typingIndicator.classList.remove("active");
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // ── Boot ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
