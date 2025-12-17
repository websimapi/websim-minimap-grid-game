import { Game } from './Game.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';

// Asset Loading
const assets = {
    grass: new Image(),
    sounds: {
        move: new Audio('move.mp3')
    }
};

assets.grass.src = 'grass.png';

async function init() {
    const canvas = document.getElementById('gameCanvas');
    
    // Wait for basic assets
    await new Promise(r => {
        if (assets.grass.complete) r();
        else assets.grass.onload = r;
    });

    const game = new Game(assets);
    const renderer = new Renderer(canvas, game, assets);
    const input = new InputHandler(canvas, game.camera, game);

    // Initial resize
    renderer.resize();
    window.addEventListener('resize', () => renderer.resize());

    // Game Loop
    function loop(time) {
        game.update(time);
        renderer.render();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

// Start
init();

