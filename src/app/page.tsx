import EnvDisplay from '@/components/env-display';

export default function Home() {
  // Load specific environment variables from process.env
  // This runs on the server side during SSR, so we have access to all env vars
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL || 'Not set',
    // Add some debugging info
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    _DEBUG_ALL_ENV_KEYS: Object.keys(process.env).join(', ')
  };

  // Server-side console log for debugging
  console.log('Environment variables loaded:', {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length
  });

  return (
    <main className="container mx-auto p-4 md:p-8">
      <EnvDisplay variables={envVars} />
    </main>
  );
}
