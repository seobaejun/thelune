/*--------------------------------------------------------------
  Quote Page JavaScript
----------------------------------------------------------------*/

// Global variables
let totalPrice = 0;
let selectedOptions = {};
let selectedSeatType = null; // 선택된 좌석 유형 추적

// Initialize quote page - moved to main DOMContentLoaded listener

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
    setupFormEventListeners('#quoteForm');
    setupFormEventListeners('#quote6SeatForm');
    
    // Add event listeners to buttons
    setupButtonListeners();
    
    console.log('Event listeners setup complete');
}

// Setup event listeners for a specific form
function setupFormEventListeners(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) {
        console.log(`Form not found: ${formSelector}`);
        return;
    }
    
    const inputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    let listenerCount = 0;
    
    inputs.forEach(input => {
        // Check if listener already exists by checking for data attribute
        if (input.dataset.listenerAttached === 'true') {
            return; // Skip if listener already attached
        }
        
        // Mark as having listener attached
        input.dataset.listenerAttached = 'true';
        
        // Add event listeners
        if (input.type === 'radio') {
            // For radio buttons, use click event to handle deselection
            input.addEventListener('click', handleRadioClick);
        } else {
            // For checkboxes, use change event
            input.addEventListener('change', handleOptionChange);
        }
        
        listenerCount++;
    });
    
    console.log(`Event listeners setup for ${formSelector} (${listenerCount} inputs)`);
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
    console.log('Setting up button listeners...');
    
    // Show quote button
    const showQuoteBtn = document.getElementById('showQuoteBtn');
    if (showQuoteBtn) {
        showQuoteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Show quote button clicked');
            showQuote();
        });
        console.log('Show quote button listener added');
    } else {
        console.error('Show quote button not found');
    }
    
    // Download PDF button
    const downloadPDFBtn = document.getElementById('downloadPDFBtn');
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Download PDF button clicked');
            downloadQuotePDF();
        });
        console.log('Download PDF button listener added');
    } else {
        console.error('Download PDF button not found');
    }
    
    // Reset button
    const resetBtn = document.querySelector('[onclick*="resetQuote"]');
    if (resetBtn) {
        resetBtn.removeAttribute('onclick');
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Reset button clicked');
            resetQuote();
        });
        console.log('Reset button listener added');
    }
    
    // Full option item click
    const fullOptionItem = document.getElementById('fullOptionItem');
    if (fullOptionItem) {
        fullOptionItem.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFullOptionDetails();
        });
        console.log('Full option item click listener added');
    }
    
    // Package1 item click listener removed - details are always visible now
    
    // Show 4-seat options button
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    if (show4SeatBtn) {
        show4SeatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            show4SeatQuoteOptions();
        });
        console.log('Show 4-seat options button listener added');
    }
    
    // Show 6-seat options button
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    if (show6SeatBtn) {
        show6SeatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            show6SeatQuoteOptions();
        });
        console.log('Show 6-seat options button listener added');
    }
    
    // 6인승 Show quote button
    const showQuoteBtn6Seat = document.getElementById('showQuoteBtn6Seat');
    if (showQuoteBtn6Seat) {
        showQuoteBtn6Seat.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('6-seat show quote button clicked');
            showQuote();
        });
        console.log('6-seat show quote button listener added');
    }
    
    // 6인승 Download PDF button
    const downloadPDFBtn6Seat = document.getElementById('downloadPDFBtn6Seat');
    if (downloadPDFBtn6Seat) {
        downloadPDFBtn6Seat.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('6-seat download PDF button clicked');
            downloadQuotePDF();
        });
        console.log('6-seat download PDF button listener added');
    }
    
}

