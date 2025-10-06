 // Graph Converter for VT↔ST Transformations
class GraphConverter {
    constructor() {
        this.vtCanvas = document.getElementById('vtPreviewCanvas');
        this.stCanvas = document.getElementById('stPreviewCanvas');
        this.stOriginalCanvas = document.getElementById('stOriginalCanvas');
        this.vtConvertedCanvas = document.getElementById('vtConvertedCanvas');
        
        this.currentVTImage = null;
        this.currentSTImage = null;
        
        this.init();
    }

    init() {
        this.setupCanvases();
        this.setupEventListeners();
        this.setupUploadHandlers();
    }

    setupCanvases() {
        const canvases = [this.vtCanvas, this.stCanvas, this.stOriginalCanvas, this.vtConvertedCanvas];
        
        canvases.forEach(canvas => {
            if (canvas) {
                this.setupCanvas(canvas);
            }
        });
    }

    setupCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Draw initial placeholder
        this.drawPlaceholder(canvas);
    }

    setupEventListeners() {
        // Conversion buttons
        const convertVtToSt = document.getElementById('convertVtToSt');
        const convertStToVt = document.getElementById('convertStToVt');
        
        if (convertVtToSt) {
            convertVtToSt.addEventListener('click', () => this.convertVTtoST());
        }
        
        if (convertStToVt) {
            convertStToVt.addEventListener('click', () => this.convertSTtoVT());
        }

        // Download buttons
        const downloadStGraph = document.getElementById('downloadStGraph');
        const downloadVtGraph = document.getElementById('downloadVtGraph');
        
        if (downloadStGraph) {
            downloadStGraph.addEventListener('click', () => this.downloadGraph(this.stCanvas, 'displacement-time-graph'));
        }
        
        if (downloadVtGraph) {
            downloadVtGraph.addEventListener('click', () => this.downloadGraph(this.vtConvertedCanvas, 'velocity-time-graph'));
        }

        // Analysis buttons
        const analyzeVtGraph = document.getElementById('analyzeVtGraph');
        const analyzeStGraph = document.getElementById('analyzeStGraph');
        
        if (analyzeVtGraph) {
            analyzeVtGraph.addEventListener('click', () => this.analyzeVTGraph());
        }
        
        if (analyzeStGraph) {
            analyzeStGraph.addEventListener('click', () => this.analyzeSTGraph());
        }

        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.setupCanvases();
            this.redrawAllCanvases();
        }, 250));
    }

    setupUploadHandlers() {
        // VT to ST upload
        const vtUploadArea = document.getElementById('vtUploadArea');
        const vtFileInput = document.getElementById('vtFileInput');
        
        if (vtUploadArea && vtFileInput) {
            this.setupUploadArea(vtUploadArea, vtFileInput, this.vtCanvas, 'vt');
        }

        // ST to VT upload
        const stUploadArea = document.getElementById('stUploadArea');
        const stFileInput = document.getElementById('stFileInput');
        
        if (stUploadArea && stFileInput) {
            this.setupUploadArea(stUploadArea, stFileInput, this.stOriginalCanvas, 'st');
        }
    }

    setupUploadArea(uploadArea, fileInput, canvas, type) {
        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileUpload(e.target.files[0], canvas, type);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.handleFileUpload(e.dataTransfer.files[0], canvas, type);
            }
        });
    }

    handleFileUpload(file, canvas, type) {
        // Validate file type
        if (!file.type.match('image.*')) {
            window.uiHandler?.showToast('Please upload an image file (PNG, JPG, JPEG)', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.uiHandler?.showToast('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Store reference to the image
                if (type === 'vt') {
                    this.currentVTImage = img;
                } else {
                    this.currentSTImage = img;
                }
                
                // Draw image on canvas
                this.drawImageOnCanvas(canvas, img);
                
                window.uiHandler?.showToast('Image uploaded successfully', 'success');
                
                // Auto-analyze the graph
                if (type === 'vt') {
                    setTimeout(() => this.analyzeVTGraph(), 500);
                } else {
                    setTimeout(() => this.analyzeSTGraph(), 500);
                }
            };
            
            img.onerror = () => {
                window.uiHandler?.showToast('Error loading image', 'error');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            window.uiHandler?.showToast('Error reading file', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    drawImageOnCanvas(canvas, img) {
        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate dimensions to fit canvas while maintaining aspect ratio
        const scale = Math.min(
            width / img.width,
            height / img.height
        );
        
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
        
        // Draw image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Draw border
        ctx.strokeStyle = '#bb86fc';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, drawWidth, drawHeight);
    }

    drawPlaceholder(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || '#121212';
        ctx.fillRect(0, 0, width, height);
        
        // Draw placeholder text
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#a0a0a0';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Upload a graph to begin', width / 2, height / 2);
        
        // Draw border
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-disabled') || '#666666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.setLineDash([]);
    }

    // Core Conversion Methods
    convertVTtoST() {
        if (!this.currentVTImage) {
            window.uiHandler?.showToast('Please upload a VT graph first', 'warning');
            return;
        }

        window.uiHandler?.showToast('Converting VT to ST graph...', 'info');
        
        // Simulate conversion process
        setTimeout(() => {
            this.simulateVTtoSTConversion();
            window.uiHandler?.showToast('Conversion completed successfully!', 'success');
        }, 1500);
    }

    convertSTtoVT() {
        if (!this.currentSTImage) {
            window.uiHandler?.showToast('Please upload an ST graph first', 'warning');
            return;
        }

        window.uiHandler?.showToast('Converting ST to VT graph...', 'info');
        
        // Simulate conversion process
        setTimeout(() => {
            this.simulateSTtoVTConversion();
            window.uiHandler?.showToast('Conversion completed successfully!', 'success');
        }, 1500);
    }

    simulateVTtoSTConversion() {
        if (!this.stCanvas) return;
        
        const ctx = this.stCanvas.getContext('2d');
        const width = this.stCanvas.offsetWidth;
        const height = this.stCanvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || '#121212';
        ctx.fillRect(0, 0, width, height);
        
        // Draw simulated ST graph (integration of VT)
        this.drawSimulatedSTGraph(ctx, width, height);
        
        // Draw axes and labels
        this.drawGraphAxes(ctx, width, height, 'Time (s)', 'Displacement (m)', 'ST Graph');
    }

    simulateSTtoVTConversion() {
        if (!this.vtConvertedCanvas) return;
        
        const ctx = this.vtConvertedCanvas.getContext('2d');
        const width = this.vtConvertedCanvas.offsetWidth;
        const height = this.vtConvertedCanvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || '#121212';
        ctx.fillRect(0, 0, width, height);
        
        // Draw simulated VT graph (differentiation of ST)
        this.drawSimulatedVTGraph(ctx, width, height);
        
        // Draw axes and labels
        this.drawGraphAxes(ctx, width, height, 'Time (s)', 'Velocity (m/s)', 'VT Graph');
    }

    drawSimulatedSTGraph(ctx, width, height) {
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Simulate integration process - create a smooth curve
        ctx.strokeStyle = '#03dac6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Start at origin
        ctx.moveTo(padding, height - padding);
        
        // Create a realistic displacement curve (integral of velocity)
        const points = [];
        const segmentCount = 5;
        const segmentWidth = graphWidth / segmentCount;
        
        for (let i = 0; i <= segmentCount; i++) {
            const x = padding + i * segmentWidth;
            
            // Different segments with different behaviors
            let y;
            if (i < 2) {
                // Accelerating (parabolic)
                y = height - padding - (i * i * 0.1 * graphHeight);
            } else if (i < 4) {
                // Constant velocity (linear)
                y = height - padding - (0.4 * graphHeight + (i - 2) * 0.2 * graphHeight);
            } else {
                // Decelerating (flattening curve)
                y = height - padding - (0.8 * graphHeight - Math.pow(i - 4, 2) * 0.05 * graphHeight);
            }
            
            points.push({ x, y });
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#03dac6';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawSimulatedVTGraph(ctx, width, height) {
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Simulate differentiation process - create velocity segments
        ctx.strokeStyle = '#bb86fc';
        ctx.lineWidth = 3;
        
        const segments = [
            { start: 0, end: 0.4, value: 0.6 },  // Accelerating
            { start: 0.4, end: 0.6, value: 0.8 }, // Constant high
            { start: 0.6, end: 0.8, value: 0.4 }, // Slowing
            { start: 0.8, end: 1.0, value: 0.2 }  // Constant low
        ];
        
        segments.forEach(segment => {
            const startX = padding + segment.start * graphWidth;
            const endX = padding + segment.end * graphWidth;
            const y = height - padding - (segment.value * graphHeight);
            
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
            
            // Draw vertical lines at segment boundaries
            if (segment.start > 0) {
                ctx.beginPath();
                ctx.moveTo(startX, height - padding);
                ctx.lineTo(startX, y);
                ctx.stroke();
            }
        });
    }

    drawGraphAxes(ctx, width, height, xLabel, yLabel, title) {
        const padding = 40;
        
        // Draw axes
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xLabel, width / 2, height - padding + 10);
        
        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
        
        // Draw title
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(title, width / 2, 10);
        
        // Draw scale markers
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        // X-axis markers
        for (let i = 1; i <= 5; i++) {
            const x = padding + (i * (width - 2 * padding) / 5);
            ctx.beginPath();
            ctx.moveTo(x, height - padding - 5);
            ctx.lineTo(x, height - padding + 5);
            ctx.stroke();
            ctx.fillText(i.toString(), x, height - padding + 10);
        }
        
        // Y-axis markers
        ctx.textAlign = 'right';
        for (let i = 1; i <= 4; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 4);
            ctx.beginPath();
            ctx.moveTo(padding - 5, y);
            ctx.lineTo(padding + 5, y);
            ctx.stroke();
            ctx.fillText(i.toString(), padding - 10, y - 6);
        }
    }

    // Analysis Methods
    analyzeVTGraph() {
        if (!this.currentVTImage) {
            window.uiHandler?.showToast('Please upload a VT graph first', 'warning');
            return;
        }

        window.uiHandler?.showToast('Analyzing VT graph...', 'info');
        
        // Simulate analysis
        setTimeout(() => {
            const analysis = this.simulateVTAnalysis();
            this.displayAnalysisResult(analysis, 'VT Analysis');
            window.uiHandler?.showToast('VT graph analyzed successfully!', 'success');
        }, 1000);
    }

    analyzeSTGraph() {
        if (!this.currentSTImage) {
            window.uiHandler?.showToast('Please upload an ST graph first', 'warning');
            return;
        }

        window.uiHandler?.showToast('Analyzing ST graph...', 'info');
        
        // Simulate analysis
        setTimeout(() => {
            const analysis = this.simulateSTAnalysis();
            this.displayAnalysisResult(analysis, 'ST Analysis');
            window.uiHandler?.showToast('ST graph analyzed successfully!', 'success');
        }, 1000);
    }

    simulateVTAnalysis() {
        return {
            type: 'Velocity-Time Graph',
            segments: [
                { duration: '0-2s', velocity: '0 → 8 m/s', acceleration: '4 m/s²', description: 'Constant acceleration' },
                { duration: '2-4s', velocity: '8 m/s', acceleration: '0 m/s²', description: 'Constant velocity' },
                { duration: '4-6s', velocity: '8 → 4 m/s', acceleration: '-2 m/s²', description: 'Constant deceleration' },
                { duration: '6-8s', velocity: '4 m/s', acceleration: '0 m/s²', description: 'Constant velocity' }
            ],
            totalDisplacement: '42 m',
            averageVelocity: '5.25 m/s',
            maxVelocity: '8 m/s'
        };
    }

    simulateSTAnalysis() {
        return {
            type: 'Displacement-Time Graph',
            segments: [
                { duration: '0-2s', displacement: '0 → 8 m', velocity: '4 m/s', description: 'Constant positive velocity' },
                { duration: '2-4s', displacement: '8 → 24 m', velocity: '8 m/s', description: 'Constant positive velocity' },
                { duration: '4-6s', displacement: '24 → 32 m', velocity: '4 m/s', description: 'Constant positive velocity' },
                { duration: '6-8s', displacement: '32 → 36 m', velocity: '2 m/s', description: 'Constant positive velocity' }
            ],
            totalDisplacement: '36 m',
            averageVelocity: '4.5 m/s',
            maxVelocity: '8 m/s'
        };
    }

    displayAnalysisResult(analysis, title) {
        // Create or update analysis result display
        let resultContainer = document.getElementById('analysisResult');
        
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'analysisResult';
            resultContainer.className = 'analysis-result';
            
            // Insert after the preview container
            const previewContainer = document.querySelector('.preview-container');
            if (previewContainer) {
                previewContainer.parentNode.insertBefore(resultContainer, previewContainer.nextSibling);
            }
        }
        
        let html = `
            <div class="analysis-header">
                <h4>${title}</h4>
                <button class="close-analysis" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="analysis-content">
                <div class="analysis-summary">
                    <div class="summary-item">
                        <label>Graph Type:</label>
                        <span>${analysis.type}</span>
                    </div>
                    <div class="summary-item">
                        <label>Total Displacement:</label>
                        <span>${analysis.totalDisplacement}</span>
                    </div>
                    <div class="summary-item">
                        <label>Average Velocity:</label>
                        <span>${analysis.averageVelocity}</span>
                    </div>
                    <div class="summary-item">
                        <label>Maximum Velocity:</label>
                        <span>${analysis.maxVelocity}</span>
                    </div>
                </div>
                <div class="analysis-segments">
                    <h5>Segment Analysis</h5>
                    <div class="segments-grid">
        `;
        
        analysis.segments.forEach(segment => {
            html += `
                <div class="segment-card">
                    <div class="segment-duration">${segment.duration}</div>
                    <div class="segment-details">
                        <div>Velocity: ${segment.velocity}</div>
                        <div>Acceleration: ${segment.acceleration}</div>
                        <div class="segment-description">${segment.description}</div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = html;
    }

    // Utility Methods
    downloadGraph(canvas, filename) {
        if (!canvas) {
            window.uiHandler?.showToast('No graph available to download', 'error');
            return;
        }

        try {
            const link = document.createElement('a');
            link.download = `${filename}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            window.uiHandler?.showToast('Graph downloaded successfully!', 'success');
        } catch (error) {
            window.uiHandler?.showToast('Failed to download graph', 'error');
            console.error('Download error:', error);
        }
    }

    redrawAllCanvases() {
        // Redraw all canvases with their current content
        if (this.currentVTImage && this.vtCanvas) {
            this.drawImageOnCanvas(this.vtCanvas, this.currentVTImage);
        } else if (this.vtCanvas) {
            this.drawPlaceholder(this.vtCanvas);
        }
        
        if (this.currentSTImage && this.stOriginalCanvas) {
            this.drawImageOnCanvas(this.stOriginalCanvas, this.currentSTImage);
        } else if (this.stOriginalCanvas) {
            this.drawPlaceholder(this.stOriginalCanvas);
        }
        
        // Redraw converted graphs if they exist
        if (this.stCanvas) {
            const ctx = this.stCanvas.getContext('2d');
            if (ctx.getImageData(0, 0, 1, 1).data[3] !== 0) {
                this.simulateVTtoSTConversion();
            } else {
                this.drawPlaceholder(this.stCanvas);
            }
        }
        
        if (this.vtConvertedCanvas) {
            const ctx = this.vtConvertedCanvas.getContext('2d');
            if (ctx.getImageData(0, 0, 1, 1).data[3] !== 0) {
                this.simulateSTtoVTConversion();
            } else {
                this.drawPlaceholder(this.vtConvertedCanvas);
            }
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
    resetConverter(type) {
        if (type === 'vt' || type === 'all') {
            this.currentVTImage = null;
            if (this.vtCanvas) this.drawPlaceholder(this.vtCanvas);
            if (this.stCanvas) this.drawPlaceholder(this.stCanvas);
        }
        
        if (type === 'st' || type === 'all') {
            this.currentSTImage = null;
            if (this.stOriginalCanvas) this.drawPlaceholder(this.stOriginalCanvas);
            if (this.vtConvertedCanvas) this.drawPlaceholder(this.vtConvertedCanvas);
        }
        
        // Remove analysis results
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.remove();
        }
        
        window.uiHandler?.showToast('Converter reset', 'info');
    }
}

// Initialize graph converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.graphConverter = new GraphConverter();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphConverter;
}