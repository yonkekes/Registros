'use server';

/**
 * @fileOverview Analyzes user spending patterns and provides insights on potential areas for savings.
 *
 * - getSpendingInsights - A function that analyzes spending patterns and provides saving insights.
 * - GetSpendingInsightsInput - The input type for the getSpendingInsights function.
 * - GetSpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSpendingInsightsInputSchema = z.object({
  transactions: z.string().describe('Una cadena JSON de los datos de transacciones del usuario, que incluye monto, fecha, categoría y descripción.'),
});
export type GetSpendingInsightsInput = z.infer<typeof GetSpendingInsightsInputSchema>;

const GetSpendingInsightsOutputSchema = z.object({
  insights: z.string().describe('Información generada por IA sobre áreas potenciales de ahorro basadas en las transacciones del usuario.'),
});
export type GetSpendingInsightsOutput = z.infer<typeof GetSpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: GetSpendingInsightsInput): Promise<GetSpendingInsightsOutput> {
  return getSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSpendingInsightsPrompt',
  input: {schema: GetSpendingInsightsInputSchema},
  output: {schema: GetSpendingInsightsOutputSchema},
  prompt: `Eres un asesor financiero personal. Analiza las transacciones de gastos del usuario y proporciona información sobre áreas potenciales para ahorrar. Responde en español.

  Transacciones:
  {{transactions}}
  `,
});

const getSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'getSpendingInsightsFlow',
    inputSchema: GetSpendingInsightsInputSchema,
    outputSchema: GetSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
