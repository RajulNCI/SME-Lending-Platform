/**
 * cognitoAuth.ts
 *
 * Thin wrapper around amazon-cognito-identity-js.
 * Handles login, logout, token refresh, and current session retrieval.
 *
 * Config is read from environment variables (Vite):
 *   VITE_COGNITO_USER_POOL_ID
 *   VITE_COGNITO_CLIENT_ID
 *   VITE_COGNITO_REGION
 */
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const POOL_ID   = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID    as string;

// Lazy-init: never construct the pool at module load. If the Cognito env vars
// are missing (e.g. preview build without config), the constructor would throw
// "Both UserPoolId and ClientId are required" and white-screen the whole app.
let _userPool: CognitoUserPool | null = null;
function getUserPool(): CognitoUserPool {
  if (!POOL_ID || !CLIENT_ID) {
    throw new Error('Cognito is not configured (missing VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_CLIENT_ID)');
  }
  if (!_userPool) {
    _userPool = new CognitoUserPool({ UserPoolId: POOL_ID, ClientId: CLIENT_ID });
  }
  return _userPool;
}

export interface CognitoLoginResult {
  idToken: string;
  accessToken: string;
  email: string;
  displayName: string;
  groups: string[];
}

// ── Login ─────────────────────────────────────────────────────────────────────

export function cognitoLogin(email: string, password: string): Promise<CognitoLoginResult> {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool:     getUserPool(),
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess(session: CognitoUserSession) {
        const idToken     = session.getIdToken();
        const payload     = idToken.decodePayload();
        const groups: string[] = payload['cognito:groups'] ?? [];
        const given  = payload['given_name']  ?? '';
        const family = payload['family_name'] ?? '';
        const displayName = `${given} ${family}`.trim() || payload['name'] || email;

        resolve({
          idToken:     idToken.getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          email:       payload['email'] ?? email,
          displayName,
          groups,
        });
      },
      onFailure(err) {
        reject(err);
      },
      newPasswordRequired(_userAttributes, _requiredAttributes) {
        // First-time login — complete the challenge with the same password
        cognitoUser.completeNewPasswordChallenge(password, {}, {
          onSuccess(session: CognitoUserSession) {
            const idToken     = session.getIdToken();
            const payload     = idToken.decodePayload();
            const groups: string[] = payload['cognito:groups'] ?? [];
            const given  = payload['given_name']  ?? '';
            const family = payload['family_name'] ?? '';
            const displayName = `${given} ${family}`.trim() || payload['name'] || email;

            resolve({
              idToken:     idToken.getJwtToken(),
              accessToken: session.getAccessToken().getJwtToken(),
              email:       payload['email'] ?? email,
              displayName,
              groups,
            });
          },
          onFailure(err) { reject(err); },
        });
      },
    });
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function cognitoLogout(): void {
  if (!POOL_ID || !CLIENT_ID) return;
  const user = getUserPool().getCurrentUser();
  if (user) user.signOut();
}

// ── Restore session (on page reload) ─────────────────────────────────────────

export function getCognitoSession(): Promise<CognitoLoginResult | null> {
  return new Promise((resolve) => {
    if (!POOL_ID || !CLIENT_ID) { resolve(null); return; }
    const user = getUserPool().getCurrentUser();
    if (!user) { resolve(null); return; }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) { resolve(null); return; }

      const idToken     = session.getIdToken();
      const payload     = idToken.decodePayload();
      const groups: string[] = payload['cognito:groups'] ?? [];
      const given  = payload['given_name']  ?? '';
      const family = payload['family_name'] ?? '';
      const displayName = `${given} ${family}`.trim() || payload['name'] || payload['email'] || '';

      resolve({
        idToken:     idToken.getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        email:       payload['email'] ?? '',
        displayName,
        groups,
      });
    });
  });
}
