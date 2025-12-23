/*--------------------------------------------------------------
  Quote Page JavaScript
----------------------------------------------------------------*/

// Global variables
let totalPrice = 0;
let selectedOptions = {};

// Initialize quote page
document.addEventListener('DOMContentLoaded', function() {
    initializeQuotePage();
    setupEventListeners();
    updatePriceDisplay();
});

// Initialize quote page
function initializeQuotePage() {
    // Reset all form inputs
    const form = document.getElementById('quoteForm');
    if (form) {
        form.reset();
    }
    
    // Initialize selected options
    selectedOptions = {};
    totalPrice = 0;
    
    // Update displays
    updatePriceDisplay();
    updateSelectedOptionsDisplay();
    
    console.log('Quote page initialized');
}

// Setup event listeners
function setupEventListeners() {
    // Add event listeners to all form inputs
    const inputs = document.querySelectorAll('#quoteForm input[type="radio"], #quoteForm input[type="checkbox"]');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            // For radio buttons, use click event to handle deselection
            input.addEventListener('click', handleRadioClick);
        } else {
            // For checkboxes, use change event
            input.addEventListener('change', handleOptionChange);
        }
    });
    
    // Add event listeners to buttons
    setupButtonListeners();
    
    console.log('Event listeners setup complete');
}

// Handle radio button clicks (for deselection functionality)
function handleRadioClick(event) {
    const input = event.target;
    const sectionName = getSectionName(input);
    
    // Check if this radio button was already selected
    if (selectedOptions[sectionName] && selectedOptions[sectionName].element === input) {
        // If clicking the same radio button that's already selected, deselect it
        setTimeout(() => {
            input.checked = false;
            delete selectedOptions[sectionName];
            
            // Update price and display
            calculateTotalPrice();
            updatePriceDisplay();
            updateSelectedOptionsDisplay();
            
            // Add visual feedback
            addSelectionFeedback(input);
        }, 0);
    } else {
        // New selection - handle normally
        handleOptionChange(event);
    }
}

// Setup button event listeners
function setupButtonListeners() {
    // Reset button
    const resetBtn = document.querySelector('[onclick="resetQuote()"]');
    if (resetBtn) {
        resetBtn.removeAttribute('onclick');
        resetBtn.addEventListener('click', resetQuote);
    }
    
    // Show quote button
    const showQuoteBtn = document.querySelector('[onclick="showQuote()"]');
    if (showQuoteBtn) {
        showQuoteBtn.removeAttribute('onclick');
        showQuoteBtn.addEventListener('click', showQuote);
    }
    
    // Print quote button
    const printQuoteBtn = document.querySelector('[onclick="printQuote()"]');
    if (printQuoteBtn) {
        printQuoteBtn.removeAttribute('onclick');
        printQuoteBtn.addEventListener('click', printQuote);
    }
}

// Handle option change
function handleOptionChange(event) {
    const input = event.target;
    const sectionName = getSectionName(input);
    const optionName = getOptionName(input);
    const price = parseInt(input.dataset.price) || 0;
    
    if (input.type === 'radio') {
        // For radio buttons, allow deselection by clicking again
        if (input.checked && selectedOptions[sectionName] && selectedOptions[sectionName].element === input) {
            // If clicking the same radio button that's already selected, deselect it
            input.checked = false;
            delete selectedOptions[sectionName];
        } else if (input.checked) {
            // New selection
            selectedOptions[sectionName] = {
                name: optionName,
                price: price,
                element: input
            };
        }
    } else if (input.type === 'checkbox') {
        // For checkboxes, add or remove from selection
        const optionKey = `${sectionName}_${input.value}`;
        
        if (input.checked) {
            selectedOptions[optionKey] = {
                name: optionName,
                price: price,
                element: input
            };
        } else {
            delete selectedOptions[optionKey];
        }
    }
    
    // Update price and display
    calculateTotalPrice();
    updatePriceDisplay();
    updateSelectedOptionsDisplay();
    
    // Add visual feedback
    addSelectionFeedback(input);
}

// Get section name from input
function getSectionName(input) {
    const section = input.closest('.quote-section');
    if (section) {
        const heading = section.querySelector('h2');
        return heading ? heading.textContent.trim() : 'Unknown';
    }
    return 'Unknown';
}

