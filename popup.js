document.addEventListener('DOMContentLoaded', function() {
    const toggleGrid = document.getElementById('toggleGrid');

    
    // Check if chrome.storage is available
    if (!chrome.storage) {
        console.error('Chrome storage API not available');
        return;
    }
    
    // Load saved state
    chrome.storage.sync.get(['hexagonEnabled', 'hexagonSize'], function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading storage:', chrome.runtime.lastError);
            return;
        }
        
        toggleGrid.checked = result.hexagonEnabled || false;
     
   
    });
    
    // Toggle grid on/off
    toggleGrid.addEventListener('change', function() {
        const enabled = this.checked;
        chrome.storage.sync.set({hexagonEnabled: enabled}, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving storage:', chrome.runtime.lastError);
                return;
            }
        });
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('Error querying tabs:', chrome.runtime.lastError);
                return;
            }
            
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleGrid',
                    enabled: enabled
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        // This is normal if content script isn't loaded yet
                        console.log('Content script not ready:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
    });
    

});