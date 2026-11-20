const PRODUCTS = Object.freeze({
  vip_nova_era: {
    nome: 'VIP Nova Era',
    valor: 5.50,
    tipo: 'vip_nova_era'
  },
  moldura_fogo: {
    nome: 'Moldura Fogo',
    valor: 2.50,
    tipo: 'moldura',
    molduraId: 'moldura_fogo'
  },
  moldura_neon: {
    nome: 'Moldura Neon',
    valor: 3.50,
    tipo: 'moldura',
    molduraId: 'moldura_neon'
  },
  moldura_diamante: {
    nome: 'Moldura Diamante',
    valor: 4.50,
    tipo: 'moldura',
    molduraId: 'moldura_diamante'
  },
  moldura_nova_era: {
    nome: 'Moldura Nova Era',
    valor: 5.00,
    tipo: 'moldura',
    molduraId: 'moldura_nova_era'
  }
});

function getProduct(produtoId) {
  return PRODUCTS[String(produtoId || '')] || null;
}

module.exports = { PRODUCTS, getProduct };
