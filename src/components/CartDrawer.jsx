import { formatPrice } from '../utils/format'
import Icon from './ui/Icon'
import s from './CartDrawer.module.css'

export default function CartDrawer({ items, onClose, onChangeQuantity, onRemove }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className={s.backdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <aside className={s.drawer} role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className={s.header}>
          <div>
            <p className={s.eyebrow}>SUA SELEÇÃO</p>
            <h2 id="cart-title">Sacola ({items.reduce((sum, item) => sum + item.quantity, 0)})</h2>
          </div>
          <button className={s.close} type="button" aria-label="Fechar sacola" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className={s.empty}>Sua sacola está vazia. Encontre uma peça para chamar de sua.</p>
        ) : (
          <>
            <ul className={s.items}>
              {items.map(({ product, quantity }) => (
                <li className={s.item} key={product.id}>
                  <div className={s.swatch} style={{ background: product.swatch }} aria-hidden="true" />
                  <div className={s.details}>
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>
                    <div className={s.controls}>
                      <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => onChangeQuantity(product.id, -1)}>−</button>
                      <span>{quantity}</span>
                      <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => onChangeQuantity(product.id, 1)}>+</button>
                      <button className={s.remove} type="button" onClick={() => onRemove(product.id)}>Remover</button>
                    </div>
                  </div>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </li>
              ))}
            </ul>
            <div className={s.total}><span>Total</span><strong>{formatPrice(total)}</strong></div>
            <p className={s.note}>O pagamento e o cálculo do frete serão feitos na etapa de finalização.</p>
            <button className={s.checkout} type="button" disabled>Finalização em breve</button>
          </>
        )}
      </aside>
    </div>
  )
}
