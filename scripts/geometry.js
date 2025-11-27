// geometry.js - Reusable geometry drawing functions for Mathematics Hub

const MHGeometry = {
    // Draw a quadratic function graph
    drawQuadraticGraph: function(canvasId, a = 1, b = 0, c = -4) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 350;
        const height = canvas.height = 250;
        
        // Force LTR direction for canvas
        canvas.style.direction = 'ltr';
        canvas.setAttribute('dir', 'ltr');
        
        // Clear canvas with fixed white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Set up coordinate system
        const originX = width / 2;
        const originY = height / 2;
        const scale = 20;
        
        // Draw grid with fixed colors
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = originX % scale; x < width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = originY % scale; y < height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw axes with fixed colors
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 1.5;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();
        
        // Draw axis numbers and labels - force LTR text rendering
        ctx.fillStyle = '#2C3E50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // X-axis numbers
        for (let x = -8; x <= 8; x += 2) {
            if (x === 0) continue;
            const pixelX = originX + x * scale;
            // Force LTR text rendering for numbers
            ctx.save();
            ctx.direction = 'ltr';
            ctx.fillText(x.toString(), pixelX, originY + 12);
            ctx.restore();
        }
        
        // Y-axis numbers
        for (let y = -6; y <= 6; y += 2) {
            if (y === 0) continue;
            const pixelY = originY - y * scale;
            // Force LTR text rendering for numbers
            ctx.save();
            ctx.direction = 'ltr';
            ctx.fillText(y.toString(), originX - 12, pixelY);
            ctx.restore();
        }
        
        // Origin label (0) - force LTR
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('0', originX - 8, originY + 12);
        ctx.restore();
        
        // Axis labels - force LTR
        ctx.font = '12px Arial';
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('x', width - 10, originY - 10);
        ctx.fillText('y', originX + 10, 10);
        ctx.restore();
        
        // Draw quadratic function with fixed color
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        let firstPoint = true;
        for (let pixelX = 0; pixelX < width; pixelX++) {
            const x = (pixelX - originX) / scale;
            const y = a * x * x + b * x + c;
            const pixelY = originY - y * scale;
            
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        
        ctx.stroke();
        
        // Mark vertex with fixed color
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX * vertexX + b * vertexX + c;
        const vertexPixelX = originX + vertexX * scale;
        const vertexPixelY = originY - vertexY * scale;
        
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(vertexPixelX, vertexPixelY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Mark and label x-intercepts with LTR protection
        const discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            
            [x1, x2].forEach((x, index) => {
                const interceptPixelX = originX + x * scale;
                const interceptPixelY = originY;
                
                ctx.fillStyle = '#E74C3C';
                ctx.beginPath();
                ctx.arc(interceptPixelX, interceptPixelY, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Label intercept points with LTR protection
                ctx.fillStyle = '#2C3E50';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.save();
                ctx.direction = 'ltr';
                ctx.fillText(`(${x.toFixed(1)}, 0)`, interceptPixelX, interceptPixelY - 15);
                ctx.restore();
            });
        }
    },

    // Draw a triangle with vertices and measurements
    drawTriangle: function(canvasId, x1 = 80, y1 = 60, x2 = 60, y2 = 160, x3 = 160, y3 = 160) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 280;
        const height = canvas.height = 220;
        
        // Force LTR direction for canvas
        canvas.style.direction = 'ltr';
        canvas.setAttribute('dir', 'ltr');
        
        // Clear canvas with fixed white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw triangle with fixed colors
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.stroke();
        
        // Fill triangle with fixed semi-transparent color
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.fill();
        
        // Mark and label vertices with fixed color and LTR protection
        ctx.fillStyle = '#E74C3C';
        const vertices = [
            [x1, y1, 'A'],
            [x2, y2, 'B'], 
            [x3, y3, 'C']
        ];
        
        vertices.forEach(([x, y, label]) => {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Label vertex with LTR protection
            ctx.fillStyle = '#2C3E50';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let offsetX = 0, offsetY = 0;
            if (label === 'A') {
                offsetY = -15;
            } else if (label === 'B') {
                offsetX = -15;
            } else if (label === 'C') {
                offsetX = 15;
            }
            
            // Force LTR for labels
            ctx.save();
            ctx.direction = 'ltr';
            ctx.fillText(label, x + offsetX, y + offsetY);
            ctx.restore();
            ctx.fillStyle = '#E74C3C';
        });
        
        // Add side length labels with fixed colors and LTR protection
        ctx.fillStyle = '#2C3E50';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        
        const midAB = [(x1 + x2) / 2, (y1 + y2) / 2];
        const midBC = [(x2 + x3) / 2, (y2 + y3) / 2];
        const midCA = [(x3 + x1) / 2, (y3 + y1) / 2];
        
        const sideAB = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const sideBC = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
        const sideCA = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));
        
        // Draw side labels with LTR protection
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText(`${Math.round(sideAB)}`, midAB[0] - 5, midAB[1] - 8);
        ctx.fillText(`${Math.round(sideBC)}`, midBC[0], midBC[1] + 15);
        ctx.fillText(`${Math.round(sideCA)}`, midCA[0] + 5, midCA[1] + 15);
        ctx.restore();
        
        // Mark right angle if it's a right triangle
        const sides = [sideAB, sideBC, sideCA].sort((a, b) => a - b);
        if (Math.abs(sides[2] * sides[2] - (sides[0] * sides[0] + sides[1] * sides[1])) < 0.1) {
            ctx.strokeStyle = '#2C3E50';
            ctx.lineWidth = 1.5;
            const rightAngleSize = 8;
            
            let rightAngleVertex;
            if (Math.abs(sideAB * sideAB + sideBC * sideBC - sideCA * sideCA) < 0.1) {
                rightAngleVertex = [x3, y3];
            } else if (Math.abs(sideAB * sideAB + sideCA * sideCA - sideBC * sideBC) < 0.1) {
                rightAngleVertex = [x2, y2];
            } else {
                rightAngleVertex = [x1, y1];
            }
            
            ctx.beginPath();
            ctx.moveTo(rightAngleVertex[0] - rightAngleSize, rightAngleVertex[1] - rightAngleSize);
            ctx.lineTo(rightAngleVertex[0] - rightAngleSize, rightAngleVertex[1]);
            ctx.lineTo(rightAngleVertex[0], rightAngleVertex[1] - rightAngleSize);
            ctx.stroke();
        }
    },

    // Draw a circle with radius and center
    drawCircle: function(canvasId, centerX = 100, centerY = 100, radius = 50) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 250;
        const height = canvas.height = 250;
        
        // Force LTR direction for canvas
        canvas.style.direction = 'ltr';
        canvas.setAttribute('dir', 'ltr');
        
        // Clear canvas with fixed white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw circle with fixed colors
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Fill circle with fixed semi-transparent color
        ctx.fillStyle = 'rgba(52, 152, 219, 0.05)';
        ctx.fill();
        
        // Draw center point and label it O with LTR protection
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label center as O with LTR protection
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('O', centerX - 12, centerY - 12);
        ctx.restore();
        
        // Draw a point on the circumference and label it A with LTR protection
        const pointAX = centerX + radius;
        const pointAY = centerY;
        
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(pointAX, pointAY, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label point A with LTR protection
        ctx.fillStyle = '#2C3E50';
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('A', pointAX + 12, pointAY);
        ctx.restore();
        
        // Draw radius line OA with fixed color and style
        ctx.strokeStyle = '#95A5A6';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pointAX, pointAY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Add radius label with LTR protection
        ctx.fillStyle = '#2C3E50';
        ctx.font = '11px Arial';
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText(`r = ${radius}`, centerX + radius / 2, centerY - 10);
        ctx.restore();
        
        // Draw diameter for better visualization
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    // Draw a coordinate plane with grid
    drawCoordinatePlane: function(canvasId, width = 400, height = 300, scale = 20) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        // Force LTR direction for canvas
        canvas.style.direction = 'ltr';
        canvas.setAttribute('dir', 'ltr');
        
        // Clear canvas with fixed white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        const originX = width / 2;
        const originY = height / 2;
        
        // Draw grid
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = originX % scale; x < width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = originY % scale; y < height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 1.5;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, originY);
            ctx.lineTo(width, originY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();
        
        // Draw axis labels and numbers
        ctx.fillStyle = '#2C3E50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // X-axis numbers
        for (let x = -Math.floor(width/(2*scale)); x <= Math.floor(width/(2*scale)); x += 2) {
            if (x === 0) continue;
            const pixelX = originX + x * scale;
            ctx.save();
            ctx.direction = 'ltr';
            ctx.fillText(x.toString(), pixelX, originY + 12);
            ctx.restore();
        }
        
        // Y-axis numbers
        for (let y = -Math.floor(height/(2*scale)); y <= Math.floor(height/(2*scale)); y += 2) {
            if (y === 0) continue;
            const pixelY = originY - y * scale;
            ctx.save();
            ctx.direction = 'ltr';
            ctx.fillText(y.toString(), originX - 12, pixelY);
            ctx.restore();
        }
        
        // Origin label
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('0', originX - 8, originY + 12);
        ctx.restore();
        
        // Axis labels
        ctx.font = '12px Arial';
        ctx.save();
        ctx.direction = 'ltr';
        ctx.fillText('x', width - 10, originY - 10);
        ctx.fillText('y', originX + 10, 10);
        ctx.restore();
    },

    // Draw a linear function on coordinate plane
    drawLinearFunction: function(canvasId, m = 1, b = 0, color = '#E74C3C') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const originX = width / 2;
        const originY = height / 2;
        const scale = 20;
        
        // Draw the linear function
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        let firstPoint = true;
        for (let pixelX = 0; pixelX < width; pixelX++) {
            const x = (pixelX - originX) / scale;
            const y = m * x + b;
            const pixelY = originY - y * scale;
            
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        
        ctx.stroke();
        
        // Mark y-intercept if visible
        if (b !== 0) {
            const interceptPixelY = originY - b * scale;
            if (interceptPixelY >= 0 && interceptPixelY <= height) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(originX, interceptPixelY, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Label y-intercept
                ctx.fillStyle = '#2C3E50';
                ctx.font = '10px Arial';
                ctx.save();
                ctx.direction = 'ltr';
                ctx.fillText(`(0, ${b})`, originX + 15, interceptPixelY);
                ctx.restore();
            }
        }
    },

    // Initialize all geometry canvases on page
    initializeGeometry: function() {
        // Force LTR on geometry containers and items
        document.querySelectorAll('.MH-geometry-container, .MH-geometry-item').forEach(element => {
            element.style.direction = 'ltr';
            element.setAttribute('dir', 'ltr');
        });
        
        // Draw geometry elements if their canvases exist
        if (document.getElementById('quadraticGraph')) {
            this.drawQuadraticGraph('quadraticGraph');
        }
        if (document.getElementById('triangleCanvas')) {
            this.drawTriangle('triangleCanvas');
        }
        if (document.getElementById('circleCanvas')) {
            this.drawCircle('circleCanvas');
        }
    },

    // Redraw all geometry elements (useful after language changes)
    redrawGeometry: function() {
        setTimeout(() => {
            this.initializeGeometry();
        }, 200);
    }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        MHGeometry.initializeGeometry();
    });
} else {
    MHGeometry.initializeGeometry();
}