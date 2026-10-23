import Section from '../ui/Section'
import s from './Categories.module.css'

export default function Categories({ content }) {
  return (
    <Section id="colecoes" title={content.categoriesTitle} note={content.categoriesNote}>
      <div className={s.grid}>
        {content.categories.map((c) => (
          <a key={c.id} href={content.showProducts || c.href !== '#feminino' ? c.href : '#colecoes'} className={`${s.card} ${s[c.tone]}`}>
            <h3 className={s.title}>{c.title}</h3>
            <p className={s.desc}>{c.description}</p>
          </a>
        ))}
      </div>
    </Section>
  )
}
