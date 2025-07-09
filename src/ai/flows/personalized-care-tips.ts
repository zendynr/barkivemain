// This file is machine-generated - changes may be lost.

'use server';

/**
 * @fileOverview Provides personalized care tips for pets based on their profile information.
 *
 * - getPersonalizedCareTips - A function that generates personalized care tips for a pet.
 * - PersonalizedCareTipsInput - The input type for the getPersonalizedCareTips function.
 * - PersonalizedCareTipsOutput - The return type for the getPersonalizedCareTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedCareTipsInputSchema = z.object({
  breed: z.string().describe('The breed of the pet.'),
  age: z.number().describe('The age of the pet in years.'),
  weight: z.number().describe('The weight of the pet in kilograms.'),
});
export type PersonalizedCareTipsInput = z.infer<
  typeof PersonalizedCareTipsInputSchema
>;

const PersonalizedCareTipsOutputSchema = z.object({
  careTips: z
    .string()
    .describe('Personalized care tips for the pet, formatted as a paragraph.'),
});
export type PersonalizedCareTipsOutput = z.infer<
  typeof PersonalizedCareTipsOutputSchema
>;

export async function getPersonalizedCareTips(
  input: PersonalizedCareTipsInput
): Promise<PersonalizedCareTipsOutput> {
  return personalizedCareTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCareTipsPrompt',
  input: {schema: PersonalizedCareTipsInputSchema},
  output: {schema: PersonalizedCareTipsOutputSchema},
  prompt: `You are an expert pet care advisor.

  Based on the following information about the pet, provide personalized care tips.

  Breed: {{{breed}}}
  Age: {{{age}}} years
  Weight: {{{weight}}} kg

  Provide care tips related to diet, exercise, grooming, and health.
  Format your response as a paragraph.
`,
});

const personalizedCareTipsFlow = ai.defineFlow(
  {
    name: 'personalizedCareTipsFlow',
    inputSchema: PersonalizedCareTipsInputSchema,
    outputSchema: PersonalizedCareTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
