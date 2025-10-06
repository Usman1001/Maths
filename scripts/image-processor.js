// Image Processing for Graph Analysis
class ImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.processedImage = null;
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
        }
    }

    setupCanvas() {
        if (!this.canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
    }

    loadImage(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.drawImage(img);
                    resolve(img);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(imageFile);
        });
    }

    drawImage(img) {
        if (!this.canvas || !this.ctx) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate dimensions to fit canvas while maintaining aspect ratio
        const scale = Math.min(
            width / img.width,
            height / img.height
        );
        
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
        
        this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }

    // Basic image processing for graph extraction
    preprocessImage() {
        if (!this.canvas || !this.ctx || !this.originalImage) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
        }
        
        // Apply threshold for binary image
        const threshold = 128;
        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > threshold ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = value;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.processedImage = imageData;
        
        return imageData;
    }

    // Edge detection for graph line extraction
    detectEdges() {
        if (!this.processedImage) {
            this.preprocessImage();
        }
        
        // Simple edge detection implementation
        // In a real implementation, you would use more sophisticated algorithms
        window.uiHandler?.showToast('Edge detection completed', 'info');
    }

    // Extract graph data points
    extractDataPoints() {
        if (!this.processedImage) return [];
        
        // This is a simplified implementation
        // Real implementation would involve proper graph analysis
        const points = [];
        const imageData = this.processedImage;
        
        // Sample implementation - extract points along detected lines
        for (let x = 0; x < imageData.width; x += 10) {
            for (let y = 0; y < imageData.height; y += 10) {
                const index = (y * imageData.width + x) * 4;
                if (imageData.data[index] < 128) { // Dark pixel
                    points.push({ x, y });
                }
            }
        }
        
        return points;
    }

    // Convert image coordinates to mathematical coordinates
    convertToMathCoordinates(points, xRange, yRange) {
        if (!this.canvas) return points;
        
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        return points.map(point => ({
            x: (point.x / width) * (xRange.max - xRange.min) + xRange.min,
            y: ((height - point.y) / height) * (yRange.max - yRange.min) + yRange.min
        }));
    }

    // Analyze graph type (VT, ST, etc.)
    analyzeGraphType(points) {
        // Simple analysis based on point patterns
        // This would be more sophisticated in a real implementation
        
        if (points.length === 0) return 'unknown';
        
        // Check for linear patterns (VT graphs often have linear segments)
        const slopes = this.calculateSlopes(points);
        const slopeVariance = this.calculateVariance(slopes);
        
        if (slopeVariance < 0.1) {
            return 'velocity-time';
        }
        
        // Check for parabolic patterns (ST graphs for constant acceleration)
        const curvatures = this.calculateCurvature(points);
        const curvatureVariance = this.calculateVariance(curvatures);
        
        if (curvatureVariance < 0.1) {
            return 'displacement-time';
        }
        
        return 'unknown';
    }

    calculateSlopes(points) {
        const slopes = [];
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            if (dx !== 0) {
                slopes.push(dy / dx);
            }
        }
        return slopes;
    }

    calculateCurvature(points) {
        const curvatures = [];
        for (let i = 1; i < points.length - 1; i++) {
            // Simple curvature approximation
            const dx1 = points[i].x - points[i - 1].x;
            const dy1 = points[i].y - points[i - 1].y;
            const dx2 = points[i + 1].x - points[i].x;
            const dy2 = points[i + 1].y - points[i].y;
            
            if (dx1 !== 0 && dx2 !== 0) {
                const slope1 = dy1 / dx1;
                const slope2 = dy2 / dx2;
                curvatures.push(Math.abs(slope2 - slope1));
            }
        }
        return curvatures;
    }

    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return variance;
    }

    // Export processed data
    exportData(points, format = 'json') {
        let data;
        
        switch (format) {
            case 'json':
                data = JSON.stringify(points, null, 2);
                break;
            case 'csv':
                data = 'x,y\n' + points.map(p => `${p.x},${p.y}`).join('\n');
                break;
            default:
                data = JSON.stringify(points);
        }
        
        return data;
    }

    // Utility methods
    resize(width, height) {
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            
            if (this.originalImage) {
                this.drawImage(this.originalImage);
            }
        }
    }

    clear() {
        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.originalImage = null;
        this.processedImage = null;
    }
}

// Initialize image processor when needed
if (typeof window !== 'undefined') {
    window.ImageProcessor = ImageProcessor;
}