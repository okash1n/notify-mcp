const tokenInput = document.getElementById("tokenInput");
const authEnabled = document.getElementById("authEnabled");
const saveTokenButton = document.getElementById("saveToken");
const refreshTokenButton = document.getElementById("refreshToken");
const regenerateTokenButton = document.getElementById("regenerateToken");
const channelsContainer = document.getElementById("channels");
const newChannelContainer = document.getElementById("newChannel");
const addChannelButton = document.getElementById("addChannel");
const addChannelStatus = document.getElementById("addChannelStatus");
const logsContainer = document.getElementById("logs");
const testMessage = document.getElementById("testMessage");
const testUrgency = document.getElementById("testUrgency");
const sendTest = document.getElementById("sendTest");
const testResult = document.getElementById("testResult");
const reloadChannels = document.getElementById("reloadChannels");
const reloadLogs = document.getElementById("reloadLogs");
const broadcastToggle = document.getElementById("broadcastToggle");
const loggingToggle = document.getElementById("loggingToggle");
const loggingPath = document.getElementById("loggingPath");
const saveSettings = document.getElementById("saveSettings");

const state = {
  token: localStorage.getItem("nmcp_token") || "",
  presets: []
};

if (state.token) {
  tokenInput.value = state.token;
}

saveTokenButton.addEventListener("click", () => {
  state.token = tokenInput.value.trim();
  localStorage.setItem("nmcp_token", state.token);
  loadAll();
});

