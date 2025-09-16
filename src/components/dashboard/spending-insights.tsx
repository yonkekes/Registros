'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb } from 'lucide-react';
import { useTransactions } from '@/contexts/transactions-context';
import { getSpendingInsights } from '@/ai/flows/get-spending-insights';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function SpendingInsights() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { transactions } = useTransactions();

  const handleGetInsights = async () => {
    setLoading(true);
    setError('');
    setInsights('');
    try {
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      if (expenseTransactions.length === 0) {
        setInsights('No hay datos de gastos disponibles para analizar.');
        return;
      }
      const result = await getSpendingInsights({
        transactions: JSON.stringify(expenseTransactions),
      });
      setInsights(result.insights);
    } catch (e) {
      setError('No se pudieron obtener las percepciones. Inténtalo de nuevo.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-accent" />
          <span>Análisis con IA</span>
        </CardTitle>
        <CardDescription>
          Deja que la IA analice tus gastos y te sugiera formas de ahorrar dinero.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {insights && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{insights}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetInsights} disabled={loading} className="w-full">
          {loading ? 'Analizando...' : 'Analizar Mis Gastos'}
        </Button>
      </CardFooter>
    </Card>
  );
}
