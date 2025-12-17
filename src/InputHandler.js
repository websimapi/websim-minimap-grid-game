export class InputHandler {
    constructor(canvas, camera, game) {
        this.canvas = canvas;
        this.camera = camera;
        this.game = game;

        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.dragStart = { x: 0, y: 0 };
        this.dragThreshold = 15; // Pixels to move before counting as a drag
        this.hasDragged = false;

        // Pinch Zoom variables
        this.initialPinchDistance = null;
        this.initialZoom = null;

        this.setupEvents();
    }

    setupEvents() {
        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', (e) => this.onPointerUp(e.clientX, e.clientY));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    // --- Core Logic ---

    onPointerDown(x, y) {
        this.isDragging = true;
        this.hasDragged = false;
        this.lastMouse = { x, y };
        this.dragStart = { x, y };
    }

    onPointerMove(x, y) {
        if (!this.isDragging) return;

        const dx = x - this.lastMouse.x;
        const dy = y - this.lastMouse.y;

        // Check if we've exceeded the drag threshold
        const totalDist = Math.hypot(x - this.dragStart.x, y - this.dragStart.y);
        if (totalDist > this.dragThreshold) {
            this.hasDragged = true;
        }

        if (this.hasDragged) {
            // Pan camera
            this.camera.x -= dx / this.camera.zoom;
            this.camera.y -= dy / this.camera.zoom;
        }

        this.lastMouse = { x, y };
    }

    onPointerUp(x, y) {
        if (this.isDragging && !this.hasDragged) {
            // It was a click/tap
            const worldPos = this.screenToWorld(x, y);
            this.game.moveTo(worldPos);
        }
        this.isDragging = false;
        this.initialPinchDistance = null;
    }

    onWheel(e) {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const newZoom = this.camera.zoom - (e.deltaY * zoomSensitivity * this.camera.zoom);
        this.camera.zoom = Math.max(0.1, Math.min(5.0, newZoom));
    }

    // --- Touch Logic ---

    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            // Pinch start
            this.isDragging = false;
            this.initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            this.initialZoom = this.camera.zoom;
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2 && this.initialPinchDistance) {
            // Pinch Zoom
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = currentDist / this.initialPinchDistance;
            
            let newZoom = this.initialZoom * scale;
            this.camera.zoom = Math.max(0.1, Math.min(5.0, newZoom));
        }
    }

    onTouchEnd(e) {
        if (e.touches.length === 0) {
            // Use the last known coordinates for the click check
            this.onPointerUp(this.lastMouse.x, this.lastMouse.y);
        }
    }

    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const relativeX = screenX - rect.left;
        const relativeY = screenY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Offset from center, divide by zoom, add camera position
        const worldX = (relativeX - centerX) / this.camera.zoom + this.camera.x;
        const worldY = (relativeY - centerY) / this.camera.zoom + this.camera.y;

        return { x: worldX, y: worldY };
    }
}

