import React from 'react';

export default function Buildings() {
  const [buildings, setBuildings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchBuildings = React.useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/buildings?page=${pageNum}&per_page=${perPage}`);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      setBuildings(Array.isArray(data.buildings) ? data.buildings : []);
      if (data.pagination) {
        setTotalPages(data.pagination.total_pages || 1);
      }
    } catch (e) {
      setError(e.message || 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  React.useEffect(() => {
    fetchBuildings(page);
  }, [page, fetchBuildings]);

  return (
    <div>
      <h2>Buildings</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {buildings.map((b) => (
            <div key={b.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{b.client_name}</div>
              <div style={{ marginBottom: '6px' }}>{[b.address, b.city, b.state, b.zip].filter(Boolean).join(', ')}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>ID: {b.id}</div>
              <hr />
              <div>
                {Object.entries(b)
                  .filter(([k]) => !['id', 'client_name', 'address', 'city', 'state', 'zip'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ color: '#666' }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{String(v || '')}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  );
}


