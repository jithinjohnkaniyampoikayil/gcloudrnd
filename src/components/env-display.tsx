"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Eye, EyeOff, Server, Globe, Key, Settings, Code, Database } from 'lucide-react';

type EnvVar = {
  key: string;
  value: string;
  category: 'next-public' | 'api-keys' | 'database' | 'system' | 'development' | 'other';
  isSecret: boolean;
};

type EnvDisplayProps = {
  variables: { [key: string]: string | undefined };
};

const categorizeEnvVar = (key: string, value: string): EnvVar['category'] => {
  const upperKey = key.toUpperCase();
  
  if (upperKey.startsWith('NEXT_PUBLIC_')) return 'next-public';
  if (upperKey.includes('API_KEY') || upperKey.includes('SECRET') || upperKey.includes('TOKEN') || upperKey.includes('PASSWORD')) return 'api-keys';
  if (upperKey.includes('DATABASE') || upperKey.includes('DB_') || upperKey.includes('REDIS') || upperKey.includes('MONGO')) return 'database';
  if (upperKey.includes('NODE_') || upperKey.includes('PATH') || upperKey.includes('HOME') || upperKey.includes('USER')) return 'system';
  if (upperKey.includes('DEV') || upperKey.includes('DEBUG') || upperKey.includes('LOG_') || upperKey.includes('HOT_RELOAD')) return 'development';
  
  return 'other';
};

const isCustomEnvVar = (key: string): boolean => {
  const upperKey = key.toUpperCase();
  
  // For now, only show DATABASE_URL
  return upperKey === 'DATABASE_URL';
};

const isSecretVar = (key: string): boolean => {
  const upperKey = key.toUpperCase();
  return upperKey.includes('SECRET') || 
         upperKey.includes('PASSWORD') || 
         upperKey.includes('API_KEY') || 
         upperKey.includes('TOKEN') ||
         upperKey.includes('PRIVATE');
};

const getCategoryIcon = (category: EnvVar['category']) => {
  switch (category) {
    case 'next-public': return <Globe className="h-4 w-4" />;
    case 'api-keys': return <Key className="h-4 w-4" />;
    case 'database': return <Database className="h-4 w-4" />;
    case 'system': return <Server className="h-4 w-4" />;
    case 'development': return <Code className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: EnvVar['category']) => {
  switch (category) {
    case 'next-public': return 'bg-green-100 text-green-800 border-green-300';
    case 'api-keys': return 'bg-red-100 text-red-800 border-red-300';
    case 'database': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'system': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'development': return 'bg-purple-100 text-purple-800 border-purple-300';
    default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
};

export default function EnvDisplay({ variables }: EnvDisplayProps) {
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState<'partial' | 'regex'>('partial');
  const [highlight, setHighlight] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | EnvVar['category']>('all');

  const allVars: EnvVar[] = useMemo(() => {
    return Object.entries(variables)
      .filter(([key]) => isCustomEnvVar(key)) // Only show custom environment variables
      .map(([key, value]) => ({
        key,
        value: value || '',
        category: categorizeEnvVar(key, value || ''),
        isSecret: isSecretVar(key)
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [variables]);

  const categorizedVars = useMemo(() => {
    const categories = {
      'next-public': allVars.filter(v => v.category === 'next-public'),
      'api-keys': allVars.filter(v => v.category === 'api-keys'),
      'database': allVars.filter(v => v.category === 'database'),
      'system': allVars.filter(v => v.category === 'system'),
      'development': allVars.filter(v => v.category === 'development'),
      'other': allVars.filter(v => v.category === 'other'),
    };
    return categories;
  }, [allVars]);

  const displayVars = useMemo(() => {
    let vars = selectedCategory === 'all' ? allVars : categorizedVars[selectedCategory];
    
    if (!filter) {
      return vars;
    }
    
    try {
      if (filterType === 'regex') {
        const regex = new RegExp(filter, 'i');
        return vars.filter(({ key }) => regex.test(key));
      } else {
        return vars.filter(({ key }) => key.toLowerCase().includes(filter.toLowerCase()));
      }
    } catch (error) {
      console.error("Invalid regex:", error);
      return [];
    }
  }, [allVars, categorizedVars, selectedCategory, filter, filterType]);

  const categoryStats = useMemo(() => {
    const stats = Object.entries(categorizedVars).map(([category, vars]) => ({
      category: category as EnvVar['category'],
      count: vars.length,
      secretCount: vars.filter(v => v.isSecret).length
    }));
    return stats;
  }, [categorizedVars]);

  const triggerHighlight = () => {
    setHighlight(true);
    setTimeout(() => setHighlight(false), 500);
  };
  
  useEffect(() => {
    triggerHighlight();
  }, [filter, filterType, allVars, selectedCategory]);

  const handleExport = () => {
    const content = displayVars.map(({ key, value }) => `${key}=${JSON.stringify(value)}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `env-variables-${selectedCategory}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerHighlight();
  };

  const maskValue = (value: string, isSecret: boolean) => {
    if (!isSecret || showSecrets) return value;
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg border-2 border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-headline tracking-tight text-primary flex items-center justify-center gap-2">
          <Settings className="h-10 w-10" />
          EnvDisplay
        </CardTitle>
        <CardDescription className="text-lg">
          Displaying DATABASE_URL environment variable. Found {allVars.length} variable{allVars.length !== 1 ? 's' : ''}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {categoryStats.map(({ category, count, secretCount }) => (
            <Card 
              key={category}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
            >
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  {getCategoryIcon(category)}
                </div>
                <Badge className={`text-xs mb-1 ${getCategoryColor(category)}`}>
                  {category}
                </Badge>
                <div className="text-sm font-medium">{count}</div>
                {secretCount > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Key className="h-3 w-3" />
                    {secretCount}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-primary/5 rounded-lg items-start lg:items-center">
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter DATABASE_URL variable"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-type"
                checked={filterType === 'regex'}
                onCheckedChange={(checked) => setFilterType(checked ? 'regex' : 'partial')}
              />
              <Label htmlFor="filter-type" className="font-medium">Regex</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-secrets"
                checked={showSecrets}
                onCheckedChange={setShowSecrets}
              />
              <Label htmlFor="show-secrets" className="font-medium flex items-center gap-1">
                {showSecrets ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Secrets
              </Label>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={displayVars.length === 0} 
              variant="secondary" 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Export ({displayVars.length})
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border max-h-[60vh] overflow-y-auto relative">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-1/4 font-bold text-lg text-primary">Category</TableHead>
                <TableHead className="w-1/3 font-bold text-lg text-primary">Key</TableHead>
                <TableHead className="font-bold text-lg text-primary">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayVars.length > 0 ? (
                displayVars.map(({ key, value, category, isSecret }) => (
                  <TableRow 
                    key={key} 
                    className={`transition-colors duration-500 ease-in-out ${
                      highlight ? 'bg-primary/10' : 'bg-transparent'
                    } ${isSecret ? 'bg-red-50/50' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <Badge className={`text-xs ${getCategoryColor(category)}`}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(category)}
                          {category}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-code font-medium text-sm break-all">
                      {isSecret && <Key className="inline h-3 w-3 mr-1 text-red-500" />}
                      {key}
                    </TableCell>
                    <TableCell className="font-code text-sm break-all">
                      {maskValue(value, isSecret)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-32 text-base">
                    {allVars.length === 0 ? (
                      <div>
                        <p>No custom environment variables found.</p>
                        <p className="text-sm mt-2">
                          Add variables to your <code>.env.local</code> file or check if they start with allowed prefixes.
                        </p>
                      </div>
                    ) : (
                      "No environment variables match your filter."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}