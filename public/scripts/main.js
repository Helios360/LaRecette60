(() => {
  // ================== mini-utils ==================
  const qs  = (s, r = document) => r.querySelector(s);
  const el  = (tag, props = {}, ...kids) => {
    const node = document.createElement(tag);
    const { dataset, ...rest } = props || {};
    Object.assign(node, rest);
    if (dataset) Object.entries(dataset).forEach(([k, v]) => (node.dataset[k] = v));
    kids.flat().forEach(k => k != null && node.append(k.nodeType ? k : document.createTextNode(k)));
    return node;
  };
  const replace = (node, ...kids) => node && node.replaceChildren(...kids);
  const opt = (v, label = v) => el('option', { value: v }, label);
  ['#user-file-1', '#user-file-2', '#user-file-3'].forEach((sel, i) => {
    const input = qs(sel);
    const label = qs(`#file-name-${i + 1}`);
    if (!input || !label) return;

    input.addEventListener('change', () => {
      label.textContent = input.files.length
        ? input.files[0].name
        : 'Aucun fichier sélectionné';
    });
  });
  // ================== DOM refs ==================
  const burgerMenu  = qs('#burger-menu');
  const burger      = qs('#burger');
  const selectForm  = qs('#type');
  const formPlace   = qs('#selectedForm');
  const cart        = qs('#cart');
  const sendBtn     = qs('#send-cart');
  const sendStatus  = qs('#sendStatus');

  // A11y: statut parlé
  if (sendStatus) {
    sendStatus.setAttribute('role', 'status');
    sendStatus.setAttribute('aria-live', 'polite');
  }

  // ================== storage ==================
  const LS_KEYS = { cakes: 'cakes', user: 'lr_user_info' };
  const storage = {
    get: (k, fb) => {
      try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fb; }
      catch { return fb; }
    },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    remove: k => { try { localStorage.removeItem(k); } catch {} }
  };
  const getCakes = () => storage.get(LS_KEYS.cakes, []);
  const setCakes = v => storage.set(LS_KEYS.cakes, v);

  // ================== burger ==================
  if (burger && burgerMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      burgerMenu.classList.toggle('open');
    });
  }

  // ================== data & règles ==================
  const ENTREMET_DEFAULT_PARTS = ['8','10','12','25'];

  const DATA = {
    gateauTheme: {
      bases: ['Vanille', 'Chocolat'],
      fourrages: ['Vanille','Chocolat au lait','Framboise','Spéculoos','Pistache','Praliné','Citron','Fraise','Cerise'],
      parts: ['10','12','15','22']
    },
    entremet: {
      produits: {
        'Paris-Brest': ['6','8','10'],
        'Cookie à partager aux trois chocolats': ['6','8','10','12'],
        'Le Fraisier': ENTREMET_DEFAULT_PARTS,
        'Macaron Coeur Framboise': ENTREMET_DEFAULT_PARTS,
        'Schuss aux fruits des bois': ENTREMET_DEFAULT_PARTS,
        'Framboisier': ENTREMET_DEFAULT_PARTS,
        'La Seraphine': ENTREMET_DEFAULT_PARTS,
        'La charlotte poire chocolat': ENTREMET_DEFAULT_PARTS,
        'Le Biscoff': ENTREMET_DEFAULT_PARTS,
        'Le Royal': ENTREMET_DEFAULT_PARTS,
        'Le Trois Chocolat': ENTREMET_DEFAULT_PARTS
      }
    },
    mignardises: {
      varietes: ['Tartelettes citron','Chou chocolat','Mini pécan vanille','Mini mousse au chocolat','Pavlova fruits exotiques','Tartelette framboise','Paris-Brest'],
      minParVariete: 20, minCommande: 20, step: 20
    },
    miniDonuts:   { varietes: ['Chocolat','Oreo','Speculoos','Vanille'], minParVariete: 15 },
    cakePops:     { varietes: ['Chocolat','Speculoos','Citron'],         minParVariete: 10 },
    magnumsCakes: { varietes: ['Chocolat','Speculoos','Citron'],         minParVariete: 5  },
    cupcakes: {
      varietes: [
        'Kinder (Base chocolat, croustillant noisette, crème chocolat)',
        'Croustipomme (Base vanille, pommes caramélisées, crumble, crème caramel)',
        'Marbré (Base vanille et chocolat, pépites, crème vanille et chocolat)',
        'Rose (Base nature, pépites chocolat blanc, framboises, crème vanille)',
        'M&M’s (Base vanille, crémeux cacahuète, crème chocolat au lait, M&M’s)'
      ], minParVariete: 5
    },
    minisCupcakes: {
      varietes: [
        'Marieke (base vanille, chantilly spéculoos)',
        'Rose (base vanille, compotée framboises, chantilly chocolat blanc)',
        'M&M’s (base vanille, chantilly chocolat au lait, M&M’s)',
        'Oréos (base vanille, chantilly chocolat blanc, Oréos)',
        'Kinder Bueno (base vanille, chantilly chocolat au lait Kinder Bueno)'
      ], minParVariete: 10
    },
    numberCake: {
      styles: [
        'Façon framboisier/poirier/pêcher (génoise, crème mousseline, fruits)',
        'Façon moelleux chocolat / ganache chocolat au lait',
        'Façon macaron (Chocolat au lait/praliné feuilletine OU Chocolat blanc/compotée framboise)'
      ],
      parts: ['10','12','15','20','25']
    },
    traiteur: {
      miniHotdog: { nom: 'Mini Hot-dog', description: 'Saucisse, cornichon, moutarde, ketchup, oignon frit', minParVariete: 100 },
      miniBurger: { nom: 'Mini Burger', description: 'Steak haché, fromage, laitue, ketchup, sauce burger, cornichon, tomate', minParVariete: 100 },
      miniKebab:  { nom: 'Mini Kebab',  description: 'Poulet, tomate, salade, sauce blanche, pain maison.', minParVariete: 100 },
      navetteFraicheur: { nom: 'Navette Fraicheur', description: 'Jambon de volaille, emmenthal, concombre, cream cheese.', minParVariete: 100 },
      miniMozza: { nom: 'Mini mozzarella sandwich', description: 'Pain moelleux, mozzarella, tomate, pesto/basilic.', minParVariete: 100 },
      feuilletes: {
        titre: 'Feuilletés pur beurre',
        note: 'Par vingt pièces identiques.',
        varietes: ['Flamiches picardes','Feuilletés à la saucisse','Cakes de la mer','Tartelettes chèvre-tomate'],
        lot: 20
      }
    }
  };

  // ================== UI builders ==================
  const field = (id, label, control) =>
    el('div', { className: 'field' }, label ? el('label', { htmlFor: id }, label) : null, control);

  const select = (id, labelText, values) =>
    field(id, labelText, (() => {
      const s = el('select', { id });
      values.forEach(v => s.append(opt(v)));
      return s;
    })());

  const textarea = (id, placeholder) =>
    field(id, null, el('textarea', { id, placeholder }));

  const numberInput = (id, min = 1, step = 1) =>
    field(id, `Quantité (${min} minimum)`, el('input', { id, type: 'number', min, step, value: String(min), inputMode: 'numeric' }));

  const note = txt => el('p', { className: 'note' }, txt);
  const addBtn = () => el('button', { type: 'button', id: 'add-cake' }, 'Ajouter');

  const getInt = (sel, fb = 0) => {
    const n = Number(qs(sel)?.value ?? fb);
    return Number.isFinite(n) ? n : fb;
  };

  // ================== Panier (render + delete) ==================
  const CakeItem = (item, index) => {
    const p = (k, v) => (v ? el('p', {}, `${k}: ${v}`) : null);
    const { gateau, base, fourrage, nbParts, custom, variete, produit, style, quantite } = item;
    return el('div', { className: 'cake-item', dataset: { index } },
      p('Catégorie', gateau),
      p('Produit',   produit),
      p('Variété',   variete),
      p('Style',     style),
      p('Base',      base),
      p('Fourrage',  fourrage),
      p('Nombre de parts', nbParts),
      p('Quantité',  quantite),
      p('Notes',     custom),
      el('button', { className: 'delete-cake', type: 'button', 'aria-label': 'Supprimer ce gâteau', dataset: { index } },
        el('span', { 'aria-hidden': 'true' }, '🗑️'))
    );
  };

  function renderCart() {
    if (!cart) return;
    const cakes = getCakes();
    if (!cakes.length) return replace(cart, el('p', { className: 'empty' }, 'Votre panier est vide.'));
    replace(cart, ...cakes.map(CakeItem));
  }

  cart?.addEventListener('click', (e) => {
    const btn = e.target.closest?.('.delete-cake');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    const cakes = getCakes();
    if (Number.isInteger(idx) && idx >= 0 && idx < cakes.length) {
      cakes.splice(idx, 1);
      setCakes(cakes);
      renderCart();
      setStatus('Élément supprimé.');
    }
  });

  // ================== formulaires dynamiques ==================
  const forms = {
    'gateau-a-theme': () => [
      select('base-gateau-a-theme',   'Base du gâteau',   DATA.gateauTheme.bases),
      select('fourrage-gateau-a-theme','Fourrage du gâteau', DATA.gateauTheme.fourrages),
      select('parts-gateau-a-theme',  'Nombre de parts', DATA.gateauTheme.parts),
      textarea('custom', 'Vos demandes personnalisées…'),
      el('p', {}, 'Plus de 22 parts (plusieurs étages) ? Contactez-nous directement.'),
      addBtn()
    ],

    entremet: () => {
      const produits = Object.keys(DATA.entremet.produits);
      const partsSel = el('select', { id: 'entremet-parts' });
      DATA.entremet.produits[produits[0]].forEach(p => partsSel.append(opt(p)));

      // Met à jour les parts quand le produit change
      const onChange = (e) => {
        const prod = e.currentTarget.value;
        const sizes = DATA.entremet.produits[prod] || ENTREMET_DEFAULT_PARTS;
        replace(partsSel, ...sizes.map(p => opt(p)));
      };

      // Contenu
      setTimeout(() => qs('#entremet-produit')?.addEventListener('change', onChange)); // après insertion
      return [
        select('entremet-produit', 'Entremet', produits),
        field('entremet-parts', 'Nombre de parts', partsSel),
        textarea('custom', 'Vos demandes personnalisées…'),
        addBtn()
      ];
    },

    classiques: () => [
      note('La section « Classiques » est désormais intégrée aux entremets.'),
      ...forms.entremet()
    ],

    mignardises: () => [
      select('mignardise-var', 'Variété (par 20 pièces)', DATA.mignardises.varietes),
      numberInput('qty', DATA.mignardises.minCommande, DATA.mignardises.step),
      note('Minimum 60 pièces au total et 20 par variété.'),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    'mini-donuts': () => [
      select('donut-var', 'Variété', DATA.miniDonuts.varietes),
      numberInput('qty', DATA.miniDonuts.minParVariete, 1),
      note('Couleurs personnalisables.'),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    'cake-pops': () => [
      select('cakepop-var', 'Variété', DATA.cakePops.varietes),
      numberInput('qty', DATA.cakePops.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    'magnums-cakes': () => [
      select('magnum-var', 'Variété', DATA.magnumsCakes.varietes),
      numberInput('qty', DATA.magnumsCakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    cupcakes: () => [
      select('cupcake-var', 'Variété', DATA.cupcakes.varietes),
      numberInput('qty', DATA.cupcakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    'minis-cupcakes': () => [
      select('minicupcake-var', 'Variété', DATA.minisCupcakes.varietes),
      numberInput('qty', DATA.minisCupcakes.minParVariete, 1),
      textarea('custom', 'Vos demandes personnalisées…'),
      addBtn()
    ],

    'number-cake': () => [
      select('number-style', 'Style', DATA.numberCake.styles),
      select('number-parts', 'Nombre de parts', DATA.numberCake.parts),
      textarea('custom', 'Chiffre/lettre souhaité(e), couleurs, message…'),
      addBtn()
    ],

    traiteur: () => {
      const types = [
        DATA.traiteur.miniHotdog.nom,
        DATA.traiteur.miniBurger.nom,
        DATA.traiteur.miniKebab.nom,
        DATA.traiteur.navetteFraicheur.nom,
        DATA.traiteur.miniMozza.nom,
        DATA.traiteur.feuilletes.titre
      ];

      const typeSel = el('select', { id: 'traiteur-type' });
      // Placeholder non-envoyable
      typeSel.append(
        el('option', { value: '', disabled: true, selected: true, hidden: true }, '— Sélectionnez —')
      );
      types.forEach(t => typeSel.append(opt(t)));

      const dyn = el('div', { id: 'traiteur-dynamic' });

      const refresh = () => {
        const val = qs('#traiteur-type')?.value || '';
        if (val === DATA.traiteur.feuilletes.titre) {
          replace(dyn,
            select('feuillete-var', 'Variété', DATA.traiteur.feuilletes.varietes),
            numberInput('qty', DATA.traiteur.feuilletes.lot, DATA.traiteur.feuilletes.lot),
            note(DATA.traiteur.feuilletes.note)
          );
        } else if (val) {
          const cfg = [DATA.traiteur.miniHotdog, DATA.traiteur.miniBurger, DATA.traiteur.miniKebab, DATA.traiteur.navetteFraicheur, DATA.traiteur.miniMozza]
            .find(x => x.nom === val);
          replace(dyn,
            note(`${cfg?.description || ''} — Minimum 20 pièces.`),
            numberInput('qty', 20, 1)
          );
        } else {
          // état initial (placeholder sélectionné) : rien encore
          replace(dyn);
        }
      };

      // brancher + forcer un rendu initial
      setTimeout(() => {
        qs('#traiteur-type')?.addEventListener('change', refresh);
        refresh(); // <<< affiche le bon bloc dès l’ouverture du formulaire
      });

      return [
        field('traiteur-type', 'Sélection', typeSel),
        dyn,
        textarea('custom', 'Vos demandes personnalisées…'),
        addBtn()
      ];
    }
  }

  function renderForm(kind) {
    if (!formPlace) return;
    const maker = forms[kind];
    replace(formPlace, ...(maker ? maker() : []));
  }

  // sélecteur principal
  selectForm?.addEventListener('change', () => renderForm(selectForm.value));

  // ================== Ajout au panier (délégation) ==================
  formPlace?.addEventListener('click', (e) => {
    const btn = e.target.closest?.('#add-cake');
    if (!btn) return;

    const type = selectForm?.value || '';
    const txt = id => qs(id)?.value?.trim() || '';

    const push = cake => { setCakes([...getCakes(), cake]); renderCart(); setStatus('Ajouté au panier.'); };

    if (type === 'gateau-a-theme') {
      return push({
        gateau: 'Gâteau à thème',
        base: txt('#base-gateau-a-theme'),
        fourrage: txt('#fourrage-gateau-a-theme'),
        nbParts: txt('#parts-gateau-a-theme'),
        custom: txt('#custom')
      });
    }

    if (type === 'entremet' || type === 'classiques') {
      return push({
        gateau: 'Entremet',
        produit: txt('#entremet-produit'),
        nbParts: txt('#entremet-parts'),
        custom: txt('#custom')
      });
    }

    if (type === 'mignardises') {
      const qty = getInt('#qty', DATA.mignardises.minCommande);
      if (qty < DATA.mignardises.minCommande)  return setStatus(`Minimum ${DATA.mignardises.minCommande} pièces au total.`, false);
      if (qty % DATA.mignardises.minParVariete) return setStatus(`Commande par multiple de ${DATA.mignardises.minParVariete} pièces pour chaque variété.`, false);
      return push({ gateau: 'Mignardises', variete: txt('#mignardise-var'), quantite: qty, custom: txt('#custom') });
    }

    const varQtyMin = {
      'mini-donuts':   DATA.miniDonuts.minParVariete,
      'cake-pops':     DATA.cakePops.minParVariete,
      'magnums-cakes': DATA.magnumsCakes.minParVariete,
      'cupcakes':      DATA.cupcakes.minParVariete,
      'minis-cupcakes':DATA.minisCupcakes.minParVariete
    };

    if (type in varQtyMin) {
      const mapId = {
        'mini-donuts': '#donut-var',
        'cake-pops': '#cakepop-var',
        'magnums-cakes': '#magnum-var',
        'cupcakes': '#cupcake-var',
        'minis-cupcakes': '#minicupcake-var'
      };
      const labels = {
        'mini-donuts': 'Minis donuts',
        'cake-pops': 'Cake pops',
        'magnums-cakes': 'Magnums cakes',
        'cupcakes': 'Cupcakes individuels',
        'minis-cupcakes': 'Minis cupcakes'
      };
      const qty = getInt('#qty', varQtyMin[type]);
      if (qty < varQtyMin[type]) return setStatus(`${varQtyMin[type]} pièces minimum par variété.`, false);
      return push({ gateau: labels[type], variete: txt(mapId[type]), quantite: qty, custom: txt('#custom') });
    }

    if (type === 'number-cake') {
      return push({ gateau: 'Number cake', style: txt('#number-style'), nbParts: txt('#number-parts'), custom: txt('#custom') });
    }

    if (type === 'traiteur') {
      const choix = txt('#traiteur-type');
      const qty = getInt('#qty', 100);
      if (choix === DATA.traiteur.feuilletes.titre) {
        if (qty % DATA.traiteur.feuilletes.lot) return setStatus(`Commande par multiple de ${DATA.traiteur.feuilletes.lot} pièces.`, false);
        return push({ gateau: 'Traiteur - Feuilletés', variete: txt('#feuillete-var'), quantite: qty, custom: txt('#custom') });
      } else {
        return push({ gateau: `Traiteur - ${choix}`, quantite: qty, custom: txt('#custom') });
      }
    }
  });

  // ================== User info ==================
  const getUserInfo = () => ({
    email:   qs('#user-email')?.value?.trim() || '',
    phone:   qs('#user-phone')?.value?.trim() || '',
    name:    qs('#user-name')?.value?.trim() || '',
    fname:    qs('#user-fname')?.value?.trim() || '',
    retrieval:    qs('#retrieval')?.value?.trim() || '',
  });
  const saveUser = info => storage.set(LS_KEYS.user, info);
  const loadUser = () => {
    const info = storage.get(LS_KEYS.user, null);
    if (!info) return;
    if (info.email && qs('#user-email')) qs('#user-email').value = info.email;
    if (info.phone && qs('#user-phone')) qs('#user-phone').value = info.phone;
    if (info.name && qs('#user-name')) qs('#user-name').value = info.name;
    if (info.fname && qs('#user-fname')) qs('#user-fname').value = info.fname;
    if (info.retrieval && qs('#retrieval')) qs('#retrieval').value = info.retrieval;
  };
  const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = p => /^[0-9+\s().-]{8,}$/.test(p);
  // ================== statut ==================
  function setStatus(msg, ok = true) {
    if (!sendStatus) return;
    sendStatus.textContent = msg;
    sendStatus.style.color = ok ? 'var(--secondary)' : 'crimson';
  }

  // ================== Envoi panier ==================
  async function sendCartByEmail() {
    const cakes = getCakes();
    if (!cakes.length) return setStatus('Votre panier est vide.', false);

    const user = getUserInfo();

    const missing = [];
    if (!user.fname) missing.push('Prénom');
    if (!user.retrieval) missing.push('Créneau');
    if (!user.name) missing.push('Nom');
    if (!user.email) missing.push('Email');
    if (!user.phone) missing.push('Téléphone');

    if (missing.length) return setStatus(`Champs manquants : ${missing.join(', ')}.`, false);
    if (!isValidEmail(user.email)) return setStatus('Adresse e-mail invalide.', false);
    if (!isValidPhone(user.phone)) return setStatus('Numéro de téléphone invalide.', false);

    // règles globales (identiques à ton code)
    const totalTraiteur = cakes
      .filter(it => typeof it?.gateau === 'string' && it.gateau.startsWith('Traiteur -') && !/feuillet/i.test(it.gateau))
      .reduce((s, it) => s + Number(it.quantite || 0), 0);
    if (totalTraiteur > 0 && totalTraiteur < 100) return setStatus('Veuillez commander un minimum de 100 pièces au total pour le traiteur.', false);

    const totalMignardises = cakes
      .filter(it => it?.gateau === 'Mignardises')
      .reduce((s, it) => s + Number(it.quantite || 0), 0);
    if (totalMignardises > 0 && totalMignardises < 60) return setStatus('Veuillez commander un minimum de 60 pièces au total pour les mignardises.', false);

    sendBtn && (sendBtn.disabled = true);
    setStatus('Envoi en cours…');
    saveUser(user);

    try {
      const fd = new FormData();
      fd.append('payload', JSON.stringify({
        items: cakes,
        customer: user,
        webpage: location.href,
        sentAt: new Date().toISOString(),
        website: '' // honeypot (doit rester vide)
      }));

      ['#user-file-1', '#user-file-2', '#user-file-3'].forEach((sel, i) => {
        const file = qs(sel)?.files?.[0];
        if (file) fd.append(`file${i + 1}`, file);
      });

      const res = await fetch('/api/send_cart.php', {
        method: 'POST',
        body: fd
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success === true) {
        setStatus('✅ Panier envoyé avec succès !');
        storage.remove(LS_KEYS.cakes);
        renderCart();

        // optionnel: reset des fichiers
        ['#user-file-1', '#user-file-2', '#user-file-3'].forEach(sel => {
          const input = qs(sel);
          if (input) input.value = '';
        });
      } else {
        // markFieldErrors(data?.fields || {});
        setStatus(data?.error || 'Échec de l’envoi. Réessayez plus tard.', false);
      }
    } catch (err) {
      setStatus('Erreur réseau: ' + (err?.message || 'inconnue'), false);
    } finally {
      sendBtn && (sendBtn.disabled = false);
    }
  }

  // ================== init ==================
  renderCart();
  loadUser();
  sendBtn?.addEventListener('click', sendCartByEmail);
})();
