import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export default function MisionesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fdfaf5]">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-900">ASODECA</span>
          <span className="text-lg font-bold">
            EINIGKEIT <span className="text-red-600">2026</span>
          </span>
        </Link>
        <Button variant="outline">Mi cuenta</Button>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
