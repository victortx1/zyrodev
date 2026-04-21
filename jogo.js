import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const gameContainer = document.getElementById("gameContainer");
const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const totalCoinsEl = document.getElementById("totalCoins");
const finalScoreEl = document.getElementById("finalScore");
const finalCoinsEl = document.getElementById("finalCoins");
const biomeNameEl = document.getElementById("biomeName");

const introScreen = document.getElementById("introScreen");
const enterGameBtn = document.getElementById("enterGameBtn");

const gameOverScreen = document.getElementById("gameOverScreen");
const restartBtn = document.getElementById("restartBtn");
const jumpBtn = document.getElementById("jumpBtn");

/* MENU / CONFIG */
const menuToggle = document.getElementById("menuToggle");
const gameMenu = document.getElementById("gameMenu");
const settingsPanel = document.getElementById("settingsPanel");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const pauseGameBtn = document.getElementById("pauseGameBtn");
const exitGameBtn = document.getElementById("exitGameBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");

const STORAGE_COINS_KEY = "zyro_total_coins";
const STORAGE_EQUIPPED_SKIN = "zyro_equipped_skin";
const STORAGE_SOUND_ENABLED = "zyro_sound_enabled";
const STORAGE_MUSIC_ENABLED = "zyro_music_enabled";
const STORAGE_VOLUME = "zyro_volume";

const PLAYER_SKINS = {
  rumagua: "./fotosloja/rumaguaatualizado.png",
  rumanalck: "./fotosloja/rumanalck-Photoroom.png",
  rumfogo: "./fotosloja/rumfogo-Photoroom.png",
  rumgelo: "./fotosloja/rumgelo-Photoroom.png",
  rumprincipe: "./fotosloja/rumprincipe-Photoroom.png",
  rumguardiao: "./fotosloja/rumguardiao-Photoroom.png",
  ruminterestelar: "./fotosloja/ruminterestelar-Photoroom.png",
  rumhack: "./fotosloja/rumhack-Photoroom.png",
  rumflash: "./fotosloja/rumflash-Photoroom.png",
  rumruby: "./fotosloja/rumruby-Photoroom.png",
  rumperolanegra: "./fotosloja/rumperolanegra-Photoroom.png"
};

let currentUser = null;
let userBadges = [];
let vipBonusCoins = 0;
let vipName = "Nenhum";

let gameRunning = false;
let gamePaused = false;
let isJumping = false;
let velocityY = 0;
let gravity = 0.64;
let jumpStrength = 16.5;
let playerY = 0;

let score = 0;
let coins = 0;
let totalCoins = 0;

let gameSpeed = 6;
let animationId = null;
let obstacleTimer = 0;
let coinTimer = 0;

const groundHeight = 90;

/* AUDIO */
let soundEnabled = localStorage.getItem(STORAGE_SOUND_ENABLED);
soundEnabled = soundEnabled === null ? true : soundEnabled === "true";

let musicEnabled = localStorage.getItem(STORAGE_MUSIC_ENABLED);
musicEnabled = musicEnabled === null ? true : musicEnabled === "true";

let masterVolume = Number(localStorage.getItem(STORAGE_VOLUME));
if (Number.isNaN(masterVolume)) masterVolume = 0.6;

const audio = {
  jump: new Audio("./sons/pulozyro.mp3"),
  coin: new Audio("./sons/moedaszyro.mp3"),
  hit: new Audio("./sons/gameroverzyro.mp3"),
  bg: new Audio("./sons/musicadefundo.mp3")
};

audio.bg.loop = true;

const biomes = [
  {
    id: "forest",
    className: "biome-forest",
    name: "Floresta",
    minScore: 0,
    maxScore: 499
  },
  {
    id: "neon",
    className: "biome-neon",
    name: "Neon Tech",
    minScore: 500,
    maxScore: 999
  },
  {
    id: "northeast",
    className: "biome-northeast",
    name: "Nordeste",
    minScore: 1000,
    maxScore: Infinity
  }
];

