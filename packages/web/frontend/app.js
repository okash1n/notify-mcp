const tokenInput = document.getElementById("tokenInput");
const saveTokenButton = document.getElementById("saveToken");
const refreshTokenButton = document.getElementById("refreshToken");
const channelsContainer = document.getElementById("channels");
const logsContainer = document.getElementById("logs");
const testMessage = document.getElementById("testMessage");
const testUrgency = document.getElementById("testUrgency");
const sendTest = document.getElementById("sendTest");
const testResult = document.getElementById("testResult");
const reloadChannels = document.getElementById("reloadChannels");
const reloadLogs = document.getElementById("reloadLogs");

const state = {
  token: localStorage.getItem("nmcp_token") || ""
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
reloadChannels.addEventListener("click", () => loadChannels());
reloadLogs.addEventListener("click", () => loadLogs());

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
  const data = await res.json().catch(() => ({}));
  if (data.token && !state.token) {
    tokenInput.value = data.token;
  }
}

async function loadChannels() {
  const res = await apiFetch("/api/channels");
  const data = await res.json().catch(() => ({ channels: [] }));
  channelsContainer.innerHTML = "";

  data.channels.forEach((channel) => {
    const wrapper = document.createElement("div");
    wrapper.className = "channel-item";

    const meta = document.createElement("div");
    meta.className = "channel-meta";
    meta.textContent = `${channel.id} · ${channel.type}`;

    const enabledLabel = document.createElement("label");
    enabledLabel.innerHTML = "<span>Enabled</span>";
    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = Boolean(channel.enabled);
    enabledLabel.appendChild(enabledInput);

    const formatLabel = document.createElement("label");
    formatLabel.innerHTML = "<span>Format</span>";
    const formatInput = document.createElement("textarea");
    formatInput.value = channel.format || "{{urgency_emoji}} {{message}}";
    formatLabel.appendChild(formatInput);

    const saveButton = document.createElement("button");
    saveButton.className = "primary";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", async () => {
      await apiFetch(`/api/channels/${channel.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...channel,
          enabled: enabledInput.checked,
          format: formatInput.value
        })
      });
      loadChannels();
    });

    wrapper.appendChild(meta);
    wrapper.appendChild(enabledLabel);
    wrapper.appendChild(formatLabel);
    wrapper.appendChild(saveButton);
    channelsContainer.appendChild(wrapper);
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

async function loadAll() {
  await loadAuth();
  await loadChannels();
  await loadLogs();
}

loadAll();
