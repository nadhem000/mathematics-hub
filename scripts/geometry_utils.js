// geometry_utils.js - Geometry utility functions for triangles, circles, vectors

class GeometryUtils {
    constructor() {
        this.currentTheme = 'light';
        this.currentLanguage = 'en';
	}
	
    // Get CSS variable value
    getCssVariable(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	}
	
    // Set current theme
    setTheme(theme) {
        this.currentTheme = theme;
	}
	
    // Set current language
    setLanguage(lang) {
        this.currentLanguage = lang;
	}
	
    // Format number for display
    formatNumber(num, decimals = 1) {
        if (num % 1 === 0) return num.toString();
        return num.toFixed(decimals);
	}
	
    // Convert math coordinates to pixel coordinates
    mathToPixel(x, y, centerX, centerY, scale) {
        return {
            pixelX: centerX + (x * scale),
            pixelY: centerY - (y * scale)
		};
	}
	
    // Convert pixel coordinates to math coordinates
    pixelToMath(pixelX, pixelY, centerX, centerY, scale) {
        return {
            x: (pixelX - centerX) / scale,
            y: (centerY - pixelY) / scale
		};
	}
	
    // Draw coordinate system with grid
    drawCoordinateSystem(ctx, width, height, centerX, centerY, scale) {
        const gridColor = this.getCssVariable('--MH-geo-grid-color');
        const axisColor = this.getCssVariable('--MH-geo-axis-color');
        const textColor = this.getCssVariable('--MH-geo-text-color');
        
        // Clear canvas with theme background
        const bgColor = this.getCssVariable('--MH-geo-bg');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
		
        // Draw grid
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
		
        // Calculate visible range
        const xMin = -centerX / scale;
        const xMax = (width - centerX) / scale;
        const yMin = -centerY / scale;
        const yMax = (height - centerY) / scale;
		
        // Vertical grid lines
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            if (x === 0) continue;
            const pixelX = centerX + (x * scale);
            
            ctx.beginPath();
            ctx.moveTo(pixelX, 0);
            ctx.lineTo(pixelX, height);
            ctx.stroke();
            
            ctx.fillText(this.formatNumber(x), pixelX, centerY + 15);
		}
		
        // Horizontal grid lines
        for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
            if (y === 0) continue;
            const pixelY = centerY - (y * scale);
            
            ctx.beginPath();
            ctx.moveTo(0, pixelY);
            ctx.lineTo(width, pixelY);
            ctx.stroke();
            
