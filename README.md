# Mariage Ilénia & Maïk — Upload Google Drive direct

Structure à mettre sur GitHub :

- index.html
- package.json
- api/upload.js
- README.md

Variables Vercel nécessaires :

- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_DRIVE_FOLDER_ID

Important :
- Ne jamais mettre la clé privée dans index.html.
- Le dossier Google Drive doit être partagé avec le service account en Éditeur.
- GOOGLE_PRIVATE_KEY doit être copiée depuis le JSON Google avec les \n.

Architecture :

1. Le site demande à /api/upload une session Google Drive resumable.
2. Le navigateur envoie ensuite le fichier directement vers Google Drive.
3. Les gros fichiers ne passent donc pas par Vercel.
