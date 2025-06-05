// Content script for hexagon grid overlay
class HexagonGridOverlay {
    constructor() {
        this.gridContainer = null;
        this.enabled = false;
        this.size = 150;
        this.init();
    }
    
    init() {
        // Load saved settings
        chrome.storage.sync.get(['hexagonEnabled', 'hexagonSize'], (result) => {
            this.enabled = result.hexagonEnabled || false;
            this.size = result.hexagonSize || 80;
            
            if (this.enabled) {
                this.createGrid();
            }
        });
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggleGrid') {
                this.toggleGrid(request.enabled);
            } else if (request.action === 'updateSize') {
                this.updateSize(request.size);
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.enabled && this.gridContainer) {
                this.recreateGrid();
            }
        }); 
        this.createGrid();
    }
    
    createHexagon() {
        const hexagon = document.createElement('div');
        hexagon.className = 'hexagon-overlay-item';
        
        hexagon.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 200 200" style="filter: drop-shadow(rgba(0, 0, 0, 0) 0px 0px 10px);">
                <path class="hexagon-fill-overlay" d="M0 86.60254037844386L50 0L150 0L200 86.60254037844386L150 173.20508075688772L50 173.20508075688772Z"></path>
                <path class="hexagon-border-dark" d="M0 86.60254037844386L50 0L150 0L200 86.60254037844386L150 173.20508075688772L50 173.20508075688772Z"></path>
                <path class="hexagon-border-light" d="M0 86.60254037844386L50 0L150 0L200 86.60254037844386L150 173.20508075688772L50 173.20508075688772Z"></path>
            </svg>
        `;
       
        return hexagon;
    }
    
    createGrid() {
        if (this.gridContainer) {
            this.removeGrid();
        }
        
        // Create main container
        this.gridContainer = document.createElement('div');
        this.gridContainer.id = 'hexagon-overlay-pattern';
        this.gridContainer.className = 'hexagon-pattern-overlay';
        
        // Set CSS custom properties
        this.gridContainer.style.setProperty('--hex-size', this.size + 'px');
        
        // Calculate grid dimensions
        const rowHeight = this.size * 1.1547 * 0.75;
        const numRows = Math.ceil(window.innerHeight / rowHeight) + 14;
        const numCols = Math.ceil(window.innerWidth / this.size) + 14;
        
        for (let row = 0; row < numRows; row++) {
            const hexRow = document.createElement('div');
            hexRow.className = 'hex-row-overlay';
            
            for (let col = 0; col < numCols; col++) {
                const hexagon = this.createHexagon();
                hexRow.appendChild(hexagon);
            }
            
            this.gridContainer.appendChild(hexRow);
        }
        
        document.body.appendChild(this.gridContainer);
    }
    
    removeGrid() {
        if (this.gridContainer) {
            this.gridContainer.remove();
            this.gridContainer = null;
        }
    }
    
    recreateGrid() {
        this.removeGrid();
        this.createGrid();
    }
    
    toggleGrid(enabled) {
        this.enabled = enabled;
        
        if (enabled) {
            this.createGrid();
        } else {
            this.removeGrid();
        }
    }
    
    updateSize(size) {
        this.size = size;
        
        if (this.enabled && this.gridContainer) {
            this.gridContainer.style.setProperty('--hex-size', size + 'px');
            this.recreateGrid();
        }
    }
}

// Initialize the overlay when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HexagonGridOverlay();
    });
} else {
    new HexagonGridOverlay();
}