// --- tiny helpers ------------------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);

  // apply properties except dataset
  const { dataset, ...rest } = props;
  Object.assign(node, rest);

  if (dataset) {
    for (const [k, v] of Object.entries(dataset)) {
      node.dataset[k] = v;
    }
  }

  for (const c of children.flat()) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }

  return node;
};

const replace = (node, ...kids) => node.replaceChildren(...kids);

// --- UI refs -----------------------------------------------------------------
const burgerMenu = $('#burger-menu');
const burger = $('#burger');

const selectForm = $('#type');
const formPlace = $('#selectedForm');
const cart = $('#cart');

const sendBtn = $('#send-cart');
const sendStatus = $('#sendStatus');

// Ensure status is announced to assistive tech
if (sendStatus) {
  sendStatus.setAttribute('role', 'status');
  sendStatus.setAttribute('aria-live', 'polite');
}

// --- persistent state ---------------------------------------------------------
const LS_KEYS = {
  cakes: 'cakes',
  user: 'lr_user_info',
};

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

const getCakes = () => storage.get(LS_KEYS.cakes, []);
const setCakes = (arr) => storage.set(LS_KEYS.cakes, arr);

// --- burger toggle ------------------------------------------------------------
if (burger && burgerMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    burgerMenu.classList.toggle('open');
  });
}

// --- cart rendering & actions -------------------------------------------------
function CakeItem(item, index) {
  const { gateau, base, fourrage, nbParts, custom, variete, produit, style, quantite } = item;
  return el(
    'div',
    { className: 'cake-item', dataset: { index } },
    el('p', {}, `Catégorie: ${gateau}`),
    produit ? el('p', {}, `Produit: ${produit}`) : null,
    variete ? el('p', {}, `Variété: ${variete}`) : null,
    style ? el('p', {}, `Style: ${style}`) : null,
    base ? el('p', {}, `Base: ${base}`) : null,
    fourrage ? el('p', {}, `Fourrage: ${fourrage}`) : null,
    nbParts ? el('p', {}, `Nombre de parts: ${nbParts}`) : null,
    quantite ? el('p', {}, `Quantité: ${quantite}`) : null,
    custom ? el('p', {}, `Notes: ${custom}`) : null,
    el(
      'button',
      {
        className: 'delete-cake',
        type: 'button',
        'aria-label': 'Supprimer ce gâteau',
        dataset: { index }
      },
      el('span', { 'aria-hidden': 'true' }, '🗑️')
    )
  );
}


function renderCart() {
  if (!cart) return;
  const cakes = getCakes();
  if (!cakes.length) {
    replace(cart, el('p', { className: 'empty' }, 'Votre panier est vide.'));
    return;
  }
  const items = cakes.map((c, i) => CakeItem(c, i));
  replace(cart, ...items);
}

// Single delegated handler for delete
if (cart) {
  cart.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-cake');
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const cakes = getCakes();
    if (Number.isInteger(index) && index >= 0 && index < cakes.length) {
      cakes.splice(index, 1);
      setCakes(cakes);
      renderCart();
      setStatus('Élément supprimé.');
    }
  });
}