refreshTokenButton.addEventListener("click", () => loadAuth());
regenerateTokenButton.addEventListener("click", async () => {
  const res = await apiFetch("/api/auth/token", {
    method: "POST",
    body: JSON.stringify({ regenerate: true })
  });
  if (!res.ok) {
    alert("Failed to regenerate token. Ensure auth is disabled or token is set.");
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (data.token) {
    tokenInput.value = data.token;
    state.token = data.token;
    localStorage.setItem("nmcp_token", data.token);
  }
  if (typeof data.enabled === "boolean") {
    authEnabled.checked = data.enabled;
  }
});

authEnabled.addEventListener("change", async () => {
  const enabled = authEnabled.checked;
  const payload = { enabled, regenerate: enabled && !tokenInput.value.trim() };
  const res = await apiFetch("/api/auth/token", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    authEnabled.checked = !enabled;
    alert("Failed to update auth setting. Check your token.");
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (data.token) {
    tokenInput.value = data.token;
    state.token = data.token;
    localStorage.setItem("nmcp_token", data.token);
  }
});

reloadChannels.addEventListener("click", () => loadChannels());
reloadLogs.addEventListener("click", () => loadLogs());

saveSettings.addEventListener("click", async () => {
  const payload = {
    broadcast: broadcastToggle.checked,
    logging: {
      enabled: loggingToggle.checked,
      db_path: loggingPath.value.trim()
    }
  };
  const res = await apiFetch("/api/config", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    alert("Failed to save settings.");
    return;
  }
  await loadConfig();
});

sendTest.addEventListener("click", async () => {
  testResult.textContent = "sending...";
  const payload = {
    message: testMessage.value || "Test notification",
    urgency: testUrgency.value
  };
  const res = await apiFetch("/api/test", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  testResult.textContent = JSON.stringify(data, null, 2);
});

addChannelButton.addEventListener("click", async () => {
  addChannelStatus.textContent = "";
  try {
    const payload = state.newChannelForm.getPayload();
    const res = await apiFetch("/api/channels", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      addChannelStatus.textContent = "Failed to add channel.";
      return;
    }
    addChannelStatus.textContent = "Added.";
    await loadChannels();
  } catch (err) {
    addChannelStatus.textContent = err?.message || String(err);
  }
});

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (state.token) {
    headers.set("Authorization", `Bearer ${state.token}`);
  }
  return fetch(path, { ...options, headers });
}

async function loadAuth() {
  const res = await apiFetch("/api/auth");
  if (!res.ok) {
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (typeof data.enabled === "boolean") {
    authEnabled.checked = data.enabled;
  }
  if (data.token && !state.token) {
    tokenInput.value = data.token;
  }
}

async function loadConfig() {
  const res = await apiFetch("/api/config");
  if (!res.ok) {
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (typeof data.broadcast === "boolean") {
    broadcastToggle.checked = data.broadcast;
  }
  if (data.logging) {
    loggingToggle.checked = Boolean(data.logging.enabled);
    loggingPath.value = data.logging.db_path || "";
  }
}

async function loadPresets() {
  const res = await apiFetch("/api/presets");
  const data = await res.json().catch(() => ({ presets: [] }));
  state.presets = data.presets || [];
}

function createLabel(text, input) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = text;
  label.appendChild(span);
  label.appendChild(input);
  return label;
}

function createInput(type, value = "", placeholder = "") {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  if (placeholder) input.placeholder = placeholder;
  return input;
}

function createTextarea(value = "", placeholder = "") {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  if (placeholder) textarea.placeholder = placeholder;
  return textarea;
}

function createSelect(options, value) {
  const select = document.createElement("select");
  options.forEach((option) => {
    const el = document.createElement("option");
    el.value = option.value;
    el.textContent = option.label;
    if (option.value === value) {
      el.selected = true;
    }
    select.appendChild(el);
  });
  return select;
}

function buildUrgencyFields(existing) {
  const info = document.createElement("input");
  info.type = "checkbox";
  const action = document.createElement("input");
  action.type = "checkbox";

  if (Array.isArray(existing)) {
    info.checked = existing.includes("info");
    action.checked = existing.includes("action_required");
  }

  const container = document.createElement("div");
  container.className = "row";

  const infoLabel = document.createElement("label");
  infoLabel.className = "inline";
  infoLabel.appendChild(info);
  infoLabel.appendChild(document.createTextNode(" info only"));

  const actionLabel = document.createElement("label");
  actionLabel.className = "inline";
  actionLabel.appendChild(action);
  actionLabel.appendChild(document.createTextNode(" action_required only"));

  container.appendChild(infoLabel);
  container.appendChild(actionLabel);

  return { container, info, action };
}

function buildChannelForm(channel, options) {
  const wrapper = document.createElement("div");
  wrapper.className = "channel-item";

  const typeOptions = [
    { label: "http-webhook", value: "http-webhook" },
    { label: "ntfy", value: "ntfy" },
    { label: "desktop", value: "desktop" }
  ];

  let type = channel.type || "http-webhook";
  let typeSelect;

  if (options.allowTypeSelect) {
    typeSelect = createSelect(typeOptions, type);
    wrapper.appendChild(createLabel("Type", typeSelect));
  } else {
    const meta = document.createElement("div");
    meta.className = "channel-meta";
    meta.textContent = `${channel.id || "new"} · ${type}`;
    wrapper.appendChild(meta);
  }

  const enabledInput = createInput("checkbox");
  enabledInput.checked = Boolean(channel.enabled ?? true);
  wrapper.appendChild(createLabel("Enabled", enabledInput));

  const formatInput = createTextarea(channel.format || "{{urgency_emoji}} {{message}}", "{{urgency_emoji}} {{message}}");
  wrapper.appendChild(createLabel("Format", formatInput));

  const urgencyFields = buildUrgencyFields(channel.only_urgency || []);
  wrapper.appendChild(createLabel("Only Urgency (optional)", urgencyFields.container));

  const typeFields = document.createElement("div");
  wrapper.appendChild(typeFields);

  const typeState = {};

  function renderTypeFields(currentType) {
    typeFields.innerHTML = "";

    if (currentType === "http-webhook") {
      const urlInput = createInput("text", channel.url || "", "https://hooks.example.com/...");
      const presetOptions = [{ label: "custom", value: "" }].concat(
        state.presets.map((preset) => ({ label: preset.name, value: preset.name }))
      );
      const presetSelect = createSelect(presetOptions, channel.preset || "");
      const headersInput = createTextarea(
        channel.headers ? JSON.stringify(channel.headers, null, 2) : "",
        '{"Authorization":"Bearer ..."}'
      );

      typeFields.appendChild(createLabel("Webhook URL", urlInput));
      typeFields.appendChild(createLabel("Preset", presetSelect));
      typeFields.appendChild(createLabel("Headers (JSON)", headersInput));

      Object.assign(typeState, { urlInput, presetSelect, headersInput });
    }

    if (currentType === "ntfy") {
      const serverInput = createInput("text", channel.server || "https://ntfy.sh", "https://ntfy.sh");
      const topicInput = createInput("text", channel.topic || "", "my-topic");
      const infoPriority = createInput("number", channel.priority_map?.info ?? "", "3");
      const actionPriority = createInput("number", channel.priority_map?.action_required ?? "", "5");

      typeFields.appendChild(createLabel("Server", serverInput));
      typeFields.appendChild(createLabel("Topic", topicInput));
      typeFields.appendChild(createLabel("Priority (info)", infoPriority));
      typeFields.appendChild(createLabel("Priority (action_required)", actionPriority));

      Object.assign(typeState, { serverInput, topicInput, infoPriority, actionPriority });
    }

    if (currentType === "desktop") {
      const endpointInput = createInput("text", channel.endpoint || "ws://localhost:9876", "ws://localhost:9876");
      typeFields.appendChild(createLabel("Endpoint", endpointInput));
      Object.assign(typeState, { endpointInput });
    }
  }

  renderTypeFields(type);

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      type = typeSelect.value;
      renderTypeFields(type);
    });
  }

  function getPayload() {
    const payload = {
      id: channel.id,
      type,
      enabled: enabledInput.checked,
      format: formatInput.value.trim() || undefined
    };

    const urgencyOnly = [];
    if (urgencyFields.info.checked) urgencyOnly.push("info");
    if (urgencyFields.action.checked) urgencyOnly.push("action_required");
    if (urgencyOnly.length) {
      payload.only_urgency = urgencyOnly;
    }

    if (type === "http-webhook") {
      const url = typeState.urlInput.value.trim();
      if (!url) throw new Error("Webhook URL is required.");
      payload.url = url;
      if (typeState.presetSelect.value) {
        payload.preset = typeState.presetSelect.value;
      }
      const headersText = typeState.headersInput.value.trim();
      if (headersText) {
        try {
          payload.headers = JSON.parse(headersText);
        } catch (err) {
          throw new Error("Headers JSON is invalid.");
        }
      }
    }

    if (type === "ntfy") {
      const server = typeState.serverInput.value.trim();
      const topic = typeState.topicInput.value.trim();
      if (!server || !topic) throw new Error("ntfy server and topic are required.");
      payload.server = server;
      payload.topic = topic;
      const infoValue = typeState.infoPriority.value;
      const actionValue = typeState.actionPriority.value;
      const priority = {};
      if (infoValue) priority.info = Number(infoValue);
      if (actionValue) priority.action_required = Number(actionValue);
      if (Object.keys(priority).length) {
        payload.priority_map = priority;
      }
    }

    if (type === "desktop") {
      const endpoint = typeState.endpointInput.value.trim();
      if (!endpoint) throw new Error("Desktop endpoint is required.");
      payload.endpoint = endpoint;
    }

    return payload;
  }

  return { element: wrapper, getPayload };
}

