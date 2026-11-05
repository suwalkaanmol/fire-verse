/**
 * ScarDuel: Cyberpunk Neon Shootout
 * Core Game Logic and Web Audio Synthesizer
 */

// --- Audio Synthesizer (Web Audio API) ---
class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn("Web Audio API could not be initialized:", e);
            this.ctx = null;
        }
    }

    playShoot() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            
            // Laser sound using frequency sweep
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            // Bandpass filter to make it sound like a gun blast
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, now);
            filter.Q.setValueAtTime(1.0, now);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.16);
        } catch (e) {
            console.warn("Error playing shoot sound:", e);
        }
    }

    playHit() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            
            // Impact explosion / electronic hit
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            // Distort it slightly
            const dist = this.ctx.createWaveShaper();
            dist.curve = makeDistortionCurve(50);
            
            osc.connect(dist);
            dist.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.21);
        } catch (e) {
            console.warn("Error playing hit sound:", e);
        }
    }

    playHitmarker() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            
            // Electronic hitmarker chirp/click
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1800, now);
            osc.frequency.setValueAtTime(2600, now + 0.03);
            
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.07);
        } catch (e) {
            console.warn("Error playing hitmarker chirp sound:", e);
        }
    }

    playReloadStart() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            
            // Mechanical click
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.05);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.11);
        } catch (e) {
            console.warn("Error playing reload start sound:", e);
        }
    }

    playReloadDone() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            
            // Double metallic sound
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(523.25, now); // C5
            osc1.frequency.setValueAtTime(783.99, now + 0.08); // G5
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, now + 0.08); // C6
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.setValueAtTime(0.08, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc1.start(now);
            osc1.stop(now + 0.2);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.2);
        } catch (e) {
            console.warn("Error playing reload done sound:", e);
        }
    }

    playEmpty() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {
            console.warn("Error playing empty sound:", e);
        }
    }

    playWin() {
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
            
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                
                gain.gain.setValueAtTime(0.0, now + idx * 0.1);
                gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.45);
            });
        } catch (e) {
            console.warn("Error playing win sound:", e);
        }
    }
}

function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

const sfx = new SoundEffects();

// --- Game Configurations ---
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const MAX_HP = 200;
const MAX_AMMO = 30;
const SCAR_RANGE = 550; // Medium range bullet travel limit in px
const SHOT_COOLDOWN = 140; // milliseconds between shots (SCAR rapid fire)
const RELOAD_TIME = 1500; // 1.5 seconds

// Boundaries
const P1_LIMIT_X = 430; // Cannot cross past this point to the right
const P2_LIMIT_X = 570; // Cannot cross past this point to the left
const TOP_LIMIT_Y = 100; // Top bounding box
const BOTTOM_LIMIT_Y = 560; // Bottom bounding box

