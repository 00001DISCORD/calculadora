class Calculator {
    constructor(expressionElement, resultElement) {
        this.expressionElement = expressionElement;
        this.resultElement = resultElement;
        this.reset();
    }

    reset() {
        this.currentExpression = '0';
        this.finalExpression = '';
        this.result = '';
        this.isResultShown = false;
        this.openParenthesesCount = 0;
        this.updateScreen();
    }

    appendNumber(number) {
        if (this.isResultShown) {
            this.currentExpression = number;
            this.isResultShown = false;
        } else if (this.currentExpression === '0' && number !== '.') {
            this.currentExpression = number;
        } else if (this.currentExpression.length < 20) {
            this.currentExpression += number;
        }
        this.updateScreen();
    }

    appendOperator(operator) {
        if (this.isResultShown) {
            this.currentExpression = this.result + ' ' + operator + ' ';
            this.isResultShown = false;
        } else if (this.currentExpression !== '' || operator === '-') {
            this.currentExpression += ' ' + operator + ' ';
        }
        this.updateScreen();
    }

    appendDecimal() {
        if (this.isResultShown) {
            this.currentExpression = '0.';
            this.isResultShown = false;
        } else if (!this.currentExpression.split(' ').pop().includes('.')) {
            this.currentExpression += '.';
        }
        this.updateScreen();
    }

    handleParenthesis() {
        if (this.isResultShown) {
            this.currentExpression = '0';
            this.isResultShown = false;
        }
        const lastChar = this.currentExpression.slice(-1);
        const lastToken = this.currentExpression.trim().split(/\s+/).pop();
        const isLastCharNumber = /\d/.test(lastChar);
        const isLastCharOperator = /[+\-*/]/.test(lastChar);

        if (this.openParenthesesCount === 0 || isLastCharOperator) {
            if (this.currentExpression === '0') {
                this.currentExpression = '(';
            } else {
                this.currentExpression += ' (';
            }
            this.openParenthesesCount++;
        } else if (this.openParenthesesCount > 0 && (isLastCharNumber || lastChar === ')')) {
            this.currentExpression += ')';
            this.openParenthesesCount--;
        }
        this.updateScreen();
    }

    calculate() {
        try {
            let expressionToEvaluate = this.currentExpression.trim();
            if (expressionToEvaluate === '') return;

            while (this.openParenthesesCount > 0) {
                expressionToEvaluate += ')';
                this.openParenthesesCount--;
            }

            const result = Function('"use strict";return (' + expressionToEvaluate + ')')();
            if (!isFinite(result)) throw new Error('División por cero');
            this.finalExpression = expressionToEvaluate + ' =';
            this.result = result.toString();
            this.isResultShown = true;
        } catch (error) {
            this.finalExpression = this.currentExpression + ' =';
            this.result = 'Error';
            this.isResultShown = true;
        }
        this.updateScreen();
    }

    backspace() {
        if (this.isResultShown) {
            this.reset();
        } else if (this.currentExpression.length > 1) {
            const newExpression = this.currentExpression.slice(0, -1).trim();
            if (newExpression === '') {
                this.currentExpression = '0';
            } else {
                this.currentExpression = newExpression;
                const lastChar = this.currentExpression.slice(-1);
                if (lastChar === '(') this.openParenthesesCount--;
                else if (lastChar === ')') this.openParenthesesCount++;
            }
        } else {
            this.currentExpression = '0';
        }
        this.updateScreen();
    }

    updateScreen() {
        this.expressionElement.textContent = this.isResultShown ? this.finalExpression : '';
        this.resultElement.textContent = this.isResultShown ? this.result : this.currentExpression;
        this.expressionElement.classList.toggle('dark', this.isResultShown);
    }
}

const expressionElement = document.querySelector('.calculator-expression');
const resultElement = document.querySelector('.calculator-result');
const calculator = new Calculator(expressionElement, resultElement);

// Lógica para alternar temas
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Cargar el tema guardado en localStorage (si existe)
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    themeToggleButton.textContent = savedTheme === 'dark-theme' ? '☀️' : '🌙';
}

themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDarkTheme = body.classList.contains('dark-theme');
    themeToggleButton.textContent = isDarkTheme ? '☀️' : '🌙'; // Cambiar emoji
    localStorage.setItem('theme', isDarkTheme ? 'dark-theme' : 'light-theme');
});

document.querySelector('.calculator-keys').addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) return;

    switch (true) {
        case target.classList.contains('equal-sign'):
            calculator.calculate();
            break;
        case target.classList.contains('operator'):
            calculator.appendOperator(target.value);
            break;
        case target.classList.contains('decimal'):
            calculator.appendDecimal();
            break;
        case target.classList.contains('all-clear'):
            calculator.reset();
            break;
        case target.classList.contains('backspace'):
            calculator.backspace();
            break;
        case target.classList.contains('parenthesis'):
            calculator.handleParenthesis();
            break;
        default:
            calculator.appendNumber(target.value);
    }
});