import { useState, useEffect } from 'react'

const API_URL = '/api'

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`)
      if (!response.ok) throw new Error('Nepodarilo se nacist objednavky')
      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const createOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepodarilo se vytvorit objednavku')
      }
      
      await fetchOrders()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    if (status.includes('pripravuje')) return 'status-preparing'
    if (status.includes('Rozvazi')) return 'status-delivering'
    if (status.includes('Doruceno')) return 'status-delivered'
    return 'status-request'
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('cs-CZ')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🍕 Restaurant Robin&Sam</h1>
        <p>System spravy objednavek a sledovani doruceni</p>
      </div>

      <div className="controls">
        <div className="status-badge status-info">
          Celkem objednavek: {orders.length}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={createOrder}
          disabled={loading}
        >
          {loading ? '⏳ Vytvareni...' : ' Nova objednavka'}
        </button>
      </div>

      {error && (
        <div className="error">
          ❌ Chyba: {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2> Zadne objednavky</h2>
          <p>Kliknete na "Nova objednavka" pro vytvoreni prvni objednavky</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">{order.id}</span>
              </div>
              
              <div className={`order-status ${getStatusClass(order.status)}`}>
                {order.status === 'Zadost o objednavku' && '📝'}
                {order.status === 'Restaurace pripravuje' && '👨‍🍳'}
                {order.status === 'Rozvazi se' && '🚚'}
                {order.status === 'Doruceno' && '✅'}
                {' '}
                {order.status}
              </div>

              <div className="order-time">
                Vytvoreno: {formatTime(order.createdAt)}
              </div>

              {order.history && order.history.length > 0 && (
                <div className="order-history">
                  <h4>Historie</h4>
                  <ul className="history-list">
                    {order.history.map((item, idx) => (
                  <li key={idx} className="history-item">
                    <span className="history-status">{item.status}</span>
                    <span className="history-time">{formatTime(item.timestamp)}</span>
                  </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App

