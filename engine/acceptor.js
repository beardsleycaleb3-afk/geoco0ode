/**
 * GEO-CO0ODE ACCEPTOR
 * Receives 8-bit binary strands (00-FF) for the Buddy Matrix.
 */
const Acceptor = {
    validate: function(strand) {
        const value = parseInt(strand, 16);
        return value >= 0 && value <= 255;
    },
    getLabel: function(index) {
        return `n_${index}`;
    }
};
export default Acceptor;