let currentBiome = "forest";

if (totalCoinsEl) totalCoinsEl.textContent = totalCoins;
if (biomeNameEl) biomeNameEl.textContent = "Floresta";

applyAudioSettings();
updateAudioUI();

function aplicarSkinEquipada() {
  const equippedSkin = localStorage.getItem(STORAGE_EQUIPPED_SKIN);

  if (equippedSkin && PLAYER_SKINS[equippedSkin]) {
    player.style.backgroundImage = `url('${PLAYER_SKINS[equippedSkin]}')`;
  } else {
    player.style.backgroundImage = `url('./fotosloja/rumaguaatualizado.png')`;
  }
}

function calcularBonusVIP(badges = []) {
  userBadges = Array.isArray(badges) ? badges : [];
  vipBonusCoins = 0;
  vipName = "Nenhum";

  if (userBadges.includes("vip_black")) {
    vipBonusCoins = 5;
    vipName = "VIP Black";
    return;
  }

  if (userBadges.includes("vip_ouro")) {
    vipBonusCoins = 3;
    vipName = "VIP Ouro";
    return;
  }

  if (
    userBadges.includes("vip") ||
    userBadges.includes("vip zyrorum") ||
    userBadges.includes("vip_zyrorum")
  ) {
    vipBonusCoins = 2;
    vipName = "VIP ZYRORUM";
    return;
  }

  if (userBadges.includes("socio")) {
    vipBonusCoins = 2;
    vipName = "Sócio";
  }
}

function applyAudioSettings() {
  audio.jump.volume = Math.min(masterVolume, 1);
  audio.coin.volume = Math.min(masterVolume, 1);
  audio.hit.volume = Math.min(masterVolume, 1);
  audio.bg.volume = Math.min(masterVolume * 0.45, 1);

  localStorage.setItem(STORAGE_SOUND_ENABLED, String(soundEnabled));
  localStorage.setItem(STORAGE_MUSIC_ENABLED, String(musicEnabled));
  localStorage.setItem(STORAGE_VOLUME, String(masterVolume));
}

function updateAudioUI() {
  if (soundToggleBtn) {
    soundToggleBtn.textContent = soundEnabled ? "Efeitos: Ligado" : "Efeitos: Desligado";
    soundToggleBtn.classList.toggle("active", soundEnabled);
  }

  if (musicToggleBtn) {
    musicToggleBtn.textContent = musicEnabled ? "Música: Ligada" : "Música: Desligada";
    musicToggleBtn.classList.toggle("active", musicEnabled);
  }

  if (volumeSlider) {
    volumeSlider.value = Math.round(masterVolume * 100);
  }

  if (volumeValue) {
    volumeValue.textContent = `${Math.round(masterVolume * 100)}%`;
  }

  if (pauseGameBtn) {
    pauseGameBtn.textContent = gamePaused ? "Continuar jogo" : "Pausar jogo";
  }
}

function playSfx(name) {
  if (!soundEnabled || !audio[name]) return;

  try {
    audio[name].currentTime = 0;
    audio[name].play().catch(() => {});
  } catch (error) {}
}

function startMusic() {
  if (!musicEnabled) return;
  audio.bg.play().catch(() => {});
}

function stopMusic() {
  audio.bg.pause();
}

function syncMusicState() {
  if (musicEnabled && !gamePaused && (gameRunning || (introScreen && !introScreen.classList.contains("hidden")))) {
    startMusic();
  } else {
    stopMusic();
  }
}