// Handle option change
function handleOptionChange(event) {
    const input = event.target;
    const sectionName = getSectionName(input);
    const optionName = getOptionName(input);
    const price = parseInt(input.dataset.price) || 0;
    
    if (input.type === 'radio') {
        // For radio buttons, only one selection per section
        if (input.checked) {
            // Clear previous selection in this section
            if (selectedOptions[sectionName]) {
                delete selectedOptions[sectionName];
            }
            
            // Set new selection
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
    
    // Update bottom price input (4인승)
    const totalPriceBottomInput = document.getElementById('totalPriceBottom');
    if (totalPriceBottomInput) {
        totalPriceBottomInput.value = formattedPrice;
    }
    
    // Update bottom price input (6인승)
    const totalPriceBottomInput6Seat = document.getElementById('totalPriceBottom6Seat');
    if (totalPriceBottomInput6Seat) {
        totalPriceBottomInput6Seat.value = formattedPrice;
    }
    
    // Update sidebar total (span element)
    const sidebarTotal = document.getElementById('totalPrice');
    if (sidebarTotal) {
        sidebarTotal.textContent = formattedPrice + '원';
    }
    
    console.log('Price display updated:', formattedPrice);
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

// Reset quote options (좌석 유형 변경 시 사용)
function resetQuoteOptions() {
    console.log('resetQuoteOptions() called - seat type changed');
    
    // Reset form without confirmation
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
    
    console.log('Quote options reset for seat type change');
}

// Sidebar functions removed

// Show quote
function showQuote() {
    console.log('=== showQuote() called ===');
    console.log('Selected options count:', Object.keys(selectedOptions).length);
    console.log('Selected options:', selectedOptions);
    
    if (Object.keys(selectedOptions).length === 0) {
        alert('먼저 옵션을 선택해주세요.');
        return;
    }
    
    // Prevent multiple calls
    if (document.getElementById('quoteModal')) {
        console.log('Modal already exists, removing it first');
        document.getElementById('quoteModal').remove();
    }
    
    try {
        console.log('Creating quote modal...');
        createSimpleQuoteModal();
        console.log('Quote modal created successfully');
    } catch (error) {
        console.error('Error creating quote modal:', error);
        alert('견적서 표시 중 오류가 발생했습니다: ' + error.message);
    }
}

// Create simple quote modal
function createSimpleQuoteModal() {
    console.log('Creating simple modal...');
    
    // Create modal HTML
    const modalHTML = `
        <div id="quoteModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; color: black;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #ff3d24;">THE LUNE 견적서</h2>
                    <button onclick="closeSimpleModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div>
                    <h3>선택된 옵션</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">항목</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(selectedOptions).map(([key, option]) => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${option.name}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatPrice(option.price)}원</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: #ff3d24; color: white; font-weight: bold;">
                                <td style="padding: 10px; border: 1px solid #ddd;">총 합계</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatPrice(totalPrice)}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="closeSimpleModal()" style="background: #ccc; color: black; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">닫기</button>
                    <button onclick="downloadQuotePDF()" style="background: #ff3d24; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">PDF 다운로드</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Simple modal added to DOM');
}

// Close simple modal
function closeSimpleModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.remove();
        console.log('Simple modal closed');
    }
}

// Toggle full option details
function toggleFullOptionDetails() {
    const detailsDiv = document.getElementById('fullOptionDetails');
    const toggleArrow = document.getElementById('toggleArrow');
    
    if (detailsDiv && toggleArrow) {
        if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
            detailsDiv.style.display = 'block';
            toggleArrow.innerHTML = '▲';
            console.log('Full option details shown');
        } else {
            detailsDiv.style.display = 'none';
            toggleArrow.innerHTML = '▼';
            console.log('Full option details hidden');
        }
    }
}

// Toggle package1 details
function togglePackage1Details() {
    const detailsDiv = document.getElementById('package1Details');
    const toggleArrow = document.getElementById('package1Arrow');
    
    if (detailsDiv && toggleArrow) {
        if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
            detailsDiv.style.display = 'block';
            toggleArrow.innerHTML = '▲';
            console.log('Package1 details shown');
        } else {
            detailsDiv.style.display = 'none';
            toggleArrow.innerHTML = '▼';
            console.log('Package1 details hidden');
        }
    }
}

// Show 4-seat quote options
function show4SeatQuoteOptions() {
    console.log('show4SeatQuoteOptions() called');
    
    const quoteOptions = document.getElementById('quoteOptions');
    const quote6SeatOptions = document.getElementById('quote6SeatOptions');
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    
    if (quoteOptions && show4SeatBtn) {
        // 6인승 옵션 숨기기
        if (quote6SeatOptions) {
            quote6SeatOptions.style.display = 'none';
        }
        
        // 좌석 유형이 변경되었다면 옵션 초기화
        if (selectedSeatType && selectedSeatType !== '4seat') {
            resetQuoteOptions();
        }
        selectedSeatType = '4seat';
        
        // 즉시 버튼 상태 변경 (사용자 피드백)
        show4SeatBtn.innerHTML = '4인승 견적 선택됨 ✓';
        show4SeatBtn.style.background = 'linear-gradient(135deg, #28a745, #20a039)';
        show4SeatBtn.disabled = true;
        show4SeatBtn.style.cursor = 'default';
        
        // Show sidebar
        showSidebar();
        
        // 6인승 버튼을 다시 선택 가능하게 설정
        if (show6SeatBtn) {
            show6SeatBtn.innerHTML = '견적 문의';
            show6SeatBtn.style.background = 'rgba(139, 69, 19, 0.95)';
            show6SeatBtn.style.opacity = '1';
            show6SeatBtn.disabled = false;
            show6SeatBtn.style.cursor = 'pointer';
        }
        
        // 즉시 옵션 표시 (애니메이션 최소화)
        quoteOptions.style.display = 'block';
        
        // 다음 프레임에서 처리 (레이아웃 안정화)
        requestAnimationFrame(() => {
            // 4인승 form에 이벤트 리스너 설정
            setupFormEventListeners('#quoteForm');
            
            // 스크롤 이동 (단순화)
            setTimeout(() => {
                quoteOptions.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        });
        
        console.log('4-seat quote options shown');
        showNotification('4인승 견적 옵션이 표시되었습니다. 원하는 옵션을 선택해주세요!', 'success');
    } else {
        console.error('Quote options or button not found');
    }
}

// Show 6-seat quote options
function show6SeatQuoteOptions() {
    console.log('show6SeatQuoteOptions() called');
    
    const quoteOptions = document.getElementById('quoteOptions');
    const quote6SeatOptions = document.getElementById('quote6SeatOptions');
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    
    if (quote6SeatOptions && show6SeatBtn) {
        // 4인승 옵션 숨기기
        if (quoteOptions) {
            quoteOptions.style.display = 'none';
        }
        
        // 좌석 유형이 변경되었다면 옵션 초기화
        if (selectedSeatType && selectedSeatType !== '6seat') {
            resetQuoteOptions();
        }
        selectedSeatType = '6seat';
        
        // 즉시 버튼 상태 변경 (사용자 피드백)
        show6SeatBtn.innerHTML = '6인승 견적 선택됨 ✓';
        show6SeatBtn.style.background = 'linear-gradient(135deg, #28a745, #20a039)';
        show6SeatBtn.disabled = true;
        show6SeatBtn.style.cursor = 'default';
        
        // Show sidebar
        showSidebar();
        
        // 4인승 버튼을 다시 선택 가능하게 설정
        if (show4SeatBtn) {
            show4SeatBtn.innerHTML = '견적 문의';
            show4SeatBtn.style.background = 'rgba(139, 69, 19, 0.95)';
            show4SeatBtn.style.opacity = '1';
            show4SeatBtn.disabled = false;
            show4SeatBtn.style.cursor = 'pointer';
        }
        
        // 6인승 옵션 표시 (애니메이션 최소화)
        quote6SeatOptions.style.display = 'block';
        
        // 다음 프레임에서 처리 (레이아웃 안정화)
        requestAnimationFrame(() => {
            // 6인승 form에 이벤트 리스너 설정
            setupFormEventListeners('#quote6SeatForm');
            
            // 스크롤 이동 (단순화)
            setTimeout(() => {
                quote6SeatOptions.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        });
        
        console.log('6-seat quote options shown');
        showNotification('6인승 견적 옵션이 표시되었습니다. 원하는 옵션을 선택해주세요!', 'success');
    } else {
        console.error('6-seat quote options or button not found');
    }
}

// Download PDF quote
function downloadQuotePDF() {
    console.log('=== downloadQuotePDF() called ===');
    
    if (Object.keys(selectedOptions).length === 0) {
        alert('먼저 옵션을 선택해주세요.');
        return;
    }
    
    // Check if libraries are loaded
    if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        console.error('PDF libraries not loaded');
        alert('PDF 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    try {
        alert('PDF를 생성하고 있습니다. 잠시만 기다려주세요...');
        
        // Create a simple PDF content
        const content = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black;">
                <h1 style="color: #ff3d24; text-align: center;">THE LUNE 견적서</h1>
                <p style="text-align: center;">견적일: ${new Date().toLocaleDateString('ko-KR')}</p>
                <hr>
                <h2>선택된 옵션</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 10px; border: 1px solid #ddd;">항목</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">가격</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(selectedOptions).map(([key, option]) => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${option.name}</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatPrice(option.price)}원</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #ff3d24; color: white;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">총 합계</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatPrice(totalPrice)}원</td>
                        </tr>
                    </tfoot>
                </table>
                <hr>
                <p style="text-align: center; margin-top: 30px;">
                    <strong>THE LUNE</strong><br>
                    경기도 파주시 탄현면 축현산단로 21-41<br>
                    전화: 031-943-4488 | 이메일: thelune1@naver.com
                </p>
            </div>
        `;
        
        // Create temporary element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        document.body.appendChild(tempDiv);
        
        // Generate PDF
        html2canvas(tempDiv).then(canvas => {
            document.body.removeChild(tempDiv);
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            const fileName = `THE_LUNE_견적서_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(fileName);
            
            alert('PDF 다운로드가 완료되었습니다!');
            
        }).catch(error => {
            console.error('PDF generation error:', error);
            document.body.removeChild(tempDiv);
            alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
        });
        
    } catch (error) {
        console.error('Error in downloadQuotePDF:', error);
        alert('PDF 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
}

// Print quote (legacy function for compatibility)
function printQuote() {
    if (Object.keys(selectedOptions).length === 0) {
        showNotification('먼저 옵션을 선택해주세요.', 'warning');
        return;
    }
    
    // Create printable content
    const printContent = generatePrintContent();
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('견적서를 출력합니다.', 'info');
}

// Create quote modal
function createQuoteModal() {
    console.log('createQuoteModal() called');
    
    // Remove existing modal if any
    const existingModal = document.getElementById('quoteModal');
    if (existingModal) {
        console.log('Removing existing modal');
        existingModal.remove();
    }
    
    // Double check that modal doesn't exist
    if (document.getElementById('quoteModal')) {
        console.log('Modal still exists after removal, aborting');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'quoteModal';
    modal.className = 'quote-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>THE LUNE 견적서</h3>
                <button class="modal-close" onclick="window.closeQuoteModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${generateQuoteContent()}
            </div>
            <div class="modal-footer">
                <button class="glass-button secondary-glass-button" onclick="window.closeQuoteModal()">
                    <span class="glass-button-text">닫기</span>
                </button>
                <button class="glass-button primary-glass-button" onclick="window.printQuote()">
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
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
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
    console.log('Modal added to body');
    
    // Add overlay click event (only close when clicking the overlay, not the content)
    const overlay = modal.querySelector('.modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            // Only close if clicking directly on the overlay, not on modal content
            if (e.target === overlay) {
                console.log('Overlay clicked, closing modal');
                closeQuoteModal();
            }
        });
    }
    
    // Prevent modal content clicks from bubbling to overlay
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    console.log('Modal setup complete');
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

// Generate PDF content (optimized for PDF generation)
function generatePDFContent() {
    const currentDate = new Date();
    const quoteNumber = 'TL' + currentDate.getFullYear() + (currentDate.getMonth() + 1).toString().padStart(2, '0') + currentDate.getDate().toString().padStart(2, '0') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #ff3d24;">
                <div style="font-size: 28px; font-weight: bold; color: #ff3d24;">THE LUNE</div>
                <div style="text-align: right; font-size: 14px;">
                    <div><strong>견적번호:</strong> ${quoteNumber}</div>
                    <div><strong>견적일자:</strong> ${currentDate.toLocaleDateString('ko-KR')}</div>
                    <div><strong>유효기간:</strong> ${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</div>
                </div>
            </div>
            
            <!-- Title -->
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 30px 0; padding: 15px; background: #f8f9fa; border-left: 5px solid #ff3d24;">
                카니발 하이리무진 견적서
            </div>
            
            <!-- Customer Info -->
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; margin-bottom: 30px;">
                <h4 style="color: #ff3d24; margin-bottom: 15px;">고객 정보</h4>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="width: 120px; font-weight: bold; color: #555;">고객명:</div>
                    <div style="flex: 1; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 20px;"></div>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="width: 120px; font-weight: bold; color: #555;">연락처:</div>
                    <div style="flex: 1; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 20px;"></div>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="width: 120px; font-weight: bold; color: #555;">이메일:</div>
                    <div style="flex: 1; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 20px;"></div>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="width: 120px; font-weight: bold; color: #555;">주소:</div>
                    <div style="flex: 1; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 20px;"></div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #ff3d24;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #ff3d24, #e6351f); color: white;">
                        <th style="padding: 15px 12px; text-align: center; font-weight: bold; font-size: 14px; width: 10%;">번호</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: bold; font-size: 14px; width: 50%;">상품명 / 옵션</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: bold; font-size: 14px; width: 15%;">수량</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: bold; font-size: 14px; width: 25%;">금액</th>
                    </tr>
                </thead>
                <tbody>`;
    
    Object.entries(selectedOptions).forEach(([key, option], index) => {
        content += `
            <tr>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${index + 1}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-weight: 500;">${option.name}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">1</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold; color: #ff3d24;">${formatPrice(option.price)}원</td>
            </tr>
        `;
    });
    
    const subtotal = totalPrice;
    const tax = Math.floor(totalPrice * 0.1);
    const total = subtotal + tax;
    
    content += `
                </tbody>
                <tfoot style="background: #f8f9fa; border: 2px solid #ff3d24;">
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">소계</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #ff3d24;">${formatPrice(subtotal)}원</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">부가세 (10%)</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #ff3d24;">${formatPrice(tax)}원</td>
                    </tr>
                    <tr style="background: #ff3d24; color: white; font-weight: bold; font-size: 18px;">
                        <td colspan="3" style="text-align: right; padding: 15px 12px; border: none;">총 견적금액</td>
                        <td style="padding: 15px 12px; text-align: right; border: none;">${formatPrice(total)}원</td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Terms -->
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #ff3d24;">
                <h4 style="color: #ff3d24; margin-bottom: 15px;">견적 조건 및 유의사항</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">본 견적서는 ${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}까지 유효합니다.</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">최종 가격은 실제 차량 상태 및 추가 옵션에 따라 변동될 수 있습니다.</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">부가세 별도 (부가세 포함 금액은 위 표 참조)</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">작업 기간: 계약 후 약 2-3주 소요 (차량 상태에 따라 변동 가능)</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">A/S 보증: 시공 완료 후 1년간 무상 A/S 제공</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">계약금: 총 금액의 30% (계약 시 지불)</li>
                    <li style="margin-bottom: 8px; font-size: 13px; color: #666;">잔금: 작업 완료 후 인도 시 지불</li>
                </ul>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; text-align: center; padding: 20px; background: #333; color: white; border-radius: 5px;">
                <h3 style="color: #ff3d24; margin-bottom: 10px;">THE LUNE (더룬)</h3>
                <div style="display: flex; justify-content: center; gap: 30px; font-size: 14px; flex-wrap: wrap;">
                    <div>📍 경기도 파주시 탄현면 축현산단로 21-41</div>
                    <div>📞 031-943-4488</div>
                    <div>✉️ thelune1@naver.com</div>
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #ccc;">
                    프리미엄 카니발 하이리무진 전문 업체 | 2023년 브랜드파워 1위 | 차량 인테리어 특허 보유
                </div>
            </div>
        </div>
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
window.closeSimpleModal = closeSimpleModal;
window.toggleFullOptionDetails = toggleFullOptionDetails;
window.togglePackage1Details = togglePackage1Details;
window.show4SeatQuoteOptions = show4SeatQuoteOptions;
window.show4SeatQuoteOptions = show4SeatQuoteOptions;
window.show6SeatQuoteOptions = show6SeatQuoteOptions;
window.setLanguage = setLanguage;

// Debug function
window.testButtons = function() {
    console.log('Testing button functions...');
    console.log('showQuote:', typeof window.showQuote);
    console.log('downloadQuotePDF:', typeof window.downloadQuotePDF);
    console.log('Selected options:', selectedOptions);
    console.log('Total price:', totalPrice);
};

// Initialize quote functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quote system initialized - Version 2.0 - Updated Quote Format');
    
    // Initialize sidebar
    hideSidebar();
    
    // 기존 초기화 함수들 호출
    initializeQuotePage();
    setupEventListeners();
    updatePriceDisplay();
    
    // 6인승 버튼 이벤트 리스너 추가
    const showQuoteBtn6Seat = document.getElementById('showQuoteBtn6Seat');
    const downloadPDFBtn6Seat = document.getElementById('downloadPDFBtn6Seat');
    
    if (showQuoteBtn6Seat) {
        showQuoteBtn6Seat.addEventListener('click', function() {
            console.log('6인승 견적서 보기 버튼 클릭됨');
            showQuote();
        });
    }
    
    if (downloadPDFBtn6Seat) {
        downloadPDFBtn6Seat.addEventListener('click', function() {
            console.log('6인승 PDF 다운로드 버튼 클릭됨');
            downloadQuotePDF();
        });
    }
});

// Show sidebar when options are displayed
function showSidebar() {
    const sidebar = document.getElementById('quoteSidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
        console.log('Sidebar displayed');
    }
}

// Hide sidebar when options are hidden
function hideSidebar() {
    const sidebar = document.getElementById('quoteSidebar');
    if (sidebar) {
        sidebar.style.display = 'none';
        console.log('Sidebar hidden');
    }
}
