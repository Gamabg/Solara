import s from './TeeShirt.module.css'

const TONES = {
  black: { fill: '#2a2623', shade: '#14110e', ink: '#f3ead9' },
  sand: { fill: '#d8b987', shade: '#b99660', ink: '#2a2622' },
  offwhite: { fill: '#f4efe4', shade: '#ddd4c1', ink: '#2a2622' },
}

const SHAPE = 'M70 22 L40 34 L14 64 L36 84 L52 72 L52 182 L148 182 L148 72 L164 84 L186 64 L160 34 L130 22 C124 36 112 42 100 42 C88 42 76 36 70 22Z'
const NECK = 'M70 22 C76 36 88 42 100 42 C112 42 124 36 130 22 C122 29 112 31 100 31 C88 31 78 29 70 22Z'

export default function TeeShirt({ tone, lines }) {
  const t = TONES[tone]
  return (
    <div className={s.tee} style={{ '--print': t.ink }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <path d={SHAPE} fill={t.fill} />
        <path d={NECK} fill={t.shade} />
      </svg>
      <p className={s.print} aria-hidden="true">
        {lines.map((line, index) => <span key={`${index}-${line}`}>{line}</span>)}
      </p>
    </div>
  )
}
