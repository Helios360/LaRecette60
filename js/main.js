const burgerMenu = document.getElementById('burger-menu');
const burger = document.getElementById('burger');
burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  burgerMenu.classList.toggle('open');
});

const selectForm = document.getElementById('type');
const formPlace = document.getElementById('selectedForm');
const cart = document.getElementById('cart');

const getCakes = () => JSON.parse(localStorage.getItem('cakes')) || [];
const setCakes = (arr) => localStorage.setItem('cakes', JSON.stringify(arr));

function renderCart() {
  const cakes = getCakes();
  cart.innerHTML = '';
  cakes.forEach((c, index) => {
    cart.innerHTML += `
      <div class="cake-item" data-index="${index}">
        <p>Base: ${c.base}</p>
        <p>Fourrage: ${c.fourrage}</p>
        <p>Nombre de parts: ${c.nbParts}</p>
        <a href="#" class="delete-cake" data-index="${index}" aria-label="Supprimer ce gâteau">
          <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4V4zm2 2h6V4H9v2zM6.074 8l.857 12H17.07l.857-12H6.074zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z" fill="var(--secondary)"/>
          </svg>
        </a>
      </div>
    `;
  });
}

// Delegated delete handler
cart.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-cake');
  if (!btn) return;
  e.preventDefault();

  const index = Number(btn.dataset.index);
  const cakes = getCakes();
  cakes.splice(index, 1);
  setCakes(cakes);
  renderCart();
});

// Render cart on page load
renderCart();

selectForm.addEventListener("change", () => {
  const selectedValue = selectForm.value;
  formPlace.innerHTML = "";

  if (selectedValue === "gateau-a-theme") {
    formPlace.innerHTML = `
      <div class="field">
        <label for="base-gateau-a-theme">Base du gateau</label>
        <select id="base-gateau-a-theme">
          <option value="vanille">Vanille</option>
          <option value="chocolat">Chocolat</option>
        </select>
      </div>
      <div class="field">
        <label for="fourrage-gateau-a-theme">Fourrage du gateau</label>
        <select id="fourrage-gateau-a-theme">
          <option value="vanille">Vanille</option>
          <option value="chocolat-au-lait">Chocolat au lait</option>
          <option value="framboise">Framboise</option>
          <option value="speculoos">Spéculoos</option>
          <option value="pistache">Pistache</option>
          <option value="praline">Praliné</option>
          <option value="citron">Citron</option>
          <option value="fraise">Fraise</option>
          <option value="cerise">Cerise</option>
        </select>
      </div>
      <div class="field">
        <label for="parts-gateau-a-theme">Nombre de parts</label>
        <select id="parts-gateau-a-theme">
          <option value="10">10</option>
          <option value="12">12</option>
          <option value="15">15</option>
          <option value="22">22</option>
        </select>
      </div>
      <div class="field">
        <textarea id="custom" placeholder="Vos demandes personnalisées..."></textarea>
      </div>
      <p>Pour les gâteaux à thèmes de plus de 22 parts (plusieurs étages), commande personnalisée recommandée.</p>
      <button type="button" id="add-cake">Ajouter</button>
    `;

    // Attach add handler only once per render
    document.getElementById('add-cake').addEventListener('click', () => {
      const base = document.getElementById('base-gateau-a-theme').value;
      const fourrage = document.getElementById('fourrage-gateau-a-theme').value;
      const nbParts = document.getElementById('parts-gateau-a-theme').value;
      const custom = document.getElementById('custom').value;

      const cakes = getCakes();
      cakes.push({ base, fourrage, nbParts, custom });
      setCakes(cakes);
      renderCart();
    });

  } else if (selectedValue === "entremet") {
    formPlace.innerHTML = `
      <div class="field">
        <label for="base-entremet">Base du gâteau</label>
        <select id="base-entremet">
          <option value="base-vanille">Vanille</option>
          <option value="base-chocolat">Chocolat</option>
        </select>
      </div>
    `;
  }
});
const sendBtn = document.getElementById('send-cart');
const sendStatus = document.getElementById('sendStatus');

function setStatus(msg, ok = true) {
  sendStatus.textContent = msg;
  sendStatus.style.color = ok ? 'var(--secondary)' : 'crimson';
}

function getUserInfo() {
  return {
    email: (document.getElementById('user-email')?.value || '').trim(),
    name: (document.getElementById('user-name-fname')?.value || '').trim(),
    address: (document.getElementById('user-adresse')?.value || '').trim(),
  };
}
function saveUserInfoToLS(info) {
  try { localStorage.setItem('lr_user_info', JSON.stringify(info)); } catch {}
}
function loadUserInfoFromLS() {
  try {
    const raw = localStorage.getItem('lr_user_info');
    if (!raw) return;
    const { email, name, address } = JSON.parse(raw);
    if (email) document.getElementById('user-email').value = email;
    if (name) document.getElementById('user-name-fname').value = name;
    if (address) document.getElementById('user-adresse').value = address;
  } catch {}
}

function isValidEmail(email) {
  // simple sanity check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendCartByEmail() {
  const cakes = getCakes();
  if (!cakes.length) {
    setStatus("Votre panier est vide.", false);
    return;
  }

  const user = getUserInfo();
  if (!user.name || !user.address || !user.email) {
    setStatus("Veuillez renseigner votre nom, votre adresse et votre email.", false);
    return;
  }
  if (!isValidEmail(user.email)) {
    setStatus("Adresse e-mail invalide.", false);
    return;
  }

  sendBtn.disabled = true;
  setStatus("Envoi en cours…");

  try {
    // persist the user info for next time
    saveUserInfoToLS(user);

    const res = await fetch('send_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cakes,
        customer: {
          email: user.email,
          name: user.name,
          address: user.address
        },
        webpage: location.href,
        sentAt: new Date().toISOString()
      })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      setStatus("✅ Panier envoyé avec succès !");
      localStorage.removeItem('cakes');
      renderCart();
    } else {
      setStatus(data.error || "Échec de l’envoi. Réessayez plus tard.", false);
    }
  } catch (err) {
    setStatus("Erreur réseau: " + err.message, false);
  } finally {
    sendBtn.disabled = false;
  }
}
loadUserInfoFromLS();

if (sendBtn) {
  sendBtn.addEventListener('click', sendCartByEmail);
}
