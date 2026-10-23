import s from './Hero.module.css'

export default function Hero({ content }) {
  return (
    <section className={`container ${s.hero}`} aria-labelledby="hero-title">
      <div className={s.panel}>
        <svg className={s.scene} viewBox="0 0 1440 600" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6e9cc" />
              <stop offset="1" stopColor="#f1c98a" />
            </linearGradient>
          </defs>
          <rect width="1440" height="600" fill="url(#sky)" />
          <g className={s.sun}>
            <circle cx="1030" cy="300" r="250" fill="#e0a84c" opacity="0.16" />
            <circle cx="1030" cy="300" r="180" fill="#e0a84c" opacity="0.32" />
            <circle cx="1030" cy="300" r="115" fill="#e0a84c" />
          </g>
          <path d="M0 470 C250 400 480 430 720 465 C960 500 1200 420 1440 450 V600 H0Z" fill="#dcbd8a" />
          <path d="M0 520 C300 470 560 520 820 535 C1060 548 1260 500 1440 520 V600 H0Z" fill="#cdab7d" />
          <path d="M0 565 C330 535 640 575 940 570 C1160 566 1320 550 1440 560 V600 H0Z" fill="#a9855a" />
        </svg>

        <div className={s.text}>
          <h1 id="hero-title" className={s.title}>{content.heroTitle}</h1>
          <p className={s.lead}>{content.heroDescription}</p>
          <a className={s.cta} href={content.showProducts ? '#feminino' : content.showCategories ? '#colecoes' : '#conteudo'}>{content.heroCta}</a>
        </div>
      </div>
    </section>
  )
}
