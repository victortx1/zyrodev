export const TEMPORADA_1 = {
  nome: "Primeira Temporada",
  idBadge: "primeira_temporada",
  inicio: new Date("2026-03-14T00:00:00"),
  duracaoDias: 15
};

export function getDataFimTemporada() {
  const fim = new Date(TEMPORADA_1.inicio);
  fim.setDate(fim.getDate() + TEMPORADA_1.duracaoDias);
  return fim;
}

export function temporadaAtiva() {
  const agora = new Date();
  return agora >= TEMPORADA_1.inicio && agora <= getDataFimTemporada();
}