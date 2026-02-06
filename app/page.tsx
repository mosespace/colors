import React, { Suspense } from 'react';
import Palette from '@/components/palette';

function RouteFallback() {
  return <></>;
}
export default function page() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense fallback={<RouteFallback />}>
        <Palette />
      </Suspense>
    </div>
  );
}
