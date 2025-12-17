export class Renderer {
    constructor(canvas, game, assets) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.assets = assets;
        this.tileSize = 64;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        const { width, height } = this.canvas;
        const { camera, player, path } = this.game;

        // Clear screen
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.save();

        // Apply Camera Transform
        // Translate to center of screen
        this.ctx.translate(width / 2, height / 2);
        // Scale
        this.ctx.scale(camera.zoom, camera.zoom);
        // Translate opposite of camera position
        this.ctx.translate(-camera.x, -camera.y);

        this.drawGrid(camera, width, height);
        this.drawPath(path);
        this.drawTargetMarker();
        this.drawPlayer(player);

        this.ctx.restore();
    }

    drawGrid(camera, screenW, screenH) {
        // Optimization: Only draw visible tiles
        // Calculate the view bounds in world coordinates
        const halfW = (screenW / 2) / camera.zoom;
        const halfH = (screenH / 2) / camera.zoom;
        
        const left = camera.x - halfW;
        const right = camera.x + halfW;
        const top = camera.y - halfH;
        const bottom = camera.y + halfH;

        // Convert to grid indices
        const startCol = Math.floor(left / this.tileSize);
        const endCol = Math.ceil(right / this.tileSize);
        const startRow = Math.floor(top / this.tileSize);
        const endRow = Math.ceil(bottom / this.tileSize);

        for (let x = startCol; x <= endCol; x++) {
            for (let y = startRow; y <= endRow; y++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Draw Grass
                if (this.assets.grass) {
                    // Draw image slightly larger to avoid gaps at high zoom
                    this.ctx.drawImage(this.assets.grass, posX, posY, this.tileSize + 1, this.tileSize + 1);
                } else {
                    this.ctx.fillStyle = ((x + y) % 2 === 0) ? '#4CAF50' : '#45a049';
                    this.ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }

                // Grid lines (subtle)
                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);
            }
        }
    }

    drawPath(path) {
        if (!path || path.length === 0) return;

        this.ctx.beginPath();
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';

        // Draw from player to first point
        const pStart = this.game.player;
        this.ctx.moveTo(pStart.x * this.tileSize + this.tileSize/2, pStart.y * this.tileSize + this.tileSize/2);

        for (let point of path) {
            this.ctx.lineTo(
                point.x * this.tileSize + this.tileSize / 2, 
                point.y * this.tileSize + this.tileSize / 2
            );
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawTargetMarker() {
        if (!this.game.target) return;

        const x = this.game.target.x * this.tileSize + this.tileSize / 2;
        const y = this.game.target.y * this.tileSize + this.tileSize / 2;

        // Pulsing effect based on time
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;

        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.arc(x, y, 10 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.arc(x, y, 15 * pulse, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPlayer(player) {
        const px = player.x * this.tileSize + this.tileSize / 2;
        const py = player.y * this.tileSize + this.tileSize / 2;

        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(player.rotation);

        // Draw FOV (Field of View)
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, 150, -Math.PI / 4, Math.PI / 4); // 90 degree cone
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.2)'; // Faint light
        this.ctx.fill();

        // Draw Player Body (Circle)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = '#3498db';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw Direction Indicator (Arrow)
        this.ctx.beginPath();
        this.ctx.moveTo(10, -5);
        this.ctx.lineTo(20, 0);
        this.ctx.lineTo(10, 5);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();

        this.ctx.restore();
    }
}