async function carregarDadosDoJogador(uid) {
  try {
    const userRef = doc(db, "usuarios", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      calcularBonusVIP(data.badges);

      totalCoins = Number(data.totalCoins || 0);
      localStorage.setItem(STORAGE_COINS_KEY, String(totalCoins));

      if (data.equippedSkin) {
        localStorage.setItem(STORAGE_EQUIPPED_SKIN, data.equippedSkin);
      }

      if (typeof data.soundEnabled === "boolean") {
        soundEnabled = data.soundEnabled;
        localStorage.setItem(STORAGE_SOUND_ENABLED, String(soundEnabled));
      }

      if (typeof data.musicEnabled === "boolean") {
        musicEnabled = data.musicEnabled;
        localStorage.setItem(STORAGE_MUSIC_ENABLED, String(musicEnabled));
      }

      if (typeof data.volume === "number") {
        masterVolume = data.volume;
        localStorage.setItem(STORAGE_VOLUME, String(masterVolume));
      }

      console.log(`VIP ativo: ${vipName} | Bônus por moeda: +${vipBonusCoins}`);
    } else {
      await setDoc(userRef, {
        totalCoins: 0,
        equippedSkin: localStorage.getItem(STORAGE_EQUIPPED_SKIN) || "rumagua",
        soundEnabled: soundEnabled,
        musicEnabled: musicEnabled,
        volume: masterVolume,
        badges: []
      });

      totalCoins = 0;
      userBadges = [];
      vipBonusCoins = 0;
      vipName = "Nenhum";
      localStorage.setItem(STORAGE_COINS_KEY, "0");
    }

    aplicarSkinEquipada();
    applyAudioSettings();
    updateAudioUI();
    updateHUD();
  } catch (error) {
    console.error("Erro ao carregar dados do jogador:", error);
  }
}

async function salvarConfiguracoesFirebase() {
  if (!currentUser) return;

  try {
    const userRef = doc(db, "usuarios", currentUser.uid);
    await updateDoc(userRef, {
      equippedSkin: localStorage.getItem(STORAGE_EQUIPPED_SKIN) || "rumagua",
      soundEnabled: soundEnabled,
      musicEnabled: musicEnabled,
      volume: masterVolume
    });
  } catch (error) {
    console.error("Erro ao salvar configurações no Firebase:", error);
  }
}

async function salvarMoedasFirebase() {
  if (!currentUser) return;

  try {
    const userRef = doc(db, "usuarios", currentUser.uid);
    await updateDoc(userRef, {
      totalCoins: totalCoins
    });
  } catch (error) {
    console.error("Erro ao salvar moedas no Firebase:", error);
  }
}

async function startGame() {
  if (currentUser) {
    await carregarDadosDoJogador(currentUser.uid);
  }

  limparObjetos();
  resetState();
  aplicarSkinEquipada();

  if (introScreen) introScreen.classList.add("hidden");
  if (gameOverScreen) gameOverScreen.classList.add("hidden");

  gameRunning = true;
  gamePaused = false;
  player.classList.add("run");

  closeMenu();
  closeSettings();
  syncMusicState();
  updateAudioUI();
  loop();
}

function resetState() {
  score = 0;
  coins = 0;
  gameSpeed = 6;
  obstacleTimer = 0;
  coinTimer = 0;
  playerY = 0;
  velocityY = 0;
  isJumping = false;
  currentBiome = "forest";

  player.style.bottom = `${groundHeight}px`;
  setBiome("forest");
  updateHUD();
}

function updateHUD() {
  if (scoreEl) scoreEl.textContent = Math.floor(score);
  if (coinsEl) coinsEl.textContent = coins;
  if (totalCoinsEl) totalCoinsEl.textContent = totalCoins;
}

function jump() {
  if (!gameRunning) return;
  if (gamePaused) return;
  if (isJumping) return;

  isJumping = true;
  velocityY = jumpStrength;

  playSfx("jump");

  player.classList.add("jump");
  setTimeout(() => {
    player.classList.remove("jump");
  }, 450);
}

function getBiomeByScore(currentScore) {
  return (
    biomes.find(
      (biome) => currentScore >= biome.minScore && currentScore <= biome.maxScore
    ) || biomes[0]
  );
}

function setBiome(biomeId) {
  currentBiome = biomeId;

  gameContainer.classList.remove("biome-forest", "biome-neon", "biome-northeast");

  const biome = biomes.find((item) => item.id === biomeId);
  if (!biome) return;

  gameContainer.classList.add(biome.className);
  if (biomeNameEl) biomeNameEl.textContent = biome.name;
}

