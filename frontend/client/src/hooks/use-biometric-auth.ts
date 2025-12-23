import { useState, useEffect, useCallback } from 'react';

interface BiometricAuthState {
  isAvailable: boolean;
  isSupported: boolean;
  isEnrolled: boolean;
  authenticating: boolean;
  error: string | null;
  authenticate: () => Promise<boolean>;
  enroll: (credentialId: string) => Promise<boolean>;
  checkEnrollment: () => Promise<boolean>;
  supportedTypes: string[];
}

export function useBiometricAuth(): BiometricAuthState {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedTypes, setSupportedTypes] = useState<string[]>([]);

  useEffect(() => {
    checkBiometricSupport();
  }, [checkBiometricSupport]);

  const checkBiometricSupport = useCallback(async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setIsSupported(false);
        return;
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available);
      setIsSupported(true);

      // Determine supported biometric types
      const types: string[] = [];
      if (available) {
        // Check for specific biometric types (this is approximate)
        try {
          const credential = await navigator.credentials.get({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: 'Imarisha Loans' },
              user: {
                id: new Uint8Array(16),
                name: 'test@example.com',
                displayName: 'Test User'
              },
              authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required'
              },
              timeout: 60000
            }
          } as CredentialRequestOptions);

          if (credential) {
            types.push('biometric');
          }
        } catch (err) {
          // Ignore errors during capability check
        }
      }

      setSupportedTypes(types);
      console.log('[Biometric] Support checked:', { available, supported: true, types });
    } catch (err) {
      setIsSupported(false);
      setIsAvailable(false);
      console.log('[Biometric] Not supported:', err);
    }
  }, []);

  const checkEnrollment = useCallback(async (): Promise<boolean> => {
    try {
      // Check if user has enrolled biometrics by attempting authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required'
        }
      } as CredentialRequestOptions);

      const enrolled = !!credential;
      setIsEnrolled(enrolled);
      return enrolled;
    } catch (err) {
      setIsEnrolled(false);
      return false;
    }
  }, []);

  const enroll = useCallback(async (credentialId: string): Promise<boolean> => {
    try {
      setError(null);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Imarisha Loans',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: credentialId,
            displayName: `User ${credentialId}`
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      } as CredentialCreationOptions);

      if (credential) {
        setIsEnrolled(true);
        console.log('[Biometric] Enrollment successful');
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMessage);
      console.error('[Biometric] Enrollment failed:', err);
      return false;
    }
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setAuthenticating(true);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: [] // Allow any enrolled credential
        }
      } as CredentialRequestOptions);

      const success = !!credential;
      if (success) {
        console.log('[Biometric] Authentication successful');
      } else {
        setError('Authentication failed');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('[Biometric] Authentication failed:', err);
      return false;
    } finally {
      setAuthenticating(false);
    }
  }, []);

  return {
    isAvailable,
    isSupported,
    isEnrolled,
    authenticating,
    error,
    authenticate,
    enroll,
    checkEnrollment,
    supportedTypes
  };
}
