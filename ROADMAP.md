# 🗺️ Roadmap & Idées d'évolutions — Kfz-Kennzeichen Finder (v8.0.0+)

Ce document recense les pistes fonctionnelles et techniques prévues pour les prochaines versions de l'application (architecture 100 % statique PWA).

---

## 🎯 1. Ludification & Apprentissage
- [ ] **Mode Quiz interactif** : Affichage d'une plaque générée aléatoirement (ex. `FÜ`, `M`, `KA`) avec QCM à 4 choix (ville ou Land), compteur de score, série de bonnes réponses (*streak*) et filtrage possible par Land ou par favoris.
- [ ] **Plaque mystère du jour** : Sélection déterministe d'une plaque quotidienne calculée côté client à partir de la date du jour (sans backend).

## 📊 2. Visualisation, Statistiques & Géolocalisation
- [ ] **Tableau de bord analytique par Land** : Répartition des préfixes par Land, classement par longueur de préfixe (1, 2 ou 3 lettres) et taux de complétion des favoris par région.
- [ ] **Carte SVG choroplèthe (densité)** : Coloration dynamique des Länder selon le nombre de préfixes enregistrés ou selon la présence de favoris.
- [ ] **Tri par proximité GPS (« Autour de moi »)** : Utilisation de `navigator.geolocation` (avec ajout des coordonnées `lat`/`lon` dans `data.json`) pour trier les préfixes par distance kilométrique réelle lors d'un déplacement en Allemagne ou près de la frontière.

## 🚘 3. Enrichissement de l'Encyclopédie & Plaques Spéciales
- [ ] **Simulateur de plaque personnalisée (*Wunschkennzeichen*)** :
  - Édition libre des lettres et chiffres après le sceau (`KL 8136`) dans la modale de détail.
  - Bascule entre les variantes réglementaires :
    - Standard
    - Véhicule électrique (`E` en fin de numéro)
    - Véhicule historique / collection (`H` en fin de numéro)
    - Plaque saisonnière (*Saisonkennzeichen* avec bandeau mois de début / mois de fin)
- [ ] **Classification administrative (`type` dans `data.json`)** : Distinction entre préfixes principaux actuels, préfixes réintroduits depuis la réforme de 2012 (*Kennzeichenliberalisierung*, ex. `WAT`, `WAF`, `LÖB`) et plaques fédérales spéciales (`Y` Bundeswehr, `BP` Bundespolizei, `0` corps diplomatique).
- [ ] **Liens externes rapides** : Boutons d'accès direct vers **Apple Plans / Google Maps**, **Wikipédia** et **OpenStreetMap** depuis la modale de détail.

## ⚙️ 4. Ergonomie & Données Utilisateur
- [ ] **Notes personnelles par préfixe** : Ajout d'un mémo texte privé par plaque dans `localStorage` (inclus dans l'exportation/importation).
- [ ] **Raccourci clavier global** : Focus automatique sur la barre de recherche via `/` ou `Cmd+K` / `Ctrl+K`.

---

## 📋 Matrice de priorisation

| Fonctionnalité | Impact utilisateur | Complexité technique | Modification `data.json` |
| :--- | :---: | :---: | :---: |
| Simulateur `E` / `H` / Saison | Élevé | Faible | Non |
| Quiz interactif | Élevé | Moyenne | Non |
| Statistiques par Land | Moyen | Faible | Non |
| Raccourci clavier (`/` ou `Cmd+K`) | Moyen | Faible | Non |
| Statut (Actuel / Réintroduit / Fédéral) | Élevé | Faible | Oui (`type`) |
| Tri par distance GPS | Élevé | Moyenne | Oui (`lat`, `lon`) |