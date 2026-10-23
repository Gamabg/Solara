import { getVisibleMenu } from '../../data/menu'
import s from './Footer.module.css'

export default function Footer({ showProducts, showCategories }) {
  const menu = getVisibleMenu({ showProducts, showCategories })
  return (
    <footer className={s.footer}>
      <div className="container">
        <strong className={s.brand}>SOLARA</strong>
        <p className={s.tagline}>Energia em movimento.</p>
        <nav className={s.links} aria-label="Rodapé">
          {menu.map((m) => <a key={m.key} href={m.href}>{m.label}</a>)}
        </nav>
        <p className={s.copy}>© {new Date().getFullYear()} Solara. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
