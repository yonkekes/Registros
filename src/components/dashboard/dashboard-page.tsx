'use client';

import { useState, useMemo } from 'react';
import { SummaryCards } from './summary-cards';
import { ExpenseChart } from './expense-chart';
import { SpendingInsights } from './spending-insights';
import { DailyExpensesChart } from './daily-expenses-chart';
import { getMonth, getYear } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../theme-toggle';

export default function DashboardPage() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${getYear(now)}-${getMonth(now)}`;
  });

  const availableMonths = useMemo(() => {
    const months = new Map<string, string>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = getYear(date);
      const month = getMonth(date);
      const monthKey = `${year}-${month}`;
      if (!months.has(monthKey)) {
        months.set(monthKey, format(date, 'MMMM yyyy', { locale: es }));
      }
    });

    // Ensure current month is available even if there are no transactions
    const now = new Date();
    const currentMonthKey = `${getYear(now)}-${getMonth(now)}`;
    if (!months.has(currentMonthKey)) {
      months.set(currentMonthKey, format(now, 'MMMM yyyy', { locale: es }));
    }

    return Array.from(months.entries())
      .map(([key, label]) => ({
        value: key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [transactions]);
  
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return transactions;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    return transactions.filter(t => {
      const date = new Date(t.date);
      return getYear(date) === year && getMonth(date) === month;
    });
  }, [transactions, selectedMonth]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Panel
        </h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle />
        </div>
      </div>
      <SummaryCards transactions={filteredTransactions} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ExpenseChart transactions={filteredTransactions} />
        </div>
        <div className="col-span-4 lg:col-span-3">
          <SpendingInsights />
        </div>
        <div className="col-span-4 lg:col-span-7">
          <DailyExpensesChart transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
}
