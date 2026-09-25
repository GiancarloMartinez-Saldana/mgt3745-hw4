(() => {
  'use strict';

  // HW4: subscriptions now live in Cloudflare D1 behind the Worker (ADR-002).
  // Paste your deployed Worker URL here after `npx wrangler deploy`.
  const deployedApi = 'https://mgt3745-hw4.mgt3745-hw4-giancarlo.workers.dev';
  // A page served from this machine talks to `npm run dev` instead, so the
  // failure modes in FEATURES.md can be tested without touching the real table.
  const isLocalPage = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  // The query switch makes "server unreachable" repeatable: nothing listens on port 9.
  const simulateServerDown = new URLSearchParams(window.location.search).has('serverDown');
  const api = simulateServerDown ? 'http://127.0.0.1:9'
    : isLocalPage ? 'http://127.0.0.1:8787'
    : deployedApi;

  // ---- HW3, for the record (superseded by ADR-002) ------------------------
  // loadNotes: JSON.parse(window.localStorage.getItem(storageKey))
  // saveNotes: window.localStorage.setItem(storageKey, JSON.stringify(nextNotes))
  // -------------------------------------------------------------------------

  const noteForm = document.querySelector('#note-form');
  const noteInput = document.querySelector('#note-input');
  const priceInput = document.querySelector('#price-input');
  const noteList = document.querySelector('#note-list');
  const noteError = document.querySelector('#note-error');
  const saveStatus = document.querySelector('#save-status');
  const emptyState = document.querySelector('#empty-state');
  const spendTotal = document.querySelector('#spend-total');
  let notes = [];

  function showError(message) {
    // The user sees it on the page. Nothing is thrown in the console.
    noteError.textContent = message;
    saveStatus.textContent = '';
  }

  async function loadNotes() {
    const response = await fetch(api + '/entries');
    if (!response.ok) {
      showError('Could not load your subscriptions (server said ' + response.status + '). Try reloading.');
      return [];
    }
    return response.json();
  }

  async function saveNote(entry) {
    const response = await fetch(api + '/entries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      // The Worker's 400 path sends a short reason in the body. Show it.
      const reason = await response.text();
      showError('Could not save: ' + (reason || response.status) + '. Your entry is still here.');
      return false;
    }
    return true;
  }

  async function deleteNote(id) {
    const response = await fetch(api + '/entries/' + encodeURIComponent(id), { method: 'DELETE' });
    if (!response.ok) {
      showError('Could not delete that subscription. Nothing was changed.');
      return false;
    }
    return true;
  }

  function formatPrice(price) {
    return price.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  function renderNotes() {
    noteList.replaceChildren();
    emptyState.hidden = notes.length > 0;

    const total = notes.reduce((sum, entry) => sum + entry.price, 0);
    spendTotal.textContent = notes.length > 0
      ? `Total monthly spend: ${formatPrice(total)}`
      : '';

    notes.forEach((note, index) => {
      const listItem = document.createElement('li');
      const noteText = document.createElement('span');
      // textContent, never innerHTML: the server does not get to write HTML into the page either.
      noteText.textContent = `${note.service} — ${formatPrice(note.price)}/mo`;
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete subscription ${index + 1}: ${note.service}`);
      deleteButton.addEventListener('click', async () => {
        try {
          if (!(await deleteNote(note.id))) return;
          await refresh();
          saveStatus.textContent = 'Subscription deleted.';
          noteInput.focus();
        } catch {
          showError('Could not reach the server. Nothing was deleted.');
        }
      });
      listItem.append(noteText, deleteButton);
      noteList.append(listItem);
    });
  }

  async function refresh() {
    try {
      notes = await loadNotes();
    } catch {
      // The network itself failed (offline, DNS, CORS). fetch throws here.
      showError('Could not reach the server. Your subscriptions are safe; try again shortly.');
      notes = [];
    }
    renderNotes();
  }

  noteForm.addEventListener('submit', async event => {
    event.preventDefault();
    const service = noteInput.value.trim();
    const characterCount = Array.from(service).length;
    const price = Number(priceInput.value);

    if (characterCount < 1 || characterCount > 200) {
      noteError.textContent = 'Enter a service name containing 1–200 characters.';
      noteInput.setAttribute('aria-invalid', 'true');
      saveStatus.textContent = '';
      noteInput.focus();
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      noteError.textContent = 'Enter a monthly price greater than 0.';
      priceInput.setAttribute('aria-invalid', 'true');
      saveStatus.textContent = '';
      priceInput.focus();
      return;
    }
    noteInput.removeAttribute('aria-invalid');
    priceInput.removeAttribute('aria-invalid');
    noteError.textContent = '';

    try {
      // Only clear the inputs after the server confirms, same rule as HW3.
      if (!(await saveNote({ service, price }))) return;
    } catch {
      showError('Could not reach the server. Your entry is still here; try again.');
      return;
    }
    await refresh();
    noteInput.value = '';
    priceInput.value = '';
    noteInput.focus();
    saveStatus.textContent = 'Subscription saved.';
  });

  refresh();
})();
