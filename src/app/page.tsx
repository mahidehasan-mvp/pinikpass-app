import { PasswordGeneratorCard } from '@/components/password-generator-card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background font-sans">
      <PasswordGeneratorCard />
    </main>
  );
}