// Get option name from input
function getOptionName(input) {
    const label = input.nextElementSibling;
    if (label) {
        const nameElement = label.querySelector('.option-name');
        return nameElement ? nameElement.textContent.trim() : label.textContent.trim();
    }
    return 'Unknown Option';
}

// Calculate total price
function calculateTotalPrice() {
    totalPrice = 0;
    
    Object.values(selectedOptions).forEach(option => {
        totalPrice += option.price;
    });
    
    console.log('Total price calculated:', totalPrice);
}

// Update price display
function updatePriceDisplay() {
    const formattedPrice = formatPrice(totalPrice);
    
    // Update main price input (if exists)
    const totalPriceInput = document.getElementById('totalPrice');
    if (totalPriceInput) {
        totalPriceInput.value = formattedPrice;
    }
    
    // Update bottom price input
    const totalPriceBottomInput = document.getElementById('totalPriceBottom');
    if (totalPriceBottomInput) {
        totalPriceBottomInput.value = formattedPrice;
    }
    
    // Update sidebar total
    const sidebarTotal = document.getElementById('sidebarTotal');
    if (sidebarTotal) {
        sidebarTotal.textContent = formattedPrice + '원';
    }
}

// Update selected options display
function updateSelectedOptionsDisplay() {
    const selectedOptionsContainer = document.getElementById('selectedOptions');
    if (!selectedOptionsContainer) return;
    
    // Clear existing content
    selectedOptionsContainer.innerHTML = '';
    
    if (Object.keys(selectedOptions).length === 0) {
        selectedOptionsContainer.innerHTML = '<p>옵션을 선택해주세요.</p>';
        return;
    }
    
    // Add each selected option
    Object.entries(selectedOptions).forEach(([key, option]) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'selected-option';
        
        optionElement.innerHTML = `
            <span class="option-title">${option.name}</span>
            <span class="option-cost">${formatPrice(option.price)}원</span>
        `;
        
        selectedOptionsContainer.appendChild(optionElement);
    });
}

// Format price with commas
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Add selection feedback
function addSelectionFeedback(input) {
    const optionItem = input.closest('.option-item');
    if (optionItem) {
        // Add a temporary highlight effect
        optionItem.style.transform = 'scale(1.02)';
        optionItem.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            optionItem.style.transform = '';
        }, 200);
    }
}

// Reset quote
function resetQuote() {
    if (confirm('모든 선택을 초기화하시겠습니까?')) {
        // Reset form
        const form = document.getElementById('quoteForm');
        if (form) {
            form.reset();
        }
        
        // Reset variables
        selectedOptions = {};
        totalPrice = 0;
        
        // Update displays
        updatePriceDisplay();
        updateSelectedOptionsDisplay();
        
        // Show success message
        showNotification('견적이 초기화되었습니다.', 'success');
        
        console.log('Quote reset');
    }
}

// Show quote
function showQuote() {
    if (Object.keys(selectedOptions).length === 0) {
        showNotification('먼저 옵션을 선택해주세요.', 'warning');
        return;
    }
    
    // Create quote modal
    createQuoteModal();
}

// Download PDF quote
function downloadQuotePDF() {
    if (Object.keys(selectedOptions).length === 0) {
        showNotification('먼저 옵션을 선택해주세요.', 'warning');
        return;
    }
    
    // Create printable content for PDF
    const printContent = generatePrintContent();
    
    // Open print window for PDF download
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    showNotification('견적서 PDF 다운로드를 시작합니다.', 'info');
}

// Print quote (legacy function for compatibility)
function printQuote() {
    downloadQuotePDF();
}

