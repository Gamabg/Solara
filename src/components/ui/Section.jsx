import s from './Section.module.css'

export default function Section({ id, title, note, children }) {
  return (
    <section id={id} className={`container ${s.section}`} aria-labelledby={`${id}-title`}>
      <div className={s.head}>
        <h2 id={`${id}-title`} className={s.title}>{title}</h2>
        {note && <p className={s.note}>{note}</p>}
      </div>
      {children}
    </section>
  )
}
