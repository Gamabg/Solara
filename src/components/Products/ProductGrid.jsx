import Section from '../ui/Section'
import ProductCard from './ProductCard'
import s from './ProductGrid.module.css'

export default function ProductGrid({ products, onAdd, title, note, searchQuery, loading }) {
  return (
    <Section id="feminino" title={title} note={note}>
      {loading ? (
        <p role="status">Carregando produtos…</p>
      ) : products.length ? (
        <div className={s.grid}>
          {products.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
        </div>
      ) : (
        <p role="status">{searchQuery ? 'Nenhum produto encontrado para essa busca.' : 'Nenhum produto disponível no momento.'}</p>
      )}
    </Section>
  )
}
