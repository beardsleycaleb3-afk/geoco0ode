import Node from './node.js';
import Clock from './clock.js';
import Translator from './translator.js';
import Acceptor from './acceptor.js';
import AudioPlayer from './audio.js';

const Orchestrator = {
    grid: [],

    init: function() {
        // Build 960-tile grid
        for (let i = 0; i < 960; i++) {
            this.grid.push(Node.create(i));
        }

        AudioPlayer.init();

        // Ticker drives the Sequencer
        Clock.start((tick) => {
            this.sync(tick);
        });
    },

    sync: function(tick) {
        const currentTile = tick % 960;
        // 1. Accept data -> 2. Translate/Fold -> 3. Render
        console.log(`Syncing Tile ${currentTile} at Pivot 88 logic.`);
    }
};

export default Orchestrator;