// Create quote modal
function createQuoteModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('quoteModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'quoteModal';
    modal.className = 'quote-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeQuoteModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>THE LUNE 견적서</h3>
                <button class="modal-close" onclick="closeQuoteModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${generateQuoteContent()}
            </div>
            <div class="modal-footer">
                <button class="glass-button secondary-glass-button" onclick="closeQuoteModal()">
                    <span class="glass-button-text">닫기</span>
                </button>
                <button class="glass-button primary-glass-button" onclick="downloadQuotePDF()">
                    <span class="glass-button-text">📄 PDF 다운로드</span>
                </button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .quote-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                position: relative;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border: 1px solid rgba(255, 61, 36, 0.3);
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid rgba(255, 61, 36, 0.3);
            }
            .modal-header h3 {
                margin: 0;
                color: var(--primary-color);
                font-size: 24px;
                font-weight: 700;
            }
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                padding: 30px;
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 15px;
                padding: 20px 30px;
                border-top: 1px solid rgba(255, 61, 36, 0.3);
            }
        </style>
    `;
    
    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close quote modal
function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Generate quote content
function generateQuoteContent() {
    let content = `
        <div class="quote-summary-content">
            <div class="company-info">
                <h4>THE LUNE</h4>
                <p>경기도 파주시 탄현면 축현산단로 21-41</p>
                <p>전화: 031-943-4488 | 이메일: thelune1@naver.com</p>
            </div>
            <div class="quote-date">
                <p>견적일: ${new Date().toLocaleDateString('ko-KR')}</p>
            </div>
            <div class="selected-items">
                <h4>선택된 옵션</h4>
                <table class="quote-table">
                    <thead>
                        <tr>
                            <th>항목</th>
                            <th>가격</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.entries(selectedOptions).forEach(([key, option]) => {
        content += `
            <tr>
                <td>${option.name}</td>
                <td>${formatPrice(option.price)}원</td>
            </tr>
        `;
    });
    
    content += `
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>총 합계</strong></td>
                            <td><strong>${formatPrice(totalPrice)}원</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        <style>
            .quote-summary-content .company-info {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 61, 36, 0.3);
            }
            .quote-summary-content .company-info h4 {
                color: var(--primary-color);
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
            }
            .quote-summary-content .quote-date {
                text-align: right;
                margin-bottom: 20px;
            }
            .quote-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .quote-table th,
            .quote-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .quote-table th {
                background: rgba(255, 61, 36, 0.1);
                color: var(--primary-color);
                font-weight: 600;
            }
            .quote-table .total-row {
                background: rgba(255, 61, 36, 0.1);
                color: var(--primary-color);
            }
            .quote-table .total-row td {
                border-top: 2px solid var(--primary-color);
                font-size: 18px;
            }
        </style>
    `;
    
    return content;
}

