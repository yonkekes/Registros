'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTransactions } from '@/contexts/transactions-context';
import { Transaction, categories, Category, incomeCategories, expenseCategories } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { es } from 'date-fns/locale';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.date(),
  category: z.custom<Category>(val => categories.includes(val as Category), {
    message: 'Categoría inválida',
  }),
  description: z.string().min(1, 'La descripción es requerida'),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export function AddTransactionSheet({
  open,
  onOpenChange,
  transactionId,
}: AddTransactionSheetProps) {
  const { addTransaction, updateTransaction, getTransactionById } =
    useTransactions();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      description: '',
      comments: '',
    },
  });

  const transactionType = form.watch('type');

  useEffect(() => {
    if (transactionId) {
      const tx = getTransactionById(transactionId);
      if (tx) {
        form.reset({
          ...tx,
          date: new Date(tx.date),
          amount: Math.abs(tx.amount),
        });
      }
    } else {
      form.reset({
        type: 'expense',
        amount: undefined,
        date: new Date(),
        category: 'Alimentacion',
        description: '',
        comments: '',
      });
    }
  }, [transactionId, open, form, getTransactionById]);

  useEffect(() => {
    if (transactionType === 'income' && !incomeCategories.includes(form.getValues('category') as any)) {
      form.setValue('category', incomeCategories[0]);
    } else if (transactionType === 'expense' && !expenseCategories.includes(form.getValues('category') as any)) {
      form.setValue('category', expenseCategories[0]);
    }
  }, [transactionType, form]);

  const onSubmit = (values: FormValues) => {
    const transactionData = {
      ...values,
      date: values.date.toISOString(),
    };

    if (transactionId) {
      updateTransaction({ ...transactionData, id: transactionId });
    } else {
      addTransaction(transactionData);
    }
    onOpenChange(false);
  };
  
  const handleAutoCategorize = async () => {
    const description = form.getValues('description');
    if (!description) {
        form.setError('description', { message: 'Se necesita una descripción para categorizar.'});
        return;
    }
    setIsCategorizing(true);
    try {
        const result = await categorizeTransaction({ description });
        if (result.category) {
            const newCategory = result.category;
            const isIncomeCat = incomeCategories.includes(newCategory as any);
            const isExpenseCat = expenseCategories.includes(newCategory as any);

            if (isIncomeCat) {
                form.setValue('type', 'income');
                form.setValue('category', newCategory, { shouldValidate: true });
            } else if (isExpenseCat) {
                form.setValue('type', 'expense');
                form.setValue('category', newCategory, { shouldValidate: true });
            }
        }
    } catch (e) {
        console.error("Failed to categorize transaction", e);
        // Optionally, show a toast or error message to the user
    } finally {
        setIsCategorizing(false);
    }
  }


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {transactionId ? 'Editar' : 'Añadir'} Transacción
          </SheetTitle>
          <SheetDescription>
            {transactionId ? 'Actualizar' : 'Registrar'} una nueva actividad financiera.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Gasto</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Ingreso</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. Café con amigos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                    <div className='flex gap-2'>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {transactionType === 'expense'
                              ? expenseCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))
                              : incomeCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={handleAutoCategorize} disabled={isCategorizing}>
                            {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-accent"/>}
                            <span className="sr-only">Auto-categorizar</span>
                        </Button>
                    </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem className='flex-1'>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col flex-1 mt-2">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP', { locale: es })
                            ) : (
                                <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                            locale={es}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade cualquier nota extra..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isCategorizing}>
              {transactionId ? 'Guardar Cambios' : 'Añadir Transacción'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
