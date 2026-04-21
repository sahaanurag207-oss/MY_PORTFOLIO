// Vercel Speed Insights initialization
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights when the page loads
if (typeof window !== 'undefined') {
  injectSpeedInsights({
    debug: false,
    // sampleRate: 1, // Track 100% of events (default)
  });
}
