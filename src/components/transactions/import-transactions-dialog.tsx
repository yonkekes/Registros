'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/contexts/transactions-context';
import { Category, categories } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';

interface ImportTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transactionFields = {
    date: 'Fecha',
    description: 'Descripción',
    amount: 'Monto',
    type: 'Tipo',
    category: 'Categoría',
    comments: 'Comentarios'
};

type TransactionFieldKeys = keyof typeof transactionFields;

const REQUIRED_FIELDS: TransactionFieldKeys[] = [
  'date',
  'description',
  'amount',
  'type',
  'category',
];
const OPTIONAL_FIELDS: TransactionFieldKeys[] = ['comments'];

type TransactionFieldMapping = {
    [key in TransactionFieldKeys]: string;
}

export function ImportTransactionsDialog({
  open,
  onOpenChange,
}: ImportTransactionsDialogProps) {
  const { addMultipleTransactions } = useTransactions();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Partial<TransactionFieldMapping>>({});

  const resetState = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setData([]);
    setMapping({});
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            const fileHeaders = jsonData[0] as string[];
            const fileData = jsonData.slice(1).map(row => {
                const rowData: Record<string, any> = {};
                fileHeaders.forEach((header, index) => {
                    rowData[header] = row[index];
                });
                return rowData;
            });
            setHeaders(fileHeaders);
            setData(fileData);
            setStep(2);
          } else {
             toast({
              variant: "destructive",
              title: "Archivo Vacío",
              description: "El archivo seleccionado no contiene datos.",
            });
            resetState();
          }
        } catch (error) {
          console.error("Error al procesar el archivo:", error);
          toast({
            variant: "destructive",
            title: "Error de Lectura",
            description: "No se pudo leer el archivo. Asegúrate de que es un .xlsx válido.",
          });
          resetState();
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleMappingChange = (field: TransactionFieldKeys, value: string) => {
    setMapping(prev => ({...prev, [field]: value}));
  }

  const handleImport = () => {
     const missingFields = REQUIRED_FIELDS.filter(field => !mapping[field]);
     if (missingFields.length > 0) {
        toast({
            variant: "destructive",
            title: "Campos Faltantes",
            description: `Por favor, mapea los siguientes campos: ${missingFields.map(f => transactionFields[f]).join(', ')}`,
        });
        return;
     }

     const newTransactions: Omit<any, 'id'>[] = [];
     data.forEach((row, rowIndex) => {
        try {
            const typeValue = String(row[mapping.type!]).toLowerCase();
            const newTransaction = {
                date: new Date(row[mapping.date!]).toISOString(),
                description: String(row[mapping.description!]),
                amount: parseFloat(row[mapping.amount!]),
                type: typeValue === 'ingreso' || typeValue === 'income' ? 'income' : 'expense',
                category: String(row[mapping.category!]) as Category,
                comments: mapping.comments ? String(row[mapping.comments!]) : undefined,
            };

            if (newTransaction.date && newTransaction.description && !isNaN(newTransaction.amount) && categories.includes(newTransaction.category)) {
                newTransactions.push(newTransaction);
            }
        } catch (e) {
            console.warn(`Omitiendo fila ${rowIndex+2} por error de formato.`);
        }
     });

    if (newTransactions.length > 0) {
        addMultipleTransactions(newTransactions);
        toast({
            title: "Importación Exitosa",
            description: `Se importaron ${newTransactions.length} transacciones.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error de Importación",
            description: "No se encontraron transacciones válidas con el mapeo proporcionado.",
        });
    }
    handleClose(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Transacciones</DialogTitle>
          <DialogDescription>
            Sigue los pasos para importar tus transacciones desde un archivo Excel.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx"
            />
            <p className='mb-4'>Arrastra y suelta tu archivo aquí o</p>
            <Button onClick={handleFileSelect}>Seleccionar Archivo</Button>
            <p className="text-xs text-gray-500 mt-2">Solo archivos .xlsx son soportados</p>
          </div>
        )}
        
        {step === 2 && (
            <div>
                <h3 className="font-semibold mb-2">Paso 2: Mapear Columnas</h3>
                <p className="text-sm text-muted-foreground mb-4">Asigna las columnas de tu archivo a los campos de transacción requeridos.</p>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map(field => (
                         <div key={field} className='flex flex-col gap-2'>
                            <label className='text-sm font-medium capitalize'>
                                {transactionFields[field]}
                                {REQUIRED_FIELDS.includes(field as any) && <span className='text-destructive'> *</span>}
                            </label>
                            <Select onValueChange={(value) => handleMappingChange(field, value)} value={mapping[field]}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar columna" />
                                </SelectTrigger>
                                <SelectContent>
                                    {headers.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    ))}
                </div>

                <h3 className="font-semibold mb-2 mt-6">Vista Previa de Datos</h3>
                <div className="rounded-md border max-h-60 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(0, 5).map((row, i) => (
                                <TableRow key={i}>
                                    {headers.map(h => <TableCell key={h}>{String(row[h] ?? '')}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => resetState()}>Cancelar</Button>
                    <Button onClick={handleImport}>Importar Transacciones</Button>
                </DialogFooter>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