// --- Particle System ---
class Particle {
    constructor(x, y, vx, vy, color, size, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = maxLife;
        this.maxLife = maxLife;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // Gravity / friction
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Floating Damage Text ---
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0; // seconds
        this.vy = -60; // move upwards in px/sec
        this.vx = (Math.random() - 0.5) * 30;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.font = 'bold 22px "Orbitron", sans-serif';
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// --- Bullet Entity ---
class Bullet {
    constructor(x, y, isP1) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.speed = 1800; // pixels per second
        this.direction = isP1 ? 1 : -1;
        this.damage = 15;
        this.isP1 = isP1;
        this.active = true;
        this.color = isP1 ? 'rgba(0, 243, 255, 1)' : 'rgba(255, 0, 85, 1)';
        this.glowColor = isP1 ? 'rgba(0, 243, 255, 0.4)' : 'rgba(255, 0, 85, 0.4)';
    }

    update(dt) {
        const prevX = this.x;
        this.x += this.speed * this.direction * dt;
        
        // Calculate total distance traveled
        const dist = Math.abs(this.x - this.startX);
        
        if (dist >= SCAR_RANGE) {
            // Bullet fades/dissolves out of range
            this.active = false;
            // Spawn dissipation particles at the boundary point
            const endX = this.startX + SCAR_RANGE * this.direction;
            spawnDissolveParticles(endX, this.y, this.color);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        // Draw laser streak
        ctx.moveTo(this.x - (40 * this.direction), this.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
    }
}

// --- Player Entity ---
class Player {
    constructor(id, x, y, isP1, color, glowColor) {
        this.id = id;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.isP1 = isP1;
        this.color = color;
        this.glowColor = glowColor;
        
        this.width = 40;
        this.height = 65;
        this.speed = 350; // pixels/sec
        
        this.hp = MAX_HP;
        this.ammo = MAX_AMMO;
        
        this.reloading = false;
        this.reloadProgress = 0; // 0 to 1
        this.lastShotTime = 0;
        
        // Anim states
        this.tilt = 0;
        this.muzzleFlash = 0; // opacity timer
        
        // Stat tracking
        this.shotsFired = 0;
        this.hits = 0;
        this.damageDealt = 0;
        this.lastDodgeTime = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.hp = MAX_HP;
        this.ammo = MAX_AMMO;
        this.reloading = false;
        this.reloadProgress = 0;
        this.lastShotTime = 0;
        this.shotsFired = 0;
        this.hits = 0;
        this.damageDealt = 0;
        this.tilt = 0;
        this.muzzleFlash = 0;
        this.lastDodgeTime = 0;
    }

    move(dx, dy, dt) {
        // Apply speed
        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;
        
        // Character tilt animation during vertical movement
        if (dy !== 0) {
            this.tilt = Math.max(-0.15, Math.min(0.15, this.tilt + dy * 0.02));
        } else {
            this.tilt *= 0.85; // return to upright
        }

        // Keep P1 within boundaries
        if (this.isP1) {
            this.x = Math.max(30, Math.min(P1_LIMIT_X, this.x));
        } else {
            this.x = Math.max(P2_LIMIT_X, Math.min(CANVAS_WIDTH - 30, this.x));
        }
        
        // Vertical boundary check
        this.y = Math.max(TOP_LIMIT_Y, Math.min(BOTTOM_LIMIT_Y, this.y));
    }

    shoot(bullets) {
        const now = Date.now();
        if (this.reloading) {
            sfx.playEmpty();
            return;
        }
        if (this.ammo <= 0) {
            sfx.playEmpty();
            this.startReload();
            return;
        }
        if (now - this.lastShotTime < SHOT_COOLDOWN) {
            return; // on cooldown
        }

        // Fire bullet
        this.ammo--;
        this.lastShotTime = now;
        this.shotsFired++;
        this.muzzleFlash = 1.0; // Full brightness flash
        
        // Spawn bullet (offset relative to gun tip)
        const gunX = this.x + (this.isP1 ? 25 : -25);
        const gunY = this.y - 5;
        bullets.push(new Bullet(gunX, gunY, this.isP1));
        
        // Muzzle particles
        spawnMuzzleParticles(gunX, gunY, this.isP1, this.color);
        
        // Sound
        sfx.playShoot();
        
        // Update HUD
        updateAmmoHUD(this);
    }

    startReload() {
        if (this.reloading || this.ammo === MAX_AMMO) return;
        this.reloading = true;
        this.reloadProgress = 0;
        sfx.playReloadStart();
        
        // Toggle reload HUD element
        const reloadWrapper = document.getElementById(`${this.id}-reload-bar`).parentElement;
        reloadWrapper.classList.add('active');
    }

    update(dt) {
        // Handle reload timing
        if (this.reloading) {
            this.reloadProgress += dt * (1000 / RELOAD_TIME);
            if (this.reloadProgress >= 1.0) {
                this.ammo = MAX_AMMO;
                this.reloading = false;
                this.reloadProgress = 0;
                sfx.playReloadDone();
                
                // Hide reload HUD
                const reloadWrapper = document.getElementById(`${this.id}-reload-bar`).parentElement;
                reloadWrapper.classList.remove('active');
                updateAmmoHUD(this);
            } else {
                // Update reload bar width
                const bar = document.getElementById(`${this.id}-reload-bar`);
                if (bar) bar.style.width = `${this.reloadProgress * 100}%`;
            }
        }

        // Fade muzzle flash
        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= dt * 10;
        }
    }

    draw(ctx) {
        const dir = this.isP1 ? 1 : -1;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt);

        // --- Visual Range Indicator (Dashed Arc) ---
        // Draws a thin scanning arc in the direction the player is looking
        ctx.save();
        ctx.restore(); // Do range visualization globally under arena renderer to avoid rotational tilt

        // --- Draw Shadow/Glow ---
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        // --- Character body (Vanguard/Spectre Cyber Suit) ---
        // Visor/Helmet
        ctx.fillStyle = '#1e202b';
        ctx.beginPath();
        ctx.moveTo(-10 * dir, -30);
        ctx.lineTo(12 * dir, -30);
        ctx.lineTo(16 * dir, -15);
        ctx.lineTo(-6 * dir, -10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Visor glass glow
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(5 * dir, -26);
        ctx.lineTo(11 * dir, -26);
        ctx.lineTo(14 * dir, -18);
        ctx.lineTo(4 * dir, -18);
        ctx.closePath();
        ctx.fill();

        // Cyber Chassis (Chestplate)
        ctx.fillStyle = '#12141d';
        ctx.beginPath();
        ctx.moveTo(-15 * dir, -10);
        ctx.lineTo(10 * dir, -10);
        ctx.lineTo(15 * dir, 15);
        ctx.lineTo(-12 * dir, 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        // Core Glowing Reactor/Chest Stripe
        ctx.fillStyle = this.color;
        ctx.fillRect(-3 * dir, -5, 6 * dir, 18);

        // Legs/Thrust Pad
        ctx.fillStyle = '#0e1017';
        ctx.fillRect(-10 * dir, 20, 18 * dir, 12);
        
        // Feet/Hover jets
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-8 * dir, 32, 5 * dir, 3);
        ctx.fillRect(2 * dir, 32, 5 * dir, 3);

        // --- Draw the SCAR Gun ---
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#222533';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        
        // SCAR-H Chassis
        ctx.beginPath();
        ctx.moveTo(0 * dir, -8);
        ctx.lineTo(26 * dir, -8); // barrel
        ctx.lineTo(26 * dir, -2);
        ctx.lineTo(20 * dir, -2);
        ctx.lineTo(18 * dir, 4); // clip
        ctx.lineTo(14 * dir, 4);
        ctx.lineTo(12 * dir, 1);
        ctx.lineTo(0 * dir, 0); // stock
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Tactical scope
        ctx.fillStyle = this.color;
        ctx.fillRect(8 * dir, -11, 6 * dir, 3);

        // Hands holding the gun
        ctx.fillStyle = '#1e202b';
        ctx.beginPath();
        ctx.arc(6 * dir, -2, 4, 0, Math.PI * 2);
        ctx.arc(15 * dir, -2, 3, 0, Math.PI * 2);
        ctx.fill();

        // --- Muzzle Flash ---
        if (this.muzzleFlash > 0) {
            ctx.save();
            ctx.globalAlpha = this.muzzleFlash;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
            
            // Spike flash
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(26 * dir, -7);
            ctx.lineTo(38 * dir, -5);
            ctx.lineTo(26 * dir, -3);
            ctx.lineTo(32 * dir, -9);
            ctx.lineTo(26 * dir, -7);
            ctx.closePath();
            ctx.fill();
            
            // Halo
            const grad = ctx.createRadialGradient(26 * dir, -5, 1, 26 * dir, -5, 15);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.3, this.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(26 * dir, -5, 15, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
        ctx.restore();
    }
}

// --- Global Particle Pool & Entities ---
let particles = [];
let floatingTexts = [];
let bullets = [];

function spawnMuzzleParticles(x, y, isP1, color) {
    const dir = isP1 ? 1 : -1;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.random() - 0.5) * 0.8; // spray forward
        const speed = 100 + Math.random() * 200;
        const vx = Math.cos(angle) * speed * dir;
        const vy = Math.sin(angle) * speed;
        const size = 2 + Math.random() * 3;
        const life = 0.15 + Math.random() * 0.15;
        particles.push(new Particle(x, y, vx, vy, color, size, life));
    }
}

function spawnHitParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 180;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = 1.5 + Math.random() * 2.5;
        const life = 0.2 + Math.random() * 0.25;
        particles.push(new Particle(x, y, vx, vy, '#fff', size, life));
        particles.push(new Particle(x, y, vx * 0.8, vy * 0.8, color, size + 1, life * 1.2));
    }
}

