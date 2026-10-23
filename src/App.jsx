import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import ProductGrid from './components/Products/ProductGrid'
import Categories from './components/Categories/Categories'
import Footer from './components/Footer/Footer'
import CartDrawer from './components/CartDrawer'
import AdminPanel from './components/admin/AdminPanel'
import { PRODUCTS } from './data/products'
import { DEFAULT_STORE_CONTENT } from './data/storeContent'
import { fromDatabaseProduct, isSupabaseConfigured, supabase } from './lib/supabase'

export default function App() {
  const [products, setProducts] = useState(isSupabaseConfigured ? [] : PRODUCTS)
  const [content, setContent] = useState(DEFAULT_STORE_CONTENT)
  const [cart, setCart] = useState([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [storeError, setStoreError] = useState('')
  const [storeLoading, setStoreLoading] = useState(isSupabaseConfigured)
  const [cartError, setCartError] = useState('')

  useEffect(() => {
    if (window.location.pathname === '/admin') return
    if (!isSupabaseConfigured) return

    const loadStore = async () => {
      const [productResult, contentResult] = await Promise.all([
        supabase.from('products').select('*').eq('active', true).order('created_at'),
        supabase.from('store_content').select('value').eq('id', 'home').maybeSingle(),
      ])
      if (productResult.error) throw productResult.error
      if (contentResult.error) throw contentResult.error
      setProducts(productResult.data.map(fromDatabaseProduct))
      if (contentResult.data?.value) {
        setContent({ ...DEFAULT_STORE_CONTENT, ...contentResult.data.value })
      }
    }

    loadStore()
      .catch((error) => setStoreError(`Não foi possível carregar a loja: ${error.message}`))
      .finally(() => setStoreLoading(false))
  }, [])

  useEffect(() => {
    if (window.location.pathname === '/admin') return
    try {
      const savedCart = window.localStorage.getItem('solara-cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        const validCart = Array.isArray(parsedCart) && parsedCart.every((item) =>
          item
          && item.product
          && typeof item.product.id === 'string'
          && typeof item.product.name === 'string'
          && Number.isFinite(item.product.price)
          && Number.isInteger(item.quantity)
          && item.quantity > 0
        )
        if (!validCart) throw new Error('Os dados salvos da sacola estão inválidos.')
        setCart(parsedCart)
      }
    } catch (error) {
      setCartError(`Não foi possível recuperar a sacola: ${error.message}`)
    } finally {
      setCartLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!cartLoaded) return
    try {
      window.localStorage.setItem('solara-cart', JSON.stringify(cart))
    } catch (error) {
      setCartError(`Não foi possível salvar a sacola: ${error.message}`)
    }
  }, [cart, cartLoaded])

  useEffect(() => {
    if (!cartOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cartOpen])

  const visibleProducts = useMemo(() => {
    const term = searchQuery.trim().toLocaleLowerCase('pt-BR')
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.colorLabel, ...(product.lines || [])]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term)
    )
  }, [products, searchQuery])

  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      if (existing) {
        return items.map((item) => item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item)
      }
      return [...items, { product, quantity: 1 }]
    })
  }

  const changeQuantity = (productId, change) => {
    setCart((items) => items
      .map((item) => item.product.id === productId
        ? { ...item, quantity: item.quantity + change }
        : item)
      .filter((item) => item.quantity > 0))
  }

  if (window.location.pathname === '/admin') return <AdminPanel />

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showProducts={content.showProducts}
        showCategories={content.showCategories}
      />
      <main id="conteudo">
        {storeError && <p className="store-status" role="alert">{storeError}</p>}
        {cartError && <p className="store-status" role="alert">{cartError}</p>}
        {content.showHero && <Hero content={content} />}
        {content.showProducts && (
          <ProductGrid
            products={visibleProducts}
            onAdd={addToCart}
            title={content.productTitle}
            note={content.productNote}
            searchQuery={searchQuery}
            loading={storeLoading}
          />
        )}
        {content.showCategories && <Categories content={content} />}
      </main>
      {content.showFooter && <Footer showProducts={content.showProducts} showCategories={content.showCategories} />}
      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onChangeQuantity={changeQuantity}
          onRemove={(productId) => setCart((items) => items.filter((item) => item.product.id !== productId))}
        />
      )}
    </>
  )
}
