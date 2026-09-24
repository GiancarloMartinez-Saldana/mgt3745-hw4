(() => {
  'use strict';

  const storageKey = 'mgt3745.subscriptions.v1';
  const noteForm = document.querySelector('#note-form');
  const noteInput = document.querySelector('#note-input');
  const priceInput = document.querySelector('#price-input');
  const noteList = document.querySelector('#note-list');
  const noteError = document.querySelector('#note-error');
  const saveStatus = document.querySelector('#save-status');
  const emptyState = document.querySelector('#empty-state');
  const spendTotal = document.querySelector('#spend-total');
  // The query switch enables a repeatable classroom failure without filling real storage.
  const simulateFailedSave = new URLSearchParams(window.location.search).has('failSave');
  let notes = loadNotes();

  function loadNotes() {
    try {
      const storedText = window.localStorage.getItem(storageKey);
      const parsed = storedText === null ? [] : JSON.parse(storedText);
      const isValidEntry = entry =>
        entry && typeof entry.service === 'string' && entry.service.trim().length > 0 &&
        typeof entry.price === 'number' && Number.isFinite(entry.price) && entry.price > 0;
      if (!Array.isArray(parsed) || parsed.some(entry => !isValidEntry(entry))) {
        throw new Error('Unexpected stored data');
      }
      return parsed;
    } catch {
      saveStatus.textContent = 'Saved notes could not be read. Original storage was left unchanged. A successful new save will replace it.';
      return [];
    }
  }

  function saveNotes(nextNotes) {
    try {
      if (simulateFailedSave) throw new Error('Simulated write failure');
      // Persist the proposed state before changing the visible state or clearing input.
      window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
      return true;
    } catch {
      noteError.textContent = 'Could not save. Your text is still here. Try again when storage is available.';
      saveStatus.textContent = '';
      return false;
    }
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
      noteText.textContent = `${note.service} — ${formatPrice(note.price)}/mo`;
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete subscription ${index + 1}: ${note.service}`);
      deleteButton.addEventListener('click', () => {
        const nextNotes = notes.filter((entry, entryIndex) => entryIndex !== index);
        if (!saveNotes(nextNotes)) return;
        notes = nextNotes;
        noteError.textContent = '';
        renderNotes();
        saveStatus.textContent = 'Subscription deleted.';
        noteInput.focus();
      });
      listItem.append(noteText, deleteButton);
      noteList.append(listItem);
    });
  }

  noteForm.addEventListener('submit', event => {
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
    const nextNotes = [...notes, { service, price }];
    if (!saveNotes(nextNotes)) return;
    notes = nextNotes;
    renderNotes();
    noteInput.value = '';
    priceInput.value = '';
    noteInput.focus();
    saveStatus.textContent = 'Subscription saved in this browser.';
  });

  renderNotes();
})();
