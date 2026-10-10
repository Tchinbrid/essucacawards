const API = "/api";

function setMessage(text, isError = false) {
  const msg = document.getElementById("vote-message");
  if (!msg) return;
  msg.textContent = text;
  msg.style.color = isError ? "#e74c3c" : "var(--gold-soft)";
}

// --- Page d'accueil : liste des catégories ---
async function chargerCategories() {
  const grid = document.getElementById("categories-grid");
  if (!grid) return;

  try {
    const res = await fetch(`${API}/categories`);
    const payload = await res.json().catch(() => ({}));
    const categories = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];

    if (!Array.isArray(categories) || categories.length === 0) {
      grid.innerHTML = '<p class="empty-state">Les catégories seront bientôt disponibles.</p>';
      return;
    }

    grid.innerHTML = categories.map(cat => `
      <a class="categorie-card" href="/categorie.html?slug=${cat.slug}">
        <div class="numero">${String(cat.ordre).padStart(2, "0")}</div>
        <div class="nom">${cat.nom}</div>
      </a>
    `).join("");
  } catch (error) {
    grid.innerHTML = '<p class="empty-state">Les catégories sont momentanément indisponibles.</p>';
  }
}

// --- Page catégorie : liste des nominés ---
let nomineeSelectionne = null;
let numerosMobileMoney = {};
let lastFocusedElement = null;

async function chargerNominees() {
  const grid = document.getElementById("nominees-grid");
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) return;

  try {
    const [res, settingsRes] = await Promise.all([
      fetch(`${API}/categories/${slug}/nominees`),
      fetch(`${API}/settings`),
    ]);

    const rawData = res.ok ? await res.json().catch(() => ({})) : {};
    const data = rawData && typeof rawData === "object" ? rawData : {};
    const nominees = Array.isArray(data.nominees) ? data.nominees : [];

    try {
      numerosMobileMoney = settingsRes.ok ? await settingsRes.json().catch(() => ({})) : {};
    } catch (err) {
      numerosMobileMoney = {};
    }

    const titre = document.getElementById("categorie-titre");
    if (titre) titre.textContent = data.categorie || "Catégorie";

    if (nominees.length === 0) {
      grid.innerHTML = '<p class="empty-state empty-state-wide">Les nominés de cette catégorie seront publiés très bientôt.</p>';
      return;
    }

    grid.innerHTML = nominees.map(n => `
      <div class="nominee-card">
        <img src="${n.photo_url || '/img/placeholder-nominee.jpg'}" alt="${n.nom_complet}">
        <div class="infos">
          <div class="nom">${n.nom_complet}</div>
          <div class="classe">${n.classe_ou_filiere || ""}</div>
          <button class="btn-voter" type="button" onclick="ouvrirModal('${n.id}', '${n.nom_complet.replace(/'/g, "\\'") }')">Voter — 100 FCFA</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    grid.innerHTML = '<p class="empty-state empty-state-wide">Cette catégorie est temporairement indisponible.</p>';
  }
}

function ouvrirModal(id, nom) {
  nomineeSelectionne = id;
  const modal = document.getElementById("vote-modal");
  const name = document.getElementById("modal-nominee-name");
  const telephone = document.getElementById("telephone");
  if (!modal || !name) return;

  lastFocusedElement = document.activeElement;
  name.textContent = nom;
  setMessage("");
  telephone.value = "";
  document.getElementById("reference").value = "";
  mettreAJourNumero();
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => telephone.focus(), 50);
}

function fermerModal() {
  const modal = document.getElementById("vote-modal");
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  if (lastFocusedElement) lastFocusedElement.focus();
}

function mettreAJourNumero() {
  const op = document.getElementById("operateur").value;
  const numero = op === "orange_money"
    ? numerosMobileMoney.numero_orange_money
    : numerosMobileMoney.numero_mtn_momo;
  const cible = document.getElementById("numero-cible");
  if (cible) cible.textContent = `Numéro à créditer : ${numero || "à configurer"}`;
}

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "operateur") mettreAJourNumero();
});

document.addEventListener("keydown", (event) => {
  const modal = document.getElementById("vote-modal");
  if (!modal || !modal.classList.contains("active")) return;
  if (event.key === "Escape") fermerModal();
});

async function soumettreVote() {
  const operateur = document.getElementById("operateur").value;
  const telephone_votant = document.getElementById("telephone").value.trim();
  const reference_transaction = document.getElementById("reference").value.trim();

  if (!telephone_votant || !reference_transaction) {
    setMessage("Merci de renseigner votre numéro et la référence de transaction.", true);
    return;
  }

  const btn = document.querySelector("#vote-modal .btn-voter");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Envoi...";
  }

  try {
    const res = await fetch(`${API}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nominee_id: nomineeSelectionne,
        operateur,
        telephone_votant,
        reference_transaction,
      }),
    });

    if (!res.ok) throw new Error();

    setMessage("Merci ! Votre vote est enregistré et sera confirmé après vérification du paiement.");
    document.getElementById("telephone").value = "";
    document.getElementById("reference").value = "";
  } catch (error) {
    setMessage("Une erreur est survenue. Veuillez réessayer.", true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Confirmer mon vote";
    }
  }
}

// --- Page classement ---
async function chargerClassement() {
  const container = document.getElementById("classement-container");
  if (!container) return;

  try {
    const res = await fetch(`${API}/classement`);
    const payload = await res.json().catch(() => ({}));
    const data = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="empty-state">Le classement sera publié dès qu’il y aura des votes confirmés.</p>';
      return;
    }

    const parCategorie = {};
    data.forEach(row => {
      if (!parCategorie[row.categorie]) parCategorie[row.categorie] = [];
      parCategorie[row.categorie].push(row);
    });

    container.innerHTML = Object.entries(parCategorie).map(([cat, rows]) => `
      <h2 class="ranking-title">${cat}</h2>
      <div class="nominees-grid">
        ${rows.map(r => `
          <div class="nominee-card">
            <img src="${r.photo_url || '/img/placeholder-nominee.jpg'}" alt="${r.nom_complet}">
            <div class="infos">
              <div class="nom">${r.nom_complet}</div>
              <div class="votes">${r.total_votes} vote(s)</div>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("");
  } catch (error) {
    container.innerHTML = '<p class="empty-state">Le classement est momentanément indisponible.</p>';
  }
}

chargerCategories();
chargerNominees();
chargerClassement();
