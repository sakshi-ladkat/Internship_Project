/**
 * Draft System Debug Helper
 * Add this script to your page to get a floating debug panel
 * 
 * Usage: Add to index.html before closing </body>:
 * <script src="./assets/js/draft-debugger.js"></script>
 */

(function () {
    'use strict';

    // Create debug panel
    function createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'draftDebugPanel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: #1e293b;
            color: #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 999999;
            overflow: hidden;
            display: none;
        `;

        panel.innerHTML = `
            <div style="background: #0f172a; padding: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
                <strong style="color: #38bdf8;">🔍 Draft Debugger</strong>
                <button id="closeDraftDebug" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px;">×</button>
            </div>
            <div id="draftDebugContent" style="padding: 12px; max-height: 400px; overflow-y: auto;">
                <div style="margin-bottom: 10px;">
                    <button id="refreshDebug" style="width: 100%; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 8px;">🔄 Refresh Status</button>
                    <button id="testSave" style="width: 100%; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 8px;">💾 Test Save</button>
                    <button id="testLoad" style="width: 100%; padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 8px;">📥 Test Load</button>
                    <button id="clearDraft" style="width: 100%; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">🗑️ Clear Draft</button>
                </div>
                <div id="debugInfo" style="background: #0f172a; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.6;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('closeDraftDebug').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        document.getElementById('refreshDebug').addEventListener('click', updateDebugInfo);
        document.getElementById('testSave').addEventListener('click', testSaveDraft);
        document.getElementById('testLoad').addEventListener('click', testLoadDraft);
        document.getElementById('clearDraft').addEventListener('click', clearDraftData);

        return panel;
    }

    // Create toggle button
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'draftDebugToggle';
        button.textContent = '🔍';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            z-index: 999998;
            transition: all 0.3s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', () => {
            const panel = document.getElementById('draftDebugPanel');
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                button.style.display = 'none';
                updateDebugInfo();
            }
        });

        document.body.appendChild(button);
    }

    // Update debug information
    function updateDebugInfo() {
        const info = document.getElementById('debugInfo');
        const token = localStorage.getItem('registrationDraftToken');

        let html = '<div style="margin-bottom: 8px;">';

        // Token status
        if (token) {
            html += `<div style="color: #10b981;">✓ Token: ${token.substring(0, 20)}...</div>`;
        } else {
            html += `<div style="color: #ef4444;">✗ No token found</div>`;
        }

        // Function availability
        html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155;">';
        html += '<strong style="color: #38bdf8;">Functions:</strong><br>';
        html += checkFunction('loadDraft');
        html += checkFunction('saveDraft');
        html += checkFunction('setupAutoSave');
        html += checkFunction('loadInstitutes');
        html += '</div>';

        // Form status
        html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155;">';
        html += '<strong style="color: #38bdf8;">Form Elements:</strong><br>';
        const formWrapper = document.getElementById('registrationFormWrapper');
        if (formWrapper) {
            const inputs = formWrapper.querySelectorAll('input, select');
            html += `<div style="color: #10b981;">✓ Form found (${inputs.length} inputs)</div>`;
        } else {
            html += `<div style="color: #ef4444;">✗ Form not found</div>`;
        }
        html += '</div>';

        // Current step
        html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155;">';
        html += '<strong style="color: #38bdf8;">Registration State:</strong><br>';
        if (typeof registrationCurrentStep !== 'undefined') {
            html += `<div>Current Step: ${registrationCurrentStep}</div>`;
        }
        if (typeof verificationToken !== 'undefined' && verificationToken) {
            html += `<div style="color: #10b981;">✓ Email verified</div>`;
        }
        html += '</div>';

        html += '</div>';
        info.innerHTML = html;
    }

    function checkFunction(name) {
        const exists = typeof window[name] === 'function';
        const color = exists ? '#10b981' : '#ef4444';
        const icon = exists ? '✓' : '✗';
        return `<div style="color: ${color};">${icon} ${name}</div>`;
    }

    // Test save draft
    async function testSaveDraft() {
        const info = document.getElementById('debugInfo');
        info.innerHTML = '<div style="color: #f59e0b;">Saving draft...</div>';

        try {
            if (typeof window.saveDraft === 'function') {
                await window.saveDraft();
                setTimeout(updateDebugInfo, 500);
            } else {
                info.innerHTML = '<div style="color: #ef4444;">✗ saveDraft function not available</div>';
            }
        } catch (error) {
            info.innerHTML = `<div style="color: #ef4444;">✗ Error: ${error.message}</div>`;
        }
    }

    // Test load draft
    async function testLoadDraft() {
        const info = document.getElementById('debugInfo');
        info.innerHTML = '<div style="color: #f59e0b;">Loading draft...</div>';

        try {
            if (typeof window.loadDraft === 'function') {
                await window.loadDraft();
                setTimeout(updateDebugInfo, 500);
            } else {
                info.innerHTML = '<div style="color: #ef4444;">✗ loadDraft function not available</div>';
            }
        } catch (error) {
            info.innerHTML = `<div style="color: #ef4444;">✗ Error: ${error.message}</div>`;
        }
    }

    // Clear draft data
    async function clearDraftData() {
        const token = localStorage.getItem('registrationDraftToken');

        if (token && typeof window.deleteDraft === 'function') {
            await window.deleteDraft();
        }

        localStorage.removeItem('registrationDraftToken');
        updateDebugInfo();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Only show on registration page
        if (window.location.hash.includes('register')) {
            createDebugPanel();
            createToggleButton();
        }
    }

    // Re-initialize on hash change
    window.addEventListener('hashchange', () => {
        const panel = document.getElementById('draftDebugPanel');
        const toggle = document.getElementById('draftDebugToggle');

        if (window.location.hash.includes('register')) {
            if (!panel) {
                createDebugPanel();
                createToggleButton();
            }
        } else {
            if (panel) panel.remove();
            if (toggle) toggle.remove();
        }
    });

})();
