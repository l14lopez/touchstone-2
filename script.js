/* North Star Bakery: saved product ideas and inquiry feedback. */
(() => {
  'use strict';

  const productIdeas = [
    { id: 'signature-loaf', name: 'Signature Loaf' },
    { id: 'morning-pastries', name: 'Morning Pastries' },
    { id: 'celebration-cakes', name: 'Celebration Cakes' }
  ];
  const storageKey = 'north-star-bakery-favorites';

  function loadFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(parsed)
        ? parsed.filter(id => productIdeas.some(product => product.id === id))
        : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(favorites) {
    try { localStorage.setItem(storageKey, JSON.stringify(favorites)); }
    catch { /* Favorites remain usable on this page if storage is unavailable. */ }
  }

  function renderFavorites(favorites) {
    const list = document.getElementById('favorites-list');
    const status = document.getElementById('favorites-status');
    list.replaceChildren();
    productIdeas.filter(product => favorites.includes(product.id)).forEach(product => {
      const item = document.createElement('li');
      item.textContent = product.name;
      list.append(item);
    });
    status.textContent = favorites.length
      ? `${favorites.length} item${favorites.length === 1 ? '' : 's'} saved for your next visit.`
      : 'No items saved yet.';
    document.querySelectorAll('.favorite-button').forEach(button => {
      const product = productIdeas.find(entry => entry.id === button.dataset.product);
      const selected = favorites.includes(product.id);
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = `${selected ? 'Remove' : 'Save'} ${product.name}`;
    });
  }

  function initFavorites() {
    const list = document.getElementById('favorites-list');
    if (!list) return;
    let favorites = loadFavorites();
    renderFavorites(favorites);
    document.querySelectorAll('.favorite-button').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.product;
        favorites = favorites.includes(id)
          ? favorites.filter(item => item !== id)
          : [...favorites, id];
        saveFavorites(favorites);
        renderFavorites(favorites);
      });
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const messages = {
      name: !value ? 'Enter your name.' : value.length < 2 ? 'Name must have at least 2 characters.' : '',
      email: !value ? 'Enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Enter a valid email address.' : '',
      'request-type': !value ? 'Choose a request type.' : '',
      'pickup-date': !value ? 'Choose a date.' : value < localToday ? 'Choose today or a future date.' : '',
      details: !value ? 'Describe your request.' : value.length < 10 ? 'Add at least 10 characters of detail.' : ''
    };
    const message = messages[field.id] || '';
    document.getElementById(`${field.id}-error`).textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  function initInquiryForm() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;
    form.noValidate = true;
    const fields = ['name', 'email', 'request-type', 'pickup-date', 'details']
      .map(id => document.getElementById(id));
    fields.forEach(field => {
      field.addEventListener(field.tagName === 'SELECT' || field.type === 'date' ? 'change' : 'input', () => {
        if (field.hasAttribute('aria-invalid')) validateField(field);
        document.getElementById('form-status').textContent = '';
      });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const results = fields.map(validateField);
      const status = document.getElementById('form-status');
      if (results.every(Boolean)) {
        status.textContent = 'Your request details are ready to review. This demonstration does not send a message or place an order.';
      } else {
        status.textContent = 'Please correct the highlighted fields. Your entries have been kept.';
        fields[results.indexOf(false)].focus();
      }
    });
  }

  initFavorites();
  initInquiryForm();
})();
