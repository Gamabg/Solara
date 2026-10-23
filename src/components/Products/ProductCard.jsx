import { useEffect, useState } from 'react'
import TeeShirt from './TeeShirt'
import { formatPrice } from '../../utils/format'
import s from './ProductCard.module.css'

export default function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(id)
  }, [added])

  const handleAdd = () => { onAdd(product); setAdded(true) }

  return (
    <article className={s.card}>
      <div className={`${s.media} ${s[product.tone]}`}>
        <TeeShirt tone={product.tone} lines={product.lines} />
      </div>
      <div className={s.info}>
        <div>
          <h3 className={s.name}>{product.name}</h3>
          <p className={s.meta}>
            <span className={s.swatch} style={{ background: product.swatch }} aria-hidden="true" />
            {product.colorLabel}
          </p>
        </div>
        <p className={s.price}>{formatPrice(product.price)}</p>
      </div>
      <button className={`${s.add} ${added ? s.added : ''}`} onClick={handleAdd}>
        {added ? 'Adicionada à sacola' : 'Adicionar à sacola'}
      </button>
    </article>
  )
}
