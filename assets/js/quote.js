/*--------------------------------------------------------------
  Quote Page JavaScript
----------------------------------------------------------------*/

// Global variables
let totalPrice = 0;
let selectedOptions = {};
let selectedSeatType = null; // 선택된 좌석 유형 추적

// Make totalPrice and selectedOptions globally accessible
window.totalPrice = totalPrice;
window.selectedOptions = selectedOptions;

// Initialize quote page - moved to main DOMContentLoaded listener

// Initialize quote page
function initializeQuotePage() {
    // Initialize selected options
    selectedOptions = {};
    totalPrice = 0;
    
    // form.reset()을 호출하지 않아서 기본 checked 상태 유지
    
    // 순정 옵션과 컨버전 옵션을 강제로 checked 상태로 설정
    function forceCheckStandardAndConversionOptions() {
        const standardOptions = [
            'standard_style', 'standard_drive_wise', 'standard_monitoring',
            'standard_smart_connect', 'standard_hud', 'standard_boss', 'standard_comfort'
        ];
        standardOptions.forEach(optionId => {
            const input = document.getElementById(optionId);
            if (input) {
                input.setAttribute('checked', 'checked');
                input.checked = true;
                // label에 checked 클래스 추가
                const label = input.closest('label');
                if (label) {
                    label.classList.add('checked');
                }
                // change 이벤트 발생시켜서 스타일 업데이트
                input.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('순정 옵션 체크 설정:', optionId, input.checked);
            } else {
                console.log('순정 옵션을 찾을 수 없음:', optionId);
            }
        });
        
        const conversionOptions = [
            'conversion_roof', 'conversion_mood', 'conversion_tv', 'conversion_soundproof'
        ];
        conversionOptions.forEach(optionId => {
            const input = document.getElementById(optionId);
            if (input) {
                input.setAttribute('checked', 'checked');
                input.checked = true;
                // label에 checked 클래스 추가
                const label = input.closest('label');
                if (label) {
                    label.classList.add('checked');
                }
                // change 이벤트 발생시켜서 스타일 업데이트
                input.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('컨버전 옵션 체크 설정:', optionId, input.checked);
            } else {
                console.log('컨버전 옵션을 찾을 수 없음:', optionId);
            }
        });
    }
    
    // 여러 시점에서 체크 상태 설정
    setTimeout(forceCheckStandardAndConversionOptions, 100);
    setTimeout(forceCheckStandardAndConversionOptions, 300);
    setTimeout(forceCheckStandardAndConversionOptions, 500);
    
    // 초기 로드 시 체크된 모든 옵션을 selectedOptions에 추가 (숨겨진 요소 포함)
    // 단, 컨버전 옵션은 제외 (컨버전 옵션 단계로 넘어갔을 때만 합산)
    const allForms = ['quoteForm', 'quote6SeatForm', 'quote9SeatForm'];
    allForms.forEach(formId => {
        const currentForm = document.getElementById(formId);
        if (currentForm) {
            // 모든 체크된 라디오 버튼과 체크박스 찾기 (display:none인 요소도 포함)
            // 단, 컨버전 옵션은 제외
            const checkedInputs = currentForm.querySelectorAll('input[type="radio"][checked], input[type="checkbox"][checked]');
            console.log(`Form ${formId}에서 체크된 옵션 수:`, checkedInputs.length);
            checkedInputs.forEach(input => {
                // 컨버전 옵션은 제외
                if (input.id && (input.id.startsWith('conversion_') || input.name && input.name.startsWith('conversion_'))) {
                    console.log('컨버전 옵션 제외:', input.id || input.name);
                    return;
                }
                
                // checked 속성이 있으면 checked 상태로 확실히 설정
                if (input.hasAttribute('checked')) {
                    input.checked = true;
                }
                
                const sectionName = getSectionName(input);
                const optionName = getOptionName(input);
                const price = parseInt(input.dataset.price) || 0;
                
                if (input.type === 'radio') {
                    selectedOptions[sectionName] = {
                        name: optionName,
                        price: price,
                        element: input
                    };
                    console.log('라디오 옵션 추가:', sectionName, optionName, price);
                } else if (input.type === 'checkbox') {
                    const optionKey = `${sectionName}_${input.value}`;
                    selectedOptions[optionKey] = {
                        name: optionName,
                        price: price,
                        element: input
                    };
                    console.log('체크박스 옵션 추가:', optionKey, optionName, price);
                }
            });
        }
    });
    
    // 전체 문서에서도 체크된 옵션 찾기 (form 밖에 있을 수 있음)
    // 단, 컨버전 옵션은 제외 (컨버전 옵션 단계로 넘어갔을 때만 합산)
    const allCheckedInputs = document.querySelectorAll('input[type="radio"][checked], input[type="checkbox"][checked]');
    console.log('전체 문서에서 체크된 옵션 수:', allCheckedInputs.length);
    allCheckedInputs.forEach(input => {
        // 컨버전 옵션은 제외
        if (input.id && (input.id.startsWith('conversion_') || (input.name && input.name.startsWith('conversion_')))) {
            console.log('컨버전 옵션 제외 (전체 문서):', input.id || input.name);
            return;
        }
        
        const sectionName = getSectionName(input);
        const optionName = getOptionName(input);
        const price = parseInt(input.dataset.price) || 0;
        
        if (input.type === 'radio') {
            if (!selectedOptions[sectionName]) {
                selectedOptions[sectionName] = {
                    name: optionName,
                    price: price,
                    element: input
                };
                console.log('라디오 옵션 추가 (전체 문서):', sectionName, optionName, price);
            }
        } else if (input.type === 'checkbox') {
            const optionKey = `${sectionName}_${input.value}`;
            if (!selectedOptions[optionKey]) {
                selectedOptions[optionKey] = {
                    name: optionName,
                    price: price,
                    element: input
                };
                console.log('체크박스 옵션 추가 (전체 문서):', optionKey, optionName, price);
            }
        }
    });
    
    // 가격 재계산
    calculateTotalPrice();
    
    // Update displays
    updatePriceDisplay();
    updateSelectedOptionsDisplay();
    
    // 초기 로드 시 외장컬러 옵션 상태 업데이트 (등급이 선택되지 않은 상태)
    updateExteriorColorOptions(null);
    
    // 초기 로드 시 모델 선택에 따라 옵션 업데이트
    const form4Seat = document.getElementById('quoteForm');
    if (form4Seat) {
        const modelInput = form4Seat.querySelector('input[name="model_type"]:checked');
        if (modelInput) {
            updateModelOptions(modelInput);
        }
        // 특장라인업 옵션도 업데이트
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
    
    // 초기 단계 설정
    currentStep = 'model-spec';
    showStep('model-spec');
    updateStepButtons();
    updateProgressBar();
    
    console.log('Quote page initialized');
    console.log('Initial selected options:', selectedOptions);
    console.log('Initial total price:', totalPrice);
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
            
            // label 클릭 시 change 이벤트가 확실히 발생하도록
            const label = input.closest('label');
            if (label && !label.dataset.clickListenerAttached) {
                label.dataset.clickListenerAttached = 'true';
                label.addEventListener('click', function(e) {
                    console.log('Label clicked:', input.id, 'target:', e.target.tagName);
                    // input이 아닌 다른 요소를 클릭한 경우
                    if (e.target !== input && e.target.tagName !== 'INPUT') {
                        // 브라우저가 자동으로 input을 체크하도록 기다린 후 change 이벤트 발생
                        setTimeout(() => {
                            console.log('Dispatching change event for:', input.id, 'checked:', input.checked);
                            const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                            input.dispatchEvent(changeEvent);
                        }, 10);
                    }
                });
            }
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
    
    // 컨버전 옵션 버튼 (기존 리스너 제거 후 재등록)
    const quoteConversionBtn = document.getElementById('quoteConversionBtn');
    if (quoteConversionBtn) {
        // 기존 이벤트 리스너 제거를 위해 클론
        const newBtn = quoteConversionBtn.cloneNode(true);
        quoteConversionBtn.parentNode.replaceChild(newBtn, quoteConversionBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('컨버전 옵션 버튼 클릭됨 - goToNextStep 호출');
            console.log('현재 currentStep:', currentStep);
            goToNextStep();
        });
        console.log('컨버전 옵션 버튼 listener 추가됨');
    } else {
        console.error('quoteConversionBtn을 찾을 수 없습니다.');
    }
    
    // 이전 버튼
    const quotePrevBtn = document.getElementById('quotePrevBtn');
    if (quotePrevBtn) {
        quotePrevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('이전 버튼 클릭됨');
            goToPrevStep();
        });
        console.log('이전 버튼 listener 추가됨');
    }
    
    // 견적보기 버튼
    const quoteViewBtn = document.getElementById('quoteViewBtn');
    if (quoteViewBtn) {
        quoteViewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('견적보기 버튼 클릭됨');
            showQuote();
        });
        console.log('견적보기 버튼 listener 추가됨');
    }
    
}

