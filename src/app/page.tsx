import EnvDisplay from '@/components/env-display';

export default function Home() {
  // Load specific environment variables from process.env
  // This runs on the server side during SSR, so we have access to all env vars
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL || 'Not set'
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <EnvDisplay variables={envVars} />
    </main>
  );
}
