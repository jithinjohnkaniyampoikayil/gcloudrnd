import EnvDisplay from '@/components/env-display';

export default function Home() {
  // More detailed debugging
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL);
  console.log('typeof process.env.DATABASE_URL:', typeof process.env.DATABASE_URL);
  console.log('All process.env keys:', Object.keys(process.env));
  console.log('All process.env:', process.env);
  console.log('=========================');

  // Load specific environment variables from process.env
  // This runs on the server side during SSR, so we have access to all env vars
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL || 'Not set',
    // Add some debugging info
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    PORT: process.env.PORT || 'Not set',
    HOSTNAME: process.env.HOSTNAME || 'Not set',
    _DEBUG_ALL_ENV_KEYS: Object.keys(process.env).join(', '),
    _DEBUG_DATABASE_URL_TYPE: typeof process.env.DATABASE_URL,
    _DEBUG_DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length.toString() : '0'
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