            ctx.textAlign = 'right';
            ctx.fillText(this.formatNumber(y), centerX - 8, pixelY);
            ctx.textAlign = 'center';
		}
		
        // Draw axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 2;
		
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
		
        // Origin label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', centerX - 5, centerY + 5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
		
        // Draw arrowheads
        this.drawArrowhead(ctx, width, centerY, Math.PI, axisColor);
        this.drawArrowhead(ctx, centerX, 0, -Math.PI/2, axisColor);
	}
	
    // Draw arrowhead
    drawArrowhead(ctx, x, y, angle, color) {
        const size = 8;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size/2);
        ctx.lineTo(-size, size/2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
	}
	
    // TRIANGLE FUNCTIONS
	
    // Draw triangle from three points
    drawTriangle(ctx, pointA, pointB, pointC, centerX, centerY, scale, options = {}) {
        const defaultOptions = {
            fillColor: this.getCssVariable('--primary-light') + '40', // Semi-transparent
            strokeColor: this.getCssVariable('--primary'),
            lineWidth: 2,
            fill: true,
            stroke: true,
            labelPoints: false,
            pointLabels: ['A', 'B', 'C'],
            showAngles: false,
            showSides: false
		};
		
        const opts = { ...defaultOptions, ...options };
		
        // Convert math coordinates to pixel coordinates
        const pixelA = this.mathToPixel(pointA.x, pointA.y, centerX, centerY, scale);
        const pixelB = this.mathToPixel(pointB.x, pointB.y, centerX, centerY, scale);
        const pixelC = this.mathToPixel(pointC.x, pointC.y, centerX, centerY, scale);
		
        // Draw filled triangle
        if (opts.fill) {
            ctx.fillStyle = opts.fillColor;
            ctx.beginPath();
            ctx.moveTo(pixelA.pixelX, pixelA.pixelY);
            ctx.lineTo(pixelB.pixelX, pixelB.pixelY);
            ctx.lineTo(pixelC.pixelX, pixelC.pixelY);
            ctx.closePath();
            ctx.fill();
		}
		
        // Draw triangle outline
        if (opts.stroke) {
            ctx.strokeStyle = opts.strokeColor;
            ctx.lineWidth = opts.lineWidth;
            ctx.beginPath();
            ctx.moveTo(pixelA.pixelX, pixelA.pixelY);
            ctx.lineTo(pixelB.pixelX, pixelB.pixelY);
            ctx.lineTo(pixelC.pixelX, pixelC.pixelY);
            ctx.closePath();
            ctx.stroke();
		}
		
        // Label points
        if (opts.labelPoints) {
            this.drawPointLabel(ctx, pixelA.pixelX, pixelA.pixelY, opts.pointLabels[0]);
            this.drawPointLabel(ctx, pixelB.pixelX, pixelB.pixelY, opts.pointLabels[1]);
            this.drawPointLabel(ctx, pixelC.pixelX, pixelC.pixelY, opts.pointLabels[2]);
		}
		
        // Show angles
        if (opts.showAngles) {
            this.drawAngle(ctx, pointA, pointB, pointC, centerX, centerY, scale);
            this.drawAngle(ctx, pointB, pointC, pointA, centerX, centerY, scale);
            this.drawAngle(ctx, pointC, pointA, pointB, centerX, centerY, scale);
		}
		
        // Show side lengths
        if (opts.showSides) {
            this.drawSideLength(ctx, pointA, pointB, centerX, centerY, scale);
            this.drawSideLength(ctx, pointB, pointC, centerX, centerY, scale);
            this.drawSideLength(ctx, pointC, pointA, centerX, centerY, scale);
		}
		
        return { points: [pointA, pointB, pointC], pixels: [pixelA, pixelB, pixelC] };
	}
	
    // Draw equilateral triangle
    drawEquilateralTriangle(ctx, center, sideLength, rotation = 0, centerX, centerY, scale, options = {}) {
        const height = (Math.sqrt(3) / 2) * sideLength;
        
        const pointA = {
            x: center.x - sideLength/2,
            y: center.y - height/3
		};
        
        const pointB = {
            x: center.x + sideLength/2,
            y: center.y - height/3
		};
        
        const pointC = {
            x: center.x,
            y: center.y + (2 * height/3)
		};
		
        // Apply rotation
        if (rotation !== 0) {
            return this.drawTriangle(ctx, 
                this.rotatePoint(pointA, center, rotation),
                this.rotatePoint(pointB, center, rotation),
                this.rotatePoint(pointC, center, rotation),
                centerX, centerY, scale, options
			);
		}
		
        return this.drawTriangle(ctx, pointA, pointB, pointC, centerX, centerY, scale, options);
	}
	
    // Draw right triangle
    drawRightTriangle(ctx, vertex, base, height, centerX, centerY, scale, options = {}) {
        const pointA = vertex;
        const pointB = { x: vertex.x + base, y: vertex.y };
        const pointC = { x: vertex.x, y: vertex.y + height };
		
        return this.drawTriangle(ctx, pointA, pointB, pointC, centerX, centerY, scale, {
            ...options,
            showAngles: true
		});
	}
	
    // CIRCLE FUNCTIONS
	
    // Draw circle
    drawCircle(ctx, center, radius, centerX, centerY, scale, options = {}) {
        const defaultOptions = {
            fillColor: this.getCssVariable('--secondary-light') + '40',
            strokeColor: this.getCssVariable('--secondary'),
            lineWidth: 2,
            fill: true,
            stroke: true,
            showCenter: true,
            showRadius: false,
            showDiameter: false,
            label: ''
		};
		
        const opts = { ...defaultOptions, ...options };
        const pixelCenter = this.mathToPixel(center.x, center.y, centerX, centerY, scale);
        const pixelRadius = radius * scale;
		
        // Draw filled circle
        if (opts.fill) {
            ctx.fillStyle = opts.fillColor;
            ctx.beginPath();
            ctx.arc(pixelCenter.pixelX, pixelCenter.pixelY, pixelRadius, 0, 2 * Math.PI);
            ctx.fill();
		}
		
        // Draw circle outline
        if (opts.stroke) {
            ctx.strokeStyle = opts.strokeColor;
            ctx.lineWidth = opts.lineWidth;
            ctx.beginPath();
            ctx.arc(pixelCenter.pixelX, pixelCenter.pixelY, pixelRadius, 0, 2 * Math.PI);
            ctx.stroke();
		}
		
        // Show center point
        if (opts.showCenter) {
            this.drawPoint(ctx, center, centerX, centerY, scale, {
                color: opts.strokeColor,
                radius: 4,
                label: 'O'
			});
		}
		
        // Show radius
        if (opts.showRadius) {
            this.drawRadius(ctx, center, radius, 0, centerX, centerY, scale);
		}
		
        // Show diameter
        if (opts.showDiameter) {
            this.drawDiameter(ctx, center, radius, 0, centerX, centerY, scale);
		}
		
        // Add label
        if (opts.label) {
            ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(opts.label, pixelCenter.pixelX, pixelCenter.pixelY - pixelRadius - 10);
		}
		
        return { center: pixelCenter, radius: pixelRadius };
	}
	
    // Draw radius line
    drawRadius(ctx, center, radius, angle, centerX, centerY, scale) {
        const pixelCenter = this.mathToPixel(center.x, center.y, centerX, centerY, scale);
        const endPoint = {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
		};
        const pixelEnd = this.mathToPixel(endPoint.x, endPoint.y, centerX, centerY, scale);
		
        ctx.strokeStyle = this.getCssVariable('--accent');
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(pixelCenter.pixelX, pixelCenter.pixelY);
        ctx.lineTo(pixelEnd.pixelX, pixelEnd.pixelY);
        ctx.stroke();
        ctx.setLineDash([]);
		
        // Add radius label
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const midX = (pixelCenter.pixelX + pixelEnd.pixelX) / 2;
        const midY = (pixelCenter.pixelY + pixelEnd.pixelY) / 2;
        ctx.fillText(`r = ${this.formatNumber(radius)}`, midX, midY - 8);
	}
	
    // Draw diameter line
    drawDiameter(ctx, center, radius, angle, centerX, centerY, scale) {
        const pixelCenter = this.mathToPixel(center.x, center.y, centerX, centerY, scale);
        const startPoint = {
            x: center.x - radius * Math.cos(angle),
            y: center.y - radius * Math.sin(angle)
		};
        const endPoint = {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
		};
        const pixelStart = this.mathToPixel(startPoint.x, startPoint.y, centerX, centerY, scale);
        const pixelEnd = this.mathToPixel(endPoint.x, endPoint.y, centerX, centerY, scale);
		
        ctx.strokeStyle = this.getCssVariable('--warning');
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(pixelStart.pixelX, pixelStart.pixelY);
        ctx.lineTo(pixelEnd.pixelX, pixelEnd.pixelY);
        ctx.stroke();
        ctx.setLineDash([]);
		
        // Add diameter label
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const midX = (pixelStart.pixelX + pixelEnd.pixelX) / 2;
        const midY = (pixelStart.pixelY + pixelEnd.pixelY) / 2;
        ctx.fillText(`d = ${this.formatNumber(2 * radius)}`, midX, midY - 8);
	}
	
    // VECTOR FUNCTIONS
	
    // Draw vector from start to end point
    drawVector(ctx, start, end, centerX, centerY, scale, options = {}) {
        const defaultOptions = {
            color: this.getCssVariable('--MH-geo-line1-color'),
            lineWidth: 3,
            arrowheadSize: 10,
            arrowheadAngle: Math.PI / 6,
            label: '',
            showComponents: false,
            showMagnitude: false
		};
		
        const opts = { ...defaultOptions, ...options };
        const pixelStart = this.mathToPixel(start.x, start.y, centerX, centerY, scale);
        const pixelEnd = this.mathToPixel(end.x, end.y, centerX, centerY, scale);
		
        // Draw vector line
        ctx.strokeStyle = opts.color;
        ctx.lineWidth = opts.lineWidth;
        ctx.beginPath();
        ctx.moveTo(pixelStart.pixelX, pixelStart.pixelY);
        ctx.lineTo(pixelEnd.pixelX, pixelEnd.pixelY);
        ctx.stroke();
		
        // Draw arrowhead
        this.drawVectorArrowhead(ctx, pixelStart, pixelEnd, opts.arrowheadSize, opts.arrowheadAngle, opts.color);
		
        // Draw start point
        this.drawPoint(ctx, start, centerX, centerY, scale, {
            color: opts.color,
            radius: 3
		});
		
        // Add vector label
        if (opts.label) {
            ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            const midX = (pixelStart.pixelX + pixelEnd.pixelX) / 2;
            const midY = (pixelStart.pixelY + pixelEnd.pixelY) / 2;
            ctx.fillText(opts.label, midX, midY - 15);
		}
		
        // Show components
        if (opts.showComponents) {
            this.drawVectorComponents(ctx, start, end, centerX, centerY, scale);
		}
		
        // Show magnitude
        if (opts.showMagnitude) {
            this.drawVectorMagnitude(ctx, start, end, centerX, centerY, scale);
		}
		
        return { 
            vector: { x: end.x - start.x, y: end.y - start.y },
            magnitude: this.calculateDistance(start, end)
		};
	}
	
    // Draw vector arrowhead
    drawVectorArrowhead(ctx, pixelStart, pixelEnd, size, angle, color) {
        const dx = pixelEnd.pixelX - pixelStart.pixelX;
        const dy = pixelEnd.pixelY - pixelStart.pixelY;
        const vectorAngle = Math.atan2(dy, dx);
		
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(pixelEnd.pixelX, pixelEnd.pixelY);
        ctx.lineTo(
            pixelEnd.pixelX - size * Math.cos(vectorAngle - angle),
            pixelEnd.pixelY - size * Math.sin(vectorAngle - angle)
		);
        ctx.lineTo(
            pixelEnd.pixelX - size * Math.cos(vectorAngle + angle),
            pixelEnd.pixelY - size * Math.sin(vectorAngle + angle)
		);
        ctx.closePath();
        ctx.fill();
	}
	
    // Draw vector components
    drawVectorComponents(ctx, start, end, centerX, centerY, scale) {
        const pixelStart = this.mathToPixel(start.x, start.y, centerX, centerY, scale);
        const pixelEnd = this.mathToPixel(end.x, end.y, centerX, centerY, scale);
		
        // X component
        ctx.strokeStyle = this.getCssVariable('--MH-geo-line1-color') + '80';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(pixelStart.pixelX, pixelStart.pixelY);
        ctx.lineTo(pixelEnd.pixelX, pixelStart.pixelY);
        ctx.stroke();
		
        // Y component
        ctx.beginPath();
        ctx.moveTo(pixelEnd.pixelX, pixelStart.pixelY);
        ctx.lineTo(pixelEnd.pixelX, pixelEnd.pixelY);
        ctx.stroke();
        ctx.setLineDash([]);
		
        // Component labels
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        
        // X component label
        const xComp = end.x - start.x;
        ctx.fillText(
            `x = ${this.formatNumber(xComp)}`, 
            (pixelStart.pixelX + pixelEnd.pixelX) / 2, 
            pixelStart.pixelY - 10
		);
		
        // Y component label
        const yComp = end.y - start.y;
        ctx.fillText(
            `y = ${this.formatNumber(yComp)}`, 
            pixelEnd.pixelX + 10, 
            (pixelStart.pixelY + pixelEnd.pixelY) / 2
		);
	}
	
    // Draw vector magnitude
    drawVectorMagnitude(ctx, start, end, centerX, centerY, scale) {
        const magnitude = this.calculateDistance(start, end);
        const pixelStart = this.mathToPixel(start.x, start.y, centerX, centerY, scale);
        const pixelEnd = this.mathToPixel(end.x, end.y, centerX, centerY, scale);
		
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        const midX = (pixelStart.pixelX + pixelEnd.pixelX) / 2;
        const midY = (pixelStart.pixelY + pixelEnd.pixelY) / 2;
        
        // Calculate perpendicular offset for label
        const dx = pixelEnd.pixelX - pixelStart.pixelX;
        const dy = pixelEnd.pixelY - pixelStart.pixelY;
        const angle = Math.atan2(dy, dx);
        const offset = 20;
        
        const labelX = midX + offset * Math.cos(angle + Math.PI/2);
        const labelY = midY + offset * Math.sin(angle + Math.PI/2);
        
        ctx.fillText(`|v| = ${this.formatNumber(magnitude)}`, labelX, labelY);
	}

