import EnvDisplay from '@/components/env-display';

export default function Home() {
  // In Next.js, process.env is only fully available on the server side
  // during the build process and server-side rendering. Client-side code
  // only gets access to variables prefixed with NEXT_PUBLIC_.
  // By fetching here in a Server Component, we get all of them.
  const envVars = { ...process.env };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <EnvDisplay variables={envVars} />
    </main>
  );
}