// Handle option change
function handleOptionChange(event) {
    const input = event.target;
    const sectionName = getSectionName(input);
    const optionName = getOptionName(input);
    const price = parseInt(input.dataset.price) || 0;
    
    console.log('handleOptionChange called:', {
        inputId: input.id,
        inputName: input.name,
        inputValue: input.value,
        checked: input.checked,
        sectionName: sectionName,
        optionName: optionName,
        price: price
    });
    
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
            console.log('Option added:', optionKey, price);
        } else {
            delete selectedOptions[optionKey];
            console.log('Option removed:', optionKey);
        }
    }
    
    // Update price and display
    calculateTotalPrice();
    updatePriceDisplay();
    updateSelectedOptionsDisplay();
    
    console.log('Selected options:', selectedOptions);
    console.log('Total price:', totalPrice);
    
    // 등급 선택이 변경되면 외장컬러 옵션 업데이트
    if (sectionName === '등급 선택' || sectionName === '등급') {
        updateExteriorColorOptions(input);
    }
    
    // 차종 선택이 변경되면 특장라인업 옵션 업데이트
    if (sectionName === '차종 선택' || sectionName === '차종') {
        updateSpecialLineupOptions(input);
    }
    
    // 모델 선택이 변경되면 모델별 옵션 업데이트
    if (sectionName === '모델' || input.name === 'model_type') {
        updateModelOptions(input);
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
    
    // name 속성을 기반으로 여러 이미지를 표시해야 하는 섹션 판단
    const inputName = input.name || '';
    const isMultiImageSection = 
        inputName.includes('special_lineup_options') || 
        inputName.includes('performance_options') || 
        inputName.includes('additional_options');
    
    // 특장라인업 옵션, 퍼포먼스 옵션, 추가 옵션은 여러 이미지 표시
    const multiImageSections = ['특장라인업 옵션', '퍼포먼스 옵션', '추가 옵션', '추가옵션'];
    
    // 디버깅
    console.log('updateOptionImage:', {
        inputName: inputName,
        sectionName: sectionName,
        inputType: input.type,
        isMultiImageSection: isMultiImageSection,
        isInMultiImageSections: multiImageSections.includes(sectionName)
    });
    
    // 특장라인업 옵션, 퍼포먼스 옵션, 추가 옵션은 항상 여러 이미지 컨테이너 사용 (라디오 버튼 포함)
    if (isMultiImageSection || multiImageSections.includes(sectionName)) {
        console.log('Calling updateCheckboxOptionImage (multi-image section)');
        // 기존 큰 이미지 컨테이너 제거 (data-multi-image 속성이 없는 것)
        const existingContainers = form.querySelectorAll(`.option-image-container[data-section="${sectionName}"]`);
        existingContainers.forEach(container => {
            if (!container.hasAttribute('data-multi-image')) {
                // 큰 이미지만 있는 컨테이너 제거
                const hasImageItems = container.querySelector('.option-image-item');
                if (!hasImageItems) {
                    container.remove();
                }
            }
        });
        updateCheckboxOptionImage(input, sectionName, form);
    } else if (input.type === 'checkbox') {
        // 다른 섹션의 체크박스도 여러 이미지 컨테이너 사용
        console.log('Calling updateCheckboxOptionImage (checkbox)');
        updateCheckboxOptionImage(input, sectionName, form);
    } else {
        // 라디오 버튼인 경우 (단일 선택) - 큰 이미지 표시
        console.log('Calling updateRadioOptionImage');
        updateRadioOptionImage(input, sectionName, form);
    }
}

