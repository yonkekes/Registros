import {
  type LucideIcon,
  Utensils,
  Car,
  ShoppingCart,
  House,
  Landmark,
  Wrench,
  Plug,
  HandCoins,
  Briefcase,
  Cog,
  Building,
  Wallet,
} from 'lucide-react';

export const expenseCategories = [
  'Alimentacion',
  'Transporte y/o Gasolina',
  'Compras Casa',
  'Prestamo y Deuda',
  'Compra de Repuestos',
  'Servicios Basicos Luz y Agua',
  'Creditos',
  'Otros Gastos',
] as const;

export const incomeCategories = [
  'Sueldo',
  'Servicio Tecnico',
  'Comision Inmobiliaria',
  'Otros Ingresos',
] as const;

export const categories = [...expenseCategories, ...incomeCategories];

export type ExpenseCategory = (typeof expenseCategories)[number];
export type IncomeCategory = (typeof incomeCategories)[number];
export type Category = ExpenseCategory | IncomeCategory;

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string; // ISO string
  category: Category;
  description: string;
  comments?: string;
};

export const categoryIcons: Record<Category, LucideIcon> = {
  // Expense
  Alimentacion: Utensils,
  'Transporte y/o Gasolina': Car,
  'Compras Casa': ShoppingCart,
  'Prestamo y Deuda': Landmark,
  'Compra de Repuestos': Wrench,
  'Servicios Basicos Luz y Agua': Plug,
  Creditos: HandCoins,
  'Otros Gastos': Cog,
  // Income
  Sueldo: Briefcase,
  'Servicio Tecnico': Cog,
  'Comision Inmobiliaria': Building,
  'Otros Ingresos': Wallet,
};
