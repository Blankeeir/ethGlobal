// hooks/useSubmission.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SubmissionState {
  isLoading: boolean;
  error: string | null;
  response: Record<string, unknown> | null;
  submit: (data: unknown) => Promise<void>;
  clearError: () => void;
  clearAll: () => void;
}

// hooks/useSubmission.ts

// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';

interface SubmissionState {
  isLoading: boolean;
  error: string | null;
  response: Record<string, unknown> | null;
  submit: (data: unknown) => Promise<void>;
  clearError: () => void;
  clearAll: () => void;
  setIsLoading: (isLoading: boolean) => void; // Added method
}

export const useSubmission = create<SubmissionState>()(
  devtools((set) => ({
    isLoading: false,
    error: null,
    response: null,

    submit: async (data) => {
      try {
        set({ isLoading: true, error: null });
        
        // TODO: Replace with your actual submission logic
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        const result = await response.json();
        set({ response: result });
      } catch (error: unknown) {
        set({ error: (error instanceof Error) ? error.message : String(error) });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
    
    clearAll: () => set({
      isLoading: false,
      error: null,
      response: null
    }),

    setIsLoading: (isLoading: boolean) => set({ isLoading }), // Implemented method
  }), { name: 'submission-store' })
);