'use client';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Category, expenseCategories, Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ExpenseChartProps {
    transactions: Transaction[];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<Category, number>);

    return expenseCategories
      .map(category => ({
        category,
        total: expenseByCategory[category] || 0,
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Gastos</CardTitle>
        <CardDescription>
          Un desglose de tus gastos por categoría.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: 'Total',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-[250px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={value => formatCurrency(value as number)}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
