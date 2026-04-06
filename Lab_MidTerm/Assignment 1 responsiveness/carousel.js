$(document).ready(function () {

    // ── 1. INITIALISE SLICK CAROUSEL ──────────────────────────────────────────
    $('.product-carousel').slick({

        // Show 3 cards on desktop by default
        slidesToShow: 3,
        slidesToScroll: 1,

        // Infinite loop — when you hit the last card it wraps back to card 1
        infinite: true,

        // Auto-play every 5 seconds (AI-Enhanced feature)
        autoplay: true,
        autoplaySpeed: 5000,

        // Hide Slick's built-in arrows (we use our own buttons below)
        arrows: false,

        // Smooth CSS transition between slides
        speed: 500,
        cssEase: 'ease',

        // ── RESPONSIVE BREAKPOINTS ─────────────────────────────────────────
        responsive: [
            {
                breakpoint: 900,        // tablet: screen width ≤ 900px
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 600,        // mobile: screen width ≤ 600px
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });


    // ── 2. SLIDE COUNTER ──────────────────────────────────────────────────────
    // How many total slides?
    var totalSlides = $('.product-carousel .product-card').length;
    $('#total-slides').text(totalSlides);

    // This event fires every time Slick moves to a new slide
    // currentSlide is 0-indexed, so we add 1 to display "1 of 10" style
    $('.product-carousel').on('afterChange', function (event, slick, currentSlide) {
        $('#current-slide').text(currentSlide + 1);
    });


    // ── 3. CUSTOM PREV / NEXT BUTTONS ────────────────────────────────────────
    // .slick('slickPrev') and .slick('slickNext') are Slick's built-in methods
    // We call them from our own buttons using jQuery click handlers

    $('#prev-btn').on('click', function () {
        $('.product-carousel').slick('slickPrev');
    });

    $('#next-btn').on('click', function () {
        $('.product-carousel').slick('slickNext');
    });


    // ── 4. PAUSE ON HOVER (AI-Enhanced Feature) ───────────────────────────────
    // When mouse enters any product card → pause autoplay
    // When mouse leaves → resume autoplay
    // We use jQuery .on() with event delegation on the carousel wrapper
    // because Slick clones cards (duplicates them for infinite loop),
    // so we must listen on the parent, not directly on .product-card

    $('.product-carousel').on('mouseenter', '.product-card', function () {
        $('.product-carousel').slick('slickPause');
    });

    $('.product-carousel').on('mouseleave', '.product-card', function () {
        $('.product-carousel').slick('slickPlay');
    });

});