function spawnDissolveParticles(x, y, color) {
    // Laser dissipates out of range
    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 60;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = 1 + Math.random() * 2;
        const life = 0.3 + Math.random() * 0.2;
        particles.push(new Particle(x, y, vx, vy, color, size, life));
    }
}

// --- HUD Interface Updates ---
function initAmmoClipDOM(player, idSuffix) {
    const clipContainer = document.getElementById(`${idSuffix}-ammo-clip`);
    clipContainer.innerHTML = '';
    for (let i = 0; i < MAX_AMMO; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('bullet-indicator', 'active');
        clipContainer.appendChild(indicator);
    }
}

function updateAmmoHUD(player) {
    const valText = document.getElementById(`${player.id}-ammo-val`);
    if (valText) valText.textContent = player.ammo;

    const clipContainer = document.getElementById(`${player.id}-ammo-clip`);
    if (clipContainer) {
        const dots = clipContainer.getElementsByClassName('bullet-indicator');
        for (let i = 0; i < dots.length; i++) {
            // Fill from right to left or left to right depending on P1/P2
            if (i < player.ammo) {
                dots[i].classList.add('active');
            } else {
                dots[i].classList.remove('active');
            }
        }
    }
}

function updateHP_HUD(player) {
    const hpVal = document.getElementById(`${player.id}-hp-val`);
    const hpBar = document.getElementById(`${player.id}-hp-bar`);
    const hpGlitch = document.getElementById(`${player.id}-hp-glitch`);
    
    if (hpVal) hpVal.textContent = `${Math.ceil(player.hp)} / ${MAX_HP}`;
    
    const pct = Math.max(0, (player.hp / MAX_HP) * 100);
    if (hpBar) hpBar.style.width = `${pct}%`;
    
    // Smooth trailing damage effect
    setTimeout(() => {
        if (hpGlitch) hpGlitch.style.width = `${pct}%`;
    }, 400);
}

