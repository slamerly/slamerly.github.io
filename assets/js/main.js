/*
	Spectral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');
	var bannerVideoController = null;

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: [null, '480px']
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);

		// Typewriter animation
		var typewriterText = 'Gameplay & Tools Programmer';
		var typewriterElement = $('.typewriter-text');
		var cursorElement = $('.typewriter-cursor');
		if (typewriterElement.length > 0) {
			var index = 0;
			var typingSpeed = 50;
			function typeNextCharacter() {
				if (index < typewriterText.length) {
					typewriterElement.append(typewriterText.charAt(index));
					index++;
					setTimeout(typeNextCharacter, typingSpeed);
				}
			}
			// Start typewriter after a short delay to allow h2 to animate first
			setTimeout(typeNextCharacter, 700);
		}

		// Carousel script
		var $carousel = $('.carousel');
		var $carouselTrack = $carousel.find('.carousel-track');
		var scrollSpeed = 1.5; // Slightly reduced speed for smoother flow at 60fps
		var scrollStep = 300;
		var autoScrollInterval;
		var resumeTimeout;

		if ($carouselTrack.length > 0) {
			// Clone items for loop illusion
			var $items = $carouselTrack.children().clone();
			$carouselTrack.append($items);

			// Auto-scroll setup
			function startAutoScroll() {
				stopAutoScroll();
				autoScrollInterval = setInterval(function () {
					$carouselTrack[0].scrollLeft += scrollSpeed;
				}, 16); // 16ms is closer to 60fps (much smoother than 10ms)
			}

			function stopAutoScroll() {
				clearInterval(autoScrollInterval);
				clearTimeout(resumeTimeout);
			}

			function triggerResumeAutoScroll() {
				clearTimeout(resumeTimeout);
				resumeTimeout = setTimeout(startAutoScroll, 1200); // Resume auto-scroll 2s after interaction
			}

			// Start auto-scroll initially
			startAutoScroll();

			// Pause on hover or touch/pointer down
			$carousel.on('mouseenter touchstart pointerdown', stopAutoScroll);
			$carousel.on('mouseleave touchend touchcancel pointerup pointercancel', triggerResumeAutoScroll);

			// Loop wrapping using scroll listener for both auto and manual scrolls
			$carouselTrack.on('scroll', function () {
				var scrollWidth = $carouselTrack[0].scrollWidth;
				var halfWidth = scrollWidth / 2;
				if (halfWidth <= 0) return;

				var scrollLeft = $carouselTrack[0].scrollLeft;
				if (scrollLeft >= halfWidth) {
					// Instantly wrap back to start copy (since smooth behavior is disabled in CSS)
					$carouselTrack[0].scrollLeft = scrollLeft - halfWidth;
				}
			});

			// Manual scroll buttons
			$carousel.find('.carousel-btn.left').on('click', function () {
				stopAutoScroll();
				$carouselTrack[0].scrollBy({ left: -scrollStep, behavior: 'smooth' });
				triggerResumeAutoScroll();
			});

			$carousel.find('.carousel-btn.right').on('click', function () {
				stopAutoScroll();
				$carouselTrack[0].scrollBy({ left: scrollStep, behavior: 'smooth' });
				triggerResumeAutoScroll();
			});

			bannerVideoController = createBannerVideoController($carousel);
		}
	});

	function createBannerVideoController($carousel) {
		var $shell = $('#banner-video-shell');
		if ($shell.length === 0) {
			return null;
		}

		var trailerPlaylist = [
			{ id: 'tF0D5lFZY7c' }
		];
		var player;
		var trailerIndex = 0;
		var trailerTimer = null;
		var resumeTimer = null;
		var hoverTimer = null;
		var apiPollTimer = null;
		var currentMode = 'trailer';
		var trailerState = { index: 0, time: 0 };
		var activeProjectId = null;

		function clearTrailerTimer() {
			clearTimeout(trailerTimer);
			trailerTimer = null;
		}

		function clearHoverTimer() {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}

		function clearResumeTimer() {
			clearTimeout(resumeTimer);
			resumeTimer = null;
		}

		function stopApiPoll() {
			clearInterval(apiPollTimer);
			apiPollTimer = null;
		}

		function updateShellMode(mode) {
			$shell.toggleClass('is-project', mode === 'project');
		}

		function cueVideo(videoId, startSeconds) {
			if (!player) return;
			player.loadVideoById({ videoId: videoId, startSeconds: startSeconds || 0 });
			player.mute();
		}

		function advanceTrailer() {
			trailerIndex = (trailerIndex + 1) % trailerPlaylist.length;
			trailerState.index = trailerIndex;
			trailerState.time = 0;
			cueVideo(trailerPlaylist[trailerIndex].id, 0);
		}

		function scheduleTrailerAdvance() {
			clearTrailerTimer();
			if (currentMode !== 'trailer') return;
			if (trailerPlaylist.length <= 1) return;

			var durationSec = 0;
			var currentSec = 0;

			if (player && player.getDuration) {
				durationSec = Number(player.getDuration()) || 0;
			}

			if (player && player.getCurrentTime) {
				currentSec = Number(player.getCurrentTime()) || 0;
			}

			if (durationSec <= 0) {
				trailerTimer = setTimeout(function () {
					scheduleTrailerAdvance();
				}, 1000);
				return;
			}

			var remainingMs = Math.max(800, Math.floor((durationSec - currentSec) * 1000));

			trailerTimer = setTimeout(function () {
				if (currentMode !== 'trailer') return;
				advanceTrailer();
			}, remainingMs + 150);
		}

		function playTrailer(startIndex, startSeconds) {
			currentMode = 'trailer';
			updateShellMode('trailer');
			trailerIndex = startIndex || 0;
			trailerState.index = trailerIndex;
			trailerState.time = startSeconds || 0;
			activeProjectId = null;
			cueVideo(trailerPlaylist[trailerIndex].id, trailerState.time);
			scheduleTrailerAdvance();
		}

		function playProject(videoId) {
			if (!videoId || (currentMode === 'project' && activeProjectId === videoId)) {
				return;
			}

			clearTrailerTimer();
			clearResumeTimer();
			clearHoverTimer();

			if (currentMode === 'trailer' && player && player.getCurrentTime) {
				trailerState.index = trailerIndex;
				trailerState.time = Math.max(0, Math.floor(player.getCurrentTime() || 0));
			}

			currentMode = 'project';
			activeProjectId = videoId;
			updateShellMode('project');
			cueVideo(videoId, 0);
		}

		function restoreTrailer() {
			clearResumeTimer();
			if (currentMode === 'trailer') {
				return;
			}
			playTrailer(trailerState.index, trailerState.time);
		}

		function setHoverProject(videoId) {
			clearHoverTimer();
			clearResumeTimer();
			hoverTimer = setTimeout(function () {
				playProject(videoId);
			}, 90);
		}

		function bindItemHover() {
			$carousel.on('mouseenter focusin', '.carousel-item', function () {
				$carousel.find('.carousel-item').removeClass('hover-item');
				$carousel.addClass('has-hover-item');
				$(this).addClass('hover-item');
				var videoId = $(this).data('video-id');
				if (videoId) {
					setHoverProject(videoId);
				}
			});

			$carousel.on('mouseleave focusout', '.carousel-item', function (event) {
				$carousel.removeClass('has-hover-item');
				$(this).removeClass('hover-item');
				if (event.type === 'focusout' && this.contains(event.relatedTarget)) {
					return;
				}
				clearHoverTimer();
				clearResumeTimer();
				resumeTimer = setTimeout(restoreTrailer, 120);
			});

			$carousel.on('mouseleave', function () {
				$carousel.removeClass('has-hover-item');
				$carousel.find('.carousel-item').removeClass('hover-item');
				clearHoverTimer();
				clearResumeTimer();
				resumeTimer = setTimeout(restoreTrailer, 120);
			});
		}

		window.onYouTubeIframeAPIReady = function () {
			if (typeof YT === 'undefined' || !YT.Player) {
				return;
			}

			stopApiPoll();

			player = new YT.Player('banner-video-player', {
				videoId: trailerPlaylist[0].id,
				playerVars: {
					autoplay: 1,
					controls: 0,
					disablekb: 1,
					fs: 0,
					iv_load_policy: 3,
					loop: 0,
					modestbranding: 1,
					playsinline: 1,
					rel: 0,
					origin: window.location.origin
				},
				events: {
					onReady: function (event) {
						event.target.mute();
						bindItemHover();
						playTrailer(0, 0);
					},
					onStateChange: function (event) {
						if (event.data === YT.PlayerState.PLAYING) {
							$shell.addClass('is-video-visible');
						}

						if (currentMode !== 'trailer') {
							return;
						}

						if (event.data === YT.PlayerState.PLAYING) {
							scheduleTrailerAdvance();
						}

						if (event.data === YT.PlayerState.ENDED) {
							if (trailerPlaylist.length <= 1) {
								event.target.seekTo(0);
								event.target.playVideo();
							} else {
								advanceTrailer();
							}
						}
					}
				}
			});
		};

		if (window.YT && YT.Player) {
			window.onYouTubeIframeAPIReady();
		} else {
			apiPollTimer = setInterval(function () {
				if (window.YT && YT.Player) {
					window.onYouTubeIframeAPIReady();
				}
			}, 150);
		}

		return {
			playTrailer: playTrailer,
			playProject: playProject,
			restoreTrailer: restoreTrailer
		};
	}

	// Mobile?
	if (browser.mobile)
		$body.addClass('is-mobile');
	else {

		breakpoints.on('>medium', function () {
			$body.removeClass('is-mobile');
		});

		breakpoints.on('<=medium', function () {
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
		&& $header.hasClass('alt')) {

		$window.on('resize', function () { $window.trigger('scroll'); });

		$banner.scrollex({
			bottom: $header.outerHeight() + 1,
			terminate: function () { $header.removeClass('alt'); },
			enter: function () { $header.addClass('alt'); },
			leave: function () { $header.removeClass('alt'); }
		});

	}

})(jQuery);