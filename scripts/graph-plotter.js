// Advanced Graph Plotter with Math.js Integration
class GraphPlotter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graphs = [];
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.scale = 40;
        this.gridSize = 1;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupControls();
        this.draw();
    }

    setupCanvas() {
        // Set canvas dimensions
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Set canvas display size
        this.canvas.style.width = this.canvas.offsetWidth + 'px';
        this.canvas.style.height = this.canvas.offsetHeight + 'px';
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.setupCanvas();
            this.draw();
        }, 250));

        // Mouse events for panning
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    }

    setupControls() {
        // Plot button
        const plotBtn = document.getElementById('plotBtn');
        if (plotBtn) {
            plotBtn.addEventListener('click', () => this.plotFunction());
        }

        // Clear button
        const clearBtn = document.getElementById('clearGraph');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearGraphs());
        }

        // Export button
        const exportBtn = document.getElementById('exportGraph');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportGraph());
        }

        // Zoom controls
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        const resetView = document.getElementById('resetView');

        if (zoomIn) zoomIn.addEventListener('click', () => this.zoom(1.2));
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoom(0.8));
        if (resetView) resetView.addEventListener('click', () => this.resetView());

        // Template buttons
        const templateBtns = document.querySelectorAll('.template-btn');
        templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const expr = btn.getAttribute('data-expr');
                document.getElementById('functionInput').value = expr;
            });
        });

        // Range inputs
        const rangeInputs = ['xMin', 'xMax', 'yMin', 'yMax'];
        rangeInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.draw());
            }
        });

        // Color picker
        const colorPicker = document.getElementById('graphColor');
        if (colorPicker) {
            colorPicker.addEventListener('change', () => {
                if (this.graphs.length > 0) {
                    this.graphs[this.graphs.length - 1].color = colorPicker.value;
                    this.draw();
                }
            });
        }

        // Line width slider
        const lineWidth = document.getElementById('lineWidth');
        if (lineWidth) {
            lineWidth.addEventListener('input', () => {
                if (this.graphs.length > 0) {
                    this.graphs[this.graphs.length - 1].lineWidth = lineWidth.value;
                    this.draw();
                }
            });
        }
    }

    // Event Handlers
    handleMouseDown(e) {
        this.isDragging = true;
        this.dragStart.x = e.clientX - this.offset.x;
        this.dragStart.y = e.clientY - this.offset.y;
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            this.offset.x = e.clientX - this.dragStart.x;
            this.offset.y = e.clientY - this.dragStart.y;
            this.draw();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.isDragging = true;
        this.dragStart.x = touch.clientX - this.offset.x;
        this.dragStart.y = touch.clientY - this.offset.y;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            this.offset.x = touch.clientX - this.dragStart.x;
            this.offset.y = touch.clientY - this.dragStart.y;
            this.draw();
        }
    }

    handleTouchEnd() {
        this.isDragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        
        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        
        this.zoomAt(mouseX, mouseY, zoom);
    }

    // Core Graph Functions
    plotFunction(expression = null) {
        const functionInput = document.getElementById('functionInput');
        const expr = expression || functionInput.value.trim();
        const color = document.getElementById('graphColor').value;
        const lineWidth = document.getElementById('lineWidth').value || 2;

        if (!expr) {
            window.uiHandler?.showToast('Please enter a function to plot', 'warning');
            return;
        }

        try {
            // Validate and compile expression
            const compiledExpr = math.compile(expr);
            
            // Test the function with a sample value
            compiledExpr.evaluate({ x: 0 });
            
            const graph = {
                expression: expr,
                compiledExpr: compiledExpr,
                color: color,
                lineWidth: parseInt(lineWidth),
                points: []
            };

            this.graphs.push(graph);
            this.draw();
            
            window.uiHandler?.showToast('Function plotted successfully!', 'success');
            
        } catch (error) {
            console.error('Error plotting function:', error);
            window.uiHandler?.showToast(`Error: ${error.message}`, 'error');
        }
    }

    clearGraphs() {
        this.graphs = [];
        this.draw();
        window.uiHandler?.showToast('Graph cleared', 'info');
    }

    exportGraph() {
        // Create a temporary canvas for export (without controls)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Draw the graph on temporary canvas
        this.drawOnCanvas(tempCtx, tempCanvas.width, tempCanvas.height, true);
        
        // Export as PNG
        const link = document.createElement('a');
        link.download = `mathsmaster-graph-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        window.uiHandler?.showToast('Graph exported as PNG', 'success');
    }

    // Drawing Functions
    draw() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.animationId = requestAnimationFrame(() => {
            this.drawOnCanvas(this.ctx, this.canvas.offsetWidth, this.canvas.offsetHeight);
        });
    }

    drawOnCanvas(ctx, width, height, isExport = false) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card') || '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        // Draw coordinate system
        this.drawCoordinateSystem(ctx, width, height);
        
        // Draw all graphs
        this.graphs.forEach(graph => {
            this.drawFunction(ctx, graph, width, height);
        });
        
        // Draw info (only if not exporting)
        if (!isExport) {
            this.drawInfo(ctx, width, height);
        }
    }

    drawCoordinateSystem(ctx, width, height) {
        const centerX = width / 2 + this.offset.x;
        const centerY = height / 2 + this.offset.y;
        
        // Draw grid
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-disabled') || '#666666';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        // Vertical grid lines
        for (let x = centerX % this.scale; x < width; x += this.scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = centerY % this.scale; y < height; y += this.scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#a0a0a0';
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
        
        // Draw axis labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#a0a0a0';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // X-axis labels
        for (let x = centerX + this.scale; x < width; x += this.scale) {
            const value = (x - centerX) / this.scale;
            if (Math.abs(value) > 0.1) {
                ctx.fillText(this.formatNumber(value), x, centerY + 5);
            }
        }
        
        for (let x = centerX - this.scale; x > 0; x -= this.scale) {
            const value = (x - centerX) / this.scale;
            if (Math.abs(value) > 0.1) {
                ctx.fillText(this.formatNumber(value), x, centerY + 5);
            }
        }
        
        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let y = centerY + this.scale; y < height; y += this.scale) {
            const value = (centerY - y) / this.scale;
            if (Math.abs(value) > 0.1) {
                ctx.fillText(this.formatNumber(value), centerX - 5, y);
            }
        }
        
        for (let y = centerY - this.scale; y > 0; y -= this.scale) {
            const value = (centerY - y) / this.scale;
            if (Math.abs(value) > 0.1) {
                ctx.fillText(this.formatNumber(value), centerX - 5, y);
            }
        }
        
        // Draw origin label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', centerX - 5, centerY + 5);
    }

    drawFunction(ctx, graph, width, height) {
        const centerX = width / 2 + this.offset.x;
        const centerY = height / 2 + this.offset.y;
        
        try {
            ctx.strokeStyle = graph.color;
            ctx.lineWidth = graph.lineWidth;
            ctx.setLineDash([]);
            ctx.beginPath();
            
            let isFirstPoint = true;
            graph.points = [];
            
            for (let pixelX = 0; pixelX < width; pixelX++) {
                const x = (pixelX - centerX) / this.scale;
                
                try {
                    const y = graph.compiledExpr.evaluate({ x: x });
                    
                    if (typeof y === 'number' && isFinite(y)) {
                        const pixelY = centerY - y * this.scale;
                        
                        if (pixelY >= 0 && pixelY <= height) {
                            if (isFirstPoint) {
                                ctx.moveTo(pixelX, pixelY);
                                isFirstPoint = false;
                            } else {
                                ctx.lineTo(pixelX, pixelY);
                            }
                            
                            graph.points.push({ x: pixelX, y: pixelY, value: { x, y } });
                        } else {
                            isFirstPoint = true;
                        }
                    } else {
                        isFirstPoint = true;
                    }
                } catch (e) {
                    isFirstPoint = true;
                }
            }
            
            ctx.stroke();
            
        } catch (error) {
            console.error('Error drawing function:', error);
        }
    }

    drawInfo(ctx, width, height) {
        // Draw graph count info
        if (this.graphs.length > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#e0e0e0';
            ctx.font = '14px Inter';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Graphs: ${this.graphs.length}`, 10, 10);
            
            // Draw scale info
            ctx.textAlign = 'right';
            ctx.fillText(`Scale: 1 unit = ${this.scale}px`, width - 10, 10);
        }
    }

    // Utility Functions
    zoom(factor) {
        this.scale *= factor;
        this.draw();
    }

    zoomAt(x, y, factor) {
        const centerX = this.canvas.offsetWidth / 2 + this.offset.x;
        const centerY = this.canvas.offsetHeight / 2 + this.offset.y;
        
        const worldX = (x - centerX) / this.scale;
        const worldY = (centerY - y) / this.scale;
        
        this.scale *= factor;
        
        const newCenterX = x - worldX * this.scale;
        const newCenterY = y + worldY * this.scale;
        
        this.offset.x = newCenterX - this.canvas.offsetWidth / 2;
        this.offset.y = newCenterY - this.canvas.offsetHeight / 2;
        
        this.draw();
    }

    resetView() {
        this.offset = { x: 0, y: 0 };
        this.scale = 40;
        this.draw();
        window.uiHandler?.showToast('View reset', 'info');
    }

    formatNumber(num) {
        if (typeof num !== 'number') return num;
        
        // Handle very small numbers
        if (Math.abs(num) < 0.0001 && num !== 0) {
            return num.toExponential(2);
        }
        
        // Handle numbers that need scientific notation
        if (Math.abs(num) >= 1000000) {
            return num.toExponential(2);
        }
        
        // Format regular numbers
        if (Math.abs(num) < 10) {
            return parseFloat(num.toFixed(3));
        } else if (Math.abs(num) < 100) {
            return parseFloat(num.toFixed(2));
        } else {
            return parseFloat(num.toFixed(1));
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public Methods
    addFunction(expression, color = '#bb86fc', lineWidth = 2) {
        try {
            const compiledExpr = math.compile(expression);
            const graph = {
                expression: expression,
                compiledExpr: compiledExpr,
                color: color,
                lineWidth: lineWidth,
                points: []
            };
            this.graphs.push(graph);
            this.draw();
            return true;
        } catch (error) {
            console.error('Error adding function:', error);
            return false;
        }
    }

    removeFunction(index) {
        if (index >= 0 && index < this.graphs.length) {
            this.graphs.splice(index, 1);
            this.draw();
            return true;
        }
        return false;
    }

    getFunctionPoints(index) {
        if (index >= 0 && index < this.graphs.length) {
            return this.graphs[index].points;
        }
        return [];
    }

    evaluateFunction(index, x) {
        if (index >= 0 && index < this.graphs.length) {
            try {
                return this.graphs[index].compiledExpr.evaluate({ x: x });
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    // Advanced Features
    findRoots(index, interval = [-10, 10], precision = 0.001) {
        // Implementation of root finding using bisection method
        const roots = [];
        const step = 0.1;
        
        for (let x = interval[0]; x < interval[1]; x += step) {
            const y1 = this.evaluateFunction(index, x);
            const y2 = this.evaluateFunction(index, x + step);
            
            if (y1 !== null && y2 !== null && y1 * y2 < 0) {
                // Root found in this interval, refine using bisection
                let a = x;
                let b = x + step;
                let root = this.bisection(index, a, b, precision);
                if (root !== null) {
                    roots.push(root);
                }
            }
        }
        
        return roots;
    }

    bisection(index, a, b, precision) {
        let fa = this.evaluateFunction(index, a);
        let fb = this.evaluateFunction(index, b);
        
        if (fa === null || fb === null || fa * fb > 0) {
            return null;
        }
        
        let c;
        for (let i = 0; i < 100; i++) {
            c = (a + b) / 2;
            const fc = this.evaluateFunction(index, c);
            
            if (fc === null || Math.abs(fc) < precision) {
                return c;
            }
            
            if (fa * fc < 0) {
                b = c;
                fb = fc;
            } else {
                a = c;
                fa = fc;
            }
        }
        
        return c;
    }

    calculateArea(index, a, b, method = 'simpson', n = 1000) {
        // Numerical integration methods
        const func = (x) => this.evaluateFunction(index, x);
        
        switch (method) {
            case 'simpson':
                return this.simpsonsRule(func, a, b, n);
            case 'trapezoidal':
                return this.trapezoidalRule(func, a, b, n);
            case 'midpoint':
                return this.midpointRule(func, a, b, n);
            default:
                return this.simpsonsRule(func, a, b, n);
        }
    }

    simpsonsRule(func, a, b, n) {
        if (n % 2 !== 0) n++; // n must be even
        
        const h = (b - a) / n;
        let sum = func(a) + func(b);
        
        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            const coefficient = (i % 2 === 0) ? 2 : 4;
            const value = func(x);
            if (value !== null) {
                sum += coefficient * value;
            }
        }
        
        return (h / 3) * sum;
    }

    trapezoidalRule(func, a, b, n) {
        const h = (b - a) / n;
        let sum = (func(a) + func(b)) / 2;
        
        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            const value = func(x);
            if (value !== null) {
                sum += value;
            }
        }
        
        return h * sum;
    }

    midpointRule(func, a, b, n) {
        const h = (b - a) / n;
        let sum = 0;
        
        for (let i = 0; i < n; i++) {
            const x = a + (i + 0.5) * h;
            const value = func(x);
            if (value !== null) {
                sum += value;
            }
        }
        
        return h * sum;
    }
}

// Initialize graph plotter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const graphCanvas = document.getElementById('graphCanvas');
    if (graphCanvas) {
        window.graphPlotter = new GraphPlotter('graphCanvas');
        
        // Plot initial function if exists
        const initialFunction = document.getElementById('functionInput')?.value;
        if (initialFunction) {
            setTimeout(() => {
                window.graphPlotter.plotFunction(initialFunction);
            }, 500);
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphPlotter;
}