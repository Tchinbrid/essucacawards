# ESS-UCAC Academic Awards — Site de vote

Site prêt à déployer pour le gala du **10 juillet 2026**. Il reste 4 étapes pour le mettre en ligne : Supabase, images, Render, et le remplissage des nominés.

## Étape 1 — Créer la base de données (Supabase, 10 min)

1. Va sur https://supabase.com → « New project ».
2. Une fois le projet créé, ouvre l'onglet **SQL Editor** → colle tout le contenu du fichier `db/schema.sql` → **Run**.
3. Va dans **Project Settings > API** et note deux valeurs :
   - `Project URL` → à mettre dans `SUPABASE_URL`
   - `service_role key` (⚠️ pas la `anon key`) → à mettre dans `SUPABASE_SERVICE_KEY`
4. Va dans **Storage** → crée un bucket public nommé `nominees` (pour stocker les photos des nominés).

## Étape 2 — Ajouter les images

Dépose dans `public/img/` les fichiers suivants (noms exacts, sinon casse les balises `<img>`) :

| Fichier attendu | Contenu |
|---|---|
| `logo-ucac-ess.png` | Logo UCAC École des Sciences de la Santé (fond transparent) |
| `logo-amicale.png` | Logo Bureau de l'Amicale |
| `sponsor-carimo.png` | Logo Carimo |
| `sponsor-applestore237.png` | Logo Apple Store 237 |
| `sponsor-boissons-cameroun.png` | Logo Boissons du Cameroun |
| `sponsor-delices-mariejo.png` | Logo Les Délices de Marie Jo |
| `placeholder-nominee.jpg` | Photo générique si un nominé n'a pas encore de photo |

Les photos des nominés eux-mêmes seront uploadées dans le bucket Supabase `nominees` (étape 4).

## Étape 3 — Déployer sur Render (10 min)

1. Crée un dépôt GitHub avec ce dossier et pousse le code.
2. Sur https://render.com → **New > Web Service** → connecte le dépôt.
3. Renseigne :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
4. Dans l'onglet **Environment**, ajoute les variables :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
5. Déploie. Ton site sera accessible à une adresse du type `https://ess-ucac-awards.onrender.com`.

## Étape 4 — Ajouter les nominés par catégorie

Dès que tu m'envoies la liste des nominés (nom, catégorie, classe/filière, photo), je génère directement les lignes SQL à coller dans Supabase, ou je les ajoute pour toi si tu me donnes accès. En attendant, tu peux aussi les ajouter manuellement :

1. Dans Supabase → **Table Editor > nominees** → **Insert row**.
2. Renseigne `category_id` (voir la table `categories` pour les identifiants 1 à 7), `nom_complet`, `classe_ou_filiere`, `photo_url` (lien de l'image uploadée dans le bucket `nominees`), et laisse `statut` = `valide`.

## Étape 5 — Configurer les numéros Mobile Money

Dans Supabase → **Table Editor > settings**, remplace les valeurs `A_DEFINIR` des lignes `numero_orange_money` et `numero_mtn_momo` par tes vrais numéros. Modifie aussi `vote_fermeture` si l'horaire change.

## Comment fonctionne le vote (important à expliquer au public)

Le site n'est **pas encore branché à un vrai système de paiement automatique** (Monetbil/CinetPay demandent une validation qui prend souvent plusieurs jours — trop long avant le 10 juillet). Le flux actuel est donc :

1. Le votant clique sur « Voter », choisit Orange Money ou MTN MoMo.
2. Le site affiche le numéro à créditer de 100 FCFA.
3. Le votant envoie l'argent depuis son téléphone, reçoit une référence de transaction par SMS.
4. Il saisit cette référence sur le site → le vote est enregistré avec le statut `en_attente`.
5. **Toi ou un membre du bureau** vérifiez les transactions reçues sur le compte Mobile Money, puis passez le statut du vote à `confirme` dans Supabase (Table Editor > votes) — seuls les votes `confirme` comptent dans le classement.

C'est le même principe que celui déjà utilisé sur « L'ESS a un Grand Talent ». Si tu obtiens l'activation de Monetbil ou CinetPay avant le 10 juillet, je peux brancher le paiement automatique en remplacement de cette étape manuelle.

## Lancer le site en local pour tester

```bash
npm install
cp .env.example .env   # puis remplir les vraies valeurs
npm start
```

Le site sera accessible sur http://localhost:3000
