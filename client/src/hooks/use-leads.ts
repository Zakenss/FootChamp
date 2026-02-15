import { useMutation } from "@tanstack/react-query";
import { api, type CreateLeadToulouseInput, type CreateLeadMarrakechInput } from "@shared/routes";

export function useCreateLead(city: string) {
  return useMutation({
    mutationFn: async (data: CreateLeadToulouseInput | CreateLeadMarrakechInput) => {
      const isToulouse = city.toLowerCase() === "toulouse";
      const endpoint = isToulouse 
        ? api.leads.createToulouse 
        : api.leads.createMarrakech;
        
      const validated = endpoint.input.parse(data);
      const res = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = endpoint.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Une erreur est survenue lors de l\'envoi du formulaire.');
      }
      
      return endpoint.responses[201].parse(await res.json());
    },
  });
}
