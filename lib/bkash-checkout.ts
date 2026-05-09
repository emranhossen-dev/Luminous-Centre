/**
 * bKash Tokenized Checkout (hosted payment page), mode 0011 — sandbox / live.
 * Docs: https://developer.bka.sh/docs/create-payment-2
 * Credentials must stay server-side only.
 */

function getBaseUrl(): string {
  const raw =
    process.env.BKASH_API_BASE_URL ||
    process.env.BKASH_BASE_URL ||
    'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
  return raw.replace(/\/$/, '');
}

function requireBkashEnv(): {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
} {
  const appKey = process.env.BKASH_APP_KEY || '';
  const appSecret = process.env.BKASH_APP_SECRET || '';
  const username = process.env.BKASH_USERNAME || '';
  const password = process.env.BKASH_PASSWORD || '';
  if (!appKey || !appSecret || !username || !password) {
    throw new Error('bKash is not configured. Set BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD.');
  }
  return { appKey, appSecret, username, password };
}

export async function bkashGrantToken(): Promise<string> {
  const { appKey, appSecret, username, password } = requireBkashEnv();
  const base = getBaseUrl();
  const res = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username,
      password
    },
    body: JSON.stringify({ app_key: appKey, app_secret: appSecret })
  });
  const data = (await res.json()) as Record<string, unknown>;
  const idToken = data.id_token as string | undefined;
  if (!res.ok || !idToken) {
    const msg =
      (data.statusMessage as string) ||
      (data.errorMessage as string) ||
      (data.message as string) ||
      `Grant token failed (${res.status})`;
    throw new Error(msg);
  }
  return idToken;
}

export type BkashCreatePaymentResult = {
  paymentID: string;
  bkashURL: string;
  merchantInvoiceNumber: string;
  raw: Record<string, unknown>;
};

export async function bkashCreatePayment(params: {
  amount: string;
  merchantInvoiceNumber: string;
  payerReference: string;
  callbackURL: string;
}): Promise<BkashCreatePaymentResult> {
  const { appKey } = requireBkashEnv();
  const base = getBaseUrl();
  const idToken = await bkashGrantToken();

  const res = await fetch(`${base}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': appKey
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: params.payerReference,
      callbackURL: params.callbackURL,
      amount: params.amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.merchantInvoiceNumber
    })
  });

  const data = (await res.json()) as Record<string, unknown>;
  const statusCode = data.statusCode as string | undefined;
  const paymentID = data.paymentID as string | undefined;
  const bkashURL = data.bkashURL as string | undefined;

  if (!res.ok || statusCode !== '0000' || !paymentID || !bkashURL) {
    const msg =
      (data.statusMessage as string) ||
      (data.errorMessage as string) ||
      (data.message as string) ||
      `Create payment failed (${res.status})`;
    throw new Error(msg);
  }

  return {
    paymentID,
    bkashURL,
    merchantInvoiceNumber: params.merchantInvoiceNumber,
    raw: data
  };
}

export type BkashExecuteResult = Record<string, unknown>;

export async function bkashExecutePayment(paymentID: string): Promise<BkashExecuteResult> {
  const { appKey } = requireBkashEnv();
  const base = getBaseUrl();
  const idToken = await bkashGrantToken();

  const res = await fetch(`${base}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': appKey
    },
    body: JSON.stringify({ paymentID })
  });

  const data = (await res.json()) as BkashExecuteResult;
  return data;
}
