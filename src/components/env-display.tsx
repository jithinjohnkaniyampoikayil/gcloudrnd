"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download } from 'lucide-react';

type EnvVar = {
  key: string;
  value: string;
};

type EnvDisplayProps = {
  variables: { [key: string]: string | undefined };
};

export default function EnvDisplay({ variables }: EnvDisplayProps) {
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState<'partial' | 'regex'>('partial');
  const [highlight, setHighlight] = useState(false);

  const allVars: EnvVar[] = useMemo(() => {
    return Object.entries(variables)
      .map(([key, value]) => ({ key, value: value || '' }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [variables]);

  const filteredVars = useMemo(() => {
    if (!filter) {
      return allVars;
    }
    
    try {
      if (filterType === 'regex') {
        const regex = new RegExp(filter, 'i');
        return allVars.filter(({ key }) => regex.test(key));
      } else {
        return allVars.filter(({ key }) => key.toLowerCase().includes(filter.toLowerCase()));
      }
    } catch (error) {
      console.error("Invalid regex:", error);
      return [];
    }
  }, [allVars, filter, filterType]);

  const triggerHighlight = () => {
    setHighlight(true);
    setTimeout(() => setHighlight(false), 500);
  };
  
  useEffect(() => {
    triggerHighlight();
  }, [filter, filterType, allVars]);

  const handleExport = () => {
    const content = filteredVars.map(({ key, value }) => `${key}=${JSON.stringify(value)}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'env-variables.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerHighlight();
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg border-2 border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-headline tracking-tight text-primary">EnvDisplay</CardTitle>
        <CardDescription className="text-lg">View, filter, and export your runtime environment variables.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-primary/5 rounded-lg items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by variable name (e.g., PATH, NEXT_PUBLIC_...)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="filter-type"
              checked={filterType === 'regex'}
              onCheckedChange={(checked) => setFilterType(checked ? 'regex' : 'partial')}
            />
            <Label htmlFor="filter-type" className="font-medium">Use Regex</Label>
          </div>
          <Button onClick={handleExport} disabled={filteredVars.length === 0} variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Download className="mr-2 h-4 w-4" />
            Export Filtered
          </Button>
        </div>
        
        <div className="rounded-md border max-h-[60vh] overflow-y-auto relative">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-1/3 font-bold text-lg text-primary">Key</TableHead>
                <TableHead className="font-bold text-lg text-primary">Value</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredVars.length > 0 ? (
                filteredVars.map(({ key, value }) => (
                  <TableRow 
                    key={key} 
                    className={`transition-colors duration-500 ease-in-out ${highlight ? 'bg-primary/10' : 'bg-transparent'}`}
                  >
                    <TableCell className="font-code font-medium text-sm break-all">{key}</TableCell>
                    <TableCell className="font-code text-sm break-all">{value}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground h-32 text-base">
                    No environment variables match your filter.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}