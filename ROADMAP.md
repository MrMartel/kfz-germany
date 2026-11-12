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

## 📸 5. Car-Spotting & Carnet de Chasse
- [ ] **Journal des observations (*Spotting Log*)** : Distinction entre « Favoris » et « Plaques croisées en vrai » avec date de première observation, compteur de vues et jauge de progression globale.
- [ ] **Export visuel PNG (Canvas API)** : Génération d'une fiche image récapitulative (carte colorée + statistiques) partageable directement sur mobile.
- [ ] **Filtre par axe autoroutier (*Autobahn*)** : Sélection des préfixes situés le long des grands axes (A5, A8, A3, A1, etc.) pour un usage en road-trip.

## 📖 6. Culture & Réglementation Automobile Allemande
- [ ] **Guide visuel des macarons (*HU / TÜV* & *Umweltplakette*)** : Explication interactive du code couleur annuel et de la lecture horaire des macarons de contrôle technique.
- [ ] **Encyclopédie des plaques spéciales** : Fiches dédiées aux plaques de transit (bande jaune), d'exportation (bande rouge) et aux codes pays du corps diplomatique (`0-XX`).
- [ ] **Étymologie des préfixes** : Explication de l'origine des abréviations non évidentes (anciens noms de districts ou fusions administratives).

## 🔍 7. Recherche Intelligente & Outils de Partage
- [ ] **Recherche sans accents / umlauts (`ä, ö, ü, ß`)** : Normalisation Unicode pour que `munchen` ou `koln` trouvent immédiatement `München` et `Köln`.
- [ ] **Synchronisation par QR Code** : Affichage d'un QR Code sur l'écran du PC lors du clic sur *Synchroniser* pour un scan direct avec l'appareil photo de l'iPhone.
- [ ] **Exportation CSV / JSON** : Téléchargement d'une sauvegarde locale de ses favoris et observations.
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