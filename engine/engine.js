/**
 * GEO-CO0ODE CORE ENGINE v3.3
 * Consolidated 018810 Mirror Logic & Typewriter Sequencer
 */

export const Translator = {
    fold: (i, total = 960) => (total - 1) - i
};

export const Node = {
    create: (id, value = 0) => ({
        id: id,
        value: value,
        mirrorId: 959 - id,
        isPivot: id === 88 || id % 100 === 88
    })
};

export const Audio = {
    ctx: null,
    analyser: null,
    init: async function() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.ctx.createAnalyser();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.ctx.createMediaStreamSource(stream).connect(this.analyser);
        } catch (e) { console.error("EM Sensor blocked."); }
    },
    playClick: function() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    },
    getLevel: function() {
        if (!this.analyser) return 0;
        const data = new Uint8Array(128);
        this.analyser.getByteFrequencyData(data);
        return data.reduce((a, b) => a + b, 0) / 128;
    }
};

export const Acceptor = {
    buffer: "",
    process: function(key, onComplete) {
        if (/^[0-9A-F]$/i.test(key)) {
            this.buffer += key.toUpperCase();
            if (this.buffer.length === 2) {
                onComplete(this.buffer);
                this.buffer = "";
            }
        }
    }
};

export const Storage = {
    save: (nodes) => {
        const seed = nodes.slice(0, 480).map(n => n.value);
        localStorage.setItem('geo_dna_3000', JSON.stringify(seed));
    }
};

const Orchestrator = {
    nodes: [],
    cursor: 0,
    init: function() {
        for (let i = 0; i < 960; i++) {
            this.nodes.push(Node.create(i));
        }
        setInterval(() => {
            window.dispatchEvent(new CustomEvent('geo-sync', { detail: Audio.getLevel() }));
        }, 100);
    },
    typewrite: function(strand) {
        const val = parseInt(strand, 16);
        // Apply 3000:1 Mirror Logic
        this.nodes[this.cursor].value = val;
        this.nodes[Translator.fold(this.cursor)].value = val;
        Audio.playClick();
        this.cursor = (this.cursor + 1) % 480;
    }
};

export default Orchestrator;
