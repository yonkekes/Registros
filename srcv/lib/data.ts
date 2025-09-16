import { Transaction } from '@/lib/types';

// This data is now for reference and will not be used in production
// as the data is fetched from Firebase Realtime Database.
export const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    date: new Date('2024-07-01T09:00:00').toISOString(),
    category: 'Sueldo',
    description: 'Sueldo Mensual',
  },
  {
    id: '2',
    type: 'expense',
    amount: 1500,
    date: new Date('2024-07-01T12:00:00').toISOString(),
    category: 'Prestamo y Deuda',
    description: 'Pago de prestamo',
  },
  {
    id: '3',
    type: 'expense',
    amount: 350,
    date: new Date('2024-07-02T19:30:00').toISOString(),
    category: 'Alimentacion',
    description: 'Cena en restaurante',
  },
  {
    id: '4',
    type: 'expense',
    amount: 800,
    date: new Date('2024-07-03T10:00:00').toISOString(),
    category: 'Compras Casa',
    description: 'Compras del supermercado',
  },
  {
    id: '5',
    type: 'expense',
    amount: 200,
    date: new Date('2024-07-05T08:00:00').toISOString(),
    category: 'Transporte y/o Gasolina',
    description: 'Gasolina para el coche',
  },
  {
    id: '6',
    type: 'income',
    amount: 1000,
    date: new Date('2024-07-06T20:00:00').toISOString(),
    category: 'Servicio Tecnico',
    description: 'Reparacion de PC',
  },
  {
    id: '7',
    type: 'expense',
    amount: 300,
    date: new Date('2024-07-10T13:00:00').toISOString(),
    category: 'Servicios Basicos Luz y Agua',
    description: 'Factura de la luz',
  },
  {
    id: '8',
    type: 'expense',
    amount: 150,
    date: new Date('2024-07-12T12:30:00').toISOString(),
    category: 'Alimentacion',
    description: 'Almuerzo con colegas',
  },
];