function updateBiome() {
  const biome = getBiomeByScore(Math.floor(score));
  if (biome.id !== currentBiome) {
    setBiome(biome.id);
  }
}

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  let width = 70;
  let height = 90;
  let image = "";
  let hitboxScaleX = 0.70;
  let hitboxScaleY = 0.70;
  let hitboxOffsetY = 0;
  let bottomOffset = 0;

  if (currentBiome === "forest") {
    if (Math.random() > 0.5) {
      width = 180;
      height = 190;
      image = "./fotos/pedrafloresta.png";
      hitboxScaleX = 0.52;
      hitboxScaleY = 0.58;
      bottomOffset = -15;
    } else {
      width = 180;
      height = 190;
      image = "./fotos/arvore2.0.png";
      hitboxScaleX = 0.62;
      hitboxScaleY = 0.62;
      bottomOffset = -28;
    }
  }

  if (currentBiome === "neon") {
    if (Math.random() > 0.5) {
      width = 150;
      height = 160;
      image = "./fotos/monster.png";
      hitboxScaleX = 0.60;
      hitboxScaleY = 0.68;
      bottomOffset = -20;
    } else {
      width = 150;
      height = 160;
      image = "./fotos/monster2.png";
      hitboxScaleX = 0.60;
      hitboxScaleY = 0.68;
    }
  }

  if (currentBiome === "northeast") {
    if (Math.random() > 0.5) {
      width = 190;
      height = 200;
      image = "./fotos/camelo.png";
      hitboxScaleX = 0.58;
      hitboxScaleY = 0.74;
      bottomOffset = -20;
    } else {
      width = 190;
      height = 200;
      image = "./fotos/criper.png";
      hitboxScaleX = 0.70;
      hitboxScaleY = 0.55;
      bottomOffset = -29;
    }
  }

  obstacle.dataset.width = width;
  obstacle.dataset.height = height;
  obstacle.dataset.hitboxScaleX = hitboxScaleX;
  obstacle.dataset.hitboxScaleY = hitboxScaleY;
  obstacle.dataset.hitboxOffsetY = hitboxOffsetY;

  obstacle.style.width = `${width}px`;
  obstacle.style.height = `${height}px`;
  obstacle.style.left = `${gameContainer.offsetWidth + 60}px`;
  obstacle.style.bottom = `${groundHeight + bottomOffset}px`;
  obstacle.style.backgroundImage = `url('${image}')`;
  obstacle.style.backgroundSize = "contain";
  obstacle.style.backgroundRepeat = "no-repeat";
  obstacle.style.backgroundPosition = "center bottom";
  obstacle.style.border = "none";
  obstacle.style.boxShadow = "none";
  obstacle.style.borderRadius = "0";
  obstacle.style.backgroundColor = "transparent";
  obstacle.style.pointerEvents = "none";

  gameContainer.appendChild(obstacle);
}

function createCoin() {
  const coin = document.createElement("div");
  coin.classList.add("coin");

  const size = 34;
  const minY = groundHeight + 55;
  const maxY = groundHeight + 175;
  const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  coin.dataset.width = size;
  coin.dataset.height = size;
  coin.dataset.hitboxScaleX = 0.70;
  coin.dataset.hitboxScaleY = 0.70;
  coin.dataset.hitboxOffsetY = 0;

  coin.style.width = `${size}px`;
  coin.style.height = `${size}px`;
  coin.style.left = `${gameContainer.offsetWidth + 50}px`;
  coin.style.bottom = `${randomY}px`;

  gameContainer.appendChild(coin);
}

function movePlayer() {
  if (isJumping) {
    playerY += velocityY;
    velocityY -= gravity;

    if (playerY <= 0) {
      playerY = 0;
      velocityY = 0;
      isJumping = false;
    }
  }

  player.style.bottom = `${groundHeight + playerY}px`;
}