async function loadChannels() {
  const res = await apiFetch("/api/channels");
  const data = await res.json().catch(() => ({ channels: [] }));
  channelsContainer.innerHTML = "";

  data.channels.forEach((channel) => {
    const { element, getPayload } = buildChannelForm(channel, { allowTypeSelect: false });

    const actions = document.createElement("div");
    actions.className = "row";

    const saveButton = document.createElement("button");
    saveButton.className = "primary";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", async () => {
      try {
        const payload = getPayload();
        const res = await apiFetch(`/api/channels/${channel.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          alert("Failed to save channel.");
          return;
        }
        await loadChannels();
      } catch (err) {
        alert(err?.message || String(err));
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "ghost";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      if (!confirm(`Delete ${channel.id}?`)) return;
      const res = await apiFetch(`/api/channels/${channel.id}`, { method: "DELETE" });
      if (res.ok) {
        await loadChannels();
      }
    });

    actions.appendChild(saveButton);
    actions.appendChild(deleteButton);
    element.appendChild(actions);
    channelsContainer.appendChild(element);
  });
}

async function loadLogs() {
  const res = await apiFetch("/api/logs");
  const data = await res.json().catch(() => ({ logs: [] }));
  logsContainer.innerHTML = "";

  data.logs.forEach((log) => {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = `${log.timestamp} · ${log.urgency} · ${log.status} · ${log.message}`;
    logsContainer.appendChild(entry);
  });
}

async function loadNewChannelForm() {
  newChannelContainer.innerHTML = "";
  const { element, getPayload } = buildChannelForm({ enabled: true }, { allowTypeSelect: true });
  newChannelContainer.appendChild(element);
  state.newChannelForm = { getPayload };
}

async function loadAll() {
  await loadPresets();
  await loadAuth();
  await loadConfig();
  await loadNewChannelForm();
  await loadChannels();
  await loadLogs();
}

loadAll();