// --- Keyboard Input Handling ---
const activeKeys = {};

window.addEventListener('keydown', (e) => {
    // Prevent screen scroll for play keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }
    activeKeys[e.key.toLowerCase()] = true;
    
    // Enter key starts/restarts game from menu/game over screens
    if (e.key === 'Enter') {
        if (gameState === STATE_MENU || gameState === STATE_GAMEOVER) {
            sfx.init();
            startGame();
            return;
        }
    }
    
    // Instant triggers (single tap triggers like manual reloads)
    if (gameState === STATE_PLAYING) {
        if (e.key.toLowerCase() === 'r') {
            p1.startReload();
        }
        if (e.key === 'p' || e.key === '/') {
            p2.startReload();
        }
    }
    
    // ESC key returns to start menu
    if (e.key === 'Escape') {
        resetToMenu();
    }
});

window.addEventListener('keyup', (e) => {
    activeKeys[e.key.toLowerCase()] = false;
});

// --- Game Loop and Setup ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Mouse & Touch Input Handling ---
let mouseX = 120;
let mouseY = 300;
let isLeftMouseDown = false;

// Track cursor relative to canvas scale
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

// Touch controls for mobile / tablet
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
        mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);
        isLeftMouseDown = true;
    }
    e.preventDefault(); // Prevent screen scrolling when touching the game canvas
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
        mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    }
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isLeftMouseDown = false;
    }
});

window.addEventListener('touchcancel', (e) => {
    if (e.touches.length === 0) {
        isLeftMouseDown = false;
    }
});

// Disable browser context menu on canvas (good to keep)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Left click to shoot
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left Click
        isLeftMouseDown = true;
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) { // Left Click Release
        isLeftMouseDown = false;
    }
});

const p1 = new Player('p1', 120, 300, true, '#00f3ff', 'rgba(0, 243, 255, 0.4)');
const p2 = new Player('p2', 880, 300, false, '#ff0055', 'rgba(255, 0, 85, 0.4)');

