// utils/analytics.ts
export const analytics = {
    identify: (userId: string, traits?: Record<string, unknown>) => {
      try {
        // Implement your analytics tracking here
        console.log('Analytics identify:', { userId, traits });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    },
    
    track: (event: string, properties?: Record<string, unknown>) => {
      try {
        console.log('Analytics track:', { event, properties });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    }
  };