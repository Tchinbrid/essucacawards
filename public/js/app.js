const API = "/api";

// --- Page d'accueil : liste des catégories ---
async function chargerCategories() {
  const grid = document.getElementById("categories-grid");
  if (!grid) return;
  const res = await fetch(`${API}/categories`);
  const categories = await res.json();
  grid.innerHTML = categories.map(cat => `
    <a class="categorie-card" href="/categorie.html?slug=${cat.slug}">
      <div class="numero">${String(cat.ordre).padStart(2, "0")}</div>
      <div class="nom">${cat.nom}</div>
    </a>
  `).join("");
}

// --- Page catégorie : liste des nominés ---
let nomineeSelectionne = null;
let numerosMobileMoney = {};

async function chargerNominees() {
  const grid = document.getElementById("nominees-grid");
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) return;

  const [res, settingsRes] = await Promise.all([
    fetch(`${API}/categories/${slug}/nominees`),
    fetch(`${API}/settings`),
  ]);
  const data = await res.json();
  numerosMobileMoney = await settingsRes.json();

  document.getElementById("categorie-titre").textContent = data.categorie || "Catégorie";

  if (!data.nominees || data.nominees.length === 0) {
    grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">
      Les nominés de cette catégorie seront publiés très bientôt.</p>`;
    return;
  }

  grid.innerHTML = data.nominees.map(n => `
    <div class="nominee-card">
      <img src="${n.photo_url || '/img/placeholder-nominee.jpg'}" alt="${n.nom_complet}">
      <div class="infos">
        <div class="nom">${n.nom_complet}</div>
        <div class="classe">${n.classe_ou_filiere || ""}</div>
        <button class="btn-voter" onclick="ouvrirModal('${n.id}', '${n.nom_complet.replace(/'/g, "\\'")}')">Voter — 100 FCFA</button>
      </div>
    </div>
  `).join("");
}

function ouvrirModal(id, nom) {
  nomineeSelectionne = id;
  document.getElementById("modal-nominee-name").textContent = nom;
  document.getElementById("vote-message").textContent = "";
  mettreAJourNumero();
  document.getElementById("vote-modal").classList.add("active");
}
function fermerModal() {
  document.getElementById("vote-modal").classList.remove("active");
}
function mettreAJourNumero() {
  const op = document.getElementById("operateur").value;
  const numero = op === "orange_money"
    ? numerosMobileMoney.numero_orange_money
    : numerosMobileMoney.numero_mtn_momo;
  document.getElementById("numero-cible").textContent = `Numéro à créditer : ${numero || "à configurer"}`;
}
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "operateur") mettreAJourNumero();
});

async function soumettreVote() {
  const operateur = document.getElementById("operateur").value;
  const telephone_votant = document.getElementById("telephone").value.trim();
  const reference_transaction = document.getElementById("reference").value.trim();
  const msg = document.getElementById("vote-message");

  if (!telephone_votant || !reference_transaction) {
    msg.style.color = "#e74c3c";
    msg.textContent = "Merci de renseigner votre numéro et la référence de transaction.";
    return;
  }

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

  if (res.ok) {
    msg.style.color = "var(--gold)";
    msg.textContent = "Merci ! Votre vote est enregistré et sera confirmé après vérification du paiement.";
  } else {
    msg.style.color = "#e74c3c";
    msg.textContent = "Une erreur est survenue. Veuillez réessayer.";
  }
}

// --- Page classement ---
async function chargerClassement() {
  const container = document.getElementById("classement-container");
  if (!container) return;
  const res = await fetch(`${API}/classement`);
  const data = await res.json();

  const parCategorie = {};
  data.forEach(row => {
    if (!parCategorie[row.categorie]) parCategorie[row.categorie] = [];
    parCategorie[row.categorie].push(row);
  });

  container.innerHTML = Object.entries(parCategorie).map(([cat, rows]) => `
    <h2 style="color: var(--gold); margin-top: 30px;">${cat}</h2>
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
}

chargerCategories();
chargerNominees();
chargerClassement();
