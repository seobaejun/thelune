(function ($) {
  ("use strict");

  /*
|--------------------------------------------------------------------------
| Template Name: CRAS
| Author: Thememarch
| Version: 1.0.0
|--------------------------------------------------------------------------
|--------------------------------------------------------------------------
| TABLE OF CONTENTS:
|--------------------------------------------------------------------------
| 1. Preloader
| 2. Mobile Menu
| 3. Sticky Header
| 4. Dynamic Background
| 5. Slick Slider
| 6. Modal Video
| 7. Scroll Up
| 8. Hover text Animation
| 9. Pagination 
| 10. Company Tab
| 11. Accordion
| 12. Sticky Content
| 13. Comming Soon Counter
| 14. Light Gallery
| 15. Counter

    /*--------------------------------------------------------------
    Scripts initialization
--------------------------------------------------------------*/

  $.exists = function (selector) {
    return $(selector).length > 0;
  };

  $(window).on("load", function () {
    $(window).trigger("scroll");
    $(window).trigger("resize");
    preloader();
    AOS.init();
  });

  $(function () {
    $(window).trigger("resize");
    mainNav();
    stickyHeader();
    dynamicBackground();
    swiperInit();
    modalVideo();
    scrollUp();
    textAnimation();
  });

  $(window).on("scroll", function () {
    showScrollUp();
  });

  $(window).on("resize", function () {
    // 화면 크기 변경 시 모바일 메뉴 언어 선택 버튼 재설정
    mainNav();
  });

  /*-------------------------------------------------
      1. preloader  
 --------------------------------------------------------------*/

  function preloader() {
    setTimeout(function () {
      $("#preloader").addClass("loaded");
      if ($("#preloader").hasClass("loaded")) {
        $("#preloader")
          .delay(850)
          .queue(function () {
            $(this).remove();
          })
          .fadeOut();
      }
    }, 200);
  }

  /*--------------------------------------------------------------
     2. Mobile  Menu  
 -----------------------------------------------------------------*/
  function mainNav() {
    // 햄버거 버튼을 헤더 오른쪽에 배치 (모바일에서만)
    if ($(window).width() <= 1199) {
      // 모바일에서 헤더의 언어 선택 버튼 숨기기 (JavaScript로 직접 처리)
      $(".language-selector, .ak-header_btns .language-selector, .ak-main-header-right .language-selector").css({
        'display': 'none !important',
        'visibility': 'hidden',
        'opacity': '0',
        'height': '0',
        'width': '0',
        'overflow': 'hidden',
        'margin': '0',
        'padding': '0'
      });
      
      if ($(".ak-main_header_in .ak-munu_toggle").length === 0) {
        $(".ak-main_header_in").append('<span class="ak-munu_toggle"><span></span></span>');
      }
      
      // 모바일 메뉴에 언어 선택 버튼 추가 (한 번만)
      if ($(".ak-nav_list .mobile-language-selector").length === 0) {
        var langSelector = $(".language-selector").first();
        var langHtml = langSelector.html();
        if (langHtml) {
          // 언어 선택 버튼을 모바일 메뉴에 추가
          var mobileLangSelector = '<li class="mobile-language-selector-wrapper" style="list-style: none !important; border-bottom: none !important;"><div class="mobile-language-selector">' + langHtml + '</div></li>';
          $(".ak-nav_list").append(mobileLangSelector);
          
          // 모바일 언어 선택 버튼에 이벤트 리스너 추가
          $(".mobile-language-selector .lang-btn").off('click').on("click", function(e) {
            e.preventDefault();
            var lang = $(this).attr('onclick');
            if (lang) {
              // onclick 속성에서 언어 추출
              var langMatch = lang.match(/switchLanguage\('(\w+)'\)/);
              if (langMatch) {
                var selectedLang = langMatch[1];
                // 모든 언어 버튼 업데이트
                $(".mobile-language-selector .lang-btn").removeClass('active').css({
                  'background': 'none',
                  'border-color': 'rgba(188, 184, 177, 0.3)',
                  'color': '#ffffff',
                  'font-weight': 'normal'
                });
                $(this).addClass('active').css({
                  'background': 'rgba(188, 184, 177, 0.2)',
                  'border-color': 'rgba(188, 184, 177, 0.5)',
                  'color': '#bcb8b1',
                  'font-weight': '600'
                });
                // 데스크톱 언어 버튼도 업데이트
                $(".language-selector .lang-btn").removeClass('active').css({
                  'color': 'white',
                  'font-weight': 'normal'
                });
                $(".language-selector .lang-btn[onclick*=\"" + selectedLang + "\"]").addClass('active').css({
                  'color': '#bcb8b1',
                  'font-weight': '600'
                });
                // 언어 전환 함수 호출 (event 객체 생성)
                if (typeof switchLanguage === 'function') {
                  // event 객체를 생성하여 switchLanguage 함수에 전달
                  var fakeEvent = { target: this };
                  var originalEvent = window.event;
                  window.event = fakeEvent;
                  try {
                    switchLanguage(selectedLang);
                    // 언어 전환 후 모바일 버튼 상태 다시 동기화
                    setTimeout(function() {
                      $(".mobile-language-selector .lang-btn").removeClass('active').css({
                        'background': 'none',
                        'border-color': 'rgba(188, 184, 177, 0.3)',
                        'color': '#ffffff',
                        'font-weight': 'normal'
                      });
                      $(".mobile-language-selector .lang-btn[onclick*=\"" + selectedLang + "\"]").addClass('active').css({
                        'background': 'rgba(188, 184, 177, 0.2)',
                        'border-color': 'rgba(188, 184, 177, 0.5)',
                        'color': '#bcb8b1',
                        'font-weight': '600'
                      });
                    }, 100);
                  } finally {
                    window.event = originalEvent;
                  }
                }
              }
            }
          });
        }
      }
    } else {
      // 데스크톱에서 언어 선택 버튼 다시 보이기
      $(".language-selector, .ak-header_btns .language-selector, .ak-main-header-right .language-selector").css({
        'display': '',
        'visibility': '',
        'opacity': '',
        'height': '',
        'width': '',
        'overflow': '',
        'margin': '',
        'padding': ''
      });
      
      if ($(".ak-nav .ak-munu_toggle").length === 0) {
        $(".ak-nav").append('<span class="ak-munu_toggle"><span></span></span>');
      }
      // 데스크톱에서는 모바일 언어 선택 버튼 제거
      $(".mobile-language-selector-wrapper").remove();
    }
    $(".menu-item-has-children").append(
      '<span class="ak-munu_dropdown_toggle"></span>'
    );
    
    // 이벤트 리스너 중복 등록 방지
    $(".ak-munu_toggle").off("click").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      // 이미 애니메이션 중이면 무시
      if ($(".ak-nav_list").is(":animated")) {
        return false;
      }
      
      $(this).toggleClass("ak-toggle_active");
      var isOpen = $(".ak-nav").hasClass("mobile-menu-open");
      
      if (isOpen) {
        // 메뉴 닫기
        $(".ak-nav").removeClass("mobile-menu-open");
        $(".ak-nav_list").slideUp(300);
      } else {
        // 메뉴 열기
        $(".ak-nav").addClass("mobile-menu-open");
        $(".ak-nav_list").slideDown(300);
      }
      
      // 모바일에서 언어 선택 버튼 상태 동기화
      if ($(window).width() <= 1199) {
        setTimeout(function() {
          var activeLang = localStorage.getItem('preferredLanguage') || 'ko';
          $(".mobile-language-selector .lang-btn").removeClass('active').css({
            'background': 'none',
            'border-color': 'rgba(188, 184, 177, 0.3)',
            'color': '#ffffff',
            'font-weight': 'normal'
          });
          $(".mobile-language-selector .lang-btn[onclick*=\"" + activeLang + "\"]").addClass('active').css({
            'background': 'rgba(188, 184, 177, 0.2)',
            'border-color': 'rgba(188, 184, 177, 0.5)',
            'color': '#bcb8b1',
            'font-weight': '600'
          });
        }, 100);
      }
    });
    $(".ak-munu_dropdown_toggle").on("click", function () {
      $(this).toggleClass("active").siblings("ul").slideToggle();
      $(this).parent().toggleClass("active");
    });

    $(".menu-item-has-black-section").append(
      '<span class="ak-munu_dropdown_toggle_1"></span>'
    );

    $(".ak-munu_dropdown_toggle_1").on("click", function () {
      $(this).toggleClass("active").siblings("ul").slideToggle();
      $(this).parent().toggleClass("active");
    });

    $(".ak-mode_btn").on("click", function () {
      $(this).toggleClass("active");
      $("body").toggleClass("ak-dark");
    });
    // Side Nav
    $(".ak-icon_btn").on("click", function () {
      $(".ak-side_header").addClass("active");
    });
    $(".ak-close, .ak-side_header_overlay").on("click", function () {
      $(".ak-side_header").removeClass("active");
    });
    //  Menu Text Split
    $(".ak-animo_links > li > a").each(function () {
      let xxx = $(this).html().split("").join("</span><span>");
      $(this).html(`<span class="ak-animo_text"><span>${xxx}</span></span>`);
    });
  }
  /*--------------------------------------------------------------
     3. Sticky Header
--------------------------------------------------------------*/
  function stickyHeader() {
    var $window = $(window);
    var lastScrollTop = 0;
    var $header = $(".ak-sticky_header");
    var headerHeight = $header.outerHeight() + 30;

    $window.scroll(function () {
      var windowTop = $window.scrollTop();

      if (windowTop >= headerHeight) {
        $header.addClass("ak-gescout_sticky");
      } else {
        $header.removeClass("ak-gescout_sticky");
        $header.removeClass("ak-gescout_show");
      }

      if ($header.hasClass("ak-gescout_sticky")) {
        if (windowTop < lastScrollTop) {
          $header.addClass("ak-gescout_show");
        } else {
          $header.removeClass("ak-gescout_show");
        }
      }

      lastScrollTop = windowTop;
    });
  }

  /*--------------------------------------------------------------
     4. Dynamic Background
-------------------------------------------------------------*/
  function dynamicBackground() {
    $("[data-src]").each(function () {
      var src = $(this).attr("data-src");
      $(this).css({
        "background-image": "url(" + src + ")",
      });
    });
  }

  /*--------------------------------------------------------------    
     5. Slick Slider
 --------------------------------------------------------------*/

  function swiperInit() {
    if ($.exists(".ak-slider-hero-1")) {
      var swiperOptions = {
        loop: true,
        speed: 800,
        parallax: true,
        zoom: {
          maxRatio: 5,
        },
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        watchSlidesProgress: true,
        slidesPerView: "auto",
        pagination: {
          el: ".hero-swiper-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return '<p class="' + className + '">' + (index + 1) + "</p>";
          },
        },
        navigation: {
          nextEl: ".ak-swiper-button-prev",
          prevEl: ".ak-swiper-button-next",
        },
      };

      var swiper = new Swiper(".ak-slider-hero-1", swiperOptions);
    }

    if ($.exists(".ak-slider-hero-three")) {
      var swiperOptions = {
        loop: true,
        speed: 1200,
        parallax: true,
        zoom: {
          maxRatio: 5,
        },
        watchSlidesProgress: true,
        navigation: {
          nextEl: ".ak-swiper-button-prev.slider-three",
          prevEl: ".ak-swiper-button-next.slider-three",
        },
      };

      var swiper = new Swiper(".ak-slider-hero-three", swiperOptions);
    }

    if ($.exists(".ak-slider-hero-two-1")) {
      var swiperOptions = {
        loop: true,
        speed: 1200,
        parallax: true,
        zoom: {
          maxRatio: 5,
        },
        watchSlidesProgress: true,
      };

      var swiper = new Swiper(".ak-slider-hero-two-1", swiperOptions);
    }

    if ($.exists(".ak-slider-testimonal")) {
      var swiper = new Swiper(".ak-slider-testimonal", {
        loop: true,
        speed: 800,
        effect: "fade",
        autoplay: false,
        slidesPerView: "auto",
        pagination: {
          el: ".ak-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".testimonal-prev",
          prevEl: ".testimonal-next",
        },
      });
    }

    if ($.exists(".ak-trusted-client-slider")) {
      var swiper = new Swiper(".ak-trusted-client-slider", {
        loop: true,
        speed: 1000,
        autoplay: true,
        slidesPerView: "auto",
        pagination: {
          el: ".ak-pagination-2",
          clickable: true,
        },
      });
    }
    if ($.exists(".team-single-page-slider")) {
      var swiper = new Swiper(".team-single-page-slider", {
        loop: true,
        speed: 1000,
        autoplay: true,
        slidesPerView: "auto",
        effect: "coverflow",
        spaceBetween: "12%",
        grabCursor: true,
        centeredSlides: true,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        },
        keyboard: {
          enabled: true,
        },
        navigation: {
          nextEl: ".button-next",
          prevEl: ".button-prev",
        },
      });
    }

    if ($.exists(".ak-pricing-slider")) {
      var swiper = new Swiper(".ak-pricing-slider", {
        loop: true,
        speed: 1000,
        autoplay: true,
        slidesPerView: "auto",
        centeredSlides: true,
        pagination: {
          clickable: true,
        },
      });
      // Stop autoplay on mouse enter
      $(".ak-pricing-slider").on("mouseenter", function () {
        swiper.autoplay.stop();
      });

      // Start autoplay on mouse leave
      $(".ak-pricing-slider").on("mouseleave", function () {
        swiper.autoplay.start();
      });
    }
  }

  /*--------------------------------------------------------------
     6. Modal Video
 --------------------------------------------------------------*/
  function modalVideo() {
    $(document).on("click", ".ak-video-open", function (e) {
      e.preventDefault();
      var video = $(this).attr("href");
      video = video.split("?v=")[1].trim();
      $(".ak-video-popup-container iframe").attr(
        "src",
        `https://www.youtube.com/embed/${video}`
      );
      $(".ak-video-popup").addClass("active");
    });
    $(".ak-video-popup-close, .ak-video-popup-layer").on("click", function (e) {
      $(".ak-video-popup").removeClass("active");
      $("html").removeClass("overflow-hidden");
      $(".ak-video-popup-container iframe").attr("src", "about:blank");
      e.preventDefault();
    });
  }

  /*--------------------------------------------------------------
     7. Scroll Up
--------------------------------------------------------------*/
  function scrollUp() {
    $(".ak-scrollup").on("click", function (e) {
      e.preventDefault();
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        0
      );
    });
  }
  // For Scroll Up
  function showScrollUp() {
    let scroll = $(window).scrollTop();
    if (scroll >= 350) {
      $(".ak-scrollup").addClass("ak-scrollup-show");
    } else {
      $(".ak-scrollup").removeClass("ak-scrollup-show");
    }
  }

  /*--------------------------------------------------------------
   8. Hover text Animation
--------------------------------------------------------------*/
  function textAnimation() {
    if ($.exists(".text-hover-animaiton")) {
      const $textAnimationElements = $(".text-hover-animaiton");
      if ($textAnimationElements.length > 0) {
        $textAnimationElements.each((index, element) => {
          const $element = $(element);
          const isBlackText = $element.hasClass("black");
          const isWhiteText = $element.hasClass("white");
          const splitType = "words chars";

          const textColorClass = isBlackText
            ? "menu-text black"
            : isWhiteText
            ? "menu-text white"
            : "menu-text";

          new SplitText(element, {
            type: splitType,
            wordsClass: textColorClass,
          });
        });
      }
    }
  }

  /*--------------------------------------------------------------
    9. Pagination 
 --------------------------------------------------------------*/
  if ($.exists(".pagination-wrapper")) {
    var $items = $(".pagination-wrapper .col");
    var numItems = $items.length;
    var perPage = 6;

    $items.slice(perPage).hide();
    $("#pagination-container").pagination({
      items: numItems,
      itemsOnPage: perPage,
      prevText: "&laquo;",
      nextText: "&raquo;",
      onPageClick: function (pageNumber) {
        var showFrom = perPage * (pageNumber - 1);
        var showTo = showFrom + perPage;
        $items.hide().slice(showFrom, showTo).show();
      },
    });
  }

  /*--------------------------------------------------------------
    10. Company Tab
 --------------------------------------------------------------*/
  if ($.exists(".company-tab")) {
    var $activeTab = $(".active-tab");
    var $contentList = $(".tabs-content .list");
    var $tabsList = $(".tabs li");
    var activeIndex = $activeTab.index();
    $contentList.eq(activeIndex).show();

    $(".tabs").on("click", "li", function (e) {
      var $currentTab = $(e.currentTarget);
      var index = $currentTab.index();

      $tabsList.removeClass("active-tab");
      $currentTab.addClass("active-tab");

      $contentList.hide().eq(index).show();
    });
  }

  /*--------------------------------------------------------------
    11. Accordion
 --------------------------------------------------------------*/
  if ($.exists(".ak-accordion-title")) {
    $(".ak-accordion-title").click(function () {
      $(this).toggleClass("active");
      var $accordionTab = $(this).next(".ak-accordion-tab");
      $accordionTab.slideToggle();
      $accordionTab
        .parent()
        .siblings()
        .find(".ak-accordion-tab")
        .slideUp()
        .prev()
        .removeClass("active");
    });
  }

  /*--------------------------------------------------------------
    12. Sticky Content
 --------------------------------------------------------------*/
  if ($.exists(".sticky-content")) {
    if ($(".sticky-content").length) {
      const $window = $(window);
      const $sidebar = $(".sidebar");
      const sidebarHeight = $sidebar.innerHeight();
      const footerOffsetTop = $(".scroll-end-point").offset().top;
      const sidebarOffset = $sidebar.offset();
      const footerThreshold = footerOffsetTop - sidebarHeight;
      let isScrolling = false;
      function handleScroll() {
        if (!isScrolling) {
          isScrolling = true;
          requestAnimationFrame(() => {
            const scrollTop = $window.scrollTop();

            if (scrollTop > sidebarOffset.top) {
              $sidebar.addClass("fixed");
            } else {
              $sidebar.removeClass("fixed");
            }

            if (scrollTop + sidebarHeight > footerOffsetTop) {
              const distanceToBottom = -(
                scrollTop +
                sidebarHeight -
                footerOffsetTop
              );
              $sidebar.css({ top: distanceToBottom });
            } else {
              $sidebar.css({ top: 0 });
            }

            isScrolling = false;
          });
        }
      }

      $window.scroll(handleScroll);
    }
  }

  if ($.exists(".sticky-content.style-two")) {
    if ($(".sticky-content.style-two").length) {
      const $window = $(window);
      const $sidebar = $(".sidebar.style-two");
      const sidebarHeight = $sidebar.innerHeight();
      const footerOffsetTop = $(".scroll-end-point.style-two").offset().top;
      const sidebarOffset = $sidebar.offset();
      const footerThreshold = footerOffsetTop - sidebarHeight;
      let isScrolling = false;
      function handleScroll() {
        if (!isScrolling) {
          isScrolling = true;
          requestAnimationFrame(() => {
            const scrollTop = $window.scrollTop();

            if (scrollTop > sidebarOffset.top) {
              $sidebar.addClass("fixed");
            } else {
              $sidebar.removeClass("fixed");
            }

            if (scrollTop + sidebarHeight > footerOffsetTop) {
              const distanceToBottom = -(
                scrollTop +
                sidebarHeight -
                footerOffsetTop
              );
              $sidebar.css({ top: distanceToBottom });
            } else {
              $sidebar.css({ top: 0 });
            }

            isScrolling = false;
          });
        }
      }

      $window.scroll(handleScroll);
    }
  }

  /*--------------------------------------------------------------
     13. Comming Soon Counter
--------------------------------------------------------------*/
  if ($.exists("#comming-section")) {
    commingSoon();

    function commingSoon() {
      const targetDate = new Date("2024-08-31T00:00:00").getTime();

      function updateCountdown() {
        const currentDate = new Date().getTime();
        const timeRemaining = targetDate - currentDate;

        if (timeRemaining <= 0) {
          document.getElementById("countdown").textContent =
            "The event is here!";
          clearInterval(interval);
          return 0;
        } else {
          const months = Math.floor(
            timeRemaining / (1000 * 60 * 60 * 24 * 30.44)
          );
          const days = Math.floor(
            (timeRemaining % (1000 * 60 * 60 * 24 * 30.44)) /
              (1000 * 60 * 60 * 24)
          );
          const hours = Math.floor(
            (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

          document.getElementById("months").textContent = `${months}`;
          document.getElementById("days").textContent = `${days}`;
          document.getElementById("hours").textContent = `${hours}`;
          document.getElementById("minutes").textContent = `${minutes}`;
          document.getElementById("secound").textContent = `${seconds}`;
        }
      }

      const interval = setInterval(updateCountdown, 1000);

      // Initial call to set the countdown value
      updateCountdown();
    }
  }

  /*--------------------------------------------------------------
    14. Light Gallery
--------------------------------------------------------------*/
  if ($.exists("#static-thumbnails")) {
    const galleryDiv = document.getElementById("static-thumbnails");
    lightGallery(galleryDiv, {
      selector: ".item a",
      addClass: "lg-custom-thumbnails",
      animateThumb: true,
      zoomFromOrigin: true,
      allowMediaOverlap: true,
      toggleThumb: true,
    });
  }

  /*--------------------------------------------------------------
    15. Counter
--------------------------------------------------------------*/
  if ($.exists(".auto-counter-section")) {
    var a = 0;
    $(window).scroll(function () {
      var oTop = $(".ak-funfact-number").offset().top - window.innerHeight;
      if (a == 0 && $(window).scrollTop() > oTop) {
        $(".counter").each(function () {
          var $this = $(this),
            countTo = $this.attr("data-number");
          $({
            countNum: $this.text(),
          }).animate(
            {
              countNum: countTo,
            },

            {
              duration: 1500,
              easing: "swing",
              step: function () {
                $this.text(Math.ceil(this.countNum).toLocaleString("en"));
              },
              complete: function () {
                $this.text(Math.ceil(this.countNum).toLocaleString("en"));
              },
            }
          );
        });
        a = 1;
      }
    });
  }
  /*--------------------------------------------------------------
    16. Contact Form
--------------------------------------------------------------*/
  if ($.exists("#contact-form")) {
    $("#ak-alert").hide();
    $("#contact-form #submit").on("click", function () {
      var name = $("#name").val();
      var subject = $("#subject").val();
      var topic = $("#topic").val();
      var email = $("#email").val();
      var msg = $("#msg").val();
      var regex =
        /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!regex.test(email)) {
        $("#ak-alert")
          .fadeIn()
          .html(
            '<div class="alert rounded-0 alert-danger"><strong>Warning!</strong> Please Enter Valid Email.</div>'
          );
        return false;
      }

      name = $.trim(name);
      subject = $.trim(subject);
      topic = $.trim(topic);
      email = $.trim(email);
      msg = $.trim(msg);

      if (name != "" && email != "" && msg != "") {
        var values = {
          name: name,
          subject: subject,
          topic: topic,
          email: email,
          msg: msg,
        };

        $.ajax({
          type: "POST",
          url: "assets/php/mail.php",
          data: values,
          success: function () {
            $("#name").val("");
            $("#subject").val("");
            $("#topic").val("");
            $("#email").val("");
            $("#msg").val("");

            $("#ak-alert")
              .fadeIn()
              .html(
                '<div class="alert rounded-0 alert-success"><strong>Success!</strong> Email has been sent successfully.</div>'
              );
            setTimeout(function () {
              $("#ak-alert").fadeOut("slow");
            }, 4000);
          },
          error: function (xhr, status, error) {
            $("#ak-alert")
              .fadeIn()
              .html(
                '<div class="alert rounded-0 alert-danger"><strong>Email not send!</strong> ' +
                  error +
                  "</div>"
              );
          },
        });
      } else {
        $("#ak-alert")
          .fadeIn()
          .html(
            '<div class="alert rounded-0 alert-danger"><strong>Warning!</strong> All fields are required.</div>'
          );
      }
      return false;
    });
  }

  /*--------------------------------------------------------------
    17. Appointment Form
--------------------------------------------------------------*/
  if ($.exists("#appointment-form")) {
    $("#ak-alert").hide();
    $("#appointment-form #submit").on("click", function (e) {
      e.preventDefault();
      var name = $("#name").val();
      var email = $("#email").val();
      var phone = $("#phone").val();
      var vehicle = $("#vehicle").val();
      var time = $("#time").val();
      var date = $("#date").val();
      var msg = $("#msg").val();
      var regex =
        /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!regex.test(email)) {
        $("#ak-alert")
          .fadeIn()
          .html(
            '<div class="alert rounded-0 alert-danger"><strong>Warning!</strong> Please Enter Valid Email.</div>'
          );
        return false;
      }

      name = $.trim(name);
      vehicle = $.trim(vehicle);
      phone = $.trim(phone);
      email = $.trim(email);
      time = $.trim(time);
      date = $.trim(date);
      msg = $.trim(msg);

      if (name != "" && email != "" && msg != "" && time != "" && date != "") {
        var values = {
          name: name,
          vehicle: vehicle,
          phone: phone,
          email: email,
          time: time,
          date: date,
          msg: msg,
        };

        $.ajax({
          type: "POST",
          url: "assets/php/appointment.php",
          data: values,
          success: function () {
            $("#name").val("");
            $("#vehicle").val("");
            $("#phone").val("");
            $("#email").val("");
            $("#msg").val("");
            $("#time").val("");
            $("#date").val("");

            $("#ak-alert")
              .fadeIn()
              .html(
                '<div class="alert rounded-0 alert-success"><strong>Success!</strong> Email has been sent successfully.</div>'
              );
            setTimeout(function () {
              $("#ak-alert").fadeOut("slow");
            }, 4000);
          },
          error: function (xhr, status, error) {
            $("#ak-alert")
              .fadeIn()
              .html(
                '<div class="alert rounded-0 alert-danger"><strong>Email not send!</strong> ' +
                  error +
                  "</div>"
              );
          },
        });
      } else {
        $("#ak-alert")
          .fadeIn()
          .html(
            '<div class="alert rounded-0 alert-danger"><strong>Warning!</strong> All fields are required.</div>'
          );
      }
      return false;
    });
  }

  /*--------------------------------------------------------------
    18. Footer Fmail Form
--------------------------------------------------------------*/
  if ($.exists("#footer-email")) {
    $("#ak-alert-footer").hide();
    $("#footer-email #footerSubmit").on("click", function (e) {
      e.preventDefault();
      var footerEmail = $("#footerEmail").val();
      var regex =
        /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!regex.test(footerEmail)) {
        $("#ak-alert-footer")
          .fadeIn()
          .html(
            '<p class="text-danger"><strong>Warning!</strong> Please Enter Valid Email.</p>'
          );
        return false;
      }
      footerEmail = $.trim(footerEmail);

      if (footerEmail != "") {
        var values = {
          footerEmail: footerEmail,
        };

        $.ajax({
          type: "POST",
          url: "assets/php/footeremail.php",
          data: values,
          success: function () {
            $("#footerEmail").val("");
            $("#ak-alert-footer")
              .fadeIn()
              .html(
                '<p class="text-success"><strong>Success!</strong> Sent successfully.</p>'
              );
            setTimeout(function () {
              $("#ak-alert-footer").fadeOut("slow");
            }, 4000);
          },
          error: function (xhr, status, error) {
            $("#ak-alert-footer")
              .fadeIn()
              .html(
                '<p class="text-danger"><strong>Email not send!</strong> </p>'
              );
          },
        });
      } else {
        $("#ak-alert-footer")
          .fadeIn()
          .html(
            '<p class="text-danger"><strong>Warning!</strong> All fields are required.</p>'
          );
      }
      return false;
    });
  }
  //end the scripts
})(jQuery);
