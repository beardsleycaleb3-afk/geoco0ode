import Translator from './translator.js';

const Storage = {
    mirrorSave: function(gridData) {
        // Capture 480-unit seed
        const seed = gridData.slice(0, 480);
        localStorage.setItem('geoco0ode_save', JSON.stringify(seed));
        return seed;
    },
    mirrorPrint: function() {
        const seed = JSON.parse(localStorage.getItem('geoco0ode_save'));
        const fullGrid = [...seed];
        // Reconstruct 960-tile grid using 018810 logic
        for (let i = 480; i < 960; i++) {
            fullGrid[i] = seed[Translator.fold(i)];
        }
        return fullGrid;
    }
};
export default Storage;
