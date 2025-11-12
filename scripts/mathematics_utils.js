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
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
    }

    // Get the equation string
    getEquationString(m, b) {
        return `y = ${this.formatNumber(m)}x ${b >= 0 ? '+' : ''} ${this.formatNumber(b)}`;
    }

    // Draw grid lines with visible numbers - FIXED VERSION
    drawGrid(ctx, width, height, centerX, centerY, scale) {
        // Use theme-aware colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.strokeStyle = isDark ? '#444' : '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.fillStyle = isDark ? '#ccc' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate visible range
        const xMin = -centerX / scale;
        const xMax = (width - centerX) / scale;
        const yMin = -centerY / scale;
        const yMax = (height - centerY) / scale;
        
        // Draw vertical grid lines and numbers
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            if (x === 0) continue; // Skip 0 for x-axis (we'll handle it separately)
            
            const pixelX = centerX + (x * scale);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(pixelX, 0);
            ctx.lineTo(pixelX, height);
            ctx.stroke();
            
            // Draw number
            ctx.fillText(this.formatNumber(x), pixelX, centerY + 15);
        }
        
        // Draw horizontal grid lines and numbers
        for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
            if (y === 0) continue; // Skip 0 for y-axis (we'll handle it separately)
            
            const pixelY = centerY - (y * scale);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(0, pixelY);
            ctx.lineTo(width, pixelY);
            ctx.stroke();
            
            // Draw number
            ctx.textAlign = 'right';
            ctx.fillText(this.formatNumber(y), centerX - 8, pixelY);
            ctx.textAlign = 'center';
        }
        
        // Draw origin (0,0)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', centerX - 5, centerY + 5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    // Draw coordinate axes with better visibility
    drawAxes(ctx, width, height, centerX, centerY) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.strokeStyle = isDark ? '#ccc' : '#000000';
        ctx.lineWidth = 2;
        ctx.fillStyle = isDark ? '#ccc' : '#000000';
        ctx.font = '14px Arial';
        
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
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('x', width - 20, centerY + 10);
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('y', centerX + 10, 10);
        
        // Draw arrowheads
        this.drawArrowhead(ctx, width, centerY, Math.PI, isDark); // x-axis arrow
        this.drawArrowhead(ctx, centerX, 0, -Math.PI/2, isDark); // y-axis arrow
    }

    // Draw arrowhead for axes
    drawArrowhead(ctx, x, y, angle, isDark = false) {
        const size = 8;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size/2);
        ctx.lineTo(-size, size/2);
        ctx.closePath();
        ctx.fillStyle = isDark ? '#ccc' : '#000000';
        ctx.fill();
        ctx.restore();
    }

    // Draw the linear function line
    drawFunctionLine(ctx, width, height, centerX, centerY, scale, m, b, color = '#0066cc') {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Calculate start and end points that fit within the canvas
        const startX = -centerX / scale;
        const endX = (width - centerX) / scale;
        
        const startY = m * startX + b;
        const endY = m * endX + b;
        
        const pixelStartX = centerX + (startX * scale);
        const pixelStartY = centerY - (startY * scale);
        const pixelEndX = centerX + (endX * scale);
        const pixelEndY = centerY - (endY * scale);
        
        ctx.moveTo(pixelStartX, pixelStartY);
        ctx.lineTo(pixelEndX, pixelEndY);
        ctx.stroke();
    }

    // Main function to draw the linear graph
    drawLinearFunction(m, b, canvasId = 'graphCanvas') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }
        
        const ctx = canvas.getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Clear canvas with theme-aware background
        ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 30;
        
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
        const scale = 30;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const pixelX = centerX + (x * scale);
        const pixelY = centerY - (y * scale);
        
        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw a border for better visibility
        ctx.strokeStyle = isDark ? '#1a1a1a' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw coordinates label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`(${this.formatNumber(x)}, ${this.formatNumber(y)})`, pixelX + 8, pixelY - 8);
    }

    // Draw legend for equations
    drawLegend(ctx, equations, colors, width) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 14px Arial';
        
        // Draw semi-transparent background for legend
        ctx.fillStyle = isDark ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(10, 10, 200, equations.length * 25 + 10);
        
        // Draw border
        ctx.strokeStyle = isDark ? '#666' : '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 200, equations.length * 25 + 10);
        
        // Draw equations
        equations.forEach((equation, index) => {
            ctx.fillStyle = colors[index];
            ctx.fillText(equation, 30, 20 + index * 25);
            
            // Draw color indicator
            ctx.fillStyle = colors[index];
            ctx.fillRect(15, 23 + index * 25, 10, 10);
        });
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