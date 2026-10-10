const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const rawSupabaseUrl = process.env.SUPABASE_URL || "";
const rawSupabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const isPlaceholderValue = (value) => {
  if (!value) return true;
  return /example|xxxxx|replace_with|colle_ici|a_definir|todo|tobechanged|your_.*key|your-project/i.test(value);
};
const supabaseUrl = isPlaceholderValue(rawSupabaseUrl) ? "" : rawSupabaseUrl;
const supabaseServiceKey = isPlaceholderValue(rawSupabaseServiceKey) ? "" : rawSupabaseServiceKey;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function ensureSupabaseConfigured(res) {
  if (!supabase) {
    res.status(503).json({
      error: "Supabase non configuré. Copie .env.example vers .env et renseigne tes vraies valeurs.",
      data: [],
    });
    return false;
  }
  return true;
}

// --- Catégories ---
router.get("/categories", async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("ordre", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- Nominés d'une catégorie ---
router.get("/categories/:slug/nominees", async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const { slug } = req.params;
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id, nom")
    .eq("slug", slug)
    .single();
  if (catErr || !cat) return res.status(404).json({ error: "Catégorie introuvable" });

  const { data, error } = await supabase
    .from("nominees")
    .select("id, nom_complet, classe_ou_filiere, bio, photo_url")
    .eq("category_id", cat.id)
    .eq("statut", "valide")
    .order("nom_complet");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ categorie: cat.nom, nominees: data });
});

// --- Classement (tous ou par catégorie) ---
router.get("/classement", async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  let query = supabase.from("classement").select("*");
  if (req.query.category_id) query = query.eq("category_id", req.query.category_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- Enregistrer un vote (statut en_attente, à confirmer manuellement) ---
router.post("/votes", async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const { nominee_id, operateur, telephone_votant, reference_transaction } = req.body;
  if (!nominee_id || !operateur || !reference_transaction) {
    return res.status(400).json({ error: "Champs manquants (nominee_id, operateur, reference_transaction requis)" });
  }
  const { data, error } = await supabase
    .from("votes")
    .insert({
      nominee_id,
      methode: "mobile_money",
      operateur,
      telephone_votant,
      reference_transaction,
      montant: 100,
      statut_paiement: "en_attente",
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Vote enregistré, en attente de confirmation du paiement.", vote: data });
});

// --- Paramètres publics (dates de vote, prix, numéros Mobile Money) ---
router.get("/settings", async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const { data, error } = await supabase.from("settings").select("cle, valeur");
  if (error) return res.status(500).json({ error: error.message });
  const settings = Object.fromEntries(data.map((s) => [s.cle, s.valeur]));
  res.json(settings);
});

module.exports = router;