const STATE_MENU = 'menu';
const STATE_PLAYING = 'playing';
const STATE_GAMEOVER = 'gameover';
let gameState = STATE_MENU;

let lastTime = 0;
let matchStartTime = 0;
let matchTimeElapsed = 0;
let shakeTime = 0;
let shakeAmount = 0;

// Setup UI Element references
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const hudHeader = document.getElementById('hud');
const matchTimerText = document.getElementById('match-timer');
const winnerTitle = document.getElementById('winner-title');
const winnerName = document.getElementById('winner-name');

// Buttons
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnModeAI = document.getElementById('btn-mode-ai');
const btnModePvP = document.getElementById('btn-mode-pvp');

let isAIMode = true; // Bot mode by default

// Bot Difficulty selection state
let botDifficulty = 1; // 1, 2, or 3

// Buttons for Difficulty
const btnDiff1 = document.getElementById('btn-diff-1');
const btnDiff2 = document.getElementById('btn-diff-2');
const btnDiff3 = document.getElementById('btn-diff-3');
const diffContainer = document.getElementById('diff-selection-container');

// Helper to update difficulty active classes
function selectDifficulty(diff) {
    botDifficulty = diff;
    btnDiff1.classList.toggle('active', diff === 1);
    btnDiff2.classList.toggle('active', diff === 2);
    btnDiff3.classList.toggle('active', diff === 3);
}

btnDiff1.addEventListener('click', () => selectDifficulty(1));
btnDiff2.addEventListener('click', () => selectDifficulty(2));
btnDiff3.addEventListener('click', () => selectDifficulty(3));

// --- Mode Toggle Listeners ---
btnModeAI.addEventListener('click', () => {
    isAIMode = true;
    btnModeAI.classList.add('active');
    btnModePvP.classList.remove('active');
    diffContainer.classList.remove('hidden');
});

btnModePvP.addEventListener('click', () => {
    isAIMode = false;
    btnModePvP.classList.add('active');
    btnModeAI.classList.remove('active');
    diffContainer.classList.add('hidden');
});

// --- Button Listeners ---
btnStart.addEventListener('click', () => {
    sfx.init();
    startGame();
});

btnRestart.addEventListener('click', () => {
    sfx.init();
    startGame();
});

function startGame() {
    gameState = STATE_PLAYING;
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    hudHeader.classList.remove('hidden');
    
    // Reset players & entities
    p1.reset();
    p2.reset();
    
    // Apply bot difficulty speed override
    if (isAIMode) {
        if (botDifficulty === 1) {
            p2.speed = 180;
        } else if (botDifficulty === 2) {
            p2.speed = 300;
        } else if (botDifficulty === 3) {
            p2.speed = 460;
        }
    }
    
    bullets = [];
    particles = [];
    floatingTexts = [];
    
    // Reset HUDs
    initAmmoClipDOM(p1, 'p1');
    initAmmoClipDOM(p2, 'p2');
    updateHP_HUD(p1);
    updateHP_HUD(p2);
    updateAmmoHUD(p1);
    updateAmmoHUD(p2);
    
    // Update player labels dynamically on HUD based on Game Mode
    const p1Class = document.querySelector('#hud-p1 .hud-class');
    const p1Label = document.querySelector('#hud-p1 .hud-label');
    const p2Class = document.querySelector('#hud-p2 .hud-class');
    const p2Label = document.querySelector('#hud-p2 .hud-label');
    
    if (isAIMode) {
        if (p1Class) p1Class.textContent = "ME";
        if (p1Label) p1Label.textContent = "PILOT";
        if (p2Class) p2Class.textContent = "BOT";
        if (p2Label) p2Label.textContent = "SYSTEM";
    } else {
        if (p1Class) p1Class.textContent = "PLAYER 1";
        if (p1Label) p1Label.textContent = "P1";
        if (p2Class) p2Class.textContent = "PLAYER 2";
        if (p2Label) p2Label.textContent = "P2";
    }
    
    // Reset Timers
    matchStartTime = Date.now();
    matchTimeElapsed = 0;
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetToMenu() {
    gameState = STATE_MENU;
    startScreen.classList.remove('hidden');
    gameoverScreen.classList.add('hidden');
    hudHeader.classList.add('hidden');
}

function triggerScreenShake(amount, duration) {
    shakeAmount = amount;
    shakeTime = duration;
}

// Draw Arena Grid, Boundaries, and Midline
function drawArena(ctx) {
    // 1. Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }

    // 2. Play Boundaries (Top/Bottom visual limits)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, TOP_LIMIT_Y - 40);
    ctx.lineTo(CANVAS_WIDTH, TOP_LIMIT_Y - 40);
    ctx.moveTo(0, BOTTOM_LIMIT_Y + 40);
    ctx.lineTo(CANVAS_WIDTH, BOTTOM_LIMIT_Y + 40);
    ctx.stroke();

    // 3. Central Neon Divider Barrier
    // Visualizes the region that players cannot cross
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.1)';
    ctx.shadowBlur = 8;
    
    // Border for P1
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(P1_LIMIT_X + 10, TOP_LIMIT_Y - 30);
    ctx.lineTo(P1_LIMIT_X + 10, BOTTOM_LIMIT_Y + 30);
    ctx.stroke();

    // Border for P2
    ctx.strokeStyle = 'rgba(255, 0, 85, 0.15)';
    ctx.beginPath();
    ctx.moveTo(P2_LIMIT_X - 10, TOP_LIMIT_Y - 30);
    ctx.lineTo(P2_LIMIT_X - 10, BOTTOM_LIMIT_Y + 30);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw "NO MANS LAND" text in middle
    ctx.save();
    ctx.font = 'bold 12px "Orbitron", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.textAlign = 'center';
    ctx.fillText("TACTICAL DIVISION", CANVAS_WIDTH / 2, TOP_LIMIT_Y - 15);
    ctx.restore();
}

