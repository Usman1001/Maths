// Unit Converter for Mathematical Quantities
class UnitConverter {
    constructor() {
        this.conversions = {
            // Angle conversions
            angle: {
                degrees: 1,
                radians: Math.PI / 180,
                gradians: 10/9
            },
            
            // Length conversions
            length: {
                meters: 1,
                centimeters: 100,
                millimeters: 1000,
                kilometers: 0.001,
                inches: 39.3701,
                feet: 3.28084,
                yards: 1.09361,
                miles: 0.000621371
            },
            
            // Area conversions
            area: {
                'square-meters': 1,
                'square-centimeters': 10000,
                'square-millimeters': 1000000,
                'square-kilometers': 0.000001,
                hectares: 0.0001,
                'square-inches': 1550,
                'square-feet': 10.7639,
                'square-yards': 1.19599,
                acres: 0.000247105
            },
            
            // Volume conversions
            volume: {
                'cubic-meters': 1,
                liters: 1000,
                milliliters: 1000000,
                'cubic-centimeters': 1000000,
                'cubic-inches': 61023.7,
                'cubic-feet': 35.3147,
                gallons: 264.172
            },
            
            // Time conversions
            time: {
                seconds: 1,
                minutes: 1/60,
                hours: 1/3600,
                days: 1/86400,
                weeks: 1/604800
            },
            
            // Speed conversions
            speed: {
                'm/s': 1,
                'km/h': 3.6,
                'mph': 2.23694,
                'ft/s': 3.28084,
                knots: 1.94384
            },
            
            // Mass conversions
            mass: {
                kilograms: 1,
                grams: 1000,
                milligrams: 1000000,
                pounds: 2.20462,
                ounces: 35.274
            }
        };
    }

    // Convert between units
    convert(value, fromUnit, toUnit, category = 'length') {
        if (!this.conversions[category]) {
            throw new Error(`Unknown conversion category: ${category}`);
        }
        
        const factors = this.conversions[category];
        
        if (!factors[fromUnit] || !factors[toUnit]) {
            throw new Error(`Unknown units: ${fromUnit} or ${toUnit}`);
        }
        
        // Convert to base unit first, then to target unit
        const baseValue = value / factors[fromUnit];
        const result = baseValue * factors[toUnit];
        
        return result;
    }

