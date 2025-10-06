// Advanced Calculus Calculator
class CalculusCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGraphs();
    }

    setupEventListeners() {
        // Derivative calculation
        const derivativeForm = document.getElementById('derivativeForm');
        if (derivativeForm) {
            derivativeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateDerivative();
            });
        }

        // Integral calculation
        const integralForm = document.getElementById('integralForm');
        if (integralForm) {
            integralForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateIntegral();
            });
        }

        // Integral type toggle
        const integralType = document.getElementById('integralType');
        if (integralType) {
            integralType.addEventListener('change', () => {
                this.toggleIntegralType();
            });
        }

        // Example buttons
        const exampleButtons = document.querySelectorAll('.example-btn');
        exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const expr = e.target.getAttribute('data-expr');
                document.getElementById('derivativeFunction').value = expr;
            });
        });
    }

    setupGraphs() {
        // Initialize derivative graph if canvas exists
        const derivativeCanvas = document.getElementById('derivativeGraph');
        if (derivativeCanvas) {
            this.setupDerivativeGraph();
        }

        // Initialize integral graph if canvas exists
        const integralCanvas = document.getElementById('integralGraph');
        if (integralCanvas) {
            this.setupIntegralGraph();
        }
    }

    calculateDerivative() {
        const functionInput = document.getElementById('derivativeFunction').value;
        const variable = document.getElementById('derivativeVariable').value || 'x';
        const order = parseInt(document.getElementById('derivativeOrder').value) || 1;

        if (!functionInput) {
            window.uiHandler?.showToast('Please enter a function', 'error');
            return;
        }

        try {
            // Use math.js for symbolic differentiation
            let derivative;
            let steps = [];

            // First, try to parse the function
            const node = math.parse(functionInput);
            steps.push(`Parsed function: ${node.toString()}`);

            // Calculate derivative step by step
            let currentExpr = node;
            for (let i = 1; i <= order; i++) {
                try {
                    currentExpr = math.derivative(currentExpr, variable);
                    steps.push(`Step ${i}: f${'\''.repeat(i)}(${variable}) = ${currentExpr.toString()}`);
                } catch (error) {
                    throw new Error(`Cannot compute ${i}${this.getOrdinalSuffix(i)} derivative`);
                }
            }

            derivative = currentExpr.toString();

            // Simplify the result
            try {
                const simplified = math.simplify(derivative);
                derivative = simplified.toString();
                steps.push(`Simplified: ${derivative}`);
            } catch (error) {
                // If simplification fails, use the original derivative
            }

            this.displayDerivativeResult(derivative, steps);
            this.plotDerivativeGraph(functionInput, derivative);

            window.uiHandler?.showToast(`Calculated ${order}${this.getOrdinalSuffix(order)} derivative successfully!`, 'success');

        } catch (error) {
            console.error('Derivative calculation error:', error);
            window.uiHandler?.showToast(`Error: ${error.message}`, 'error');
        }
    }

    getOrdinalSuffix(n) {
        if (n === 1) return 'st';
        if (n === 2) return 'nd';
        if (n === 3) return 'rd';
        return 'th';
    }

    displayDerivativeResult(derivative, steps) {
        const resultElement = document.getElementById('derivativeResult');
        const stepsElement = document.getElementById('derivativeSteps');

        if (resultElement) {
            const order = parseInt(document.getElementById('derivativeOrder').value) || 1;
            const variable = document.getElementById('derivativeVariable').value || 'x';
            
            resultElement.innerHTML = `
                <div class="result-success">
                    <h4>Derivative Result:</h4>
                    <div class="math-expression">
                        \\[ \\frac{d^{${order}}}{d${variable}^{${order}}} \\left( ${document.getElementById('derivativeFunction').value} \\right) = ${this.formatMathExpression(derivative)} \\]
                    </div>
                </div>
            `;
        }

        if (stepsElement) {
            stepsElement.innerHTML = `
                <h4>Solution Steps:</h4>
                <div class="steps-container">
                    ${steps.map(step => `<div class="step">${step}</div>`).join('')}
                </div>
            `;
        }
    }

    calculateIntegral() {
        const functionInput = document.getElementById('integralFunction').value;
        const integralType = document.getElementById('integralType').value;
        const method = document.getElementById('integrationMethod').value;

        if (!functionInput) {
            window.uiHandler?.showToast('Please enter a function', 'error');
            return;
        }

        try {
            let result;
            let steps = [];

            if (integralType === 'indefinite') {
                // Indefinite integral
                result = this.calculateIndefiniteIntegral(functionInput, steps);
            } else {
                // Definite integral
                const lowerBound = parseFloat(document.getElementById('lowerBound').value) || 0;
                const upperBound = parseFloat(document.getElementById('upperBound').value) || 1;
                result = this.calculateDefiniteIntegral(functionInput, lowerBound, upperBound, method, steps);
            }

            this.displayIntegralResult(result, steps, integralType);
            this.plotIntegralGraph(functionInput, integralType);

            window.uiHandler?.showToast('Integral calculated successfully!', 'success');

        } catch (error) {
            console.error('Integral calculation error:', error);
            window.uiHandler?.showToast(`Error: ${error.message}`, 'error');
        }
    }

    calculateIndefiniteIntegral(functionInput, steps) {
        try {
            // Use math.js for symbolic integration
            const integral = math.integrate(functionInput, 'x');
            steps.push(`Indefinite integral: ∫(${functionInput}) dx = ${integral.toString()} + C`);
            
            return integral.toString() + ' + C';
        } catch (error) {
            // Fallback to numerical integration for display
            steps.push(`Note: Using numerical approximation (symbolic integration failed)`);
            return `Numerical approximation available for definite integrals`;
        }
    }

    calculateDefiniteIntegral(functionInput, a, b, method, steps) {
        const func = math.compile(functionInput);
        
        let result;
        switch (method) {
            case 'symbolic':
                try {
                    const integral = math.integrate(functionInput, 'x');
                    const F = math.compile(integral.toString());
                    result = F.evaluate({x: b}) - F.evaluate({x: a});
                    steps.push(`Symbolic integration: ∫ₐᵇ ${functionInput} dx = [${integral.toString()}]₍${a}₎₍${b}₎ = ${result}`);
                } catch (error) {
                    steps.push(`Symbolic integration failed, using Simpson's rule`);
                    result = this.simpsonsRule(func, a, b);
                }
                break;
                
            case 'simpson':
                result = this.simpsonsRule(func, a, b);
                steps.push(`Simpson's rule approximation: ∫ₐᵇ ${functionInput} dx ≈ ${result}`);
                break;
                
            case 'trapezoidal':
                result = this.trapezoidalRule(func, a, b);
                steps.push(`Trapezoidal rule approximation: ∫ₐᵇ ${functionInput} dx ≈ ${result}`);
                break;
        }
        
        return result;
    }

    simpsonsRule(func, a, b, n = 1000) {
        if (n % 2 !== 0) n++; // n must be even
        
        const h = (b - a) / n;
        let sum = func.evaluate({x: a}) + func.evaluate({x: b});
        
        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            const coefficient = (i % 2 === 0) ? 2 : 4;
            sum += coefficient * func.evaluate({x: x});
        }
        
        return (h / 3) * sum;
    }

    trapezoidalRule(func, a, b, n = 1000) {
        const h = (b - a) / n;
        let sum = (func.evaluate({x: a}) + func.evaluate({x: b})) / 2;
        
        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            sum += func.evaluate({x: x});
        }
        
        return h * sum;
    }

    displayIntegralResult(result, steps, integralType) {
        const resultElement = document.getElementById('integralResult');
        
        if (resultElement) {
            if (integralType === 'indefinite') {
                resultElement.innerHTML = `
                    <div class="result-success">
                        <h4>Indefinite Integral:</h4>
                        <div class="math-expression">
                            \\[ \\int ${document.getElementById('integralFunction').value} \\, dx = ${this.formatMathExpression(result)} \\]
                        </div>
                    </div>
                `;
            } else {
                const a = document.getElementById('lowerBound').value;
                const b = document.getElementById('upperBound').value;
                resultElement.innerHTML = `
                    <div class="result-success">
                        <h4>Definite Integral:</h4>
                        <div class="math-expression">
                            \\[ \\int_{${a}}^{${b}} ${document.getElementById('integralFunction').value} \\, dx = ${this.formatMathExpression(result)} \\]
                        </div>
                    </div>
                `;
            }
        }
    }

    toggleIntegralType() {
        const integralType = document.getElementById('integralType').value;
        const definiteBounds = document.getElementById('definiteBounds');
        
        if (definiteBounds) {
            if (integralType === 'definite') {
                definiteBounds.style.display = 'block';
            } else {
                definiteBounds.style.display = 'none';
            }
        }
    }

    formatMathExpression(expr) {
        // Basic formatting for mathematical expressions
        return expr
            .replace(/\^/g, '^')
            .replace(/\*/g, '\\cdot ')
            .replace(/sin/g, '\\sin')
            .replace(/cos/g, '\\cos')
            .replace(/tan/g, '\\tan')
            .replace(/log/g, '\\log')
            .replace(/ln/g, '\\ln');
    }

    setupDerivativeGraph() {
        const canvas = document.getElementById('derivativeGraph');
        if (!canvas) return;
        
        // Implementation for derivative graph visualization
        // This would integrate with the existing GraphPlotter class
    }

    setupIntegralGraph() {
        const canvas = document.getElementById('integralGraph');
        if (!canvas) return;
        
        // Implementation for integral area visualization
    }

    plotDerivativeGraph(originalFunc, derivativeFunc) {
        // Plot both original function and its derivative
        if (window.graphPlotter) {
            window.graphPlotter.clearGraphs();
            window.graphPlotter.addFunction(originalFunc, '#bb86fc');
            window.graphPlotter.addFunction(derivativeFunc, '#03dac6');
        }
    }

    plotIntegralGraph(functionInput, integralType) {
        // Plot the function and shade the area for definite integrals
        if (window.graphPlotter && integralType === 'definite') {
            // Implementation for area visualization
        }
    }
}

// Initialize calculus calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculusCalculator = new CalculusCalculator();
});