function moveObjects() {
  const obstacles = document.querySelectorAll(".obstacle");
  const coinsList = document.querySelectorAll(".coin");

  obstacles.forEach((obstacle) => {
    let left = parseFloat(obstacle.style.left);
    left -= gameSpeed;
    obstacle.style.left = `${left}px`;

    const obstacleWidth = parseFloat(obstacle.dataset.width || obstacle.offsetWidth);

    if (left < -obstacleWidth - 30) {
      obstacle.remove();
      score += 5;
      updateBiome();
      updateHUD();
      return;
    }

    if (checkCollision(player, obstacle)) {
      endGame();
    }
  });

  coinsList.forEach((coin) => {
    let left = parseFloat(coin.style.left);
    left -= gameSpeed;
    coin.style.left = `${left}px`;

    const coinWidth = parseFloat(coin.dataset.width || coin.offsetWidth);

    if (left < -coinWidth - 20) {
      coin.remove();
      return;
    }

    if (checkCollision(player, coin)) {
      coin.remove();

      const ganhoBase = 5;
      const ganhoFinal = ganhoBase + vipBonusCoins;

      coins += ganhoFinal;
      score += 2;

      playSfx("coin");
      updateBiome();
      updateHUD();
    }
  });
}

function getCustomRect(element) {
  const left = parseFloat(element.style.left || "0");
  const bottom = parseFloat(element.style.bottom || groundHeight);
  const width = parseFloat(element.dataset.width || element.offsetWidth);
  const height = parseFloat(element.dataset.height || element.offsetHeight);

  const hitboxScaleX = parseFloat(element.dataset.hitboxScaleX || "1");
  const hitboxScaleY = parseFloat(element.dataset.hitboxScaleY || "1");
  const hitboxOffsetY = parseFloat(element.dataset.hitboxOffsetY || "0");

  const realWidth = width * hitboxScaleX;
  const realHeight = height * hitboxScaleY;

  const offsetX = (width - realWidth) / 2;
  const offsetY = hitboxOffsetY;

  return {
    left: left + offsetX,
    right: left + offsetX + realWidth,
    bottom: bottom + offsetY,
    top: bottom + offsetY + realHeight
  };
}

function getPlayerRect(playerEl) {
  const playerWidth = playerEl.offsetWidth;
  const playerHeight = playerEl.offsetHeight;
  const playerBottom = parseFloat(playerEl.style.bottom || groundHeight);

  const realWidth = playerWidth * 0.42;
  const realHeight = playerHeight * 0.62;

  const offsetX = (playerWidth - realWidth) / 2;
  const offsetY = 12;

  return {
    left: playerEl.offsetLeft + offsetX,
    right: playerEl.offsetLeft + offsetX + realWidth,
    bottom: playerBottom + offsetY,
    top: playerBottom + offsetY + realHeight
  };
}

function checkCollision(playerEl, objectEl) {
  const playerRect = getPlayerRect(playerEl);
  const objectRect = getCustomRect(objectEl);

  return !(
    playerRect.right <= objectRect.left ||
    playerRect.left >= objectRect.right ||
    playerRect.top <= objectRect.bottom ||
    playerRect.bottom >= objectRect.top
  );
}

function spawnController() {
  obstacleTimer++;
  coinTimer++;

  if (obstacleTimer > randomRange(95, 150)) {
    createObstacle();
    obstacleTimer = 0;
  }

  if (coinTimer > randomRange(75, 135)) {
    createCoin();
    coinTimer = 0;
  }
}

function updateDifficulty() {
  score += 0.08;
  updateBiome();

  if (gameSpeed < 14) {
    gameSpeed += 0.0015;
  }

  updateHUD();
}

async function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  gamePaused = false;
  cancelAnimationFrame(animationId);
  player.classList.remove("run");
  player.classList.remove("jump");

  totalCoins += coins;
  localStorage.setItem(STORAGE_COINS_KEY, String(totalCoins));

  await salvarMoedasFirebase();

  playSfx("hit");
  stopMusic();

  if (finalScoreEl) finalScoreEl.textContent = Math.floor(score);
  if (finalCoinsEl) finalCoinsEl.textContent = coins;
  if (totalCoinsEl) totalCoinsEl.textContent = totalCoins;

  if (gameOverScreen) gameOverScreen.classList.remove("hidden");

  updateAudioUI();
}