    // Convert angle between degrees, radians, and gradians
    convertAngle(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'angle');
    }

    // Convert length units
    convertLength(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'length');
    }

    // Convert area units
    convertArea(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'area');
    }

    // Convert volume units
    convertVolume(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'volume');
    }

    // Convert time units
    convertTime(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'time');
    }

    // Convert speed units
    convertSpeed(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'speed');
    }

    // Convert mass units
    convertMass(value, fromUnit, toUnit) {
        return this.convert(value, fromUnit, toUnit, 'mass');
    }

    // Get all available units for a category
    getAvailableUnits(category) {
        return this.conversions[category] ? Object.keys(this.conversions[category]) : [];
    }

    // Get all available categories
    getAvailableCategories() {
        return Object.keys(this.conversions);
    }

    // Format the result with appropriate precision
    formatResult(value, precision = 6) {
        if (Math.abs(value) < 0.000001 && value !== 0) {
            return value.toExponential(precision - 1);
        }
        
        if (Math.abs(value) >= 1000000) {
            return value.toExponential(precision - 1);
        }
        
        // Determine appropriate number of decimal places
        const absValue = Math.abs(value);
        let decimalPlaces;
        
        if (absValue === 0) {
            decimalPlaces = 0;
        } else if (absValue < 0.1) {
            decimalPlaces = 6;
        } else if (absValue < 1) {
            decimalPlaces = 5;
        } else if (absValue < 10) {
            decimalPlaces = 4;
        } else if (absValue < 100) {
            decimalPlaces = 3;
        } else if (absValue < 1000) {
            decimalPlaces = 2;
        } else {
            decimalPlaces = 1;
        }
        
        return parseFloat(value.toFixed(Math.min(decimalPlaces, precision)));
    }

    // Create conversion table for a category
    createConversionTable(value, fromUnit, category, targetUnits = null) {
        if (!this.conversions[category]) {
            throw new Error(`Unknown conversion category: ${category}`);
        }
        
        const units = targetUnits || this.getAvailableUnits(category);
        const table = [];
        
        for (const unit of units) {
            if (unit !== fromUnit) {
                const convertedValue = this.convert(value, fromUnit, unit, category);
                table.push({
                    unit: unit,
                    value: this.formatResult(convertedValue),
                    symbol: this.getUnitSymbol(unit)
                });
            }
        }
        
        return table;
    }

    // Get symbol for a unit
    getUnitSymbol(unit) {
        const symbols = {
            // Angle
            'degrees': '°',
            'radians': 'rad',
            'gradians': 'grad',
            
            // Length
            'meters': 'm',
            'centimeters': 'cm',
            'millimeters': 'mm',
            'kilometers': 'km',
            'inches': 'in',
            'feet': 'ft',
            'yards': 'yd',
            'miles': 'mi',
            
            // Area
            'square-meters': 'm²',
            'square-centimeters': 'cm²',
            'square-millimeters': 'mm²',
            'square-kilometers': 'km²',
            'hectares': 'ha',
            'square-inches': 'in²',
            'square-feet': 'ft²',
            'square-yards': 'yd²',
            'acres': 'ac',
            
            // Volume
            'cubic-meters': 'm³',
            'liters': 'L',
            'milliliters': 'mL',
            'cubic-centimeters': 'cm³',
            'cubic-inches': 'in³',
            'cubic-feet': 'ft³',
            'gallons': 'gal',
            
            // Time
            'seconds': 's',
            'minutes': 'min',
            'hours': 'h',
            'days': 'days',
            'weeks': 'weeks',
            
            // Speed
            'm/s': 'm/s',
            'km/h': 'km/h',
            'mph': 'mph',
            'ft/s': 'ft/s',
            'knots': 'knots',
            
            // Mass
            'kilograms': 'kg',
            'grams': 'g',
            'milligrams': 'mg',
            'pounds': 'lb',
            'ounces': 'oz'
        };
        
        return symbols[unit] || unit;
    }

    // Convert between coordinate systems
    convertCoordinates(x, y, fromSystem, toSystem) {
        let result = { x, y };
        
        switch (`${fromSystem}-${toSystem}`) {
            case 'cartesian-polar':
                result = this.cartesianToPolar(x, y);
                break;
            case 'polar-cartesian':
                result = this.polarToCartesian(x, y);
                break;
            default:
                throw new Error(`Unsupported coordinate conversion: ${fromSystem} to ${toSystem}`);
        }
        
        return result;
    }

    cartesianToPolar(x, y) {
        const r = Math.sqrt(x * x + y * y);
        const theta = Math.atan2(y, x);
        return {
            r: this.formatResult(r),
            theta: this.formatResult(theta),
            thetaDegrees: this.formatResult(theta * 180 / Math.PI)
        };
    }

    polarToCartesian(r, theta) {
        // theta is assumed to be in radians
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        return {
            x: this.formatResult(x),
            y: this.formatResult(y)
        };
    }

    // Temperature conversion (special case)
    convertTemperature(value, fromUnit, toUnit) {
        let celsius;
        
        // Convert to Celsius first
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                throw new Error(`Unknown temperature unit: ${fromUnit}`);
        }
        
        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9/5 + 32;
            case 'kelvin':
                return celsius + 273.15;
            default:
                throw new Error(`Unknown temperature unit: ${toUnit}`);
        }
    }
}

// Initialize unit converter
if (typeof window !== 'undefined') {
    window.unitConverter = new UnitConverter();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitConverter;
}   