# AzaRatti 1 of 1 — Backend (API)

API REST en Node.js / Express / MongoDB pour le site AzaRatti1of1.
À héberger sur **Render**, séparément du frontend (Vercel).

## 1. Installation locale

```bash
cd azaratti-backend
npm install
cp .env.example .env
```

Remplis ensuite **toutes** les valeurs du fichier `.env` (voir les commentaires "EMPLACEMENTS À REMPLIR" dans `.env.example`) :
- `MONGODB_URI` → créer un cluster gratuit sur https://www.mongodb.com/cloud/atlas
- `JWT_SECRET` → générer une chaîne aléatoire longue (ex: `openssl rand -base64 48`)
- `FRONTEND_URL` → l'URL de ton site une fois déployé sur Vercel
- `EMAIL_USER` / `EMAIL_APP_PASSWORD` → azarattiof@gmail.com + mot de passe d'application Google (https://myaccount.google.com/apppasswords)

## 2. Remplir la base avec les 15 produits

```bash
node seed.js
```

À relancer à chaque fois que tu modifies les produits dans `seed.js`.

## 3. Lancer en local

```bash
npm run dev
```

L'API tourne sur `http://localhost:5000`. Test rapide : `GET http://localhost:5000/api/health`

## 4. Déploiement sur Render

1. Pousse ce dossier `azaratti-backend` sur un repo GitHub dédié (séparé du frontend).
2. Sur https://render.com → New > Web Service → connecte le repo.
3. Build Command : `npm install`
4. Start Command : `npm start`
5. Dans Render > Environment, ajoute **toutes** les variables du `.env` (sauf qu'ici tu mets les vraies valeurs, jamais le fichier `.env` lui-même).
6. Une fois déployé, note l'URL Render (ex: `https://azaratti-backend.onrender.com`) — elle sera utilisée côté frontend dans `VITE_API_URL`.

## 5. Endpoints disponibles

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérifie que l'API tourne |
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur connecté |
| GET | `/api/products` | Liste des produits (filtrable par `?category=` et `?q=`) |
| GET | `/api/products/:id` | Détail d'un produit |
| POST | `/api/orders` | Enregistre une commande (avant redirection WhatsApp) |
| GET | `/api/orders/my-orders` | Historique des commandes (connecté) |
| POST | `/api/custom-request` | Demande sur-mesure (envoie 2 emails : notification + auto-réponse) |
| POST | `/api/contact` | Formulaire de contact général |
| GET | `/api/likes` | Favoris de l'utilisateur connecté |
| POST | `/api/likes/toggle` | Ajoute/retire un favori (connecté) |

## 6. Sécurité mise en place

- Mots de passe hashés avec bcrypt (12 rounds)
- Authentification par JWT (expiration configurable)
- Rate limiting sur les routes sensibles (auth, formulaires)
- En-têtes HTTP sécurisés via Helmet
- CORS restreint au domaine du frontend
- Validation stricte des entrées sur toutes les routes POST
