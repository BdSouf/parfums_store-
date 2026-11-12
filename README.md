# La7ya Store — MVP de démonstration

Boutique de parfums locale en français et arabe, avec identité visuelle sombre et dorée. Les prix, stocks, clients, paiements et services sont fictifs. Aucune intégration marchande réelle.

## Utilisation

Depuis ce dossier : `npm run dev`, puis ouvrir l’adresse affichée. Les dépendances doivent déjà être disponibles.

- `/produits` : catalogue, recherche multilingue, filtres, pagination et prix par format.
- `/marques`, `/favoris`, `/comparateur`, `/quiz` : découverte et aide au choix.
- `/panier`, `/commande`, `/compte` : achat simulé, adresses, historique et fidélité.
- `/coffrets`, `/cadeaux` : trios de 5 ml et cartes cadeaux virtuelles.
- `/admin` : produits, stocks, commandes, paiements, demandes, avis, promotions, fidélité et contenus FR/AR.
- `/notifications` : aperçus locaux des messages, sans envoi.
- `/demo` : scénarios de présentation, export/import et réinitialisation.

Compte initial : `client@example.test` / `Demo123!`. Administration : `Demo123!`.
Ces accès publics ne protègent aucune donnée réelle. Utiliser uniquement des informations fictives.

## Architecture

Les pages utilisent les composants `market-*` et `heritage-*`. Le moteur pur `src/lib/demo-engine.ts` centralise les transitions, prix et avantages. `src/lib/store.tsx` adapte ce moteur au contexte React et à la persistance locale ; `src/lib/demo-model.ts` définit les données versionnées. Les filtres sont isolés dans `src/lib/catalog-query.ts`.

### Direction visuelle à préserver

L’identité de référence est le design précédant l’extension du MVP : accueil clair-obscur, logo centré, trois univers superposés, sections éditoriales flacons/décants, cartes travaillées, galerie en arche et tableau de bord à barre latérale. Ses styles restent dans `globals.css` et les CSS modules d’origine, sans modification. Les composants `heritage-*` réutilisent ces structures ; `heritage.css` encadre uniquement les nouveaux contrôles, leur adaptation arabe et les nouvelles pages de services. Les fonctionnalités doivent s’intégrer à cette identité sans remplacer le design global.

Le stockage `la7ya-state-v3` migre les anciens états sans supprimer `la7ya-state-v2`. Les données sont partagées entre onglets de la même origine, pas entre appareils. Les imports et sauvegardes sont validés avant remplacement de l’état. Une corruption reste exportable.

Les 12 références initiales sont conservées ; six produits Maison Démo permettent de présenter les attributs enrichis sans inventer de caractéristiques pour les marques réelles. Les descriptions historiques n’ont pas fait l’objet d’une nouvelle certification documentaire. Aucun faux avis réel ni agrément n’est revendiqué.

## Vérifications

```text
node scripts/verify-demo.cjs
node_modules/.bin/tsc --noEmit --incremental false
node_modules/.bin/eslint .
node_modules/.bin/next build
```

L’entrée historique `verify-demo.cjs` lance la suite étendue `verify-market.cjs` : règles métier, stockage et rendu React FR/AR. Aucun test n’accède aux données du navigateur.

Le [guide de démonstration](DEMO_GUIDE.md) décrit les scénarios, règles fictives, limites et intégrations futures. Les vérifications visuelles multi-écrans restent à terminer : l’accès automatisé au navigateur a expiré pendant cette session.

Le MVP porte `noindex`. La production nécessitera des données validées, une authentification réelle, un serveur, une base partagée, des intégrations autorisées et une validation juridique adaptée.
