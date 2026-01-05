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
    
    // 초기 로드 시 외장컬러 옵션 상태 업데이트 (등급이 선택되지 않은 상태)
    updateExteriorColorOptions(null);
    
    // 초기 로드 시 특장라인업 옵션 상태 업데이트
    // 4인승 폼은 항상 TLV4로 처리
    const form4Seat = document.getElementById('quoteForm');
    if (form4Seat) {
        updateSpecialLineupOptionsForForm(form4Seat, 'tlv4');
    }
    
    // 9인승 폼은 차종 선택에 따라 처리
    const form9Seat = document.getElementById('quote9SeatForm');
    if (form9Seat) {
        const carTypeInput = form9Seat.querySelector('input[name^="car_type"]:checked');
        if (carTypeInput) {
            updateSpecialLineupOptions(carTypeInput);
        } else {
            updateSpecialLineupOptionsForForm(form9Seat, '');
        }
    }
    
    // 모든 폼에 이미지 컨테이너 추가
    addImageContainersToAllSections();
    
    console.log('Quote page initialized');
}

// 모든 섹션에 이미지 컨테이너 추가
function addImageContainersToAllSections() {
    const forms = ['quoteForm', 'quote6SeatForm', 'quote9SeatForm'];
    const sectionNames = [
        '차종 선택', '유종 선택', '등급 선택', '순정옵션', 
        '외장컬러', '인테리어', '퍼포먼스 옵션', '특장라인업 옵션',
        '기본 컨버전 옵션', '추가 옵션'
    ];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (!form) return;
        
        sectionNames.forEach(sectionName => {
            // 이미 이미지 컨테이너가 있는지 확인
            const existingContainer = form.querySelector(`.option-image-container[data-section="${sectionName}"]`);
            if (existingContainer) return;
            
            // 해당 섹션 찾기
            const section = form.querySelector(`.quote-section h2`);
            if (!section) return;
            
            let currentSection = section.closest('.quote-section');
            while (currentSection) {
                const h2 = currentSection.querySelector('h2');
                if (h2 && h2.textContent.trim() === sectionName) {
                    // 섹션의 section-content 다음에 이미지 컨테이너 추가
                    const sectionContent = currentSection.querySelector('.section-content');
                    if (sectionContent) {
                        const imageContainer = document.createElement('div');
                        imageContainer.className = 'option-image-container';
                        imageContainer.setAttribute('data-section', sectionName);
                        imageContainer.style.cssText = 'display: none; margin-top: 20px; text-align: center;';
                        imageContainer.innerHTML = `<img src="assets/img/4인승.jpg" alt="선택된 옵션 이미지" class="option-image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">`;
                        sectionContent.parentNode.insertBefore(imageContainer, sectionContent.nextSibling);
                    }
                    break;
                }
                currentSection = currentSection.nextElementSibling;
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add event listeners to all form inputs
    setupFormEventListeners('#quoteForm');
    setupFormEventListeners('#quote6SeatForm');
    setupFormEventListeners('#quote9SeatForm');
    
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
            input.addEventListener('click', function(e) {
                // 비활성화된 옵션은 클릭 방지
                if (input.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                handleRadioClick(e);
            });
        } else {
            // For checkboxes, use change event
            input.addEventListener('change', function(e) {
                // 비활성화된 옵션은 변경 방지
                if (input.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    input.checked = false;
                    return false;
                }
                handleOptionChange(e);
            });
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
    
    // Full option item click listener removed - details are always visible now
    
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
    
    // Show 9-seat options button
    const show9SeatBtn = document.getElementById('show9SeatOptions');
    if (show9SeatBtn) {
        show9SeatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            show9SeatQuoteOptions();
        });
        console.log('Show 9-seat options button listener added');
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
    
    // 9인승 Show quote button
    const showQuoteBtn9Seat = document.getElementById('showQuoteBtn9Seat');
    if (showQuoteBtn9Seat) {
        showQuoteBtn9Seat.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('9-seat show quote button clicked');
            showQuote();
        });
        console.log('9-seat show quote button listener added');
    }
    
    // 9인승 Download PDF button
    const downloadPDFBtn9Seat = document.getElementById('downloadPDFBtn9Seat');
    if (downloadPDFBtn9Seat) {
        downloadPDFBtn9Seat.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('9-seat download PDF button clicked');
            downloadQuotePDF();
        });
        console.log('9-seat download PDF button listener added');
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
    
    // 등급 선택이 변경되면 외장컬러 옵션 업데이트
    if (sectionName === '등급 선택' || sectionName === '등급') {
        updateExteriorColorOptions(input);
    }
    
    // 차종 선택이 변경되면 특장라인업 옵션 업데이트
    if (sectionName === '차종 선택' || sectionName === '차종') {
        updateSpecialLineupOptions(input);
    }
    
    // 퍼포먼스 옵션: 리어 에어서스펜션과 HSD 프리미엄 서스펜션은 상호 배타적
    if (sectionName === '퍼포먼스 옵션' || sectionName === '퍼포먼스') {
        const mutualExclude = input.dataset.mutualExclude;
        if (mutualExclude && input.checked) {
            const form = input.closest('form');
            if (form) {
                const excludeInput = form.querySelector(`#${mutualExclude}`);
                if (excludeInput && excludeInput.checked) {
                    excludeInput.checked = false;
                    const excludeSectionName = getSectionName(excludeInput);
                    if (selectedOptions[excludeSectionName] && selectedOptions[excludeSectionName].element === excludeInput) {
                        delete selectedOptions[excludeSectionName];
                        calculateTotalPrice();
                        updatePriceDisplay();
                        updateSelectedOptionsDisplay();
                    }
                }
            }
        }
    }
    
    // Add visual feedback
    addSelectionFeedback(input);
    
    // 옵션 선택 시 이미지 표시
    updateOptionImage(input);
}