function pauseGame() {
  if (!gameRunning) return;

  gamePaused = !gamePaused;

  if (gamePaused) {
    cancelAnimationFrame(animationId);
    player.classList.remove("run");
    stopMusic();
  } else {
    player.classList.add("run");
    syncMusicState();
    loop();
  }

  updateAudioUI();
  closeMenu();
}

function exitGame() {
  gameRunning = false;
  gamePaused = false;
  cancelAnimationFrame(animationId);

  limparObjetos();
  player.classList.remove("run");
  player.classList.remove("jump");
  stopMusic();

  if (introScreen) introScreen.classList.remove("hidden");
  if (gameOverScreen) gameOverScreen.classList.add("hidden");

  resetState();
  closeMenu();
  closeSettings();
  updateAudioUI();
}

function loop() {
  if (!gameRunning || gamePaused) return;

  movePlayer();
  moveObjects();
  spawnController();
  updateDifficulty();

  animationId = requestAnimationFrame(loop);
}

function limparObjetos() {
  document.querySelectorAll(".obstacle, .coin").forEach((el) => el.remove());
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleMenu() {
  if (!gameMenu) return;
  gameMenu.classList.toggle("hidden");
}

function closeMenu() {
  if (!gameMenu) return;
  gameMenu.classList.add("hidden");
}

function openSettings() {
  if (!settingsPanel) return;
  settingsPanel.classList.remove("hidden");
  closeMenu();
}

function closeSettings() {
  if (!settingsPanel) return;
  settingsPanel.classList.add("hidden");
}

function toggleSoundEffects() {
  soundEnabled = !soundEnabled;
  applyAudioSettings();
  updateAudioUI();
  salvarConfiguracoesFirebase();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  applyAudioSettings();
  syncMusicState();
  updateAudioUI();
  salvarConfiguracoesFirebase();
}

function setVolume(value) {
  masterVolume = Math.max(0, Math.min(1, value / 100));
  applyAudioSettings();
  syncMusicState();
  updateAudioUI();
  salvarConfiguracoesFirebase();
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
    e.preventDefault();

    if (introScreen && !introScreen.classList.contains("hidden")) return;
    if (settingsPanel && !settingsPanel.classList.contains("hidden")) return;

    jump();
  }

  if (e.code === "Escape") {
    closeMenu();
    closeSettings();
  }
});

document.addEventListener("click", (e) => {
  if (
    gameMenu &&
    !gameMenu.classList.contains("hidden") &&
    menuToggle &&
    !menuToggle.contains(e.target) &&
    !gameMenu.contains(e.target)
  ) {
    closeMenu();
  }
});

if (jumpBtn) {
  jumpBtn.addEventListener("click", jump);
  jumpBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      jump();
    },
    { passive: false }
  );
}

if (enterGameBtn) {
  enterGameBtn.addEventListener("click", startGame);
}

if (restartBtn) {
  restartBtn.addEventListener("click", startGame);
}

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

if (openSettingsBtn) {
  openSettingsBtn.addEventListener("click", openSettings);
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener("click", closeSettings);
}

if (pauseGameBtn) {
  pauseGameBtn.addEventListener("click", pauseGame);
}

if (exitGameBtn) {
  exitGameBtn.addEventListener("click", exitGame);
}

if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", toggleSoundEffects);
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener("click", toggleMusic);
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    setVolume(Number(e.target.value));
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await carregarDadosDoJogador(user.uid);
  } else {
    currentUser = null;
    totalCoins = 0;
    userBadges = [];
    vipBonusCoins = 0;
    vipName = "Nenhum";
    updateHUD();
    console.log("Nenhum usuário logado no jogo.");
  }
});

aplicarSkinEquipada();
updateHUD();
syncMusicState();