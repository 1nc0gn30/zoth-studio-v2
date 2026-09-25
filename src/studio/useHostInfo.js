import { useCallback, useEffect, useState } from 'react';

export function useHostInfo() {
  const [hostInfo, setHostInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/studio/host');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setHostInfo(data);
    } catch {
      setHostInfo({
        isZothOS: false,
        distro: 'ZothOS (Offline / Browser Preview)',
        kernel: 'Unavailable (Browser Sandbox)',
        arch: 'x86_64',
        hostname: 'browser-host',
        cpus: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
        cpuModel: 'Host Architecture Processor',
        totalMem: 8192,
        freeMem: 4096,
        uptime: 0,
        audioDevice: 'Emulated WebAudio Engine',
        installedTools: {},
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const launchTool = useCallback(async (tool) => {
    setLaunching(tool);
    try {
      const res = await fetch('/api/studio/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool }),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLaunching(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { hostInfo, loading, launching, refresh, launchTool };
}
