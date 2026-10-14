import { useEffect, useMemo, useState } from 'react'
import { createProduct, deleteProduct, getProducts, updateProduct } from './api'

const emptyForm = { name: '', category: 'Vegetables', description: '', price: '', quantity: '', unit: 'kg', imageUrl: '' }

function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProducts(term = search) {
    setLoading(true)
    try {
      setProducts(await getProducts(term))
      setNotice('')
    } catch {
      setNotice('Cannot connect to the backend. Start Spring Boot and check MySQL settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts('') }, [])

  const totalStock = useMemo(() => products.reduce((sum, p) => sum + Number(p.quantity || 0), 0), [products])
  const setField = event => setForm({ ...form, [event.target.name]: event.target.value })

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setNotice('Product updated successfully.')
      } else {
        await createProduct(payload)
        setNotice('Product added successfully.')
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadProducts()
    } catch (error) {
      setNotice(error.response?.data?.error || 'Could not save product. Check the backend and entered values.')
    }
  }

  function beginEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name || '', category: product.category || 'Vegetables',
      description: product.description || '', price: String(product.price ?? ''),
      quantity: String(product.quantity ?? ''), unit: product.unit || 'kg',
      imageUrl: product.imageUrl || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return
    try {
      await deleteProduct(product.id)
      setNotice('Product deleted.')
      await loadProducts()
    } catch {
      setNotice('Could not delete product. Check the backend connection.')
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="nav"><a className="brand" href="#"><span className="brand-leaf">❧</span>Farm<span>2</span>Fork</a><span className="nav-tag">FRESH • LOCAL • FAIR</span></nav>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">FROM OUR FARMS TO YOUR FORK</p>
            <h1>Good food starts<br /><em>with good roots.</em></h1>
            <p className="hero-description">A direct farmer-to-consumer marketplace for fresh, seasonal produce.</p>
            <a className="primary-link" href="#marketplace">Explore produce <span>↓</span></a>
          </div>
          <div className="produce-art" aria-label="Fresh vegetables illustration" role="img">
            <span className="sun"></span><span className="leaf leaf-one"></span><span className="leaf leaf-two"></span>
            <div className="veggie tomato"></div><div className="veggie orange"></div><div className="veggie carrot"></div><div className="veggie cabbage"></div>
            <div className="basket"><span>FRESH HARVEST</span></div>
          </div>
        </div>
        <div className="hero-bottom"><span>✳ Freshly harvested</span><span>✳ Farmer-first marketplace</span><span>✳ Better food, less distance</span></div>
      </header>

      <main>
        <section className="intro-row">
          <div><p className="eyebrow">THE FARM2FORK PROMISE</p><h2>Fresh choices.<br /><em>Closer connections.</em></h2></div>
          <p className="intro-text">Discover seasonal produce, learn where it comes from, and support the farmers who grow your food. This starter marketplace includes working product create, read, update and delete operations.</p>
        </section>

        <section className="stats">
          <div><span className="stat-icon">♧</span><strong>{products.length}</strong><span>Listed products</span></div>
          <div><span className="stat-icon">▤</span><strong>{totalStock}</strong><span>Units in stock</span></div>
          <div><span className="stat-icon">♡</span><strong>Farm first</strong><span>Always our approach</span></div>
        </section>

        <section className="marketplace" id="marketplace">
          <div className="section-heading"><div><p className="eyebrow">THE MARKETPLACE</p><h2>Today’s <em>fresh picks</em></h2></div><span className="market-note">Grown with care, shared with you.</span></div>

          <div className="manager-grid">
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-title"><span className="form-icon">＋</span><div><h3>{editingId ? 'Edit product' : 'Add a product'}</h3><p>Product management · CRUD</p></div></div>
              <label>Product name<input name="name" value={form.name} onChange={setField} placeholder="e.g. Farm-fresh tomatoes" required /></label>
              <div className="form-two">
                <label>Category<select name="category" value={form.category} onChange={setField}><option>Vegetables</option><option>Fruits</option><option>Leafy Greens</option><option>Grains</option><option>Herbs</option><option>Other</option></select></label>
                <label>Unit<select name="unit" value={form.unit} onChange={setField}><option>kg</option><option>g</option><option>piece</option><option>bunch</option><option>dozen</option><option>litre</option></select></label>
              </div>
              <div className="form-two">
                <label>Price (₹)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={setField} placeholder="35.00" required /></label>
                <label>Quantity<input name="quantity" type="number" min="0" value={form.quantity} onChange={setField} placeholder="20" required /></label>
              </div>
              <label>Description<textarea name="description" value={form.description} onChange={setField} placeholder="Tell customers about this harvest…" rows="3" /></label>
              <label>Image URL <span className="optional">(optional)</span><input name="imageUrl" type="url" value={form.imageUrl} onChange={setField} placeholder="https://…" /></label>
              <div className="form-actions"><button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Add product'} <span>→</span></button>{editingId && <button className="button button-light" type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel</button>}</div>
            </form>

            <div className="product-area">
              <div className="search-row"><div><h3>Market produce</h3><p>Browse what’s available today</p></div><form className="search" onSubmit={e => { e.preventDefault(); loadProducts(search) }}><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search produce…" /><button aria-label="Search">→</button></form></div>
              {notice && <div className={notice.startsWith('Cannot') || notice.startsWith('Could') ? 'notice error' : 'notice'}>{notice}</div>}
              {loading ? <div className="empty-state">Loading the market…</div> : products.length === 0 ? <div className="empty-state"><span>♧</span><h3>The market is waiting for its first harvest.</h3><p>Add a product with the form to see it listed here.</p></div> :
                <div className="product-grid">{products.map((p, i) => <article className="product-card" key={p.id}>
                  <div className={`product-visual visual-${i % 4}`}>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e => { e.currentTarget.style.display = 'none' }} /> : <span>{['🥬', '🍅', '🥕', '🍎'][i % 4]}</span>}<small>{p.category}</small></div>
                  <div className="product-info"><div className="product-name-row"><h4>{p.name}</h4><span className="stock">{p.quantity > 0 ? 'In stock' : 'Sold out'}</span></div><p>{p.description || 'Fresh produce, grown with care.'}</p><div className="price-row"><strong>₹{Number(p.price).toFixed(2)}<small> / {p.unit}</small></strong><span>{p.quantity} {p.unit} available</span></div><div className="card-actions"><button onClick={() => beginEdit(p)} className="edit-btn">Edit</button><button onClick={() => handleDelete(p)} className="delete-btn">Delete</button></div></div>
                </article>)}</div>}
            </div>
          </div>
        </section>

        <section className="how"><p className="eyebrow">HOW IT WORKS</p><h2>A better way to <em>bring food home.</em></h2><div className="steps"><div><span>01</span><h3>Farmers list</h3><p>Farmers add their fresh produce and available quantities.</p></div><div><span>02</span><h3>Consumers explore</h3><p>Customers browse the marketplace and compare products.</p></div><div><span>03</span><h3>Freshness travels</h3><p>Orders connect local harvests with the people who enjoy them.</p></div></div></section>
      </main>
      <footer><a className="brand" href="#">Farm<span>2</span>Fork</a><p>Support farmers. Get fresh. Build a greener future.</p><span>JAVA FULL STACK · REACT · SPRING BOOT · MYSQL</span></footer>
    </div>
  )
}

export default App
