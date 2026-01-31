import { useEffect, useState } from "react";

/**
 * useFetch(() => api("/path"), [deps])
 */
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetcher();
      setData(res);
      return res;
    } catch (e) {
      setError(e?.message || "Request failed");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
