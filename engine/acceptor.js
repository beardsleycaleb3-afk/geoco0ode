/**
 * GEO-CO0ODE ACCEPTOR
 * Receives 8-bit binary strands (00-FF) for the Buddy Matrix.
 */
const Acceptor = {
    // Validates if the input is a proper 8-bit strand
    validate: function(strand) {
        const value = parseInt(strand, 16);
        return value >= 0 && value <= 255;
    },

    // Maps the strand to the source (n) label
    getLabel: function(index) {
        return `n_${index}`;
    }
};

export default Acceptor;
