'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { database } from '@/lib/firebase';
import { ref, onValue, push, update, remove, set } from 'firebase/database';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addMultipleTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

const transactionsRef = ref(database, 'finanzas');

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsList: Transaction[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort by date descending
        transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(transactionsList);
      } else {
        setTransactions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransactionRef = push(transactionsRef);
    set(newTransactionRef, transaction);
  }, []);
  
  const addMultipleTransactions = useCallback((newTransactions: Omit<Transaction, 'id'>[]) => {
    const updates: Record<string, any> = {};
    newTransactions.forEach(t => {
        const newTransactionKey = push(transactionsRef).key;
        if (newTransactionKey) {
            // Remove undefined values before sending to Firebase
            const cleanedTransaction = Object.fromEntries(Object.entries(t).filter(([_, v]) => v !== undefined));
            updates[`/finanzas/${newTransactionKey}`] = cleanedTransaction;
        }
    });
    update(ref(database), updates);
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    const { id, ...data } = updatedTransaction;
    const transactionRef = ref(database, `finanzas/${id}`);
    update(transactionRef, data);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    const transactionRef = ref(database, `finanzas/${id}`);
    remove(transactionRef);
  }, []);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        addMultipleTransactions,
        updateTransaction,
        deleteTransaction,
        getTransactionById,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
