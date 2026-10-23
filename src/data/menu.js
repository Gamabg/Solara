export const MENU = [
  { key: 'novidades', label: 'Novidades', href: '#feminino', columns: [
    { title: 'Recém-chegadas', links: ['Toda a coleção', 'Mais vendidas', 'Exclusivas do site'] },
    { title: 'Por frase', links: ['Hoje eu escolhi leveza', 'Endorfina espiritual', 'Respira. Confia. Recebe.'] },
    { title: 'Por cor', links: ['Preta', 'Areia', 'Off-white'] },
    { title: 'Em destaque', links: ['Editorial da semana', 'Guia de tamanhos'] },
  ]},
  { key: 'feminino', label: 'Feminino', href: '#feminino', columns: [
    { title: 'Camisetas', links: ['Estampadas', 'Lisas', 'Manga longa'] },
    { title: 'Parte de baixo', links: ['Legging', 'Shorts', 'Calça de treino'] },
    { title: 'Casacos', links: ['Moletom', 'Corta-vento'] },
    { title: 'Ver tudo', links: ['Conjuntos', 'Acessórios'] },
  ]},
  { key: 'masculino', label: 'Masculino', href: '#colecoes', columns: [
    { title: 'Camisetas', links: ['Estampadas', 'Lisas'] },
    { title: 'Parte de baixo', links: ['Bermuda', 'Calça de treino'] },
    { title: 'Casacos', links: ['Moletom', 'Corta-vento'] },
    { title: 'Ver tudo', links: ['Acessórios'] },
  ]},
  { key: 'frases', label: 'Frases', href: '#colecoes', columns: [
    { title: 'Movimento', links: ['Hoje eu escolhi leveza', 'Respira. Confia. Recebe.'] },
    { title: 'Espírito', links: ['Endorfina espiritual'] },
    { title: 'Bem-humoradas', links: ['Cancelando boletos ruins'] },
    { title: 'Todas', links: ['Ver todas as frases'] },
  ]},
  { key: 'saldos', label: 'Saldos', href: '#colecoes', columns: [
    { title: 'Ofertas', links: ['Até 30% off', 'Até 50% off', 'Últimas peças'] },
    { title: 'Feminino', links: ['Camisetas em saldo'] },
    { title: 'Masculino', links: ['Camisetas em saldo'] },
    { title: 'Kits', links: ['Kit 2 camisetas'] },
  ]},
]

export function getVisibleMenu({ showProducts, showCategories }) {
  return MENU.filter((item) => {
    if (!showProducts && item.href === '#feminino') return false
    if (!showCategories && item.href === '#colecoes') return false
    return true
  })
}
