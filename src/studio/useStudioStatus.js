import { useCallback, useEffect, useState } from 'react';

export function useStudioStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/studio/status');
      if (!response.ok) throw new Error(`status ${response.status}`);
      setStatus(await response.json());
      setError(null);
    } catch (err) {
      setError(err.message || 'status unavailable');
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { status, error, refresh };
}