// 옵션 선택 시 이미지 표시
function updateOptionImage(input) {
    if (!input) return;
    
    const sectionName = getSectionName(input);
    if (!sectionName) return;
    
    // 현재 폼 찾기
    const form = input.closest('form');
    if (!form) return;
    
    // 체크박스인 경우 (중복 선택 가능)
    if (input.type === 'checkbox') {
        updateCheckboxOptionImage(input, sectionName, form);
    } else {
        // 라디오 버튼인 경우 (단일 선택)
        updateRadioOptionImage(input, sectionName, form);
    }
}

// 체크박스 옵션 이미지 업데이트 (중복 선택 가능)
function updateCheckboxOptionImage(input, sectionName, form) {
    const optionId = input.id;
    const optionValue = input.value;
    
    // 섹션의 메인 이미지 컨테이너 찾기 또는 생성
    let mainImageContainer = form.querySelector(`.option-image-container[data-section="${sectionName}"]`);
    
    if (!mainImageContainer) {
        const section = input.closest('.quote-section');
        if (section) {
            const sectionContent = section.querySelector('.section-content');
            if (sectionContent) {
                mainImageContainer = document.createElement('div');
                mainImageContainer.className = 'option-image-container';
                mainImageContainer.setAttribute('data-section', sectionName);
                mainImageContainer.style.cssText = 'display: none; margin-top: 20px; text-align: center;';
                mainImageContainer.style.display = 'flex';
                mainImageContainer.style.flexWrap = 'wrap';
                mainImageContainer.style.gap = '15px';
                mainImageContainer.style.justifyContent = 'center';
                sectionContent.parentNode.insertBefore(mainImageContainer, sectionContent.nextSibling);
            }
        }
    }
    
    if (!mainImageContainer) return;
    
    // 해당 옵션의 이미지 컨테이너 찾기
    let optionImageContainer = mainImageContainer.querySelector(`.option-image-item[data-option-id="${optionId}"]`);
    
    if (input.checked) {
        // 선택된 경우: 이미지 추가
        if (!optionImageContainer) {
            optionImageContainer = document.createElement('div');
            optionImageContainer.className = 'option-image-item';
            optionImageContainer.setAttribute('data-option-id', optionId);
            optionImageContainer.style.cssText = 'flex: 0 0 auto; max-width: 300px;';
            optionImageContainer.innerHTML = `<img src="assets/img/4인승.jpg" alt="${getOptionName(input)}" class="option-image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">`;
            mainImageContainer.appendChild(optionImageContainer);
        }
        mainImageContainer.style.display = 'flex';
    } else {
        // 선택 해제된 경우: 이미지 제거
        if (optionImageContainer) {
            optionImageContainer.remove();
        }
        
        // 선택된 옵션이 없으면 메인 컨테이너 숨기기
        const remainingImages = mainImageContainer.querySelectorAll('.option-image-item');
        if (remainingImages.length === 0) {
            mainImageContainer.style.display = 'none';
        }
    }
}

