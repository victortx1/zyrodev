const admin = require('firebase-admin');

function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('As variáveis do Firebase Admin não estão configuradas na Vercel.');
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  return admin;
}

function getDb() {
  return getFirebaseAdmin().firestore();
}

async function verificarTokenFirebase(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    const error = new Error('Login necessário.');
    error.statusCode = 401;
    throw error;
  }

  const idToken = header.slice(7).trim();
  if (!idToken) {
    const error = new Error('Token de autenticação ausente.');
    error.statusCode = 401;
    throw error;
  }

  return getFirebaseAdmin().auth().verifyIdToken(idToken);
}

module.exports = { getFirebaseAdmin, getDb, verificarTokenFirebase };