// 체크박스 옵션 이미지 업데이트 (중복 선택 가능, 라디오 버튼도 포함)
function updateCheckboxOptionImage(input, sectionName, form) {
    const optionId = input.id;
    const optionValue = input.value;
    
    console.log('updateCheckboxOptionImage called:', {
        optionId: optionId,
        sectionName: sectionName,
        checked: input.checked
    });
    
    // 섹션의 메인 이미지 컨테이너 찾기 또는 생성
    let mainImageContainer = form.querySelector(`.option-image-container[data-section="${sectionName}"]`);
    
    console.log('mainImageContainer found:', !!mainImageContainer);
    
    if (!mainImageContainer) {
        const section = input.closest('.quote-section');
        if (section) {
            const sectionContent = section.querySelector('.section-content');
            if (sectionContent) {
                mainImageContainer = document.createElement('div');
                mainImageContainer.className = 'option-image-container';
                mainImageContainer.setAttribute('data-section', sectionName);
                mainImageContainer.setAttribute('data-multi-image', 'true');
                // 추가옵션과 동일한 스타일 적용
                mainImageContainer.style.cssText = 'display: none; margin-top: 20px; text-align: center;';
                mainImageContainer.style.display = 'flex';
                mainImageContainer.style.flexWrap = 'wrap';
                mainImageContainer.style.gap = '15px';
                mainImageContainer.style.justifyContent = 'center';
                sectionContent.parentNode.insertBefore(mainImageContainer, sectionContent.nextSibling);
                console.log('Created new mainImageContainer');
            } else {
                console.log('sectionContent not found');
            }
        } else {
            console.log('section not found');
        }
    }
    
    if (!mainImageContainer) {
        console.log('mainImageContainer is null, returning');
        return;
    }
    
    // 기존 컨테이너가 있으면 스타일 업데이트
    if (mainImageContainer) {
        mainImageContainer.style.display = 'flex';
        mainImageContainer.style.flexWrap = 'wrap';
        mainImageContainer.style.gap = '15px';
        mainImageContainer.style.justifyContent = 'center';
    }
    
    // 라디오 버튼인 경우, 같은 name을 가진 다른 라디오 버튼의 이미지 제거
    if (input.type === 'radio') {
        const sameNameInputs = form.querySelectorAll(`input[name="${input.name}"]`);
        sameNameInputs.forEach(inp => {
            if (inp.id !== optionId) {
                const otherImageContainer = mainImageContainer.querySelector(`.option-image-item[data-option-id="${inp.id}"]`);
                if (otherImageContainer) {
                    otherImageContainer.remove();
                }
            }
        });
    }
    
    // 해당 옵션의 이미지 컨테이너 찾기
    let optionImageContainer = mainImageContainer.querySelector(`.option-image-item[data-option-id="${optionId}"]`);
    
    console.log('optionImageContainer found:', !!optionImageContainer);
    
    if (input.checked) {
        // 선택된 경우: 이미지 추가
        if (!optionImageContainer) {
            optionImageContainer = document.createElement('div');
            optionImageContainer.className = 'option-image-item';
            optionImageContainer.setAttribute('data-option-id', optionId);
            // 모든 이미지를 동일한 크기로 고정
            optionImageContainer.style.cssText = 'flex: 0 0 auto; width: 200px; height: 150px; overflow: hidden;';
            optionImageContainer.innerHTML = `<img src="assets/img/4인승.jpg" alt="${getOptionName(input)}" class="option-image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">`;
            mainImageContainer.appendChild(optionImageContainer);
            console.log('Added new image container');
        }
        mainImageContainer.style.display = 'flex';
    } else {
        // 선택 해제된 경우: 이미지 제거
        if (optionImageContainer) {
            optionImageContainer.remove();
            console.log('Removed image container');
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
    // 먼저 data-group 속성을 가진 부모 요소 찾기
    const groupElement = input.closest('[data-group]');
    if (groupElement && groupElement.dataset.group) {
        return groupElement.dataset.group;
    }
    
    // optbx 내부의 h4 찾기
    const optbx = input.closest('.optbx');
    if (optbx) {
        const heading = optbx.querySelector('h4');
        if (heading) {
            return heading.textContent.trim();
        }
    }
    
    // trim-bx의 경우 opt-label 찾기
    const trimBx = input.closest('.trim-bx');
    if (trimBx) {
        const label = trimBx.querySelector('.opt-label');
        if (label) {
            return label.textContent.trim();
        }
    }
    
    // 기존 방식 (호환성)
    const section = input.closest('.quote-section');
    if (section) {
        const heading = section.querySelector('h2');
        if (heading) {
            return heading.textContent.trim();
    }
    }
    
    return 'Unknown';
}

// Get option name from input
function getOptionName(input) {
    // label이 input의 부모인 경우 (input이 label 안에 있는 경우)
    const parentLabel = input.closest('label');
    if (parentLabel) {
        const span = parentLabel.querySelector('span');
        if (span) {
            return span.textContent.trim();
        }
        // span이 없으면 label의 텍스트에서 input의 value 제외
        const labelText = parentLabel.textContent.trim();
        return labelText || input.value;
    }
    
    // label이 input의 다음 형제인 경우
    const nextLabel = input.nextElementSibling;
    if (nextLabel && nextLabel.tagName === 'LABEL') {
        const nameElement = nextLabel.querySelector('.option-name');
        if (nameElement) {
            return nameElement.textContent.trim();
        }
        const span = nextLabel.querySelector('span');
        if (span) {
            return span.textContent.trim();
        }
        return nextLabel.textContent.trim();
    }
    
    // label for 속성으로 연결된 경우
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
            const span = label.querySelector('span');
            if (span) {
                return span.textContent.trim();
            }
            return label.textContent.trim();
    }
    }
    
    // value를 기본값으로 사용
    return input.value || 'Unknown Option';
}