// 라디오 버튼 옵션 이미지 업데이트 (단일 선택)
function updateRadioOptionImage(input, sectionName, form) {
    // 해당 섹션의 이미지 컨테이너 찾기
    let imageContainer = form.querySelector(`.option-image-container[data-section="${sectionName}"]`);
    
    // 이미지 컨테이너가 없으면 생성
    if (!imageContainer) {
        const section = input.closest('.quote-section');
        if (section) {
            const sectionContent = section.querySelector('.section-content');
            if (sectionContent) {
                imageContainer = document.createElement('div');
                imageContainer.className = 'option-image-container';
                imageContainer.setAttribute('data-section', sectionName);
                imageContainer.style.cssText = 'display: none; margin-top: 20px; text-align: center;';
                imageContainer.innerHTML = `<img src="assets/img/4인승.jpg" alt="선택된 옵션 이미지" class="option-image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">`;
                sectionContent.parentNode.insertBefore(imageContainer, sectionContent.nextSibling);
            }
        }
    }
    
    if (!imageContainer) return;
    
    // 옵션이 선택되었는지 확인
    const isSelected = input.checked;
    
    if (isSelected) {
        // 이미지 표시
        imageContainer.style.display = 'block';
    } else {
        // 같은 섹션에 다른 선택된 옵션이 있는지 확인
        const sectionInputs = form.querySelectorAll(`input[name="${input.name}"]`);
        let hasSelected = false;
        sectionInputs.forEach(inp => {
            if (inp.checked) {
                hasSelected = true;
            }
        });
        
        if (!hasSelected) {
            imageContainer.style.display = 'none';
        }
    }
}

// 등급 선택에 따라 외장컬러 옵션 활성화/비활성화
function updateExteriorColorOptions(gradeInput) {
    const selectedGrade = gradeInput ? gradeInput.value : null;
    const isXLine = selectedGrade === 'xline';
    
    // 현재 폼 찾기 (4인승, 6인승, 9인승)
    let form;
    if (gradeInput) {
        form = gradeInput.closest('form');
    } else {
        // 등급이 선택되지 않았을 때 모든 폼 처리
        const forms = ['quoteForm', 'quote6SeatForm', 'quote9SeatForm'];
        forms.forEach(formId => {
            const f = document.getElementById(formId);
            if (f) {
                updateExteriorColorOptionsForForm(f, null);
            }
        });
        return;
    }
    
    if (!form) return;
    updateExteriorColorOptionsForForm(form, isXLine);
}

