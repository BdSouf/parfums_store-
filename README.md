# La7ya Store — démonstration non officielle

MVP local destiné à présenter un parcours e-commerce complet : catalogue, variantes, panier, checkout fictif et suivi dans un dashboard.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir l’adresse affichée par Next.js (habituellement `http://localhost:3000`, ou le port libre suivant). Le catalogue, le panier et les commandes sont conservés ensemble dans le `localStorage` du navigateur. Aucune commande n’est envoyée à un service externe.

## Gérer le catalogue de démonstration

Dans `/admin`, ouvrir **Catalogue**, puis **Ajouter un parfum**. Renseigner le nom, la marque, l’univers (grandes marques, niche ou parfums arabes), une description et trois notes olfactives. Choisir une image existante ou importer un PNG, JPEG ou WebP de 600 Ko maximum.

Ajouter les formats disponibles : flacons avec leur volume, ou décants de 5, 10 et 20 ml. Chaque format possède un prix en MAD et un stock disponible. Enregistrer : le parfum apparaît dans la boutique et dispose de sa propre fiche, dans ce navigateur.

**Modifier** permet d’actualiser les informations et stocks. **Archiver** retire le parfum de la vente sans effacer les commandes ; le filtre **Archivés** permet de le remettre en vente. Un format utilisé par une commande active conserve son type et son volume jusqu’à l’annulation de cette commande.

La validation d’une commande diminue les stocks et vide le panier dans une seule sauvegarde. Une annulation restitue les stocks une seule fois ; une réactivation vérifie à nouveau la disponibilité. Les commandes conservent les informations et prix enregistrés lors de leur création. Les anciens paniers et commandes sont repris automatiquement.

Un échec de stockage affiche une erreur et n’applique pas la modification. Les images volumineuses peuvent saturer le stockage local : utiliser des images légères. Les modifications se synchronisent entre les onglets du même navigateur et de la même adresse locale (un autre port constitue un autre stockage).

## Limites volontaires de cette version

- Pas de commande, paiement ou message réel.
- Pas de Docker ni PostgreSQL pour cette première présentation.
- Pas d’authentification administrateur réelle.
- Catalogue et données de démonstration modifiables localement ; aucune synchronisation entre appareils.
- Images importées et modifications locales non disponibles au serveur pour le référencement ou les métadonnées des nouvelles fiches.

Avant une mise en production, remplacer le stockage navigateur par PostgreSQL/Prisma, protéger l’administration et mettre en place la validation transactionnelle du stock côté serveur.
