export class GoogleOAuth {
  private static readonly POPUP_WIDTH = 500;
  private static readonly POPUP_HEIGHT = 600;
  private static readonly POPUP_LEFT = typeof window !== 'undefined' ? (window.screen.width - GoogleOAuth.POPUP_WIDTH) / 2 : 0;
  private static readonly POPUP_TOP = typeof window !== 'undefined' ? (window.screen.height - GoogleOAuth.POPUP_HEIGHT) / 2 : 0;

  static signInWithRedirect(): void {
    if (typeof window === 'undefined') {
      throw new Error('Google OAuth can only be used in the browser');
    }

    // Generate auth URL
    const authUrl = new URL('/api/auth/google', window.location.origin);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google/callback`);

    // Redirect to Google OAuth
    window.location.href = authUrl.toString();
  }

  static async signInWithPopup(): Promise<{ token: string; user: any }> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Google OAuth can only be used in the browser'));
    }

    return new Promise((resolve, reject) => {
      // Generate popup URL
      const authUrl = new URL('/api/auth/google', window.location.origin);
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google/callback`);

      // Open popup window
      const popup = window.open(
        authUrl.toString(),
        'google-signin',
        `width=500,height=600,left=${(window.screen.width - 500) / 2},top=${(window.screen.height - 600) / 2},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!popup) {
        reject(new Error('Failed to open popup window'));
        return;
      }

      // Listen for messages from popup
      const messageHandler = (event: MessageEvent) => {
        // Only accept messages from our origin
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'google-oauth-success') {
          cleanup();
          resolve(event.data.payload);
        } else if (event.data.type === 'google-oauth-error') {
          cleanup();
          reject(new Error(event.data.error));
        }
      };

      // Check if popup was closed by user
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error('Popup was closed before authentication completed'));
        }
      }, 1000);

      const cleanup = () => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        if (popup && !popup.closed) {
          popup.close();
        }
      };

      window.addEventListener('message', messageHandler);

      // Handle popup close
      popup.onbeforeunload = () => {
        cleanup();
        reject(new Error('Popup was closed before authentication completed'));
      };
    });
  }

  static async handleCallback(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'google-oauth-error',
        error: decodeURIComponent(error)
      }, window.location.origin);
      window.close();
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Send success to parent window
        window.opener?.postMessage({
          type: 'google-oauth-success',
          payload: { token, user }
        }, window.location.origin);
        
        window.close();
      } catch (err) {
        window.opener?.postMessage({
          type: 'google-oauth-error',
          error: 'Failed to parse user data'
        }, window.location.origin);
        window.close();
      }
    } else {
      window.opener?.postMessage({
        type: 'google-oauth-error',
        error: 'No authentication data received'
      }, window.location.origin);
      window.close();
    }
  }
}
