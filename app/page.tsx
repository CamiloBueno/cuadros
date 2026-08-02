import Link from 'next/link';
import { Button } from '@/components/ui/button';

const MISSIONS = [
  { href: '/misiones/memorama', title: 'Parejas ocultas', description: 'Memorama' },
  { href: '/misiones/crucigrama', title: 'Completa el crucigrama', description: 'Crucigrama' },
];

export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Misiones</h1>
      <ul className="flex flex-col gap-4">
        {MISSIONS.map((mission) => (
          <li key={mission.href} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{mission.title}</p>
              <p className="text-sm text-muted-foreground">{mission.description}</p>
            </div>
            <Button variant="outline" nativeButton={false} render={<Link href={mission.href} />}>
              Entrar
            </Button>
          </li>
        ))}
      </ul>
    </main>
  );
}
