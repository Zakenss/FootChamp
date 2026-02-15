import { z } from 'zod';
import { insertLeadToulouseSchema, insertLeadMarrakechSchema, leadsToulouse, leadsMarrakech } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  leads: {
    createToulouse: {
      method: 'POST' as const,
      path: '/api/leads/toulouse',
      input: insertLeadToulouseSchema,
      responses: {
        201: z.custom<typeof leadsToulouse.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    createMarrakech: {
      method: 'POST' as const,
      path: '/api/leads/marrakech',
      input: insertLeadMarrakechSchema,
      responses: {
        201: z.custom<typeof leadsMarrakech.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreateLeadToulouseInput = z.infer<typeof api.leads.createToulouse.input>;
export type CreateLeadMarrakechInput = z.infer<typeof api.leads.createMarrakech.input>;
