'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface MissionShellProps {
  missionNumber: number;
  missionName: string;
  title: string;
  description: string;
  backHref: string;
  icon?: ReactNode;
  footerActions?: ReactNode;
  children: ReactNode;
}

export function MissionShell({
  missionNumber,
  missionName,
  title,
  description,
  backHref,
  icon,
  footerActions,
  children,
}: MissionShellProps) {
  return (
    <div className="flex flex-col gap-8 pb-24">
      <nav className="flex items-center gap-2 text-sm">
        <Link href={backHref} className="text-red-600 hover:text-red-700" aria-label="Volver a misiones">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="font-semibold text-blue-900">Misión {missionNumber}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{missionName}</span>
      </nav>

      <header className="flex items-start gap-3">
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </header>

      <div>{children}</div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-between border-t bg-white/95 px-6 py-4 backdrop-blur">
        <Link href={backHref} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
          <ArrowLeft className="size-4" />
          Salir de la misión
        </Link>
        {footerActions}
      </div>
    </div>
  );
}
