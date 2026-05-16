import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Méthode non autorisée');
  }

  try {
    const { name, mimeType } = req.body || {};

    if (!name) {
      return res.status(400).send('Nom du fichier manquant');
    }

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
      return res.status(500).send('Variables Google manquantes dans Vercel');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      return res.status(500).send('Impossible de générer le token Google');
    }

    const safeName = name.replace(/[\\/<>:"|?*]/g, '-');
    const finalName = `${new Date().toISOString().replace(/[:.]/g, '-')}_${safeName}`;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
      },
      body: JSON.stringify({
        name: finalName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      }),
    });

    if (!response.ok) {
      return res.status(500).send(await response.text());
    }

    const uploadUrl = response.headers.get('location');

    if (!uploadUrl) {
      return res.status(500).send('Google n’a pas renvoyé d’URL d’upload');
    }

    return res.status(200).json({ uploadUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}
