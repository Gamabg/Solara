import { useEffect, useState } from 'react'
import { DEFAULT_STORE_CONTENT } from '../../data/storeContent'
import { ApiError, isApiConfigured, storeApi } from '../../lib/api'
import { formatPrice } from '../../utils/format'
import s from './AdminPanel.module.css'

const storeUrl = import.meta.env.VITE_STORE_URL || '/'

const EMPTY_PRODUCT = {
  name: '',
  lines: '',
  tone: 'black',
  colorLabel: 'Preta',
  swatch: '#2a2623',
  price: '89.90',
  active: true,
}

function getErrorMessage(error) {
  return error?.message || 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [products, setProducts] = useState([])
  const [content, setContent] = useState(DEFAULT_STORE_CONTENT)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [editingProductId, setEditingProductId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isApiConfigured) {
      setCheckingSession(false)
      return undefined
    }

    let mounted = true
    storeApi.getAdmin()
      .then(({ user: nextUser }) => {
        if (!mounted) return
        setUser(nextUser)
        setAuthorized(true)
      })
      .catch((sessionError) => {
        if (!mounted) return
        if (!(sessionError instanceof ApiError) || sessionError.status !== 401) {
          setError(`Não foi possível recuperar a sessão: ${getErrorMessage(sessionError)}`)
        }
      })
      .finally(() => {
        if (mounted) setCheckingSession(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!authorized) return
    const loadAdminData = async () => {
      const [productResult, contentResult] = await Promise.all([
        storeApi.getAdminProducts(),
        storeApi.getContent(),
      ])
      setProducts(productResult.products)
      setContent({ ...DEFAULT_STORE_CONTENT, ...(contentResult.content || {}) })
    }
    loadAdminData().catch((loadError) => setError(`Não foi possível carregar o painel: ${getErrorMessage(loadError)}`))
  }, [authorized])

  const handleLogin = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { user: nextUser } = await storeApi.login(email, password)
      setUser(nextUser)
      setAuthorized(true)
      setPassword('')
    } catch (loginError) {
      setError(`Não foi possível entrar: ${getErrorMessage(loginError)}`)
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    try {
      await storeApi.logout()
      setUser(null)
      setAuthorized(false)
      setError('')
    } catch (logoutError) {
      setError(`Não foi possível encerrar a sessão: ${getErrorMessage(logoutError)}`)
    }
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const product = {
      name: productForm.name.trim(),
      lines: productForm.lines.split('\n').map((line) => line.trim()).filter(Boolean),
      tone: productForm.tone,
      colorLabel: productForm.colorLabel.trim(),
      swatch: productForm.swatch,
      price: Number(productForm.price),
      active: productForm.active,
    }
    try {
      if (editingProductId) await storeApi.updateProduct(editingProductId, product)
      else await storeApi.createProduct(product)
      setMessage(editingProductId ? 'Produto atualizado.' : 'Produto adicionado.')
      setProductForm(EMPTY_PRODUCT)
      setEditingProductId(null)
      const { products: latestProducts } = await storeApi.getAdminProducts()
      setProducts(latestProducts)
    } catch (saveError) {
      setError(`Não foi possível salvar o produto: ${getErrorMessage(saveError)}`)
    } finally {
      setBusy(false)
    }
  }

  const editProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      lines: product.lines.join('\n'),
      tone: product.tone,
      colorLabel: product.colorLabel,
      swatch: product.swatch,
      price: String(product.price),
      active: product.active,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remover "${product.name}" da loja?`)) return
    setError('')
    setMessage('')
    try {
      await storeApi.deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setMessage('Produto removido.')
      if (editingProductId === product.id) {
        setEditingProductId(null)
        setProductForm(EMPTY_PRODUCT)
      }
    } catch (deleteError) {
      setError(`Não foi possível remover o produto: ${getErrorMessage(deleteError)}`)
    }
  }

  const saveContent = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await storeApi.saveContent(content)
      setMessage('Conteúdo da loja atualizado.')
    } catch (saveError) {
      setError(`Não foi possível salvar o conteúdo: ${getErrorMessage(saveError)}`)
    } finally {
      setBusy(false)
    }
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const profile = { currentPassword }
      if (newEmail.trim()) profile.email = newEmail.trim()
      if (newPassword) profile.newPassword = newPassword
      const { user: updatedUser } = await storeApi.updateProfile(profile)
      setUser(updatedUser)
      setCurrentPassword('')
      setNewEmail('')
      setNewPassword('')
      setMessage('Perfil atualizado.')
    } catch (profileError) {
      setError(`Não foi possível atualizar o perfil: ${getErrorMessage(profileError)}`)
    } finally {
      setBusy(false)
    }
  }

  const updateCategory = (categoryId, field, value) => {
    setContent((current) => ({
      ...current,
      categories: current.categories.map((category) => category.id === categoryId
        ? { ...category, [field]: value }
        : category),
    }))
  }

  if (!isApiConfigured) {
    return (
      <main className={s.page}>
        <section className={s.login}>
          <a className={s.back} href={storeUrl}>← Voltar para a loja</a>
          <p className={s.eyebrow}>SOLARA · ADMINISTRAÇÃO</p>
          <h1>Configure a API da loja</h1>
          <p>Configure VITE_API_URL para apontar para a API hospedada na Vercel. Em desenvolvimento, use o comando vercel dev para executar as funções da API localmente.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={s.page}>
      <div className={s.topbar}>
        <a className={s.brand} href="/">SOLARA <span>ADMIN</span></a>
        {authorized && (
          <div className={s.session}>
            <span>{user?.email}</span>
            <button type="button" className={s.secondaryButton} onClick={handleLogout}>Sair</button>
          </div>
        )}
      </div>

      {checkingSession ? (
        <p className={s.notice} role="status">Verificando acesso…</p>
      ) : !authorized ? (
        <section className={s.login}>
          <p className={s.eyebrow}>ACESSO RESTRITO</p>
          <h1>Entrar no painel</h1>
          <p>Use a conta administradora configurada para a API Solara.</p>
          <form className={s.form} onSubmit={handleLogin}>
            <label>E-mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className={s.primaryButton} type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
          </form>
        </section>
      ) : (
        <div className={s.dashboard}>
          <header className={s.heading}>
            <p className={s.eyebrow}>GERENCIAMENTO DA LOJA</p>
            <h1>Olá, administrador</h1>
            <p>Edite produtos, textos e áreas visíveis da vitrine.</p>
          </header>

          {error && <p className={s.error} role="alert">{error}</p>}
          {message && <p className={s.success} role="status">{message}</p>}

          <section className={s.panel}>
            <h2>{editingProductId ? 'Editar produto' : 'Adicionar produto'}</h2>
            <form className={s.form} onSubmit={saveProduct}>
              <label>Nome<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
              <label>Frase impressa (uma linha por vez)<textarea rows="3" value={productForm.lines} onChange={(event) => setProductForm({ ...productForm, lines: event.target.value })} required /></label>
              <div className={s.formRow}>
                <label>Cor da camiseta
                  <select value={productForm.tone} onChange={(event) => setProductForm({ ...productForm, tone: event.target.value })}>
                    <option value="black">Preta</option><option value="sand">Areia</option><option value="offwhite">Off-white</option>
                  </select>
                </label>
                <label>Nome da cor<input value={productForm.colorLabel} onChange={(event) => setProductForm({ ...productForm, colorLabel: event.target.value })} required /></label>
              </div>
              <div className={s.formRow}>
                <label>Preço (R$)<input type="number" min="0.01" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
                <label>Cor da amostra<input type="color" value={productForm.swatch} onChange={(event) => setProductForm({ ...productForm, swatch: event.target.value })} /></label>
              </div>
              <label className={s.checkbox}><input type="checkbox" checked={productForm.active} onChange={(event) => setProductForm({ ...productForm, active: event.target.checked })} /> Exibir produto na loja</label>
              <div className={s.actions}>
                <button className={s.primaryButton} type="submit" disabled={busy}>{busy ? 'Salvando…' : editingProductId ? 'Salvar alterações' : 'Adicionar produto'}</button>
                {editingProductId && <button className={s.secondaryButton} type="button" onClick={() => { setEditingProductId(null); setProductForm(EMPTY_PRODUCT) }}>Cancelar</button>}
              </div>
            </form>
          </section>

          <section className={s.panel}>
            <h2>Produtos cadastrados</h2>
            {products.length === 0 ? <p>Nenhum produto cadastrado.</p> : (
              <ul className={s.productList}>
                {products.map((product) => (
                  <li key={product.id}>
                    <div><strong>{product.name}</strong><span>{formatPrice(product.price)} · {product.active ? 'Visível' : 'Oculto'}</span></div>
                    <div className={s.actions}>
                      <button className={s.secondaryButton} type="button" onClick={() => editProduct(product)}>Editar</button>
                      <button className={s.dangerButton} type="button" onClick={() => deleteProduct(product)}>Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={s.panel}>
            <h2>Conteúdo e áreas da loja</h2>
            <form className={s.form} onSubmit={saveContent}>
              <label>Título principal<input value={content.heroTitle} onChange={(event) => setContent({ ...content, heroTitle: event.target.value })} /></label>
              <label>Texto principal<textarea rows="3" value={content.heroDescription} onChange={(event) => setContent({ ...content, heroDescription: event.target.value })} /></label>
              <label>Texto do botão principal<input value={content.heroCta} onChange={(event) => setContent({ ...content, heroCta: event.target.value })} /></label>
              <label>Título da seção de produtos<input value={content.productTitle} onChange={(event) => setContent({ ...content, productTitle: event.target.value })} /></label>
              <label>Texto auxiliar dos produtos<input value={content.productNote} onChange={(event) => setContent({ ...content, productNote: event.target.value })} /></label>
              <label>Título das categorias<input value={content.categoriesTitle} onChange={(event) => setContent({ ...content, categoriesTitle: event.target.value })} /></label>
              <label>Texto auxiliar das categorias<input value={content.categoriesNote} onChange={(event) => setContent({ ...content, categoriesNote: event.target.value })} /></label>
              <fieldset className={s.fieldset}>
                <legend>Categorias</legend>
                {content.categories.map((category) => (
                  <div className={s.categoryFields} key={category.id}>
                    <label>Nome<input value={category.title} onChange={(event) => updateCategory(category.id, 'title', event.target.value)} /></label>
                    <label>Descrição<input value={category.description} onChange={(event) => updateCategory(category.id, 'description', event.target.value)} /></label>
                    <button className={s.dangerButton} type="button" onClick={() => setContent({ ...content, categories: content.categories.filter((item) => item.id !== category.id) })}>Remover categoria</button>
                  </div>
                ))}
                <button className={s.secondaryButton} type="button" onClick={() => setContent({
                  ...content,
                  categories: [...content.categories, { id: window.crypto.randomUUID(), title: 'Nova categoria', description: '', href: '#feminino', tone: 'sand' }],
                })}>Adicionar categoria</button>
              </fieldset>
              <fieldset className={s.visibility}>
                <legend>Áreas visíveis</legend>
                {[
                  ['showHero', 'Destaque principal'],
                  ['showProducts', 'Produtos'],
                  ['showCategories', 'Categorias'],
                  ['showFooter', 'Rodapé'],
                ].map(([key, label]) => (
                  <label className={s.checkbox} key={key}>
                    <input type="checkbox" checked={Boolean(content[key])} onChange={(event) => setContent({ ...content, [key]: event.target.checked })} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <button className={s.primaryButton} type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar conteúdo'}</button>
            </form>
          </section>

          <section className={s.panel}>
            <h2>Perfil do administrador</h2>
            <p>Altere o e-mail ou a senha da sua conta. Confirme a senha atual para salvar.</p>
            <form className={s.form} onSubmit={saveProfile}>
              <label>Novo e-mail
                <input type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
              </label>
              <label>Nova senha
                <input type="password" autoComplete="new-password" minLength="12" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </label>
              <label>Senha atual
                <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
              </label>
              <button className={s.primaryButton} type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Atualizar perfil'}</button>
            </form>
          </section>
        </div>
      )}

      {!checkingSession && error && !authorized && <p className={s.error} role="alert">{error}</p>}
      <a className={s.back} href={storeUrl}>← Voltar para a loja</a>
    </main>
  )
}