function drawRangeIndicators(ctx) {
    // Draws visual halos outlining their weapon limits
    
    // P1 Range Circle
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, SCAR_RANGE, -Math.PI/3, Math.PI/3);
    ctx.stroke();
    ctx.restore();

    // P2 Range Circle
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 85, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, SCAR_RANGE, Math.PI - Math.PI/3, Math.PI + Math.PI/3);
    ctx.stroke();
    ctx.restore();
}

// Check Box Collisions
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b.active) continue;

        // Determine target
        const target = b.isP1 ? p2 : p1;
        
        // Simple AABB / Circle point collision for character hitbox
        // Character bounds: X from target.x - 15 to target.x + 15, Y from target.y - 35 to target.y + 30
        const hitWidth = 30;
        const hitHeight = 65;
        const targetLeft = target.x - hitWidth/2;
        const targetRight = target.x + hitWidth/2;
        const targetTop = target.y - hitHeight/2;
        const targetBottom = target.y + hitHeight/2;

        if (b.x >= targetLeft && b.x <= targetRight && b.y >= targetTop && b.y <= targetBottom) {
            // Register Hit!
            b.active = false;
            
            // HP depletion
            target.hp -= b.damage;
            if (target.hp < 0) target.hp = 0;
            
            // Attacker stats
            const attacker = b.isP1 ? p1 : p2;
            attacker.hits++;
            attacker.damageDealt += b.damage;

            // Spawn hit sparks
            spawnHitParticles(b.x, b.y, target.color);
            
            // Screen rumble
            triggerScreenShake(8, 0.15);
            
            // Audio impact
            sfx.playHit();
            
            // Hitmarker sound for player feedback
            if (b.isP1) {
                sfx.playHitmarker();
            }

            // Floating indicator text
            floatingTexts.push(new FloatingText(target.x, target.y - 40, `-${b.damage} HP`, '#ffaa00'));

            // Update health bars
            updateHP_HUD(target);

            // Check game over condition
            if (target.hp <= 0) {
                endGame(attacker);
            }
        }
    }
}

