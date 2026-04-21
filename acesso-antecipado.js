export function usuarioESocio(dadosUsuario) {
  const badges = Array.isArray(dadosUsuario?.badges)
    ? dadosUsuario.badges
    : [];

  return badges.includes("socio");
}

export function liberadoParaTodos(update) {
  const agora = new Date();
  const data = new Date(update.liberarParaTodosEm);

  return agora >= data;
}