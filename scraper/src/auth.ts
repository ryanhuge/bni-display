interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const AUTH_URL = 'https://api.bniconnectglobal.com/auth-api/authenticate';
const CLIENT_ID = 'IDENTITY_PORTAL';

export async function authenticate(username: string, password: string): Promise<AuthResult> {
  console.log('[auth] 正在登入 BNI Connect...');

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_ID}`).toString('base64');

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      user_id: username,
      password,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`登入失敗 (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content = data.content;

  if (!content?.access_token) {
    throw new Error('登入回應中沒有 access_token');
  }

  console.log('[auth] 登入成功');
  return {
    accessToken: content.access_token,
    refreshToken: content.refresh_token,
    expiresIn: content.expires_in,
  };
}
