import { Pathfinder } from './Pathfinder.js';

export class Game {
    constructor(assets) {
        this.assets = assets;
        this.tileSize = 64;

        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };

        // Player position in Grid Units (floats for smooth movement)
        this.mapWidth = 40;
        this.mapHeight = 40;

        this.player = {
            x: Math.floor(this.mapWidth / 2),
            y: Math.floor(this.mapHeight / 2),
            rotation: 0
        };

        // Initialize camera to player position
        this.camera.x = this.player.x * this.tileSize + this.tileSize / 2;
        this.camera.y = this.player.y * this.tileSize + this.tileSize / 2;

        this.pathfinder = new Pathfinder();
        this.path = [];
        this.target = null;
        this.isMoving = false;
        this.moveSpeed = 6.0; // Grid cells per second

        this.lastTime = 0;
    }

    update(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.isMoving && this.path.length > 0) {
            this.movePlayer(dt);
        }

        // Camera Follow (Soft lerp)
        const targetCamX = this.player.x * this.tileSize + this.tileSize / 2;
        const targetCamY = this.player.y * this.tileSize + this.tileSize / 2;
        
        // Linear interpolation for smooth camera
        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;

        this.updateUI();
    }

    movePlayer(dt) {
        const targetNode = this.path[0];
        const targetX = targetNode.x;
        const targetY = targetNode.y;

        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const dist = Math.hypot(dx, dy);

        // Determine rotation
        const angle = Math.atan2(dy, dx);
        
        // Rotate player smoothly towards target direction
        let angleDiff = angle - this.player.rotation;
        // Normalize angle to -PI to PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.player.rotation += angleDiff * 10 * dt; // Rotation speed

        const moveStep = this.moveSpeed * dt;

        if (dist <= moveStep) {
            // Reached this node
            this.player.x = targetX;
            this.player.y = targetY;
            this.path.shift(); // Remove reached node

            if (this.path.length === 0) {
                this.isMoving = false;
                this.target = null;
            }
        } else {
            // Move towards node
            this.player.x += Math.cos(angle) * moveStep;
            this.player.y += Math.sin(angle) * moveStep;
        }
    }

    moveTo(worldPos) {
        // Convert world position (pixels) to grid coordinates
        const gridX = Math.floor(worldPos.x / this.tileSize);
        const gridY = Math.floor(worldPos.y / this.tileSize);

        // Check Bounds
        if (gridX < 0 || gridX >= this.mapWidth || gridY < 0 || gridY >= this.mapHeight) {
            return; // Clicked outside map
        }

        // Current player integer grid pos
        const startNode = {
            x: Math.round(this.player.x),
            y: Math.round(this.player.y)
        };

        const endNode = { x: gridX, y: gridY };

        // Bounds for pathfinder
        const bounds = { width: this.mapWidth, height: this.mapHeight };

        // Calculate path
        const newPath = this.pathfinder.findPath(startNode, endNode, bounds);

        if (newPath.length > 0) {
            this.path = newPath;
            this.target = endNode;
            this.isMoving = true;
            this.playSound('move');
        }
    }

    playSound(name) {
        if (this.assets.sounds && this.assets.sounds[name]) {
            // Clone node to play overlapping sounds
            const sound = this.assets.sounds[name].cloneNode();
            sound.volume = 0.4;
            sound.play().catch(e => console.log("Audio interaction needed"));
        }
    }

    updateUI() {
        const el = document.getElementById('coords');
        if (el) {
            el.innerText = `X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`;
        }
    }
}

