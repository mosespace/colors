import NotFound from '@/app/not-found';
import ColorDetailPage from '@/components/work';
import React from 'react';

export default async function page({
  params,
}: {
  params: Promise<{ color: string }>;
}) {
  const { color } = await params;
  if (!color || !/^([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color)) {
    return <NotFound />;
  }

  const baseHex = `#${color.toUpperCase().replace('#', '')}`;

  return <ColorDetailPage color={baseHex} />;
}
