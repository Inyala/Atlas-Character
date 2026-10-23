# Unicode Atlas — site GitHub Pages

Site statique d’exploration Unicode, avec HTML, CSS et JavaScript séparés.

## Structure

```text
unicode-explorer-site/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
└── data/
    └── preview.json
```

## Lancer en local

`fetch()` ne fonctionne généralement pas quand `index.html` est ouvert directement en `file://`.
Lance un serveur local, par exemple depuis ce dossier :

```bash
python -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

## Publier sur GitHub Pages

1. Crée un dépôt GitHub, par exemple `unicode-atlas`.
2. Envoie les fichiers et dossiers de ce projet à la racine du dépôt.
3. Ouvre **Settings → Pages**.
4. Choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`.
5. Enregistre et attends l’adresse publiée par GitHub.

## Configurer les liens de téléchargement

Ouvre `js/app.js` et remplace les URL d’exemple dans `DATA_URLS` par les liens réels de tes fichiers publiés dans une GitHub Release.

Exemple de forme d’URL :

```text
https://github.com/TON-COMPTE/TON-DEPOT/releases/latest/download/character_db.sqlite
```

Les fichiers JSON et XML complets dépassent 100 Mo dans l’archive source. GitHub refuse les fichiers individuels de plus de 100 Mo dans un dépôt Git classique. Publie les fichiers volumineux comme assets d’une **GitHub Release**, ou utilise un hébergement de fichiers adapté. Les liens ne peuvent pas fonctionner tant que tu n’as pas remplacé les URL d’exemple.

## Aperçu limité

`data/preview.json` contient un échantillon de 6 000 entrées réparties sur la plage Unicode, et non la base entière. Cela permet à GitHub Pages de proposer une recherche locale sans charger une base gigantesque. L’interface limite aussi les résultats affichés à 15 % du total Unicode annoncé, avec une pagination.

La recherche sur la page porte uniquement sur l’échantillon. Une page statique GitHub Pages ne peut pas interroger directement le fichier SQLite distant : pour rechercher dans toute la base, il faudra un backend/API ou des données découpées en fichiers indexés.

## Formats de la base complète

- `character_db.json`
- `character_db.xml`
- `character_db.sqlite`
- `character_db.csv`
- `character_db.zip`

Le site n’inclut pas les fichiers complets dans le dépôt : ils sont trop volumineux pour être versionnés directement, et les visiteurs peuvent les télécharger séparément depuis les liens configurés.