function endGame(winner) {
    gameState = STATE_GAMEOVER;
    sfx.playWin();

    // Render winner information dynamically based on game mode
    if (winner) {
        if (isAIMode) {
            winnerName.textContent = winner.isP1 ? 'VICTORY' : 'DEFEAT';
        } else {
            winnerName.textContent = winner.isP1 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS';
        }
    } else {
        winnerName.textContent = 'DRAW';
    }
    
    // Update stats headers dynamically
    const statP1Title = document.querySelector('#stat-p1 h3');
    const statP2Title = document.querySelector('#stat-p2 h3');
    if (isAIMode) {
        if (statP1Title) statP1Title.textContent = "ME (P1)";
        if (statP2Title) statP2Title.textContent = "BOT (P2)";
    } else {
        if (statP1Title) statP1Title.textContent = "PLAYER 1 (P1)";
        if (statP2Title) statP2Title.textContent = "PLAYER 2 (P2)";
    }

    // Set statistics panel numbers
    document.getElementById('stat-p1-shots').textContent = p1.shotsFired;
    document.getElementById('stat-p1-acc').textContent = p1.shotsFired > 0 ? `${Math.round((p1.hits / p1.shotsFired) * 100)}%` : '0%';
    document.getElementById('stat-p1-dmg').textContent = p1.damageDealt;

    document.getElementById('stat-p2-shots').textContent = p2.shotsFired;
    document.getElementById('stat-p2-acc').textContent = p2.shotsFired > 0 ? `${Math.round((p2.hits / p2.shotsFired) * 100)}%` : '0%';
    document.getElementById('stat-p2-dmg').textContent = p2.damageDealt;

    // Show panel
    gameoverScreen.classList.remove('hidden');
}