// Generate print content
function generatePrintContent() {
    const currentDate = new Date();
    const quoteNumber = 'TL' + currentDate.getFullYear() + (currentDate.getMonth() + 1).toString().padStart(2, '0') + currentDate.getDate().toString().padStart(2, '0') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>THE LUNE 견적서</title>
            <style>
                body {
                    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
                    margin: 30px;
                    color: #333;
                    line-height: 1.6;
                }
                .letterhead {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #ff3d24;
                }
                .company-logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #ff3d24;
                }
                .quote-info {
                    text-align: right;
                    font-size: 14px;
                }
                .quote-title {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                    margin: 30px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-left: 5px solid #ff3d24;
                }
                .customer-info {
                    background: #fff;
                    padding: 20px;
                    border: 1px solid #ddd;
                    margin-bottom: 30px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 10px;
                }
                .info-label {
                    width: 120px;
                    font-weight: bold;
                    color: #555;
                }
                .info-value {
                    flex: 1;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 2px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    border: 2px solid #ff3d24;
                }
                th {
                    background: linear-gradient(135deg, #ff3d24, #e6351f);
                    color: white;
                    padding: 15px 12px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                td {
                    padding: 12px;
                    text-align: center;
                    border-bottom: 1px solid #eee;
                }
                .item-name {
                    text-align: left !important;
                    font-weight: 500;
                }
                .price {
                    text-align: right !important;
                    font-weight: bold;
                    color: #ff3d24;
                }
                .total-section {
                    background: #f8f9fa;
                    border: 2px solid #ff3d24;
                    margin-top: 20px;
                }
                .total-row {
                    background: #ff3d24;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                }
                .total-row td {
                    border: none;
                    padding: 15px 12px;
                }
                .terms {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-left: 4px solid #ff3d24;
                }
                .terms h4 {
                    color: #ff3d24;
                    margin-bottom: 15px;
                }
                .terms ul {
                    margin: 0;
                    padding-left: 20px;
                }
                .terms li {
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: #666;
                }
                .company-footer {
                    margin-top: 40px;
                    text-align: center;
                    padding: 20px;
                    background: #333;
                    color: white;
                    border-radius: 5px;
                }
                .company-footer h3 {
                    color: #ff3d24;
                    margin-bottom: 10px;
                }
                .contact-info {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    font-size: 14px;
                }
                @media print {
                    body { margin: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="letterhead">
                <div class="company-logo">THE LUNE</div>
                <div class="quote-info">
                    <div><strong>견적번호:</strong> ${quoteNumber}</div>
                    <div><strong>견적일자:</strong> ${currentDate.toLocaleDateString('ko-KR')}</div>
                    <div><strong>유효기간:</strong> ${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</div>
                </div>
            </div>
            
            <div class="quote-title">카니발 하이리무진 견적서</div>
            
            <div class="customer-info">
                <h4 style="color: #ff3d24; margin-bottom: 15px;">고객 정보</h4>
                <div class="info-row">
                    <div class="info-label">고객명:</div>
                    <div class="info-value"></div>
                </div>
                <div class="info-row">
                    <div class="info-label">연락처:</div>
                    <div class="info-value"></div>
                </div>
                <div class="info-row">
                    <div class="info-label">이메일:</div>
                    <div class="info-value"></div>
                </div>
                <div class="info-row">
                    <div class="info-label">주소:</div>
                    <div class="info-value"></div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th width="10%">번호</th>
                        <th width="50%">상품명 / 옵션</th>
                        <th width="15%">수량</th>
                        <th width="25%">금액</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(selectedOptions).map(([key, option], index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="item-name">${option.name}</td>
                            <td>1</td>
                            <td class="price">${formatPrice(option.price)}원</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot class="total-section">
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">소계</td>
                        <td class="price">${formatPrice(totalPrice)}원</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">부가세 (10%)</td>
                        <td class="price">${formatPrice(Math.floor(totalPrice * 0.1))}원</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">총 견적금액</td>
                        <td>${formatPrice(totalPrice + Math.floor(totalPrice * 0.1))}원</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="terms">
                <h4>견적 조건 및 유의사항</h4>
                <ul>
                    <li>본 견적서는 ${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}까지 유효합니다.</li>
                    <li>최종 가격은 실제 차량 상태 및 추가 옵션에 따라 변동될 수 있습니다.</li>
                    <li>부가세 별도 (부가세 포함 금액은 위 표 참조)</li>
                    <li>작업 기간: 계약 후 약 2-3주 소요 (차량 상태에 따라 변동 가능)</li>
                    <li>A/S 보증: 시공 완료 후 1년간 무상 A/S 제공</li>
                    <li>계약금: 총 금액의 30% (계약 시 지불)</li>
                    <li>잔금: 작업 완료 후 인도 시 지불</li>
                </ul>
            </div>
            
            <div class="company-footer">
                <h3>THE LUNE (더룬)</h3>
                <div class="contact-info">
                    <div>📍 경기도 파주시 탄현면 축현산단로 21-41</div>
                    <div>📞 031-943-4488</div>
                    <div>✉️ thelune1@naver.com</div>
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #ccc;">
                    프리미엄 카니발 하이리무진 전문 업체 | 2023년 브랜드파워 1위 | 차량 인테리어 특허 보유
                </div>
            </div>
        </body>
        </html>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.quote-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `quote-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add notification styles
    const notificationStyles = `
        <style>
            .quote-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1a1a1a;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #ff3d24;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 300px;
                animation: slideInRight 0.3s ease;
            }
            .quote-notification.success {
                border-left-color: #28a745;
            }
            .quote-notification.warning {
                border-left-color: #ffc107;
            }
            .quote-notification.info {
                border-left-color: #17a2b8;
            }
            .quote-notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        </style>
    `;
    
    // Add styles to head if not already added
    if (!document.querySelector('#notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.innerHTML = notificationStyles;
        document.head.appendChild(styleElement);
    }
    
    // Add notification to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Language selection function (for compatibility)
function setLanguage(lang) {
    console.log('Language set to:', lang);
    // This would typically handle language switching
    // For now, just show a notification
    showNotification(lang === 'ko' ? '한국어로 설정되었습니다.' : 'Language set to English.', 'info');
}

// Make functions globally available
window.resetQuote = resetQuote;
window.showQuote = showQuote;
window.printQuote = printQuote;
window.downloadQuotePDF = downloadQuotePDF;
window.closeQuoteModal = closeQuoteModal;
window.setLanguage = setLanguage;

// Initialize quote functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quote system initialized - Version 2.0 - Updated Quote Format');
    initializeQuoteSystem();
});