// --- dynamic form building ----------------------------------------------------
const DATA = {
  gateauTheme: {
    bases: ['Vanille', 'Chocolat'],
    fourrages: [
      'Vanille','Chocolat au lait','Framboise','Spéculoos',
      'Pistache','Praliné','Citron','Fraise','Cerise'
    ],
    parts: ['10','12','15','22']
  },
  entremet: {
    types: [
      'Le Fraisier','Macaron Coeur Framboise','Schuss aux fruits des bois',
      'Framboisier','La Seraphine','La charlotte poire chocolat',
      'Le Biscoff','Le Royal','Le Trois Chocolat'
    ],
    parts: ['10','12','15','22']
  },

  // --- NOUVEAUX CATALOGUES ---------------------------------------------------
  mignardises: {
    varietes: [
      'Tartelettes citron', 'Chou chocolat', 'Mini pécan vanille',
      'Mini mousse au chocolat', 'Pavlova fruits exotiques',
      'Tartelette framboise', 'Paris-Brest'
    ],
    minParVariete: 10
  },

  miniDonuts: {
    varietes: ['Chocolat', 'Oreo', 'Speculoos', 'Vanille'],
    minParVariete: 15
  },

  cakePops: {
    varietes: ['Chocolat', 'Speculoos', 'Citron'],
    minParVariete: 10
  },

  magnumsCakes: {
    varietes: ['Chocolat', 'Speculoos', 'Citron'],
    minParVariete: 5
  },

  cupcakes: {
    // individuels
    varietes: [
      'Kinder (Base chocolat, croustillant noisette, crème chocolat)',
      'Croustipomme (Base vanille, pommes caramélisées, crumble, crème caramel)',
      'Marbré (Base vanille et chocolat, pépites, crème vanille et chocolat)',
      'Rose (Base nature, pépites chocolat blanc, framboises, crème vanille)',
      'M&M’s (Base vanille, crémeux cacahuète, crème chocolat au lait, M&M’s)'
    ],
    minParVariete: 5
  },

  minisCupcakes: {
    varietes: [
      'Marieke (base vanille, chantilly spéculoos)',
      'Rose (base vanille, compotée framboises, chantilly chocolat blanc)',
      'M&M’s (base vanille, chantilly chocolat au lait, M&M’s)',
      'Oréos (base vanille, chantilly chocolat blanc, Oréos)',
      'Kinder Bueno (base vanille, chantilly chocolat au lait Kinder Bueno)'
    ],
    minParVariete: 10
  },

  classiques: {
    // parts par produit
    produits: {
      'Éclair chocolat à partager': ['8','10','12'],
      'Paris-Brest': ['8','10','12'],
      'Tarte au citron': ['6','8'],
      'Flan à l’ancienne vanille bourbon': ['8','10','12'],
      'Cookie à partager aux trois chocolats': ['6','8','10','12']
    }
  },

  numberCake: {
    styles: [
      'Façon framboisier/poirier/pêcher (génoise, crème mousseline, fruits)',
      'Façon moelleux chocolat / ganache chocolat au lait',
      'Façon macaron (Chocolat au lait/praliné feuilletine OU Chocolat blanc/compotée framboise)'
    ],
    // tu peux ajuster si tu veux imposer des tailles/parts
    parts: ['8','10','12','15','22']
  },

  traiteur: {
    miniHotdog: {
      nom: 'Mini Hot-dog',
      description: 'Saucisse, cornichon, moutarde, ketchup, oignon frit',
      minParVariete: 10 // libre, mets ce que tu souhaites ; sinon enlève la contrainte
    },
    miniBurger: {
      nom: 'Mini Burger',
      description: 'Steak haché, fromage, laitue, ketchup, sauce burger, cornichon, tomate',
      minParVariete: 10
    },
    miniKebab: {
      nom: 'Mini Kebab',
      description: 'Poulet, tomate, salade, sauce blanche, pain maison.',
      minParVariete: 10
    },
    navetteFraicheur: {
      nom: 'Navette Fraicheur',
      description: 'Jambon de volaille, emmenthal, concombre, cream cheese.',
      minParVariete: 10
    },
    feuilletes: {
      titre: 'Feuilletés pur beurre',
      note: 'Par vingt pièces identiques.',
      varietes: [
        'Flamiches picardes',
        'Feuilletés à la saucisse',
        'Cakes de la mer',
        'Tartelettes chèvre-tomate'
      ],
      // contrainte pack de 20
      lot: 20
    }
  }
};

function select(id, labelText, values) {
  const idSafe = id;
  return el(
    'div',
    { className: 'field' },
    el('label', { htmlFor: idSafe }, labelText),
    (() => {
      const s = el('select', { id: idSafe });
      for (const v of values) s.appendChild(el('option', { value: v.toLowerCase().replace(/\s+/g,'-') }, v));
      return s;
    })()
  );
}

function textarea(id, placeholder) {
  return el('div', { className: 'field' },
    el('textarea', { id, placeholder })
  );
}
function quantityInput(id, min = 1, step = 1) {
  return el(
    'div',
    { className: 'field' },
    el('label', { htmlFor: id }, `Quantité (${min} minimum)`),
    el('input', { id, type: 'number', min, step, value: String(min), inputMode: 'numeric' })
  );
}

