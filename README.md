# La7ya Store — démonstration non officielle

MVP local destiné à présenter un parcours e-commerce complet : catalogue, variantes, panier, checkout fictif et suivi dans un dashboard.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`. Les paniers et commandes de démonstration sont conservés dans le `localStorage` du navigateur. Aucune donnée n’est envoyée à un service externe.

## Limites volontaires de cette version

- Pas de commande, paiement ou message réel.
- Pas de Docker ni PostgreSQL pour cette première présentation.
- Pas d’authentification administrateur réelle.
- Visuels abstraits et produits fictifs.

Avant une mise en production, remplacer le stockage navigateur par PostgreSQL/Prisma, protéger l’administration et mettre en place la validation transactionnelle du stock côté serveur.
