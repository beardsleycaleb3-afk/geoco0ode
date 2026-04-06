/**
 * GEO-CO0ODE CLOCK
 * Synchronizes the Sequencer and Audio Player.
 */
const Clock = {
    bpm: 120,
    interval: null,
    ticks: 0,

    start: function(callback) {
        const ms = (60 / this.bpm) * 1000 / 4; // 16th notes for high-density tracking
        this.interval = setInterval(() => {
            this.ticks++;
            callback(this.ticks);
        }, ms);
        console.log("Clock: Ticking at " + this.bpm + " BPM");
    },

    stop: function() {
        clearInterval(this.interval);
        this.ticks = 0;
    }
};

export default Clock;
