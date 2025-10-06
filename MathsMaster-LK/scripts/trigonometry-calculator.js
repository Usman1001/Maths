// Advanced Trigonometry Calculator with Unit Circle Visualization
class TrigonometryCalculator {
    constructor() {
        this.unitCircleCanvas = document.getElementById('unitCircleCanvas');
        this.trigGraphCanvas = document.getElementById('trigGraphCanvas');
        this.currentAngle = 0;
        this.currentFunction = 'sin';
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupCanvases();
        this.setupEventListeners();
        this.setupCalculators();
        this.drawUnitCircle();
        this.drawTrigGraph();
    }

    setupCanvases() {
        if (this.unitCircleCanvas) {
            this.setupCanvas(this.unitCircleCanvas);
        }
        if (this.trigGraphCanvas) {
            this.setupCanvas(this.trigGraphCanvas);
        }
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
    }

    setupEventListeners() {
        // Angle input
        const angleInput = document.getElementById('angleInput');
        const angleUnit = document.getElementById('angleUnit');
        
        if (angleInput && angleUnit) {
            angleInput.addEventListener('input', () => {
                this.updateAngle(angleInput.value, angleUnit.value);
            });
            
            angleUnit.addEventListener('change', () => {
                this.updateAngle(angleInput.value, angleUnit.value);
            });
        }

        // Function selector
        const functionSelect = document.getElementById('trigFunction');
        if (functionSelect) {
            functionSelect.addEventListener('change', () => {
                this.currentFunction = functionSelect.value;
                this.drawTrigGraph();
            });
        }

        // Angle slider
        const angleSlider = document.getElementById('angleSlider');
        if (angleSlider) {
            angleSlider.addEventListener('input', (e) => {
                const angle = e.target.value;
                document.getElementById('angleInput').value = angle;
                this.updateAngle(angle, 'degrees');
            });
        }

        // Identity calculator
        const identityForm = document.getElementById('identityForm');
        if (identityForm) {
            identityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyIdentity();
            });
        }

        // Triangle solver
        const triangleForm = document.getElementById('triangleForm');
        if (triangleForm) {
            triangleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.solveTriangle();
            });
        }

        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.setupCanvases();
            this.drawUnitCircle();
            this.drawTrigGraph();
        }, 250));
    }

    setupCalculators() {
        // Set up all calculator buttons and forms
        this.setupBasicCalculator();
        this.setupIdentityProver();
        this.setupTriangleSolver();
        this.setupWaveCalculator();
    }

    setupBasicCalculator() {
        const basicCalc = document.getElementById('basicTrigCalc');
        if (!basicCalc) return;

        const calculateBtn = basicCalc.querySelector('#calculateTrig');
        const clearBtn = basicCalc.querySelector('#clearTrig');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateBasicTrig());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearBasicTrig());
        }
    }

    setupIdentityProver() {
        // Additional identity prover setup
        const identityExamples = document.querySelectorAll('.identity-example');
        identityExamples.forEach(example => {
            example.addEventListener('click', (e) => {
                const identity = e.target.getAttribute('data-identity');
                if (identity) {
                    document.getElementById('identityInput').value = identity;
                }
            });
        });
    }

    setupTriangleSolver() {
        const triangleType = document.getElementById('triangleType');
        if (triangleType) {
            triangleType.addEventListener('change', () => {
                this.updateTriangleInputs();
            });
        }
    }

    setupWaveCalculator() {
        const waveForm = document.getElementById('waveForm');
        if (waveForm) {
            waveForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.analyzeWave();
            });
        }
    }

    // Core Calculation Methods
    updateAngle(angle, unit) {
        if (!angle) return;
        
        let radians;
        
        switch (unit) {
            case 'degrees':
                radians = (parseFloat(angle) * Math.PI) / 180;
                break;
            case 'radians':
                radians = parseFloat(angle);
                break;
            case 'gradians':
                radians = (parseFloat(angle) * Math.PI) / 200;
                break;
            default:
                return;
        }
        
        this.currentAngle = radians;
        this.drawUnitCircle();
        this.updateTrigValues();
    }

    updateTrigValues() {
        const sinValue = Math.sin(this.currentAngle);
        const cosValue = Math.cos(this.currentAngle);
        const tanValue = Math.tan(this.currentAngle);
        
        // Update display values
        this.updateDisplayValue('sinValue', sinValue);
        this.updateDisplayValue('cosValue', cosValue);
        this.updateDisplayValue('tanValue', tanValue);
        
        // Update reciprocal values
        this.updateDisplayValue('cscValue', 1/sinValue);
        this.updateDisplayValue('secValue', 1/cosValue);
        this.updateDisplayValue('cotValue', 1/tanValue);
    }

    updateDisplayValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (Math.abs(value) > 1000000 || (Math.abs(value) < 0.000001 && value !== 0)) {
                element.textContent = value.toExponential(4);
            } else if (Number.isInteger(value)) {
                element.textContent = value;
            } else {
                element.textContent = value.toFixed(6);
            }
        }
    }

    calculateBasicTrig() {
        const angleInput = document.getElementById('basicAngle');
        const unitInput = document.getElementById('basicUnit');
        const functionInput = document.getElementById('basicFunction');
        
        if (!angleInput || !unitInput || !functionInput) return;
        
        const angle = parseFloat(angleInput.value);
        const unit = unitInput.value;
        const func = functionInput.value;
        
        if (isNaN(angle)) {
            window.uiHandler?.showToast('Please enter a valid angle', 'error');
            return;
        }
        
        let radians;
        switch (unit) {
            case 'degrees':
                radians = (angle * Math.PI) / 180;
                break;
            case 'radians':
                radians = angle;
                break;
            default:
                radians = angle;
        }
        
        let result;
        switch (func) {
            case 'sin':
                result = Math.sin(radians);
                break;
            case 'cos':
                result = Math.cos(radians);
                break;
            case 'tan':
                result = Math.tan(radians);
                break;
            case 'csc':
                result = 1 / Math.sin(radians);
                break;
            case 'sec':
                result = 1 / Math.cos(radians);
                break;
            case 'cot':
                result = 1 / Math.tan(radians);
                break;
            default:
                result = Math.sin(radians);
        }
        
        const resultElement = document.getElementById('basicResult');
        if (resultElement) {
            if (Math.abs(result) > 1000000) {
                resultElement.textContent = result.toExponential(6);
            } else {
                resultElement.textContent = result.toFixed(6);
            }
        }
        
        window.uiHandler?.showToast(`Calculated ${func}(${angle}${unit}) = ${result.toFixed(6)}`, 'success');
    }

    clearBasicTrig() {
        const angleInput = document.getElementById('basicAngle');
        const resultElement = document.getElementById('basicResult');
        
        if (angleInput) angleInput.value = '';
        if (resultElement) resultElement.textContent = '0';
    }

    // Identity Verification
    verifyIdentity() {
        const identityInput = document.getElementById('identityInput');
        if (!identityInput) return;
        
        const identity = identityInput.value.trim();
        
        if (!identity) {
            window.uiHandler?.showToast('Please enter an identity to verify', 'warning');
            return;
        }
        
        try {
            // Simple identity verification using sample values
            const isVerified = this.testIdentity(identity);
            
            const resultElement = document.getElementById('identityResult');
            if (resultElement) {
                if (isVerified) {
                    resultElement.innerHTML = `
                        <div class="result-success">
                            <i class="fas fa-check-circle"></i>
                            Identity appears to be valid
                        </div>
                    `;
                    window.uiHandler?.showToast('Identity verified successfully!', 'success');
                } else {
                    resultElement.innerHTML = `
                        <div class="result-error">
                            <i class="fas fa-times-circle"></i>
                            Identity may not be valid
                        </div>
                    `;
                    window.uiHandler?.showToast('Identity verification failed', 'error');
                }
            }
            
        } catch (error) {
            window.uiHandler?.showToast('Error verifying identity: ' + error.message, 'error');
        }
    }

    testIdentity(identity) {
        // Test identity with multiple random values
        const testValues = [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI];
        let validCount = 0;
        
        for (const x of testValues) {
            try {
                // Split identity into left and right sides
                const sides = identity.split('=');
                if (sides.length !== 2) return false;
                
                const leftSide = this.evaluateExpression(sides[0].trim(), x);
                const rightSide = this.evaluateExpression(sides[1].trim(), x);
                
                if (Math.abs(leftSide - rightSide) < 0.0001) {
                    validCount++;
                }
            } catch (error) {
                return false;
            }
        }
        
        return validCount === testValues.length;
    }

    evaluateExpression(expr, x) {
        // Simple expression evaluator for trigonometric identities
        const normalizedExpr = expr.toLowerCase()
            .replace(/sin\^2/g, 'Math.pow(Math.sin(x),2)')
            .replace(/cos\^2/g, 'Math.pow(Math.cos(x),2)')
            .replace(/tan\^2/g, 'Math.pow(Math.tan(x),2)')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/csc/g, '1/Math.sin')
            .replace(/sec/g, '1/Math.cos')
            .replace(/cot/g, '1/Math.tan');
        
        try {
            return eval(normalizedExpr);
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }

    // Triangle Solver
    solveTriangle() {
        const triangleType = document.getElementById('triangleType').value;
        
        switch (triangleType) {
            case 'SSS':
                this.solveSSS();
                break;
            case 'SAS':
                this.solveSAS();
                break;
            case 'ASA':
                this.solveASA();
                break;
            case 'AAS':
                this.solveAAS();
                break;
            default:
                window.uiHandler?.showToast('Please select a triangle type', 'warning');
        }
    }

    solveSSS() {
        const a = parseFloat(document.getElementById('sideA').value);
        const b = parseFloat(document.getElementById('sideB').value);
        const c = parseFloat(document.getElementById('sideC').value);
        
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            window.uiHandler?.showToast('Please enter all three sides', 'error');
            return;
        }
        
        // Check triangle inequality
        if (a + b <= c || a + c <= b || b + c <= a) {
            window.uiHandler?.showToast('Invalid triangle: sides do not satisfy triangle inequality', 'error');
            return;
        }
        
        // Calculate angles using law of cosines
        const angleA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * (180/Math.PI);
        const angleB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * (180/Math.PI);
        const angleC = 180 - angleA - angleB;
        
        this.displayTriangleSolution(a, b, c, angleA, angleB, angleC);
    }

    solveSAS() {
        // Implementation for Side-Angle-Side
        window.uiHandler?.showToast('SAS solver implementation in progress', 'info');
    }

    solveASA() {
        // Implementation for Angle-Side-Angle
        window.uiHandler?.showToast('ASA solver implementation in progress', 'info');
    }

    solveAAS() {
        // Implementation for Angle-Angle-Side
        window.uiHandler?.showToast('AAS solver implementation in progress', 'info');
    }

    displayTriangleSolution(a, b, c, A, B, C) {
        const resultElement = document.getElementById('triangleResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="triangle-solution">
                    <h4>Triangle Solution</h4>
                    <div class="solution-grid">
                        <div class="solution-item">
                            <label>Sides:</label>
                            <span>a = ${a.toFixed(2)}, b = ${b.toFixed(2)}, c = ${c.toFixed(2)}</span>
                        </div>
                        <div class="solution-item">
                            <label>Angles:</label>
                            <span>A = ${A.toFixed(2)}°, B = ${B.toFixed(2)}°, C = ${C.toFixed(2)}°</span>
                        </div>
                        <div class="solution-item">
                            <label>Area:</label>
                            <span>${this.calculateTriangleArea(a, b, c).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        window.uiHandler?.showToast('Triangle solved successfully!', 'success');
    }

    calculateTriangleArea(a, b, c) {
        // Heron's formula
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    updateTriangleInputs() {
        const triangleType = document.getElementById('triangleType').value;
        const inputsContainer = document.getElementById('triangleInputs');
        
        if (!inputsContainer) return;
        
        let html = '';
        
        switch (triangleType) {
            case 'SSS':
                html = `
                    <div class="input-group">
                        <label for="sideA">Side a:</label>
                        <input type="number" id="sideA" step="0.1" min="0.1" required>
                    </div>
                    <div class="input-group">
                        <label for="sideB">Side b:</label>
                        <input type="number" id="sideB" step="0.1" min="0.1" required>
                    </div>
                    <div class="input-group">
                        <label for="sideC">Side c:</label>
                        <input type="number" id="sideC" step="0.1" min="0.1" required>
                    </div>
                `;
                break;
            case 'SAS':
                html = `
                    <div class="input-group">
                        <label for="sideA">Side a:</label>
                        <input type="number" id="sideA" step="0.1" min="0.1" required>
                    </div>
                    <div class="input-group">
                        <label for="angleB">Angle B (degrees):</label>
                        <input type="number" id="angleB" step="0.1" min="1" max="179" required>
                    </div>
                    <div class="input-group">
                        <label for="sideC">Side c:</label>
                        <input type="number" id="sideC" step="0.1" min="0.1" required>
                    </div>
                `;
                break;
            // Add other cases for ASA and AAS
        }
        
        inputsContainer.innerHTML = html;
    }

    // Wave Analysis
    analyzeWave() {
        const amplitude = parseFloat(document.getElementById('waveAmplitude').value);
        const frequency = parseFloat(document.getElementById('waveFrequency').value);
        const phase = parseFloat(document.getElementById('wavePhase').value);
        const functionType = document.getElementById('waveFunction').value;
        
        if (isNaN(amplitude) || isNaN(frequency) || isNaN(phase)) {
            window.uiHandler?.showToast('Please enter valid wave parameters', 'error');
            return;
        }
        
        const period = 1 / frequency;
        const angularFrequency = 2 * Math.PI * frequency;
        
        const resultElement = document.getElementById('waveResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="wave-analysis">
                    <h4>Wave Analysis</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <label>Period:</label>
                            <span>${period.toFixed(4)} seconds</span>
                        </div>
                        <div class="analysis-item">
                            <label>Angular Frequency:</label>
                            <span>${angularFrequency.toFixed(4)} rad/s</span>
                        </div>
                        <div class="analysis-item">
                            <label>Function:</label>
                            <span>${this.getWaveFunctionText(amplitude, frequency, phase, functionType)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        window.uiHandler?.showToast('Wave analyzed successfully!', 'success');
    }

    getWaveFunctionText(amplitude, frequency, phase, functionType) {
        const funcSymbol = functionType === 'sin' ? 'sin' : 'cos';
        return `${amplitude} ${funcSymbol}(2π × ${frequency}t + ${phase}°)`;
    }

    // Drawing Methods
    drawUnitCircle() {
        if (!this.unitCircleCanvas) return;
        
        const ctx = this.unitCircleCanvas.getContext('2d');
        const width = this.unitCircleCanvas.offsetWidth;
        const height = this.unitCircleCanvas.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw circle
        ctx.strokeStyle = '#bb86fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw axes
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - radius - 20, centerY);
        ctx.lineTo(centerX + radius + 20, centerY);
        ctx.moveTo(centerX, centerY - radius - 20);
        ctx.lineTo(centerX, centerY + radius + 20);
        ctx.stroke();
        
        // Draw angle line
        const endX = centerX + radius * Math.cos(this.currentAngle);
        const endY = centerY - radius * Math.sin(this.currentAngle);
        
        ctx.strokeStyle = '#03dac6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw point on circle
        ctx.fillStyle = '#03dac6';
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw coordinates
        const cosValue = Math.cos(this.currentAngle);
        const sinValue = Math.sin(this.currentAngle);
        
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`(${cosValue.toFixed(3)}, ${sinValue.toFixed(3)})`, endX, endY - 15);
        
        // Draw angle label
        const angleDeg = (this.currentAngle * 180 / Math.PI).toFixed(1);
        ctx.fillText(`${angleDeg}°`, centerX + 30, centerY - 30);
    }

    drawTrigGraph() {
        if (!this.trigGraphCanvas) return;
        
        const ctx = this.trigGraphCanvas.getContext('2d');
        const width = this.trigGraphCanvas.offsetWidth;
        const height = this.trigGraphCanvas.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 40;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        // Draw grid
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 0.5;
        for (let x = centerX % scale; x < width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = centerY % scale; y < height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw function
        ctx.strokeStyle = '#bb86fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            const xValue = (x - centerX) / scale;
            let yValue;
            
            switch (this.currentFunction) {
                case 'sin':
                    yValue = Math.sin(xValue);
                    break;
                case 'cos':
                    yValue = Math.cos(xValue);
                    break;
                case 'tan':
                    yValue = Math.tan(xValue);
                    break;
                default:
                    yValue = Math.sin(xValue);
            }
            
            const y = centerY - yValue * scale;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    // Utility Methods
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
    setAngle(angle, unit = 'degrees') {
        this.updateAngle(angle, unit);
    }

    getCurrentValues() {
        return {
            angle: this.currentAngle,
            sin: Math.sin(this.currentAngle),
            cos: Math.cos(this.currentAngle),
            tan: Math.tan(this.currentAngle)
        };
    }

    convertAngle(angle, fromUnit, toUnit) {
        let radians;
        
        switch (fromUnit) {
            case 'degrees':
                radians = (angle * Math.PI) / 180;
                break;
            case 'radians':
                radians = angle;
                break;
            case 'gradians':
                radians = (angle * Math.PI) / 200;
                break;
            default:
                return angle;
        }
        
        switch (toUnit) {
            case 'degrees':
                return (radians * 180) / Math.PI;
            case 'radians':
                return radians;
            case 'gradians':
                return (radians * 200) / Math.PI;
            default:
                return radians;
        }
    }
}

// Initialize trigonometry calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trigCalculator = new TrigonometryCalculator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrigonometryCalculator;
}