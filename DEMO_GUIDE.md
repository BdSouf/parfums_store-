# La7ya Store — Guide de démonstration

## Démarrer

Depuis le dossier du projet : `npm run dev`. Ouvrir l’adresse indiquée par Next.js.
Pour un aperçu compilé : `npm run build`, puis `npm run start`.

La démonstration est autonome par navigateur **et par origine** : changer de port crée un autre stockage. Les onglets d’une même origine se synchronisent. Aucun backend, paiement, email, SMS, WhatsApp ou transporteur n’est connecté.

Le design de référence précédent est conservé : accueil clair-obscur, cartes d’univers superposées, sections flacons/décants, fiches avec galerie en arche, panier et commande éditoriaux, administration à barre latérale. Les nouveaux services sont accessibles depuis le menu et le pied de page ; les nouveaux filtres et avantages sont intégrés sans remplacer ces présentations.

Le thème clair ivoire et doré de la mise à jour `ea47ed7` est désormais le thème initial, étendu aux services du MVP et à l’administration. La préférence clair/sombre est mémorisée sous `la7ya-theme`, séparément des données de démonstration. Le bouton soleil/lune est dans le header, le parcours d’achat et l’administration ; sur mobile, celui de la boutique est dans le menu. Une préférence sombre déjà enregistrée est conservée. Le visuel flacons et les sélections éditoriales de cette mise à jour sont intégrés avec leurs textes FR/AR. Ces sélections ne remplacent pas les coffrets de trois décants de 5 ml.

## Accès de test

| Usage | Accès |
| --- | --- |
| Compte client | `/compte` — `client@example.test` / `Demo123!` |
| Nouveau compte | Inscription avec un nom fictif et une adresse `@example.test` ; même mot de passe public `Demo123!` |
| Administration | `/admin` — `Demo123!` |
| Carte préchargée | `DEMO-CADEAU` — solde fictif initial de 200 MAD |
| Promotion | `DEMO10` — 10 %, un usage actif par compte, hors coffrets |
| Présentation et sauvegardes | `/demo` |
| Arabe | Bouton العربية, ou ajouter `?lang=ar` à une page |

Les identifiants sont publics. Ce n’est pas un système d’authentification. N’entrer aucune identité, adresse, donnée bancaire ou mot de passe personnel réel.

## Présentation recommandée

1. Ouvrir `/demo`, exporter les modifications à conserver, puis charger un scénario.
2. Montrer l’accueil, le changement de visuel et le passage FR/AR.
3. Parcourir les marques ; combiner format, budget et disponibilité. Les prix affichés correspondent au format filtré.
4. Ajouter des favoris et deux ou trois parfums à la comparaison. Le quiz fournit des correspondances exactes sans score inventé.
5. Choisir un format et ajouter un produit au panier. Les 2 ml sont disponibles sur certaines références fictives ; les anciens formats sont conservés.
6. Montrer le total définitif, un code promotionnel ou des points, une carte cadeau et le retrait gratuit.
7. Choisir le paiement carte de test : refus et abandon conservent le panier ; réussite crée une commande locale. Aucune saisie bancaire.
8. Ouvrir l’administration dans un deuxième onglet **du même navigateur et du même port**. Faire évoluer la commande et retrouver le suivi côté client.
9. Pour un paiement à la livraison, montrer qu’une livraison peut rester non encaissée. Utiliser séparément « Simuler l’encaissement ».
10. Depuis une commande livrée, soumettre un avis ou demander un retour. L’administration modère ou examine la demande. La remise en stock après remboursement est une action distincte.

Les scénarios « achat invité », « achat membre », « promotion », « coffret », « paiement refusé », « rupture », « retour » et « arabe » sont préparables depuis `/demo`. Leur chargement réinitialise les données, après confirmation.

## Règles fictives initiales

