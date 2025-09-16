'use client';
import { useMemo } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction } from '@/lib/types';

interface DailyExpensesChartProps {
  transactions: Transaction[];
}

export function DailyExpensesChart({ transactions }: DailyExpensesChartProps) {
  const chartData = useMemo(() => {
    const dailyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const day = format(startOfDay(new Date(t.date)), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(dailyExpenses)
      .map(([date, total]) => ({
        date,
        total,
        formattedDate: format(new Date(date), 'dd MMM', { locale: es }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Gastos Diarios</CardTitle>
            <CardDescription>
              Un desglose de tus gastos por día.
            </CardDescription>
        </div>
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
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={value => formatCurrency(value as number)}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={value => formatCurrency(value as number)}
                  labelFormatter={(value) => format(new Date(value), "eeee, dd MMMM", { locale: es })}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: 'hsl(var(--primary))',
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
