/*
	Spectral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);

			//// Carousel duplication
			//var $carouselTrack = $('.carousel-track');
			//if ($carouselTrack.length > 0) {
			//	var $items = $carouselTrack.children().clone();
			//	$carouselTrack.append($items);
			//}

			// Carrousel duplication + pause on hover
			//var $carousel = $('.carousel');
			//var $carouselTrack = $carousel.find('.carousel-track');

			//if ($carouselTrack.length > 0) {
			//	var $items = $carouselTrack.children().clone();
			//	$carouselTrack.append($items);

			//	// Stop animation ONLY when hovering the outer .carousel div
			//	$carousel.on('mouseenter', function () {
			//		$carouselTrack.css('animation-play-state', 'paused');
			//	});

			//	$carousel.on('mouseleave', function () {
			//		$carouselTrack.css('animation-play-state', 'running');
			//	});
			//}

			// Carousel script
			var $carousel = $('.carousel');
			var $carouselTrack = $carousel.find('.carousel-track');
			var scrollSpeed = 3;
			var scrollStep = 300;
			var autoScrollInterval;

			if ($carouselTrack.length > 0) {
				// Clone items for loop illusion
				//var $items = $carouselTrack.children().clone();
				//$carouselTrack.append($items);

				// Auto-scroll setup
				function startAutoScroll() {
					autoScrollInterval = setInterval(function () {
						$carouselTrack[0].scrollLeft += scrollSpeed;

						// Reset scroll position if end reached (loop)
						if ($carouselTrack[0].scrollLeft >= ($carouselTrack[0].scrollWidth / 2)) {
							$carouselTrack[0].scrollLeft = 0;
						}
					}, 10); // delay ms
				}

				function stopAutoScroll() {
					clearInterval(autoScrollInterval);
				}

				// Start auto-scroll
				startAutoScroll();

				// Pause on hover
				$carousel.on('mouseenter', stopAutoScroll);
				$carousel.on('mouseleave', startAutoScroll);

				// Manual scroll buttons
				$carousel.find('.carousel-btn.left').on('click', function () {
					stopAutoScroll();
					$carouselTrack[0].scrollLeft -= scrollStep;
				});

				$carousel.find('.carousel-btn.right').on('click', function () {
					stopAutoScroll();
					$carouselTrack[0].scrollLeft += scrollStep;
				});
			}
		});

	// Mobile?
		if (browser.mobile)
			$body.addClass('is-mobile');
		else {

			breakpoints.on('>medium', function() {
				$body.removeClass('is-mobile');
			});

			breakpoints.on('<=medium', function() {
				$body.addClass('is-mobile');
			});

		}

	// Scrolly.
		$('.scrolly')
			.scrolly({
				speed: 1500,
				offset: $header.outerHeight()
			});

	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right',
				target: $body,
				visibleClass: 'is-menu-visible'
			});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight() + 1,
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); },
				leave:		function() { $header.removeClass('alt'); }
			});

		}

})(jQuery);