// DRAW POLYGON
// Draw polygon from array of points
drawPolygon(ctx, points, centerX, centerY, scale, options = {}) {
    const defaultOptions = {
        fillColor: this.getCssVariable('--primary-light') + '40', // Semi-transparent
        strokeColor: this.getCssVariable('--primary'),
        lineWidth: 2,
        fill: true,
        stroke: true,
        labelPoints: false,
        pointLabels: [], // Array of labels for each point
        showSides: false
    };

    const opts = { ...defaultOptions, ...options };

    // Convert math coordinates to pixel coordinates
    const pixelPoints = points.map(point => 
        this.mathToPixel(point.x, point.y, centerX, centerY, scale)
    );

    // Draw filled polygon
    if (opts.fill && pixelPoints.length >= 3) {
        ctx.fillStyle = opts.fillColor;
        ctx.beginPath();
        ctx.moveTo(pixelPoints[0].pixelX, pixelPoints[0].pixelY);
        for (let i = 1; i < pixelPoints.length; i++) {
            ctx.lineTo(pixelPoints[i].pixelX, pixelPoints[i].pixelY);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Draw polygon outline
    if (opts.stroke && pixelPoints.length >= 3) {
        ctx.strokeStyle = opts.strokeColor;
        ctx.lineWidth = opts.lineWidth;
        ctx.beginPath();
        ctx.moveTo(pixelPoints[0].pixelX, pixelPoints[0].pixelY);
        for (let i = 1; i < pixelPoints.length; i++) {
            ctx.lineTo(pixelPoints[i].pixelX, pixelPoints[i].pixelY);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Label points
    if (opts.labelPoints && opts.pointLabels.length >= points.length) {
        for (let i = 0; i < points.length; i++) {
            this.drawPointLabel(ctx, pixelPoints[i].pixelX, pixelPoints[i].pixelY, opts.pointLabels[i]);
        }
    }

    // Show side lengths
    if (opts.showSides) {
        for (let i = 0; i < points.length; i++) {
            const nextIndex = (i + 1) % points.length;
            this.drawSideLength(ctx, points[i], points[nextIndex], centerX, centerY, scale);
        }
    }

    return { points: points, pixels: pixelPoints };
}
    // HELPER FUNCTIONS
	
    // Draw a point
    drawPoint(ctx, point, centerX, centerY, scale, options = {}) {
        const defaultOptions = {
            color: this.getCssVariable('--MH-geo-point-color'),
            radius: 5,
            label: '',
            showCoordinates: false
		};
		
        const opts = { ...defaultOptions, ...options };
        const pixelPoint = this.mathToPixel(point.x, point.y, centerX, centerY, scale);
		
        // Draw point
        ctx.fillStyle = opts.color;
        ctx.beginPath();
        ctx.arc(pixelPoint.pixelX, pixelPoint.pixelY, opts.radius, 0, 2 * Math.PI);
        ctx.fill();
		
        // Draw border for better visibility
        ctx.strokeStyle = this.getCssVariable('--MH-geo-bg');
        ctx.lineWidth = 2;
        ctx.stroke();
		
        // Add label
        if (opts.label) {
            this.drawPointLabel(ctx, pixelPoint.pixelX, pixelPoint.pixelY, opts.label);
		}
		
        // Show coordinates
        if (opts.showCoordinates) {
            ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(
                `(${this.formatNumber(point.x)}, ${this.formatNumber(point.y)})`,
                pixelPoint.pixelX + 8,
                pixelPoint.pixelY + 8
			);
		}
	}
	
    // Draw point label
    drawPointLabel(ctx, x, y, label) {
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y - 15);
	}
	
    // Draw angle at vertex B of triangle ABC
    drawAngle(ctx, pointA, pointB, pointC, centerX, centerY, scale) {
        const pixelB = this.mathToPixel(pointB.x, pointB.y, centerX, centerY, scale);
        
        const angle = this.calculateAngle(pointA, pointB, pointC);
        const radius = 20;
		
        // Draw angle arc
        ctx.strokeStyle = this.getCssVariable('--warning');
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const startAngle = Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
        const endAngle = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x);
        
        ctx.arc(pixelB.pixelX, pixelB.pixelY, radius, startAngle, endAngle);
        ctx.stroke();
		
        // Add angle label
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        const labelAngle = (startAngle + endAngle) / 2;
        const labelX = pixelB.pixelX + (radius + 8) * Math.cos(labelAngle);
        const labelY = pixelB.pixelY + (radius + 8) * Math.sin(labelAngle);
        
        ctx.fillText(`${this.formatNumber(angle * 180 / Math.PI)}°`, labelX, labelY);
	}
	
    // Draw side length between two points
    drawSideLength(ctx, pointA, pointB, centerX, centerY, scale) {
        const pixelA = this.mathToPixel(pointA.x, pointA.y, centerX, centerY, scale);
        const pixelB = this.mathToPixel(pointB.x, pointB.y, centerX, centerY, scale);
        
        const distance = this.calculateDistance(pointA, pointB);
		
        ctx.fillStyle = this.getCssVariable('--MH-geo-text-color');
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        const midX = (pixelA.pixelX + pixelB.pixelX) / 2;
        const midY = (pixelA.pixelY + pixelB.pixelY) / 2;
        
        // Calculate perpendicular offset
        const dx = pixelB.pixelX - pixelA.pixelX;
        const dy = pixelB.pixelY - pixelA.pixelY;
        const angle = Math.atan2(dy, dx);
        const offset = 15;
        
        const labelX = midX + offset * Math.cos(angle + Math.PI/2);
        const labelY = midY + offset * Math.sin(angle + Math.PI/2);
        
        ctx.fillText(this.formatNumber(distance), labelX, labelY);
	}
	
    // UTILITY CALCULATIONS
	
    // Calculate distance between two points
    calculateDistance(pointA, pointB) {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        return Math.sqrt(dx * dx + dy * dy);
	}
	
    // Calculate angle at vertex B of triangle ABC
    calculateAngle(pointA, pointB, pointC) {
        const BA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
        const BC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
        
        const dotProduct = BA.x * BC.x + BA.y * BC.y;
        const magnitudeBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y);
        const magnitudeBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y);
        
        return Math.acos(dotProduct / (magnitudeBA * magnitudeBC));
	}
	
    // Rotate point around center by angle (radians)
    rotatePoint(point, center, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const translatedX = point.x - center.x;
        const translatedY = point.y - center.y;
        
        return {
            x: translatedX * cos - translatedY * sin + center.x,
            y: translatedX * sin + translatedY * cos + center.y
		};
	}
	
    // Calculate vector operations
    vectorAdd(vectorA, vectorB) {
        return { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y };
	}
	
    vectorSubtract(vectorA, vectorB) {
        return { x: vectorA.x - vectorB.x, y: vectorA.y - vectorB.y };
	}
	
    vectorScale(vector, scalar) {
        return { x: vector.x * scalar, y: vector.y * scalar };
	}
	
    vectorDotProduct(vectorA, vectorB) {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
	}
	
    vectorMagnitude(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	}
	
    // Initialize canvas for geometry drawings
    initializeGeometryCanvas(canvasId, width = 600, height = 400) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return null;
		}
		
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 30;
		
        this.drawCoordinateSystem(ctx, width, height, centerX, centerY, scale);
		
        return { ctx, width, height, centerX, centerY, scale };
	}

// This method clears the canvas without drawing the coordinate system
clearCanvasWithoutCoordSystem(ctx, width, height) {
    const bgColor = this.getCssVariable('--MH-geo-bg');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
}
	
    // Clear specific canvas
    clearCanvas(canvasId, clearWithBackground = true) {
		const canvas = document.getElementById(canvasId);
		if (!canvas) return;
		
		const ctx = canvas.getContext('2d');
		if (clearWithBackground) {
			const bgColor = this.getCssVariable('--MH-geo-bg');
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			} else {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
	
    // Redraw all geometry when theme changes
    redrawOnThemeChange() {
        // This should be called when theme changes
        const geometryCanvases = document.querySelectorAll('[data-geometry-canvas]');
        geometryCanvases.forEach(canvas => {
            this.initializeGeometryCanvas(canvas.id);
            // Re-draw any stored geometry data here if needed
		});
	}
}


// Create global instance
const geometryUtils = new GeometryUtils();

// Event listeners for theme and language changes
document.addEventListener('themeChanged', function() {
    geometryUtils.setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    geometryUtils.redrawOnThemeChange();
});

window.addEventListener('languageChanged', function() {
    geometryUtils.setLanguage(document.documentElement.getAttribute('lang') || 'en');
});