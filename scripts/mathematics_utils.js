// Mathematics utility functions for linear equations

class LinearFunctionUtils {
    constructor() {
        this.currentM = 2;
        this.currentB = -3;
    }

    // Calculate y from x using y = mx + b
    calculateY(m, b, x) {
        return m * x + b;
    }

    // Calculate x from y using x = (y - b) / m
    calculateX(m, b, y) {
        if (m === 0) {
            throw new Error("Cannot find x: slope is 0 (horizontal line)");
        }
        return (y - b) / m;
    }

    // Calculate slope and intercept from two points
    calculateSlopeFromPoints(x1, y1, x2, y2) {
        if (x1 === x2) {
            throw new Error("Cannot calculate slope: x-coordinates are equal (vertical line)");
        }
        
        const m = (y2 - y1) / (x2 - x1);
        const b = y1 - m * x1;
        
        return { m, b };
    }

    // Format number for display (remove trailing .0)
    formatNumber(num) {
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    }

    // Get the equation string
    getEquationString(m, b) {
        return `y = ${this.formatNumber(m)}x ${b >= 0 ? '+' : ''} ${this.formatNumber(b)}`;
    }

    // Draw grid lines
    drawGrid(ctx, width, height, centerX, centerY, scale) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = centerX % scale; x < width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = centerY % scale; y < height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Draw coordinate axes
    drawAxes(ctx, width, height, centerX, centerY) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText('x', width - 10, centerY - 5);
        ctx.fillText('y', centerX + 5, 10);
    }

    // Draw the linear function line
    drawFunctionLine(ctx, width, height, centerX, centerY, scale, m, b) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let pixelX = 0; pixelX < width; pixelX++) {
            const x = (pixelX - centerX) / scale;
            const y = m * x + b;
            const pixelY = centerY - (y * scale);
            
            if (pixelX === 0) {
                ctx.moveTo(pixelX, pixelY);
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        
        ctx.stroke();
        
        // Add equation label
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        const equation = this.getEquationString(m, b);
        ctx.fillText(equation, 20, 30);
    }

    // Main function to draw the linear graph
    drawLinearFunction(m, b, canvasId = 'graphCanvas') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 20; // pixels per unit
        
        // Draw grid and axes
        this.drawGrid(ctx, width, height, centerX, centerY, scale);
        this.drawAxes(ctx, width, height, centerX, centerY);
        
        // Draw the function line
        this.drawFunctionLine(ctx, width, height, centerX, centerY, scale, m, b);
        
        // Update current values
        this.currentM = m;
        this.currentB = b;
        
        return this.getEquationString(m, b);
    }

    // Highlight a point on the graph
    highlightPoint(x, y, color = 'red', canvasId = 'graphCanvas') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 20;
        
        const pixelX = centerX + (x * scale);
        const pixelY = centerY - (y * scale);
        
        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw coordinates label
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        ctx.fillText(`(${this.formatNumber(x)}, ${this.formatNumber(y)})`, pixelX + 8, pixelY - 8);
    }

    // Get current function parameters
    getCurrentFunction() {
        return { m: this.currentM, b: this.currentB };
    }

    // Set current function parameters
    setCurrentFunction(m, b) {
        this.currentM = m;
        this.currentB = b;
    }
}

// Create global instance
const mathUtils = new LinearFunctionUtils();