// --- Main Engine Loop ---
function gameLoop(timestamp) {
    if (gameState !== STATE_PLAYING) return;

    // Time delta calculation (in seconds)
    const dt = Math.min(0.1, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    // Update match clock
    const elapsedSecs = Math.floor((Date.now() - matchStartTime) / 1000);
    const m = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
    const s = String(elapsedSecs % 60).padStart(2, '0');
    matchTimerText.textContent = `${m}:${s}`;

    // --- Inputs Processing ---
    // Player 1 controls (Smooth mouse alignment)
    const targetX = Math.max(30, Math.min(P1_LIMIT_X, mouseX));
    const targetY = Math.max(TOP_LIMIT_Y, Math.min(BOTTOM_LIMIT_Y, mouseY));
    
    // Smooth lerp movement towards mouse position
    const prevX = p1.x;
    const prevY = p1.y;
    p1.x += (targetX - p1.x) * 0.15;
    p1.y += (targetY - p1.y) * 0.15;
    
    // Smooth tilt feedback
    const dy = p1.y - prevY;
    p1.tilt = Math.max(-0.15, Math.min(0.15, dy * 0.04));

    // Left click triggers weapon fire (SCAR auto-fire supported when held)
    if (isLeftMouseDown) {
        p1.shoot(bullets);
    }

    // Player 2 controls
    let p2_dx = 0;
    let p2_dy = 0;

    if (isAIMode) {
        const xDiff = p2.x - p1.x; // p2 is on the right, so p2.x > p1.x

        if (botDifficulty === 1) {
            // LEVEL 1 (EASY): Slow sinusoidal drift, independent of player, slow spacing
            const waveY = Math.sin(timestamp / 600) * 150 + 330;
            const yDiff = waveY - p2.y;
            if (Math.abs(yDiff) > 15) {
                p2_dy = yDiff > 0 ? 1 : -1;
            }

            // Loose spacing
            if (xDiff > 530) {
                p2_dx = -1;
            } else if (xDiff < 480) {
                p2_dx = 1;
            }

            // Shoot rarely and loosely
            if (xDiff <= SCAR_RANGE && Math.abs(p1.y - p2.y) < 70) {
                if (Math.random() < 0.012) {
                    p2.shoot(bullets);
                }
            }
        } else if (botDifficulty === 2) {
            // LEVEL 2 (MEDIUM): Tracks player Y with an oscillating offset (human strafe effect)
            const targetOffset = Math.sin(timestamp / 300) * 80;
            const targetY = p1.y + targetOffset;
            const yDiff = targetY - p2.y;
            if (Math.abs(yDiff) > 15) {
                p2_dy = yDiff > 0 ? 1 : -1;
            }

            // Normal spacing
            if (xDiff > 500) {
                p2_dx = -1;
            } else if (xDiff < 440) {
                p2_dx = 1;
            }

            // Shoot normally
            if (xDiff <= SCAR_RANGE && Math.abs(p1.y - p2.y) < 45) {
                if (Math.random() < 0.035) {
                    p2.shoot(bullets);
                }
            }
        } else if (botDifficulty === 3) {
            // LEVEL 3 (HARD): Fast tracks, strafes, and actively DODGES player laser bullets!
            let dodgeDir = 0;
            const now = Date.now();
            
            // Bot can only dodge once every 1200ms (1.2s cooldown) to allow player shots to hit in bursts
            if (now - p2.lastDodgeTime > 1200) {
                // Scan for incoming lasers heading right and getting close
                for (let i = 0; i < bullets.length; i++) {
                    const b = bullets[i];
                    if (b.isP1 && b.x > p1.x + 100 && p2.x - b.x < 320) {
                        if (Math.abs(b.y - p2.y) < 45) {
                            // 70% chance to react and dodge, 30% chance of failing to dodge
                            if (Math.random() < 0.70) {
                                dodgeDir = b.y < p2.y ? 1 : -1;
                                p2.lastDodgeTime = now; // trigger dodge cooldown
                            }
                            break;
                        }
                    }
                }
            }

            if (dodgeDir !== 0) {
                p2_dy = dodgeDir;
            } else {
                // Strafe aiming (tight wave offset)
                const targetOffset = Math.sin(timestamp / 150) * 40;
                const targetY = p1.y + targetOffset;
                const yDiff = targetY - p2.y;
                if (Math.abs(yDiff) > 10) {
                    p2_dy = yDiff > 0 ? 1 : -1;
                }
            }

            // Tight spacing (stays closer)
            if (xDiff > 470) {
                p2_dx = -1;
            } else if (xDiff < 410) {
                p2_dx = 1;
            }

            // Shoot rapidly
            if (xDiff <= SCAR_RANGE && Math.abs(p1.y - p2.y) < 35) {
                if (Math.random() < 0.07) {
                    p2.shoot(bullets);
                }
            }
        }
        
        // Auto reload if out of ammo
        if (p2.ammo <= 0 && !p2.reloading) {
            p2.startReload();
        }
    } else {
        // Human controls for Player 2
        if (activeKeys['arrowup']) p2_dy = -1;
        if (activeKeys['arrowdown']) p2_dy = 1;
        if (activeKeys['arrowleft']) p2_dx = -1;
        if (activeKeys['arrowright']) p2_dx = 1;

        if (activeKeys['enter'] || activeKeys['l']) {
            p2.shoot(bullets);
        }
    }

    // Apply movements to P2
    p2.move(p2_dx, p2_dy, dt);

    // --- Physics & Updates ---
    p1.update(dt);
    p2.update(dt);

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.update(dt);
        if (!b.active) {
            bullets.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Update floating damage values
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.update(dt);
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }

    // Check collisions
    checkCollisions();

    // --- Screen Shake calculation ---
    ctx.save();
    if (shakeTime > 0) {
        const dx = (Math.random() - 0.5) * shakeAmount;
        const dy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(dx, dy);
        shakeTime -= dt;
    }

    // --- Render Scene ---
    ctx.fillStyle = '#06070a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid details
    drawArena(ctx);
    drawRangeIndicators(ctx);

    // Draw entities
    p1.draw(ctx);
    p2.draw(ctx);

    // Draw bullets
    bullets.forEach(b => b.draw(ctx));

    // Draw particles
    particles.forEach(p => p.draw(ctx));

    // Draw floating damage notifications
    floatingTexts.forEach(ft => ft.draw(ctx));

    // Draw custom pilot tag watermark on the bottom-left of the canvas (AS)
    ctx.save();
    ctx.font = 'bold 15px "Orbitron", sans-serif';
    ctx.fillStyle = 'rgba(0, 243, 255, 0.35)';
    ctx.shadowColor = 'rgba(0, 243, 255, 0.2)';
    ctx.shadowBlur = 5;
    ctx.textAlign = 'left';
    ctx.fillText("OPERATOR: AS", 25, CANVAS_HEIGHT - 20);
    ctx.restore();

    ctx.restore();

    requestAnimationFrame(gameLoop);
}
