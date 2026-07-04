// Advanced Calculator Class
class AdvancedCalculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.history = [];
        this.shouldResetScreen = false;
        this.isScientificMode = false;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadHistory();
        this.setupKeyboardSupport();
    }
    
    initializeElements() {
        this.currentOperandElement = document.getElementById('current-operand');
        this.previousOperandElement = document.getElementById('previous-operand');
        this.historyPanel = document.getElementById('history-panel');
        this.historyList = document.getElementById('history-list');
        this.themeToggle = document.getElementById('theme-toggle');
        this.historyToggle = document.getElementById('history-toggle');
        this.scientificToggle = document.getElementById('scientific-toggle');
        this.clearHistoryBtn = document.getElementById('clear-history');
    }
    
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
                this.addButtonEffect(button);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.btn[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
                this.addButtonEffect(button);
            });
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            this.addButtonEffect(this.themeToggle);
        });
        
        // History toggle
        this.historyToggle.addEventListener('click', () => {
            this.toggleHistory();
            this.addButtonEffect(this.historyToggle);
        });
        
        // Scientific toggle
        this.scientificToggle.addEventListener('click', () => {
            this.toggleScientificMode();
            this.addButtonEffect(this.scientificToggle);
        });
        
        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
            this.addButtonEffect(this.clearHistoryBtn);
        });
    }
    
    addButtonEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Handle leading zeros
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            // Limit number length to prevent overflow
            if (this.currentOperand.length < 15) {
                this.currentOperand += number;
            }
        }
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.percent();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.chooseOperation(action);
                break;
            case 'equals':
                this.compute();
                break;
        }
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    percent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        // If there's a previous operation, calculate percentage of the result
        if (this.previousOperand !== '' && this.operation !== undefined) {
            const prev = parseFloat(this.previousOperand);
            const result = this.performCalculation(prev, current, this.operation);
            this.currentOperand = (result / 100).toString();
        } else {
            this.currentOperand = (current / 100).toString();
        }
        this.updateDisplay();
    }
    
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }
    
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        computation = this.performCalculation(prev, current, this.operation);
        
        if (computation === null) return; // Error occurred
        
        // Add to history
        const historyItem = {
            expression: `${this.previousOperand} ${this.getOperationSymbol()} ${this.currentOperand}`,
            result: computation.toString(),
            timestamp: new Date().toLocaleString()
        };
        this.history.unshift(historyItem);
        
        // Keep only last 20 calculations
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }
    
    performCalculation(prev, current, operation) {
        switch (operation) {
            case 'add':
                return prev + current;
            case 'subtract':
                return prev - current;
            case 'multiply':
                return prev * current;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero!');
                    return null;
                }
                return prev / current;
            default:
                return null;
        }
    }
    
    showError(message) {
        // Create a temporary error display
        const originalText = this.currentOperandElement.textContent;
        this.currentOperandElement.textContent = 'Error';
        this.currentOperandElement.style.color = 'var(--error-color)';
        
        setTimeout(() => {
            this.currentOperandElement.textContent = originalText;
            this.currentOperandElement.style.color = '';
        }, 2000);
    }
    
    getOperationSymbol() {
        switch (this.operation) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
    
    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol()}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
    
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
    
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('calculator-theme', newTheme);
        
        // Update theme toggle icon with animation
        const icon = this.themeToggle.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            icon.style.transform = '';
        }, 300);
    }
    
    toggleHistory() {
        this.historyPanel.classList.toggle('active');
        this.updateHistoryDisplay();
        
        // Update button text
        const icon = this.historyToggle.querySelector('i');
        const isActive = this.historyPanel.classList.contains('active');
        this.historyToggle.innerHTML = `
            <i class="fas fa-${isActive ? 'times' : 'history'}"></i> 
            ${isActive ? 'Close' : 'History'}
        `;
    }
    
    toggleScientificMode() {
        this.isScientificMode = !this.isScientificMode;
        
        // Update button appearance
        const icon = this.scientificToggle.querySelector('i');
        const isActive = this.isScientificMode;
        
        this.scientificToggle.innerHTML = `
            <i class="fas fa-${isActive ? 'calculator' : 'square-root-alt'}"></i> 
            ${isActive ? 'Standard' : 'Scientific'}
        `;
        
        // Add visual feedback
        this.scientificToggle.style.background = isActive ? 
            'linear-gradient(135deg, var(--success-color), #059669)' : 
            'linear-gradient(135deg, var(--surface), var(--background))';
    }
    
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No calculations yet</p>
                </div>
            `;
            return;
        }
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.loadFromHistory(item.result);
                this.addButtonEffect(historyItem);
            });
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    loadFromHistory(result) {
        this.currentOperand = result;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
        
        // Show confirmation
        this.showNotification('History cleared!');
    }
    
    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    saveHistory() {
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const savedHistory = localStorage.getItem('calculator-history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }
        
        const savedTheme = localStorage.getItem('calculator-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            const icon = this.themeToggle.querySelector('i');
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    setupKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if (['+', '-', '*', '/', 'Enter', '=', 'Backspace', 'Escape', '%', '.'].includes(key)) {
            e.preventDefault();
        }
        
        if (key >= '0' && key <= '9' || key === '.') {
            this.appendNumber(key);
        } else if (key === '+' || key === '-') {
            this.chooseOperation(key === '+' ? 'add' : 'subtract');
        } else if (key === '*') {
            this.chooseOperation('multiply');
        } else if (key === '/') {
            this.chooseOperation('divide');
        } else if (key === 'Enter' || key === '=') {
            this.compute();
        } else if (key === 'Backspace') {
            this.delete();
        } else if (key === 'Escape') {
            this.clear();
        } else if (key === '%') {
            this.percent();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCalculator();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .history-panel {
        display: none;
        transform: translateX(100%);
        transition: all 0.3s ease;
    }
    
    .history-panel.active {
        display: block;
        transform: translateX(0);
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn:active {
        transform: scale(0.95) !important;
    }
    
    .history-item:active {
        transform: scale(0.98) !important;
    }
`;
document.head.appendChild(style); 