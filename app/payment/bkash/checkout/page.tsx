import { Suspense } from 'react';
import BkashCheckoutClient from './BkashCheckoutClient';

export default function BkashCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
          Loading checkout…
        </div>
      }
    >
      <BkashCheckoutClient />
    </Suspense>
  );
}
