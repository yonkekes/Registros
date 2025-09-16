'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download } from 'lucide-react';
import { TransactionsTable } from './transactions-table';
import { AddTransactionSheet } from './add-transaction-sheet';
import { useTransactions } from '@/contexts/transactions-context';
import { Category, categories, incomeCategories, expenseCategories } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImportTransactionsDialog } from './import-transactions-dialog';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';


export default function TransactionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'amount';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });
  
  const { transactions } = useTransactions();

  const handleEdit = (id: string) => {
    setEditingTransactionId(id);
    setSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingTransactionId(null);
    setSheetOpen(true);
  };
  
  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setEditingTransactionId(null);
    }
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortConfig.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm, sortConfig]);

  const handleSort = (key: 'date' | 'amount') => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }

  const availableCategories = useMemo(() => {
    if (typeFilter === 'income') return incomeCategories;
    if (typeFilter === 'expense') return expenseCategories;
    return categories;
  }, [typeFilter])
  
  const handleImportClick = () => {
    setImportDialogOpen(true);
  };
  
  const handleExport = () => {
    const dataToExport = sortedAndFilteredTransactions.map(t => ({
      'Fecha': format(new Date(t.date), 'yyyy-MM-dd'),
      'Descripción': t.description,
      'Monto': t.amount,
      'Tipo': t.type === 'income' ? 'Ingreso' : 'Gasto',
      'Categoría': t.category,
      'Comentarios': t.comments ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones");
    XLSX.writeFile(workbook, "transacciones.xlsx");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Transacciones</h2>
        <div className='flex gap-2'>
            <Button onClick={handleImportClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
            <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Transacción
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center">
        <Input
          placeholder="Filtrar por descripción..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={(v) => {
            setTypeFilter(v as any);
            setCategoryFilter('all');
        }}>
            <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
            </SelectContent>
        </Select>
         <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <TransactionsTable
        transactions={sortedAndFilteredTransactions}
        onEdit={handleEdit}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <AddTransactionSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        transactionId={editingTransactionId}
      />
      <ImportTransactionsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