- Devise MAD ; calculs en centimes entiers.
- Livraison 30 MAD, offerte dès 600 MAD après remise ; retrait gratuit.
- Le code et les points ne se cumulent pas. Un code annulé peut être réutilisé ; la réactivation contrôle à nouveau sa limite.
- 1 point par tranche de 10 MAD de produits livrés après réduction ; 100 points donnent 10 MAD de remise. Les frais et achats de cartes cadeaux sont exclus.
- Le solde de 150 points du compte initial est un **solde de présentation**, pas un avantage réel.
- Un coffret contient trois décants de 5 ml et coûte la somme de ses composants. Les lignes sont groupées ; retirer un composant retire le coffret. Pour éviter un mélange de lignes groupées et individuelles, un même format déjà présent doit être retiré avant l’ajout d’un coffret le contenant.
- Les cartes de 200, 500 ou 1 000 MAD s’achètent séparément depuis `/cadeaux`, sans modifier le panier physique. Paiement simulé réussi requis ; validité de 12 mois ; solde partiellement utilisable. Une carte émise déjà utilisée ne peut pas être remboursée par ce simulateur.
- Une annulation restitue une seule fois le stock réservé et les avantages utilisés. Un retour accepté rembourse la commande entière ; il ne remet pas automatiquement les produits en stock.
- Les offres de variantes reviennent au prix de référence hors de leurs dates. Les règles et contenus sont modifiables dans l’administration.

## Données et contenu

Le catalogue initial conserve les 12 références et adresses produits existantes et ajoute six références **Maison Démo**, entièrement fictives, pour les filtres, saisons et promotions.

Les descriptions initiales proviennent du projet existant ; leur traduction n’est pas une nouvelle validation documentaire des parfums. Aucune nouvelle famille, concentration, cible ou pyramide n’est déduite pour ces références réelles. Leur vérification éditoriale reste nécessaire avant usage commercial. Les caractéristiques supplémentaires des références fictives sont des exemples, sans prétention factuelle.

L’éditeur propose les textes FR/AR, attributs, sources HTTPS, pyramide facultative, images, formats et offres datées. Pour une référence réelle, les caractéristiques supplémentaires demandent une source documentaire. Une URL saisie par l’opérateur n’est pas automatiquement certifiée comme source fiable.

Les images sont celles déjà présentes dans le projet, ou des imports locaux PNG/JPEG/WebP de 600 Ko maximum. La photographie réelle des contenants n’est pas fournie par ce MVP.

## Sauvegarder et restaurer

- `/demo` permet l’export JSON, l’import validé et la remise à zéro.
- L’export conserve le contenu brut si le stockage est illisible. Une corruption bloque les nouvelles sauvegardes jusqu’à une restauration ou réinitialisation explicite.
- L’import est limité à 4 Mo et ferme les sessions client et administrateur.
- Les données de `la7ya-state-v2` sont migrées sans modifier les adresses et identifiants. L’ancienne clé est conservée.
- Le stock est un nombre d’unités préparées par format. Aucun réservoir commun de liquide en ml n’est simulé.
- Les écritures entre onglets ne constituent pas des transactions multi-utilisateurs garanties. Aucun partage entre appareils.

## Validation technique

```text
node scripts/verify-demo.cjs
node_modules/.bin/tsc --noEmit --incremental false
node_modules/.bin/eslint .
node_modules/.bin/next build
```

Le script vérifie le moteur métier, les migrations, la persistance simulée et le rendu React des pages FR/AR. Les données du navigateur ne sont pas modifiées par ces tests.

La compilation, les types et les contrôles automatisés ne remplacent pas une vérification visuelle : terminer les parcours au clavier et les inspections à 360, 390, 768 et 1 440 px avant présentation finale. Après intégration du thème clair, l’accueil, le catalogue arabe, l’espace client et l’administration ont été inspectés dans Brave sur grand écran ; des vues étroites de l’accueil, de l’administration et du parcours d’achat vide ont aussi été contrôlées. Cela ne constitue pas une validation complète de toutes les pages aux quatre tailles demandées.

## Intégrations reportées

| MVP actuel | Future production |
| --- | --- |
| Stockage local versionné | Base partagée, sauvegardes, transactions de stock |
| Connexion et récupération simulées | Authentification, permissions et récupération sécurisées |
| Paiement simulé et cartes cadeaux virtuelles | Prestataire, vérification serveur et rapprochement |
| Statuts et suivi fictifs | Intégration transporteur et encaissements |
| Aperçus de notifications | Envois email/SMS/WhatsApp réellement autorisés |
| Pages de présentation et noindex | Contenus juridiques validés et stratégie d’indexation |

Les tests de cette session n’établissent ni une conformité juridique de production, ni la sécurité d’une authentification réelle, ni un taux de conversion commercial.
