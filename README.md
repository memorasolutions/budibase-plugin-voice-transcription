[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/memorasolutions/budibase-plugin-voice-transcription/releases/latest)
[![Budibase Plugin](https://img.shields.io/badge/Budibase-Plugin-brightgreen.svg)](https://budibase.com)

# budibase-plugin-voice-transcription

**Plugin Budibase de transcription vocale en temps réel via Web Speech API.** Conçu pour les travailleurs terrain (construction, gants, bruit). Un stagiaire sur un toit peut dicter son journal de bord au lieu de taper. 100% gratuit, zéro backend, zero dépendance externe.

## Aperçu

Ce composant permet la **transcription vocale en temps réel** directement dans les formulaires Budibase. Idéal pour les environnements bruyants ou avec gants de travail.

**Contexte :** projet ATE (alternance travail-etudes) du Centre de services scolaire de la Capitale (CSSC), formation professionnelle construction Quebec.

**Auteur :** [MEMORA solutions](https://memora.solutions) - info@memora.ca
*(cette attribution ne doit jamais être retirée)*

## Fonctionnalités

- Gros bouton micro (48px desktop, 56px mobile) adapté aux gants
- Transcription en temps réel (texte qui apparait pendant qu'on parle)
- Zone de texte éditable manuellement après dictee
- Bouton effacer pour recommencer
- Indicateur visuel enregistrement (point pulsant, bouton rouge)
- i18n : fr-CA, fr-FR, en-CA, en-US (messages UI dynamiques)
- Intégration formulaire Budibase (form binding via `formContext.registerField`)
- WCAG 2.2 AA (aria-live, role=status, cibles 48px+, label for=)
- Build : 10KB minifié, tarball 4.5KB

## Installation

### Option 1 : depuis GitHub (recommandé)

Dans Budibase Builder :

```
Settings > Plugins > Install from GitHub URL
```

URL a coller :

```
https://github.com/memorasolutions/budibase-plugin-voice-transcription
```

### Option 2 : tarball

1. Télécharger `dist/budibase-plugin-voice-transcription-1.0.0.tar.gz` depuis ce repo
2. Dans Budibase Builder : `Settings > Plugins > Upload file`

### Option 3 : développement local

```bash
git clone https://github.com/memorasolutions/budibase-plugin-voice-transcription
cd budibase-plugin-voice-transcription
npm install
npm run build
```

Le tarball est généré dans `dist/`.

## Utilisation

1. Ajouter un **Form** component dans un ecran Budibase
2. Ajouter **Transcription vocale** comme composant enfant du formulaire
3. Configurer le **champ** (field binding) vers la colonne de la table cible
4. Choisir la **langue** de reconnaissance vocale

Le composant apparait dans la section "Plugins" du panneau de composants du builder.

## Configuration

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| **Champ** | field/string | - | Champ formulaire Budibase *(obligatoire)* |
| **Libellé** | text | Description vocale | Label affiche au-dessus du champ |
| **Langue** | select | fr-CA | Langue de reconnaissance vocale |
| **Placeholder** | text | Appuyez sur le micro... | Texte d'indication dans le champ vide |
| **Désactivé** | boolean | false | Désactivé le composant |

## Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| Chrome Android | Complet | Recommandé pour le terrain |
| Safari iOS 14.5+ | Complet | iPhone et iPad |
| Chrome desktop | Complet | Tests et développement |
| Edge | Complet | Basé sur Chromium |
| Firefox | Non supporté | SpeechRecognition absent nativement |

## Fonctionnement technique

Le plugin utilise la [Web Speech API](https://developer.mozilla.org/fr/docs/Web/API/Web_Speech_API) native du navigateur. Aucune donnée audio n'est envoyée à un serveur externe. La reconnaissance vocale est traitée localement par le moteur du navigateur (Google pour Chrome, Apple pour Safari).

### Architecture

```
Utilisateur parle
    |
    v
navigator.mediaDevices (permission micro)
    |
    v
SpeechRecognition (navigateur natif)
    |
    v
onresult -> transcript (texte)
    |
    v
fieldApi.setValue(transcript) -> Budibase form -> table
```

### Sécurité et vie privée

- L'audio est envoyé aux serveurs du navigateur (Google pour Chrome, Apple pour Safari) pour la reconnaissance vocale. Le plugin lui-meme n'envoie rien
- La reconnaissance vocale utilise le moteur natif du navigateur
- Le navigateur demande la permission d'acces au microphone à l'utilisateur
- Attention : l'audio est envoyé aux serveurs Google (Chrome) ou Apple (Safari) pour traitement. Pas de données personnelles sensibles dans la dictee

## Structure du projet

```
budibase-plugin-voice-transcription/
├── src/
│   └── Component.svelte    # Composant principal (Svelte)
├── dist/                   # Fichiers buildes (généré par npm run build)
│   ├── plugin.min.js       # Plugin minifié (10KB)
│   ├── schema.json         # Schéma avec hash SHA1
│   ├── package.json        # Metadonnées
│   └── *.tar.gz            # Tarball prêt a installer
├── schema.json             # Définition des settings pour le builder
├── package.json            # Dépendances et scripts
├── rollup.config.js        # Configuration de build
├── index.js                # Point d'entrée
├── LICENSE                 # Licence MIT
└── README.md               # Cette documentation
```

## Information pour l'EFVP (évaluation des facteurs relatifs à la vie privée)

Au Quebec, la Loi 25 (en vigueur depuis septembre 2023) exige une évaluation des facteurs relatifs à la vie privée (EFVP) pour tout projet impliquant des renseignements personnels. Cette obligation s'applique autant aux organismes publics qu'aux entreprises privées. Cette section fournit les informations nécessaires pour réaliser cette évaluation.

| Élément | Detail |
|---------|--------|
| **Donnees collectees** | Audio vocal de l'utilisateur (voix) |
| **Finalite** | Transcription de la voix en texte pour remplir un formulaire |
| **Tiers impliques** | Google (navigateur Chrome/Edge) ou Apple (navigateur Safari) |
| **Localisation des serveurs** | Etats-Unis (Google), Etats-Unis (Apple) |
| **Conservation par le plugin** | Aucune. Le plugin ne conserve ni l'audio ni la transcription au-delà de la session |
| **Conservation par les tiers** | Selon les politiques de Google/Apple. Le plugin n'a aucun contrôle sur ce point |
| **Consentement** | Explicite, libre et éclairé. Dialogue de consentement avant la première activation du micro |
| **Droit de refus** | L'utilisateur peut refuser et saisir le texte manuellement sans impact sur le service |
| **Donnees sensibles** | L'audio vocal peut contenir des renseignements personnels si l'utilisateur en dicte. Un avertissement demande de ne pas dicter d'informations personnelles sensibles |
| **Mesures d'atténuation** | Consentement préalable, avertissement visible, pas de conservation locale, possibilite de refus |
| **Responsable** | L'organisme ou l'entreprise qui déploie le plugin (responsable de la protection des renseignements personnels) |

## Contribution

Les contributions sont les bienvenues. Pour contribuer :

1. Forker le projet
2. Créér une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajout de ma fonctionnalite'`)
4. Pusher la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

**L'attribution MEMORA solutions doit être conservée dans tout fork ou distribution.**

## Licence

[MIT](LICENSE) - utilisation et modification autorisees.

**Attribution obligatoire :** MEMORA solutions, https://memora.solutions ; info@memora.ca

---

*Conçu par MEMORA solutions.*
