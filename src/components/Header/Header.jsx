import { useEffect, useState } from 'react'
import { MENU, getVisibleMenu } from '../../data/menu'
import Icon from '../ui/Icon'
import s from './Header.module.css'

export default function Header({ cartCount, onCartOpen, searchQuery, onSearchChange, showProducts, showCategories }) {
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeKey, setActiveKey] = useState(MENU[0].key)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const showMenu = (key) => { setActiveKey(key); setMegaOpen(true) }
  const hideMenu = () => setMegaOpen(false)
  const closeSearch = () => { setSearchOpen(false); onSearchChange('') }
  const visibleMenu = getVisibleMenu({ showProducts, showCategories })
  const active = MENU.find((m) => m.key === activeKey) || MENU[0]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setMegaOpen(false); setMobileOpen(false); closeSearch() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={s.header}>
      <div
        className={`${s.shell} ${megaOpen ? s.open : ''}`}
        onMouseLeave={hideMenu}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) hideMenu() }}
      >
        <div className={s.bar}>
          <a className={s.logo} href="#">
            SOLARA <span className={s.dot} aria-hidden="true" />
          </a>

          <nav className={s.links} aria-label="Principal">
            {visibleMenu.map((m) => (
              <a
                key={m.key}
                href={m.href}
                className={`${s.link} ${megaOpen && activeKey === m.key ? s.linkActive : ''}`}
                onMouseEnter={() => showMenu(m.key)}
                onFocus={() => showMenu(m.key)}
              >
                {m.label}
              </a>
            ))}
          </nav>

          <div className={s.actions}>
            <button
              className={s.iconBtn}
              aria-label={searchOpen ? 'Fechar busca' : 'Buscar produtos'}
              aria-expanded={searchOpen}
              onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
            >
              <Icon name="search" />
            </button>
            <a className={s.iconBtn} href="/admin" aria-label="Acessar área administrativa">
              <Icon name="user" />
            </a>
            <button
              className={s.iconBtn}
              aria-label={`Abrir sacola, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
              onClick={onCartOpen}
            >
              <Icon name="bag" />
              {cartCount > 0 && <span className={s.badge}>{cartCount}</span>}
            </button>
            <button
              className={`${s.iconBtn} ${s.menuBtn}`}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className={s.search} role="search" onSubmit={(event) => {
            event.preventDefault()
            document.getElementById('feminino')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            <Icon name="search" />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar camisetas e frases"
              aria-label="Buscar produtos"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')}>Limpar</button>
            )}
          </form>
        )}

        {/* Mega menu (desktop) */}
        <div className={s.mega} aria-hidden={!megaOpen}>
          <div className={s.clip}>
            <div className={s.megaInner}>
              {active.columns.map((col) => (
                <div key={col.title}>
                  <h4 className={s.colTitle}>{col.title}</h4>
                  {col.links.map((l) => (
                    <a key={l} href="#colecoes" className={s.colLink}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div id="menu-mobile" className={`${s.mobile} ${mobileOpen ? s.mobileOpen : ''}`}>
          <div className={s.clip}>
            <div className={s.mobileInner}>
              {visibleMenu.map((m) => (
                <details key={m.key} className={s.acc}>
                  <summary>{m.label}</summary>
                  {m.columns.map((col) => (
                    <div key={col.title} className={s.accGroup}>
                      <p>{col.title}</p>
                      {col.links.map((l) => (
                        <a key={l} href={m.href} onClick={() => setMobileOpen(false)}>{l}</a>
                      ))}
                    </div>
                  ))}
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