function getIntValue(sel, fallback = 0) {
  const v = Number($(sel)?.value || fallback);
  return Number.isFinite(v) ? v : fallback;
}

function noteBlock(text) {
  return el('p', { className: 'note' }, text);
}

function addButton() {
  return el('button', { type: 'button', id: 'add-cake' }, 'Ajouter');
}

function renderForm(kind) {
  if (!formPlace) return;
  if (kind === 'gateau-a-theme') {
    replace(
      formPlace,
      select('base-gateau-a-theme', 'Base du gateau', DATA.gateauTheme.bases),
      select('fourrage-gateau-a-theme', 'Fourrage du gateau', DATA.gateauTheme.fourrages),
      select('parts-gateau-a-theme', 'Nombre de parts', DATA.gateauTheme.parts),
      textarea('custom', 'Vos demandes personnalisées...'),
      addButton()
    );
  } else if (kind === 'entremet') {
    replace(
      formPlace,
      select('entremet-type', 'Entremet', DATA.entremet.types),
      select('parts-gateau-a-theme', 'Nombre de parts', DATA.entremet.parts),
      textarea('custom', 'Vos demandes personnalisées...'),
      el('p', {}, 'Pour les gâteaux à thèmes de plus de 22 parts (plusieurs étages), commande personnalisée recommandée.'),
      addButton()
    );
  } else if (kind === 'mignardises') {
    replace(
      formPlace,
      select('mignardise-var', 'Variété', DATA.mignardises.varietes),
      quantityInput('qty', DATA.mignardises.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'mini-donuts') {
    replace(
      formPlace,
      select('donut-var', 'Variété', DATA.miniDonuts.varietes),
      quantityInput('qty', DATA.miniDonuts.minParVariete, 1),
      noteBlock('Couleurs personnalisables.'),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'cake-pops') {
    replace(
      formPlace,
      select('cakepop-var', 'Variété', DATA.cakePops.varietes),
      quantityInput('qty', DATA.cakePops.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'magnums-cakes') {
    replace(
      formPlace,
      select('magnum-var', 'Variété', DATA.magnumsCakes.varietes),
      quantityInput('qty', DATA.magnumsCakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'cupcakes') {
    replace(
      formPlace,
      select('cupcake-var', 'Variété', DATA.cupcakes.varietes),
      quantityInput('qty', DATA.cupcakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'minis-cupcakes') {
    replace(
      formPlace,
      select('minicupcake-var', 'Variété', DATA.minisCupcakes.varietes),
      quantityInput('qty', DATA.minisCupcakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );
  } else if (kind === 'classiques') {
    // choix du produit puis des parts
    const produits = Object.keys(DATA.classiques.produits);
    replace(
      formPlace,
      select('classique-produit', 'Produit', produits),
      // parts mises à jour dynamiquement quand le produit change
      el('div', { className: 'field' },
        el('label', { htmlFor: 'classique-parts' }, 'Nombre de parts'),
        (() => {
          const s = el('select', { id: 'classique-parts' });
          for (const p of DATA.classiques.produits[produits[0]]) {
            s.appendChild(el('option', { value: p }, p));
          }
          return s;
        })()
      ),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );

    const prodSel = $('#classique-produit');
    const partsSel = $('#classique-parts');
    prodSel?.addEventListener('change', () => {
      const parts = DATA.classiques.produits[prodSel.value] || [];
      replace(partsSel, ...parts.map(p => el('option', { value: p }, p)));
    });
  } else if (kind === 'number-cake') {
    replace(
      formPlace,
      select('number-style', 'Style', DATA.numberCake.styles),
      select('number-parts', 'Nombre de parts', DATA.numberCake.parts),
      textarea('custom', 'Chiffre/lettre souhaité(e), couleurs, message…'),
      addButton()
    );
  } else if (kind === 'traiteur') {
    replace(
      formPlace,
      select('traiteur-type', 'Sélection', [
        DATA.traiteur.miniHotdog.nom,
        DATA.traiteur.miniBurger.nom,
        DATA.traiteur.miniKebab.nom,
        DATA.traiteur.navetteFraicheur.nom,
        DATA.traiteur.feuilletes.titre
      ]),
      // zone qui changera selon le choix
      el('div', { id: 'traiteur-dynamic' }),
      textarea('custom', 'Vos demandes personnalisées…'),
      addButton()
    );

    const dynamic = $('#traiteur-dynamic');
    const refreshTraiteur = () => {
      const val = $('#traiteur-type')?.value || '';
      if (val === DATA.traiteur.feuilletes.titre) {
        replace(
          dynamic,
          select('feuillete-var', 'Variété', DATA.traiteur.feuilletes.varietes),
          quantityInput('qty', DATA.traiteur.feuilletes.lot, DATA.traiteur.feuilletes.lot),
          noteBlock(DATA.traiteur.feuilletes.note)
        );
      } else {
        const cfg =
          [DATA.traiteur.miniHotdog, DATA.traiteur.miniBurger, DATA.traiteur.miniKebab, DATA.traiteur.navetteFraicheur]
            .find(x => x.nom === val);
        replace(
          dynamic,
          noteBlock(cfg?.description || ''),
          quantityInput('qty', cfg?.minParVariete || 1, 1)
        );
      }
    };
    $('#traiteur-type')?.addEventListener('change', refreshTraiteur);
    refreshTraiteur();
  } else {
    replace(formPlace); // clear
  }
}

// One change listener; formPlace uses delegated click for "Ajouter"
if (selectForm) {
  selectForm.addEventListener('change', () => renderForm(selectForm.value));
}

if (formPlace) {
  formPlace.addEventListener('click', () => {
    const btn = event.target.closest('#add-cake');
    if (!btn) return;

    const typeValue = selectForm?.value || '';
    if (typeValue === 'gateau-a-theme') {
      const cake = {
        gateau: $('#type')?.value || 'Gateau à thème',
        base: $('#base-gateau-a-theme')?.value || '',
        fourrage: $('#fourrage-gateau-a-theme')?.value || '',
        nbParts: $('#parts-gateau-a-theme')?.value || '',
        custom: $('#custom')?.value?.trim() || ''
      };
      setCakes([...getCakes(), cake]);
    } else if (typeValue === 'entremet') {
      const cake = {
        gateau: 'Entremet',
        base: $('#entremet-type')?.value || '',
        nbParts: $('#parts-gateau-a-theme')?.value || '',
        custom: $('#custom')?.value?.trim() || ''
      };
      setCakes([...getCakes(), cake]);
    } else if (typeValue === 'mignardises') {
      const variete = $('#mignardise-var')?.value || '';
      const qty = getIntValue('#qty', DATA.mignardises.minParVariete);
      if (qty < DATA.mignardises.minParVariete) return setStatus(`Dix unités minimum par variété.`, false);
      const cake = { gateau: 'Mignardises', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'mini-donuts') {
      const variete = $('#donut-var')?.value || '';
      const qty = getIntValue('#qty', DATA.miniDonuts.minParVariete);
      if (qty < DATA.miniDonuts.minParVariete) return setStatus(`15 pièces minimum par variété.`, false);
      const cake = { gateau: 'Minis donuts', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'cake-pops') {
      const variete = $('#cakepop-var')?.value || '';
      const qty = getIntValue('#qty', DATA.cakePops.minParVariete);
      if (qty < DATA.cakePops.minParVariete) return setStatus(`10 pièces minimum par variété.`, false);
      const cake = { gateau: 'Cake pops', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'magnums-cakes') {
      const variete = $('#magnum-var')?.value || '';
      const qty = getIntValue('#qty', DATA.magnumsCakes.minParVariete);
      if (qty < DATA.magnumsCakes.minParVariete) return setStatus(`5 pièces minimum par variété.`, false);
      const cake = { gateau: 'Magnums cakes', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'cupcakes') {
      const variete = $('#cupcake-var')?.value || '';
      const qty = getIntValue('#qty', DATA.cupcakes.minParVariete);
      if (qty < DATA.cupcakes.minParVariete) return setStatus(`5 pièces minimum par variété.`, false);
      const cake = { gateau: 'Cupcakes individuels', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'minis-cupcakes') {
      const variete = $('#minicupcake-var')?.value || '';
      const qty = getIntValue('#qty', DATA.minisCupcakes.minParVariete);
      if (qty < DATA.minisCupcakes.minParVariete) return setStatus(`10 pièces minimum par variété.`, false);
      const cake = { gateau: 'Minis cupcakes', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'classiques') {
      const produit = $('#classique-produit')?.value || '';
      const nbParts = $('#classique-parts')?.value || '';
      const cake = { gateau: 'Classique', produit, nbParts, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'number-cake') {
      const style = $('#number-style')?.value || '';
      const nbParts = $('#number-parts')?.value || '';
      const cake = { gateau: 'Number cake', style, nbParts, custom: $('#custom')?.value?.trim() || '' };
      setCakes([...getCakes(), cake]);

    } else if (typeValue === 'traiteur') {
      const choix = $('#traiteur-type')?.value || '';
      const qty = getIntValue('#qty', 1);
      // Feuilletés : par 20 pièces identiques
      if (choix === DATA.traiteur.feuilletes.titre) {
        if (qty % DATA.traiteur.feuilletes.lot !== 0) {
          return setStatus(`Commande par multiple de ${DATA.traiteur.feuilletes.lot} pièces.`, false);
        }
        const variete = $('#feuillete-var')?.value || '';
        const cake = { gateau: 'Traiteur - Feuilletés', variete, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
        setCakes([...getCakes(), cake]);
      } else {
        const cake = { gateau: `Traiteur - ${choix}`, quantite: qty, custom: $('#custom')?.value?.trim() || '' };
        setCakes([...getCakes(), cake]);
      }
    }
    renderCart();
    setStatus('Ajouté au panier.');
  });
}

// --- user info ---------------------------------------------------------------
function getUserInfo() {
  return {
    email: ($('#user-email')?.value || '').trim(),
    name: ($('#user-name-fname')?.value || '').trim(),
    address: ($('#user-adresse')?.value || '').trim(),
  };
}
function saveUserInfoToLS(info) { storage.set(LS_KEYS.user, info); }
function loadUserInfoFromLS() {
  const info = storage.get(LS_KEYS.user, null);
  if (!info) return;
  if (info.email && $('#user-email')) $('#user-email').value = info.email;
  if (info.name && $('#user-name-fname')) $('#user-name-fname').value = info.name;
  if (info.address && $('#user-adresse')) $('#user-adresse').value = info.address;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- status ------------------------------------------------------------------
function setStatus(msg, ok = true) {
  if (!sendStatus) return;
  sendStatus.textContent = msg;
  sendStatus.style.color = ok ? 'var(--secondary)' : 'crimson';
}

// --- fetch with timeout ------------------------------------------------------
async function fetchJSON(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON */ }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(id);
  }
}

// --- send cart ---------------------------------------------------------------
async function sendCartByEmail() {
  const cakes = getCakes();
  if (!cakes.length) return setStatus('Votre panier est vide.', false);

  const user = getUserInfo();
  if (!user.name || !user.address || !user.email) {
    return setStatus('Veuillez renseigner votre nom, votre adresse et votre email.', false);
  }
  if (!isValidEmail(user.email)) {
    return setStatus('Adresse e-mail invalide.', false);
  }

  if (sendBtn) sendBtn.disabled = true;
  setStatus('Envoi en cours…');

  saveUserInfoToLS(user);

  try {
    const { ok, data } = await fetchJSON('send_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cakes,
        customer: user,
        webpage: location.href,
        sentAt: new Date().toISOString()
      })
    });

    if (ok && data && (data.success === true)) {
      setStatus('✅ Panier envoyé avec succès ! Je vous réponds au plus vite');
      storage.remove(LS_KEYS.cakes);
      renderCart();
    } else {
      const msg = (data && data.error) || 'Échec de l’envoi. Réessayez plus tard.';
      setStatus(msg, false);
    }
  } catch (err) {
    setStatus('Erreur réseau: ' + (err?.message || 'inconnue'), false);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

// init
renderCart();
loadUserInfoFromLS();
if (sendBtn) sendBtn.addEventListener('click', sendCartByEmail);