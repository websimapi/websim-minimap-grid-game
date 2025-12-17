// Simple A* Pathfinding implementation
export class Pathfinder {
    constructor() {
        this.directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];
    }

    // Heuristic function (Manhattan distance)
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    findPath(start, end, bounds) {
        // Simple grid
        const key = (point) => `${point.x},${point.y}`;

        const openSet = [start];
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(key(start), 0);

        const fScore = new Map();
        fScore.set(key(start), this.heuristic(start, end));

        // Limit search
        let iterations = 0;
        const maxIterations = 5000; 

        while (openSet.length > 0) {
            iterations++;
            if (iterations > maxIterations) break;

            // Get node with lowest fScore
            let current = openSet.reduce((a, b) => 
                (fScore.get(key(a)) || Infinity) < (fScore.get(key(b)) || Infinity) ? a : b
            );

            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current, key);
            }

            // Remove current from openSet
            openSet.splice(openSet.indexOf(current), 1);

            for (let dir of this.directions) {
                const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
                
                // Bounds Check
                if (bounds) {
                    if (neighbor.x < 0 || neighbor.x >= bounds.width || 
                        neighbor.y < 0 || neighbor.y >= bounds.height) {
                        continue;
                    }
                }

                const neighborKey = key(neighbor);

                // Assuming cost of 1 for all moves
                const tentativeGScore = (gScore.get(key(current)) || Infinity) + 1;

                if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));
                    
                    if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return []; // No path found
    }

    reconstructPath(cameFrom, current, keyFunc) {
        const totalPath = [current];
        let currKey = keyFunc(current);
        
        while (cameFrom.has(currKey)) {
            current = cameFrom.get(currKey);
            currKey = keyFunc(current);
            totalPath.unshift(current);
        }
        return totalPath;
    }
}

