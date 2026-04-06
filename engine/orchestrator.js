import Node from './node.js';
import Clock from './clock.js';

const Orchestrator = {
    nodes: [],

    init: function() {
        console.log("Orchestrator: Initializing 960-tile grid...");
        this.nodes = [];
        // Generate the 960-tile matrix using the Node module
        for (let i = 0; i < 960; i++) {
            this.nodes.push(Node.create(i));
        }

        // Start the system clock
        Clock.start((tick) => {
            this.sync(tick);
        });
    },

    sync: function(tick) {
        // Sequencer and Audio Player harmony happens here
    },

    saveState: function() {
        console.log("Orchestrator: Geometric State Captured.");
        return this.nodes.map(n => n.value);
    }
};
export default Orchestrator;