// 특정 폼의 외장컬러 옵션 업데이트
function updateExteriorColorOptionsForForm(form, isXLine) {
    // 해당 폼의 모든 외장컬러 옵션 찾기
    const exteriorColorInputs = form.querySelectorAll('input[name^="exterior_color"]');
    
    exteriorColorInputs.forEach(input => {
        const restriction = input.dataset.gradeRestriction;
        const label = input.closest('.option-item');
        
        if (!restriction) {
            // 제한이 없는 옵션 (오로라 블랙 펄, 스노우 화이트 펄, 네이비 그레이 등)
            input.disabled = false;
            if (label) {
                label.style.opacity = '1';
                label.style.pointerEvents = 'auto';
                label.style.cursor = 'pointer';
            }
        } else if (restriction === 'xline') {
            // X-LINE 전용 (세라믹 실버)
            if (isXLine === true) {
                input.disabled = false;
                if (label) {
                    label.style.opacity = '1';
                    label.style.pointerEvents = 'auto';
                    label.style.cursor = 'pointer';
                }
            } else {
                // X-LINE이 아니면 비활성화
                if (input.checked) {
                    input.checked = false;
                    // 선택 해제 시 가격 업데이트
                    const sectionName = getSectionName(input);
                    if (selectedOptions[sectionName] && selectedOptions[sectionName].element === input) {
                        delete selectedOptions[sectionName];
                        calculateTotalPrice();
                        updatePriceDisplay();
                        updateSelectedOptionsDisplay();
                    }
                }
                input.disabled = true;
                if (label) {
                    label.style.opacity = '0.5';
                    label.style.pointerEvents = 'none';
                    label.style.cursor = 'not-allowed';
                    // label 클릭 이벤트도 막기
                    label.addEventListener('click', function(e) {
                        if (input.disabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                    });
                }
            }
        } else if (restriction === 'not-xline') {
            // X-LINE 제외 (아이보리 실버, 판테라 메탈)
            if (isXLine === false) {
                // X-LINE이 아니고 등급이 선택된 경우 활성화
                input.disabled = false;
                if (label) {
                    label.style.opacity = '1';
                    label.style.pointerEvents = 'auto';
                    label.style.cursor = 'pointer';
                }
            } else {
                // X-LINE이거나 등급이 선택되지 않았으면 비활성화
                if (input.checked) {
                    input.checked = false;
                    // 선택 해제 시 가격 업데이트
                    const sectionName = getSectionName(input);
                    if (selectedOptions[sectionName] && selectedOptions[sectionName].element === input) {
                        delete selectedOptions[sectionName];
                        calculateTotalPrice();
                        updatePriceDisplay();
                        updateSelectedOptionsDisplay();
                    }
                }
                input.disabled = true;
                if (label) {
                    label.style.opacity = '0.5';
                    label.style.pointerEvents = 'none';
                    label.style.cursor = 'not-allowed';
                    // label 클릭 이벤트도 막기
                    label.addEventListener('click', function(e) {
                        if (input.disabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                    });
                }
            }
        }
    });
}

// 차종 선택에 따라 특장라인업 옵션 활성화/비활성화
function updateSpecialLineupOptions(carTypeInput) {
    const form = carTypeInput.closest('form');
    if (!form) return;
    
    // 4인승 폼인 경우 항상 TLV4로 처리
    const formId = form.id;
    if (formId === 'quoteForm') {
        updateSpecialLineupOptionsForForm(form, 'tlv4');
        return;
    }
    
    // 9인승 폼인 경우 차종 선택에 따라 처리
    const selectedCarType = carTypeInput.value;
    let currentModel = '';
    if (selectedCarType === 'high_limousine') {
        currentModel = 'tl9';
    } else if (selectedCarType === 'low_carnival_limousine') {
        currentModel = 'tlv9';
    }
    
    updateSpecialLineupOptionsForForm(form, currentModel);
}

// 특정 폼의 특장라인업 옵션 업데이트
function updateSpecialLineupOptionsForForm(form, currentModel) {
    const specialLineupInputs = form.querySelectorAll('input[name^="special_lineup_options"]');
    
    specialLineupInputs.forEach(input => {
        const restriction = input.dataset.modelRestriction;
        const label = input.closest('.option-item');
        
        if (!restriction || restriction === 'all') {
            // 제한이 없는 옵션
            input.disabled = false;
            if (label) {
                label.style.opacity = '1';
                label.style.pointerEvents = 'auto';
                label.style.cursor = 'pointer';
            }
        } else {
            // 모델 제한이 있는 옵션
            const allowedModels = restriction.split(',').map(m => m.trim().toLowerCase());
            const isAllowed = currentModel && allowedModels.includes(currentModel.toLowerCase());
            
            if (isAllowed) {
                input.disabled = false;
                if (label) {
                    label.style.opacity = '1';
                    label.style.pointerEvents = 'auto';
                    label.style.cursor = 'pointer';
                }
            } else {
                // 선택 불가능한 모델
                if (input.checked) {
                    input.checked = false;
                    const sectionName = getSectionName(input);
                    const optionKey = `${sectionName}_${input.value}`;
                    if (selectedOptions[optionKey] && selectedOptions[optionKey].element === input) {
                        delete selectedOptions[optionKey];
                        calculateTotalPrice();
                        updatePriceDisplay();
                        updateSelectedOptionsDisplay();
                    }
                }
                input.disabled = true;
                if (label) {
                    label.style.opacity = '0.5';
                    label.style.pointerEvents = 'none';
                    label.style.cursor = 'not-allowed';
                }
            }
        }
    });
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
    
    // Update bottom price input (9인승)
    const totalPriceBottomInput9Seat = document.getElementById('totalPriceBottom9Seat');
    if (totalPriceBottomInput9Seat) {
        totalPriceBottomInput9Seat.value = formattedPrice;
    }
    
    // Update sidebar total (span element)
    const sidebarTotal = document.getElementById('sidebarTotal');
    if (sidebarTotal) {
        sidebarTotal.textContent = formatPrice(totalPrice) + '원';
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
        // 총 합계도 0으로 업데이트
        const sidebarTotal = document.getElementById('sidebarTotal');
        if (sidebarTotal) {
            sidebarTotal.textContent = '0원';
        }
        return;
    }
    
    // 총 합계 계산
    let totalSum = 0;
    
    // Add each selected option
    Object.entries(selectedOptions).forEach(([key, option]) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'selected-option';
        
        optionElement.innerHTML = `
            <span class="option-title">${option.name}</span>
            <span class="option-cost">${formatPrice(option.price)}원</span>
        `;
        
        selectedOptionsContainer.appendChild(optionElement);
        
        // 가격 합산
        totalSum += option.price || 0;
    });
    
    // 우측 사이드바의 총 합계 업데이트
    const sidebarTotal = document.getElementById('sidebarTotal');
    if (sidebarTotal) {
        sidebarTotal.textContent = formatPrice(totalSum) + '원';
    }
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
                    <h2 style="margin: 0; color: #bcb8b1;">THE LUNE 견적서</h2>
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
                            <tr style="background: #bcb8b1; color: white; font-weight: bold;">
                                <td style="padding: 10px; border: 1px solid #ddd;">총 합계</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatPrice(totalPrice)}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="closeSimpleModal()" style="background: #ccc; color: black; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">닫기</button>
                    <button onclick="downloadQuotePDF()" style="background: #bcb8b1; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">PDF 다운로드</button>
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

// Toggle full option details - REMOVED (details are always visible now)
// function toggleFullOptionDetails() {
//     const detailsDiv = document.getElementById('fullOptionDetails');
//     const toggleArrow = document.getElementById('toggleArrow');
//     
//     if (detailsDiv && toggleArrow) {
//         if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
//             detailsDiv.style.display = 'block';
//             toggleArrow.innerHTML = '▲';
//             console.log('Full option details shown');
//         } else {
//             detailsDiv.style.display = 'none';
//             toggleArrow.innerHTML = '▼';
//             console.log('Full option details hidden');
//         }
//     }
// }

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
    const quote9SeatOptions = document.getElementById('quote9SeatOptions');
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    const show9SeatBtn = document.getElementById('show9SeatOptions');
    
    if (quoteOptions && show4SeatBtn) {
        // 6인승, 9인승 옵션 숨기기
        if (quote6SeatOptions) {
            quote6SeatOptions.style.display = 'none';
        }
        if (quote9SeatOptions) {
            quote9SeatOptions.style.display = 'none';
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
        
        // 6인승, 9인승 버튼을 다시 선택 가능하게 설정
        if (show6SeatBtn) {
            show6SeatBtn.innerHTML = '견적 문의';
            show6SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show6SeatBtn.style.opacity = '1';
            show6SeatBtn.disabled = false;
            show6SeatBtn.style.cursor = 'pointer';
        }
        if (show9SeatBtn) {
            show9SeatBtn.innerHTML = '견적 문의';
            show9SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show9SeatBtn.style.opacity = '1';
            show9SeatBtn.disabled = false;
            show9SeatBtn.style.cursor = 'pointer';
        }
        
        // 즉시 옵션 표시 (애니메이션 최소화)
        quoteOptions.style.display = 'block';
        
        // 다음 프레임에서 처리 (레이아웃 안정화)
        requestAnimationFrame(() => {
            // 4인승 form에 이벤트 리스너 설정
            setupFormEventListeners('#quoteForm');
            
            // 외장컬러 옵션 상태 업데이트
            const selectedGrade = document.querySelector('#quoteForm input[name="grade_options"]:checked');
            if (selectedGrade) {
                updateExteriorColorOptions(selectedGrade);
            } else {
                updateExteriorColorOptions(null);
            }
            
            // 특장라인업 옵션 상태 업데이트 (4인승은 항상 TLV4)
            updateSpecialLineupOptionsForForm(document.getElementById('quoteForm'), 'tlv4');
            
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
    const quote9SeatOptions = document.getElementById('quote9SeatOptions');
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    const show9SeatBtn = document.getElementById('show9SeatOptions');
    
    if (quote6SeatOptions && show6SeatBtn) {
        // 4인승, 9인승 옵션 숨기기
        if (quoteOptions) {
            quoteOptions.style.display = 'none';
        }
        if (quote9SeatOptions) {
            quote9SeatOptions.style.display = 'none';
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
        
        // 4인승, 9인승 버튼을 다시 선택 가능하게 설정
        if (show4SeatBtn) {
            show4SeatBtn.innerHTML = '견적 문의';
            show4SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show4SeatBtn.style.opacity = '1';
            show4SeatBtn.disabled = false;
            show4SeatBtn.style.cursor = 'pointer';
        }
        if (show9SeatBtn) {
            show9SeatBtn.innerHTML = '견적 문의';
            show9SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show9SeatBtn.style.opacity = '1';
            show9SeatBtn.disabled = false;
            show9SeatBtn.style.cursor = 'pointer';
        }
        
        // 6인승 옵션 표시 (애니메이션 최소화)
        quote6SeatOptions.style.display = 'block';
        
        // 다음 프레임에서 처리 (레이아웃 안정화)
        requestAnimationFrame(() => {
            // 6인승 form에 이벤트 리스너 설정
            setupFormEventListeners('#quote6SeatForm');
            
            // 외장컬러 옵션 상태 업데이트
            const selectedGrade = document.querySelector('#quote6SeatForm input[name="grade_options_6seat"]:checked');
            if (selectedGrade) {
                updateExteriorColorOptions(selectedGrade);
            } else {
                updateExteriorColorOptions(null);
            }
            
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

// Show 9-seat quote options
function show9SeatQuoteOptions() {
    console.log('show9SeatQuoteOptions() called');
    
    const quoteOptions = document.getElementById('quoteOptions');
    const quote6SeatOptions = document.getElementById('quote6SeatOptions');
    const quote9SeatOptions = document.getElementById('quote9SeatOptions');
    const show4SeatBtn = document.getElementById('show4SeatOptions');
    const show6SeatBtn = document.getElementById('show6SeatOptions');
    const show9SeatBtn = document.getElementById('show9SeatOptions');
    
    if (quote9SeatOptions && show9SeatBtn) {
        // 4인승, 6인승 옵션 숨기기
        if (quoteOptions) {
            quoteOptions.style.display = 'none';
        }
        if (quote6SeatOptions) {
            quote6SeatOptions.style.display = 'none';
        }
        
        // 좌석 유형이 변경되었다면 옵션 초기화
        if (selectedSeatType && selectedSeatType !== '9seat') {
            resetQuoteOptions();
        }
        selectedSeatType = '9seat';
        
        // 즉시 버튼 상태 변경 (사용자 피드백)
        show9SeatBtn.innerHTML = '9인승 견적 선택됨 ✓';
        show9SeatBtn.style.background = 'linear-gradient(135deg, #28a745, #20a039)';
        show9SeatBtn.disabled = true;
        show9SeatBtn.style.cursor = 'default';
        
        // Show sidebar
        showSidebar();
        
        // 4인승, 6인승 버튼을 다시 선택 가능하게 설정
        if (show4SeatBtn) {
            show4SeatBtn.innerHTML = '견적 문의';
            show4SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show4SeatBtn.style.opacity = '1';
            show4SeatBtn.disabled = false;
            show4SeatBtn.style.cursor = 'pointer';
        }
        if (show6SeatBtn) {
            show6SeatBtn.innerHTML = '견적 문의';
            show6SeatBtn.style.background = 'rgba(188, 184, 177, 0.95)';
            show6SeatBtn.style.opacity = '1';
            show6SeatBtn.disabled = false;
            show6SeatBtn.style.cursor = 'pointer';
        }
        
        // 9인승 옵션 표시 (애니메이션 최소화)
        quote9SeatOptions.style.display = 'block';
        
        // 다음 프레임에서 처리 (레이아웃 안정화)
        requestAnimationFrame(() => {
            // 9인승 form에 이벤트 리스너 설정
            setupFormEventListeners('#quote9SeatForm');
            
            // 외장컬러 옵션 상태 업데이트
            const selectedGrade = document.querySelector('#quote9SeatForm input[name="grade_options_9seat"]:checked');
            if (selectedGrade) {
                updateExteriorColorOptions(selectedGrade);
            } else {
                updateExteriorColorOptions(null);
            }
            
            // 특장라인업 옵션 상태 업데이트
            const selectedCarType = document.querySelector('#quote9SeatForm input[name="car_type_9seat"]:checked');
            if (selectedCarType) {
                updateSpecialLineupOptions(selectedCarType);
            } else {
                updateSpecialLineupOptionsForForm(document.getElementById('quote9SeatForm'), '');
            }
            
            // 스크롤 이동 (단순화)
            setTimeout(() => {
                quote9SeatOptions.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        });
        
        console.log('9-seat quote options shown');
        showNotification('9인승 견적 옵션이 표시되었습니다. 원하는 옵션을 선택해주세요!', 'success');
    } else {
        console.error('9-seat quote options or button not found');
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
                <h1 style="color: #bcb8b1; text-align: center;">THE LUNE 견적서</h1>
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
                        <tr style="background: #bcb8b1; color: white;">
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
                border: 1px solid rgba(188, 184, 177, 0.3);
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
                border-bottom: 1px solid rgba(188, 184, 177, 0.3);
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
                border-top: 1px solid rgba(188, 184, 177, 0.3);
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
                border-bottom: 1px solid rgba(188, 184, 177, 0.3);
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
                background: rgba(188, 184, 177, 0.1);
                color: var(--primary-color);
                font-weight: 600;
            }
            .quote-table .total-row {
                background: rgba(188, 184, 177, 0.1);
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #bcb8b1;">
                <div style="font-size: 28px; font-weight: bold; color: #bcb8b1;">THE LUNE</div>
                <div style="text-align: right; font-size: 14px;">
                    <div><strong>견적번호:</strong> ${quoteNumber}</div>
                    <div><strong>견적일자:</strong> ${currentDate.toLocaleDateString('ko-KR')}</div>
                    <div><strong>유효기간:</strong> ${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</div>
                </div>
            </div>
            
            <!-- Title -->
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 30px 0; padding: 15px; background: #f8f9fa; border-left: 5px solid #bcb8b1;">
                카니발 하이리무진 견적서
            </div>
            
            <!-- Customer Info -->
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; margin-bottom: 30px;">
                <h4 style="color: #bcb8b1; margin-bottom: 15px;">고객 정보</h4>
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
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #bcb8b1;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #bcb8b1, #a8a49e); color: white;">
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
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold; color: #bcb8b1;">${formatPrice(option.price)}원</td>
            </tr>
        `;
    });
    
    const subtotal = totalPrice;
    const tax = Math.floor(totalPrice * 0.1);
    const total = subtotal + tax;
    
    content += `
                </tbody>
                <tfoot style="background: #f8f9fa; border: 2px solid #bcb8b1;">
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">소계</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #bcb8b1;">${formatPrice(subtotal)}원</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px; font-weight: bold;">부가세 (10%)</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #bcb8b1;">${formatPrice(tax)}원</td>
                    </tr>
                    <tr style="background: #bcb8b1; color: white; font-weight: bold; font-size: 18px;">
                        <td colspan="3" style="text-align: right; padding: 15px 12px; border: none;">총 견적금액</td>
                        <td style="padding: 15px 12px; text-align: right; border: none;">${formatPrice(total)}원</td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Terms -->
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #bcb8b1;">
                <h4 style="color: #bcb8b1; margin-bottom: 15px;">견적 조건 및 유의사항</h4>
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
                <h3 style="color: #bcb8b1; margin-bottom: 10px;">THE LUNE (더룬)</h3>
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
                    border-bottom: 3px solid #bcb8b1;
                }
                .company-logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #bcb8b1;
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
                    border-left: 5px solid #bcb8b1;
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
                    border: 2px solid #bcb8b1;
                }
                th {
                    background: linear-gradient(135deg, #bcb8b1, #a8a49e);
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
                    color: #bcb8b1;
                }
                .total-section {
                    background: #f8f9fa;
                    border: 2px solid #bcb8b1;
                    margin-top: 20px;
                }
                .total-row {
                    background: #bcb8b1;
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
                    border-left: 4px solid #bcb8b1;
                }
                .terms h4 {
                    color: #bcb8b1;
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
                    color: #bcb8b1;
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
                <h4 style="color: #bcb8b1; margin-bottom: 15px;">고객 정보</h4>
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
                border-left: 4px solid #bcb8b1;
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
// window.toggleFullOptionDetails = toggleFullOptionDetails; // REMOVED - details are always visible now
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