// Calculate total price
function calculateTotalPrice() {
    totalPrice = 0;
    
    Object.values(selectedOptions).forEach(option => {
        totalPrice += option.price;
    });
    
    // Update global variable
    window.totalPrice = totalPrice;
    
    console.log('Total price calculated:', totalPrice);
    console.log('Selected options:', selectedOptions);
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
    
    // Update right sidebar price (CN모터스 스타일 - 4인승)
    const quoteTotalPriceRight = document.getElementById('quoteTotalPriceRight');
    if (quoteTotalPriceRight) {
        quoteTotalPriceRight.textContent = formattedPrice;
    }
    
    // Update right sidebar price (6인승)
    const quoteTotalPriceRight6Seat = document.getElementById('quoteTotalPriceRight6Seat');
    if (quoteTotalPriceRight6Seat) {
        quoteTotalPriceRight6Seat.textContent = formattedPrice;
    }
    
    // Update right sidebar price (9인승)
    const quoteTotalPriceRight9Seat = document.getElementById('quoteTotalPriceRight9Seat');
    if (quoteTotalPriceRight9Seat) {
        quoteTotalPriceRight9Seat.textContent = formattedPrice;
    }
    
    // Update quoteTotalPrice (하단 견적 금액)
    const quoteTotalPrice = document.getElementById('quoteTotalPrice');
    if (quoteTotalPrice) {
        quoteTotalPrice.textContent = formattedPrice;
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
    
    // 옵션을 그룹별로 정리
    const groupedOptions = {};
    Object.entries(selectedOptions).forEach(([key, option]) => {
        // element에서 data-group 속성 가져오기
        let group = '기타';
        if (option.element) {
            const groupElement = option.element.closest('[data-group]');
            if (groupElement && groupElement.dataset.group) {
                group = groupElement.dataset.group;
            } else {
                // data-group이 없으면 부모 섹션의 제목 찾기
                const optbx = option.element.closest('.optbx');
                if (optbx) {
                    const optbxTop = optbx.querySelector('.optbx-top h4');
                    if (optbxTop) {
                        group = optbxTop.textContent.trim();
                    }
                }
            }
        }
        if (!groupedOptions[group]) {
            groupedOptions[group] = [];
        }
        groupedOptions[group].push(option);
    });
    
    // Create modal HTML with improved styling
    const modalHTML = `
        <div id="quoteModal" class="quote-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
            <div class="quote-modal-box" style="background: #ffffff; border-radius: 15px; max-width: 700px; width: 100%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div class="quote-modal-header" style="padding: 25px 30px; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; background: #1a1a1a;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">THE LUNE 견적서</h2>
                    <button onclick="closeSimpleModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #ffffff; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">&times;</button>
                </div>
                <div class="quote-modal-body" style="padding: 30px; overflow-y: auto; flex: 1;">
                    ${Object.keys(groupedOptions).length > 0 ? Object.entries(groupedOptions).map(([group, options]) => `
                        <div class="quote-group" style="margin-bottom: 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #1a1a1a;">${group}</h3>
                            <div class="quote-options-list" style="display: flex; flex-direction: column; gap: 10px;">
                                ${options.map(option => `
                                    <div class="quote-option-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f5f5f5; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                                        <span style="color: #1a1a1a; font-size: 15px; font-weight: 500;">${option.name}</span>
                                        <span style="color: #1a1a1a; font-size: 16px; font-weight: 600;">${formatPrice(option.price)}원</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') : '<p style="text-align: center; color: #999; padding: 40px 0;">선택된 옵션이 없습니다.</p>'}
                    
                    <div class="quote-total" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #1a1a1a;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #1a1a1a; border-radius: 10px;">
                            <span style="color: #ffffff; font-size: 18px; font-weight: 600;">총 견적 금액</span>
                            <span style="color: #ffffff; font-size: 28px; font-weight: 700;">${formatPrice(totalPrice)}원</span>
                        </div>
                    </div>
                </div>
                <div class="quote-modal-footer" style="padding: 20px 30px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; gap: 10px; justify-content: flex-end; background: #f9f9f9;">
                    <button onclick="closeSimpleModal()" style="background: #ffffff; color: #1a1a1a; padding: 12px 24px; border: 1px solid rgba(0,0,0,0.2); border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#f5f5f5'; this.style.borderColor='rgba(0,0,0,0.4)'" onmouseout="this.style.background='#ffffff'; this.style.borderColor='rgba(0,0,0,0.2)'">닫기</button>
                    <button onclick="downloadQuotePDF()" style="background: #1a1a1a; color: #ffffff; padding: 12px 24px; border: 1px solid #1a1a1a; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#1a1a1a'">📄 PDF 다운로드</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 모달 외부 클릭 시 닫기
    const modalOverlay = document.querySelector('#quoteModal.quote-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeSimpleModal();
            }
        });
    }
    
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
            
            // 이미지 슬라이더 초기화
            initializeImageSlider();
            
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
            
            // 이미지 슬라이더 초기화
            initializeImageSlider();
            
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
            
            // 이미지 슬라이더 초기화
            initializeImageSlider();
            
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
window.handleOptionChange = handleOptionChange;
window.calculateTotalPrice = calculateTotalPrice;
window.updatePriceDisplay = updatePriceDisplay;
window.getSectionName = getSectionName;
window.getOptionName = getOptionName;

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
    
    // 순정 옵션과 컨버전 옵션을 확실히 체크 상태로 설정
    function ensureStandardAndConversionOptionsChecked() {
        const standardOptions = [
            'standard_style', 'standard_drive_wise', 'standard_monitoring',
            'standard_smart_connect', 'standard_hud', 'standard_boss', 'standard_comfort'
        ];
        standardOptions.forEach(optionId => {
            const input = document.getElementById(optionId);
            if (input) {
                input.setAttribute('checked', 'checked');
                input.checked = true;
                // label에 checked 클래스 추가
                const label = input.closest('label');
                if (label) {
                    label.classList.add('checked');
                }
                console.log('순정 옵션 체크 확인:', optionId, input.checked);
            } else {
                console.log('순정 옵션을 찾을 수 없음:', optionId);
            }
        });
        
        const conversionOptions = [
            'conversion_roof', 'conversion_mood', 'conversion_tv', 'conversion_soundproof'
        ];
        conversionOptions.forEach(optionId => {
            const input = document.getElementById(optionId);
            if (input) {
                input.setAttribute('checked', 'checked');
                input.checked = true;
                // label에 checked 클래스 추가
                const label = input.closest('label');
                if (label) {
                    label.classList.add('checked');
                }
                console.log('컨버전 옵션 체크 확인:', optionId, input.checked);
            } else {
                console.log('컨버전 옵션을 찾을 수 없음:', optionId);
            }
        });
    }
    
    // 여러 시점에서 체크 상태 확인
    setTimeout(ensureStandardAndConversionOptionsChecked, 500);
    setTimeout(ensureStandardAndConversionOptionsChecked, 1000);
    setTimeout(ensureStandardAndConversionOptionsChecked, 2000);
        
        // 초기화 후 다시 한번 체크된 옵션 확인 및 합산
        // 단, 컨버전 옵션은 제외
        const allCheckedInputs = document.querySelectorAll('input[type="radio"][checked], input[type="checkbox"][checked]');
        console.log('초기화 후 체크된 옵션 재확인:', allCheckedInputs.length);
        allCheckedInputs.forEach(input => {
            // 컨버전 옵션은 제외
            if (input.id && (input.id.startsWith('conversion_') || (input.name && input.name.startsWith('conversion_')))) {
                return;
            }
            
            // 실제로 checked 상태로 설정
            input.checked = true;
            
            const sectionName = getSectionName(input);
            const optionName = getOptionName(input);
            const price = parseInt(input.dataset.price) || 0;
            
            if (input.type === 'radio') {
                selectedOptions[sectionName] = {
                    name: optionName,
                    price: price,
                    element: input
                };
            } else if (input.type === 'checkbox') {
                const optionKey = `${sectionName}_${input.value}`;
                selectedOptions[optionKey] = {
                    name: optionName,
                    price: price,
                    element: input
                };
            }
        });
        
        calculateTotalPrice();
        updatePriceDisplay();
        updateSelectedOptionsDisplay();
        console.log('초기화 후 최종 합산 완료, 총액:', totalPrice);
    }, 500);
    
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

// 이미지 슬라이더 초기화 (CN모터스 스타일)
function initializeImageSlider() {
    const sliderContainer = document.querySelector('.quote-image-swiper');
    if (!sliderContainer) return;
    
    // 기존 Swiper 인스턴스가 있으면 제거
    if (sliderContainer.swiper) {
        sliderContainer.swiper.destroy(true, true);
    }
    
    // Swiper 초기화
    if (typeof Swiper !== 'undefined') {
        new Swiper('.quote-image-swiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
        console.log('Image slider initialized');
    } else {
        console.warn('Swiper library not loaded');
    }
}

// 모델 선택에 따라 옵션 표시/숨김 처리
function updateModelOptions(modelInput) {
    if (!modelInput || !modelInput.checked) return;
    
    const form = modelInput.closest('form');
    if (!form) return;
    
    const selectedModel = modelInput.value.toLowerCase(); // TL9, TLV9, TLV4
    console.log('Selected model:', selectedModel);
    
    // 모델 선택 섹션은 항상 표시 (제외)
    const modelSelectionSection = form.querySelector('[data-opt="model_type"]');
    
    // 모든 옵션 섹션 찾기 (모델 선택 섹션 제외)
    const allOptionSections = form.querySelectorAll('.optbx, .opt-wrap');
    
    allOptionSections.forEach(section => {
        // 모델 선택 섹션은 건너뛰기
        if (section.contains(modelSelectionSection) || section === modelSelectionSection) {
            return;
        }
        
        const sectionDataModel = section.dataset.model;
        
        // 섹션에 data-model 속성이 있고, 선택된 모델과 일치하지 않으면 숨김
        if (sectionDataModel && sectionDataModel !== selectedModel) {
            section.style.display = 'none';
        } else if (sectionDataModel && sectionDataModel === selectedModel) {
            section.style.display = 'block';
        }
    });
    
    // TL9 선택 시 특정 옵션들 표시 (모델 선택 라디오 버튼 제외)
    if (selectedModel === 'tl9') {
        // TL9 전용 옵션들 표시 (모델 선택 섹션 제외)
        const tl9Options = form.querySelectorAll('[data-model="tl9"]:not([data-opt="model_type"]), [data-tl9-only="true"]');
        tl9Options.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'block';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = false;
            }
        });
        
        // 다른 모델 전용 옵션들 숨김 (모델 선택 섹션 제외)
        const otherModelOptions = form.querySelectorAll('[data-model="tlv9"]:not([data-opt="model_type"]), [data-model="tlv4"]:not([data-opt="model_type"]), [data-tlv9-only="true"], [data-tlv4-only="true"]');
        otherModelOptions.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'none';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = true;
                input.checked = false;
            }
        });
    } else if (selectedModel === 'tlv9') {
        // TLV9 전용 옵션들 표시 (모델 선택 섹션 제외)
        const tlv9Options = form.querySelectorAll('[data-model="tlv9"]:not([data-opt="model_type"]), [data-tlv9-only="true"]');
        tlv9Options.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'block';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = false;
            }
        });
        
        // 다른 모델 전용 옵션들 숨김 (모델 선택 섹션 제외)
        const otherModelOptions = form.querySelectorAll('[data-model="tl9"]:not([data-opt="model_type"]), [data-model="tlv4"]:not([data-opt="model_type"]), [data-tl9-only="true"], [data-tlv4-only="true"]');
        otherModelOptions.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'none';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = true;
                input.checked = false;
            }
        });
    } else if (selectedModel === 'tlv4') {
        // TLV4 전용 옵션들 표시 (모델 선택 섹션 제외)
        const tlv4Options = form.querySelectorAll('[data-model="tlv4"]:not([data-opt="model_type"]), [data-tlv4-only="true"]');
        tlv4Options.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'block';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = false;
            }
        });
        
        // 다른 모델 전용 옵션들 숨김 (모델 선택 섹션 제외)
        const otherModelOptions = form.querySelectorAll('[data-model="tl9"]:not([data-opt="model_type"]), [data-model="tlv9"]:not([data-opt="model_type"]), [data-tl9-only="true"], [data-tlv9-only="true"]');
        otherModelOptions.forEach(option => {
            // 모델 선택 섹션 내부 요소는 제외
            if (option.closest('[data-opt="model_type"]')) {
                return;
            }
            option.style.display = 'none';
            const input = option.querySelector('input');
            if (input) {
                input.disabled = true;
                input.checked = false;
            }
        });
    }
    
    // 가격 재계산
    calculateTotalPrice();
    updatePriceDisplay();
}

// 현재 단계 추적
let currentStep = 'model-spec'; // 초기 단계: 모델/사양
window.currentStep = currentStep; // 전역 접근을 위해 window에 할당

// currentStep을 외부에서 설정할 수 있는 함수
window.setCurrentStep = function(step) {
    currentStep = step;
    window.currentStep = step;
    console.log('currentStep 업데이트됨:', currentStep);
};

// 단계 정의
const steps = ['model-spec', 'conversion', 'conversion-select', 'additional'];

// 단계 제목 정의
const stepTitles = {
    'model-spec': '모델/사양',
    'conversion': '컨버전 옵션',
    'conversion-select': '컨버전 옵션 선택',
    'additional': '추가 옵션'
};

// 다음 단계로 이동
function goToNextStep() {
    console.log('goToNextStep 호출 - currentStep:', currentStep);
    const currentIndex = steps.indexOf(currentStep);
    console.log('현재 인덱스:', currentIndex, 'steps:', steps);
    
    if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        console.log('다음 단계로 이동:', nextStep);
        showStep(nextStep);
        currentStep = nextStep;
        window.currentStep = currentStep; // 전역에도 업데이트
        console.log('currentStep 업데이트됨:', currentStep);
        updateStepButtons();
        updateProgressBar();
    } else {
        console.log('마지막 단계입니다. 더 이상 이동할 수 없습니다.');
    }
}

// 이전 단계로 이동
function goToPrevStep() {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1];
        showStep(prevStep);
        currentStep = prevStep;
        updateStepButtons();
        updateProgressBar();
    }
}

// 특정 단계 표시
function showStep(stepName) {
    console.log('showStep called with:', stepName);
    
    // 모든 opt-wrap 숨김
    const allOptWraps = document.querySelectorAll('.opt-wrap');
    console.log('전체 opt-wrap 개수:', allOptWraps.length);
    allOptWraps.forEach(wrap => {
        wrap.style.display = 'none';
        const step = wrap.getAttribute('data-step');
        console.log('opt-wrap 숨김:', step);
    });
    
    // 선택한 단계의 opt-wrap 표시
    const optWrap = document.querySelector(`.opt-wrap[data-step="${stepName}"]`);
    if (optWrap) {
        optWrap.style.display = 'block';
        console.log('opt-wrap 표시됨:', stepName, optWrap);
    } else {
        console.error('opt-wrap을 찾을 수 없습니다:', stepName);
        console.log('사용 가능한 opt-wrap들:');
        document.querySelectorAll('.opt-wrap').forEach(wrap => {
            const step = wrap.getAttribute('data-step');
            console.log('- data-step:', step, '요소:', wrap);
        });
        // 강제로 찾기 시도
        const allWraps = document.querySelectorAll('.opt-wrap');
        for (let i = 0; i < allWraps.length; i++) {
            const wrap = allWraps[i];
            if (wrap.getAttribute('data-step') === stepName) {
                wrap.style.display = 'block';
                console.log('강제로 opt-wrap 표시:', stepName);
                break;
            }
        }
    }
    
    // 추가로 data-step 속성을 가진 모든 요소도 처리
    steps.forEach(step => {
        if (step !== stepName) {
            const stepElements = document.querySelectorAll(`[data-step="${step}"]:not(.opt-wrap)`);
            stepElements.forEach(element => {
                element.style.display = 'none';
            });
        }
    });
    
    const stepElements = document.querySelectorAll(`[data-step="${stepName}"]:not(.opt-wrap)`);
    stepElements.forEach(stepElement => {
        stepElement.style.display = 'block';
        console.log('Displayed step element:', stepElement, stepElement.className);
    });
    
    // opt-wrap이 있는 경우 그 안의 모든 optbx도 표시
    if (optWrap) {
        
        // 해당 단계의 form에 이벤트 리스너 다시 설정
        const form = optWrap.querySelector('form');
        if (form) {
            // 기존 리스너 제거를 위해 data-listener-attached 속성 제거
            const inputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            inputs.forEach(input => {
                input.removeAttribute('data-listener-attached');
            });
            setupFormEventListeners(`#${form.id}`);
            
            // 컨버전 옵션 단계로 넘어왔을 때 체크된 옵션들을 자동으로 합산
            if (stepName === 'conversion') {
                setTimeout(() => {
                    // [checked] 속성을 사용하여 display:none인 요소도 찾기
                    const checkedInputs = form.querySelectorAll('input[type="checkbox"][checked]');
                    console.log('컨버전 옵션 체크된 항목:', checkedInputs.length);
                    checkedInputs.forEach(input => {
                        // 실제로 checked 상태인지 확인
                        if (!input.checked) {
                            input.checked = true; // checked 속성이 있으면 checked 상태로 설정
                        }
                        
                        const sectionName = getSectionName(input);
                        const optionName = getOptionName(input);
                        const price = parseInt(input.dataset.price) || 0;
                        const optionKey = `${sectionName}_${input.value}`;
                        
                        console.log('컨버전 옵션 처리:', {
                            inputId: input.id,
                            sectionName: sectionName,
                            optionName: optionName,
                            price: price,
                            optionKey: optionKey,
                            alreadyExists: !!selectedOptions[optionKey]
                        });
                        
                        // 이미 추가되어 있지 않은 경우만 추가
                        if (!selectedOptions[optionKey]) {
                            selectedOptions[optionKey] = {
                                name: optionName,
                                price: price,
                                element: input
                            };
                            console.log('컨버전 옵션 자동 추가:', optionKey, price);
                        }
                    });
                    
                    // 가격 재계산 및 표시 업데이트
                    calculateTotalPrice();
                    updatePriceDisplay();
                    updateSelectedOptionsDisplay();
                    console.log('컨버전 옵션 자동 합산 완료, 총액:', totalPrice);
                    console.log('현재 선택된 옵션:', selectedOptions);
                }, 300);
            }
        }
    }
    
    // 모든 form에 이벤트 리스너 다시 설정 (안전을 위해)
    setTimeout(() => {
        setupFormEventListeners('#quoteForm');
    }, 200);
    
    // 스크롤을 해당 섹션으로 이동
    if (stepElements.length > 0) {
        setTimeout(() => {
            const firstElement = stepElements[0];
            firstElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        console.warn('No step elements found for:', stepName);
    }
}

// 단계 버튼 업데이트
function updateStepButtons() {
    const conversionBtn = document.getElementById('quoteConversionBtn');
    const prevBtn = document.getElementById('quotePrevBtn');
    
    console.log('updateStepButtons 호출 - currentStep:', currentStep);
    
    if (currentStep === 'model-spec') {
        // 모델/사양 단계: 컨버전 옵션 버튼 표시
        if (conversionBtn) {
            conversionBtn.textContent = '컨버전 옵션 →';
            conversionBtn.style.display = 'block';
        }
        if (prevBtn) {
            prevBtn.style.display = 'none';
        }
    } else if (currentStep === 'conversion') {
        // 컨버전 옵션 단계: 컨버전 옵션 선택 버튼으로 변경
        if (conversionBtn) {
            conversionBtn.textContent = '컨버전 옵션 선택 →';
            conversionBtn.style.display = 'block';
        }
        if (prevBtn) {
            prevBtn.style.display = 'block';
        }
    } else if (currentStep === 'conversion-select') {
        // 컨버전 옵션 선택 단계: 추가 옵션 버튼으로 변경
        if (conversionBtn) {
            conversionBtn.textContent = '추가 옵션 →';
            conversionBtn.style.display = 'block';
        }
        if (prevBtn) {
            prevBtn.style.display = 'block';
        }
    } else if (currentStep === 'additional') {
        // 추가 옵션 단계: 버튼 숨김
        if (conversionBtn) {
            conversionBtn.style.display = 'none';
        }
        if (prevBtn) {
            prevBtn.style.display = 'block';
        }
    }
}

// 진행 바 업데이트
function updateProgressBar() {
    // currentStep 변수 직접 사용 (window.currentStep이 아닌 실제 currentStep 변수 사용)
    const currentIndex = steps.indexOf(currentStep);
    const stepTitle = stepTitles[currentStep] || '모델/사양';
    const stepNumber = currentIndex + 1;
    const totalSteps = steps.length;
    
    console.log('updateProgressBar 호출 - currentStep:', currentStep, 'currentIndex:', currentIndex, 'stepTitle:', stepTitle);
    
    // 제목 업데이트
    const titleElement = document.getElementById('currentStepTitle');
    if (titleElement) {
        titleElement.textContent = stepTitle;
    }
    
    // 진행률 텍스트 업데이트
    const progressElement = document.getElementById('currentStepProgress');
    if (progressElement) {
        progressElement.textContent = `${stepNumber}/${totalSteps}`;
    }
    
    // 진행 바 업데이트
    const progressBars = document.querySelectorAll('.prog-bar li');
    progressBars.forEach((bar, index) => {
        if (index <= currentIndex) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
}
