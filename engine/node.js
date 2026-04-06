/**
 * GEO-CO0ODE NODE
 * The individual data unit for 018810 mapping.
 */
const Node = {
    create: function(id, value = 0) {
        return {
            id: id,
            value: value,
            // Calculate mirror identity for this specific node
            mirrorId: 959 - id,
            isPivot: id === 88 || id % 100 === 88
        };
    },
    
    // Physical Bit Reversal for 255-unit matrix compatibility
    reverse: function(byte) {
        return parseInt(byte.toString(2).padStart(8, '0').split('').reverse().join(''), 2);
    }
};

export default Node;
