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

	// Read progress bar.
	var $readProgressBar = $('.read-progress-bar');
	if ($readProgressBar.length > 0) {
		$window.on('scroll.readprogress resize.readprogress', function () {
			var scrollTop = $window.scrollTop();
			var docHeight = $(document).height() - $window.height();
			var pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 1000) / 10) : 0;
			$readProgressBar.css('width', pct + '%');
		});
	}

	// Section navigation: prev / next / top (works & professional experience pages).
	var $secSpotlights = $('#main .wrapper.alt.style2 > .spotlight[id]');

	if ($secSpotlights.length > 0) {
		var $html = $('html');
		var snapResumeTimer = null;

		$html.addClass('has-spotlights');

		var $sectionNav = $(
			'<nav class="section-nav" aria-label="Navigation de sections">' +			'<div class="section-nav-counter" aria-live="polite">1 / ' + $secSpotlights.length + '</div>' +			'<button class="section-nav-btn" id="sn-top" aria-label="Retour en haut">' +
			'<span class="section-nav-icon" aria-hidden="true">&#x21E1;</span></button>' +
			'<button class="section-nav-btn" id="sn-prev" aria-label="Section pr\u00e9c\u00e9dente">' +
			'<span class="section-nav-icon" aria-hidden="true">&#x2191;</span></button>' +
			'<button class="section-nav-btn" id="sn-next" aria-label="Section suivante">' +
			'<span class="section-nav-icon" aria-hidden="true">&#x2193;</span></button>' +
			'<button class="section-nav-btn" id="sn-down" aria-label="Retour en bas">' +
			'<span class="section-nav-icon" aria-hidden="true">&#x21E3;</span></button>' +
			'</nav>'
		);
		$body.append($sectionNav);

		var $btnTop  = $('#sn-top');
		var $btnPrev = $('#sn-prev');
		var $btnNext = $('#sn-next');
		var $btnDown = $('#sn-down');
		var $counter = $('.section-nav-counter');
		
		function pauseSnap() {
			clearTimeout(snapResumeTimer);
			$html.addClass('is-snap-paused');
			snapResumeTimer = setTimeout(function () {
				$html.removeClass('is-snap-paused');
			}, 800);
		}

		function getMaxScrollTop() {
			return Math.max(0, $(document).height() - $window.height());
		}

		function isAtPageBottom() {
			return $window.scrollTop() >= getMaxScrollTop() - 2;
		}

		function getActiveSecIdx() {
			if (isAtPageBottom()) {
				return $secSpotlights.length - 1;
			}

			var headerOffset = $header.outerHeight();
			var probe = $window.scrollTop() + headerOffset + (($window.height() - headerOffset) * 0.45);
			var idx = 0;
			$secSpotlights.each(function (i) {
				if ($(this).offset().top <= probe) {
					idx = i;
				}
			});
			return idx;
		}

		function scrollToSpotlight($el) {
			var targetTop = Math.max(0, $el.offset().top - $header.outerHeight());
			pauseSnap();
			window.scrollTo({ top: targetTop, behavior: 'smooth' });
		}

		function updateSectionNav() {
			var scrolled = $window.scrollTop() > 180;
			var idx    = getActiveSecIdx();
			var atBottom = isAtPageBottom();
			var atLast = idx === $secSpotlights.length - 1 || atBottom;

			$sectionNav.toggleClass('is-visible', scrolled);
			$counter.text((idx + 1) + ' / ' + $secSpotlights.length);

			$btnTop.toggleClass('is-visible', scrolled);
			$btnPrev
				.toggleClass('is-visible', scrolled)
				.toggleClass('is-disabled', idx === 0);
			$btnNext
				.toggleClass('is-visible', scrolled)
				.toggleClass('is-disabled', atLast);

			$btnDown
				.toggleClass('is-visible', scrolled)
				.toggleClass('is-disabled', atLast);
		}

		$btnTop.on('click', function () {
			pauseSnap();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		$btnPrev.on('click', function () {
			var idx = getActiveSecIdx();
			if (idx > 0) { scrollToSpotlight($($secSpotlights[idx - 1])); }
		});

		$btnNext.on('click', function () {
			var idx = getActiveSecIdx();
			if (idx < $secSpotlights.length - 1) { scrollToSpotlight($($secSpotlights[idx + 1])); }
		});

		$btnDown.on('click', function () {
			pauseSnap();
			window.scrollTo({ top: getMaxScrollTop(), behavior: 'smooth' });
		});

		$window.on('scroll.secnav resize.secnav', updateSectionNav);
		updateSectionNav();
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

	// Active menu state (current page + current section when available).
	var $menu = $('#menu');
	if ($menu.length > 0) {
		var currentPath = normalizePath(window.location.pathname);
		var $menuLinks = $menu.find('a[href]');
		var $pageLinks = $();
		var $sectionLinks = $();
		var sectionLinksById = {};

		$menuLinks.each(function () {
			var $link = $(this);
			var rawHref = $link.attr('href');

			if (!rawHref || rawHref.charAt(0) === '#') {
				return;
			}

			var parsedUrl;
			try {
				parsedUrl = new URL(rawHref, window.location.href);
			} catch (e) {
				return;
			}

			if (parsedUrl.origin !== window.location.origin) {
				return;
			}

			var linkPath = normalizePath(parsedUrl.pathname);
			var linkHash = (parsedUrl.hash || '').replace('#', '').toLowerCase();

			if (linkPath !== currentPath) {
				return;
			}

			if (!linkHash) {
				$pageLinks = $pageLinks.add($link);
				return;
			}

			$sectionLinks = $sectionLinks.add($link);
			if (!sectionLinksById[linkHash]) {
				sectionLinksById[linkHash] = $();
			}
			sectionLinksById[linkHash] = sectionLinksById[linkHash].add($link);
		});

		if ($pageLinks.length > 0) {
			$pageLinks.addClass('is-active').attr('aria-current', 'page');
		}

		function setActiveSectionLink(sectionId) {
			$sectionLinks.removeClass('is-active').removeAttr('aria-current');

			if (!sectionId || !sectionLinksById[sectionId]) {
				return;
			}

			sectionLinksById[sectionId]
				.addClass('is-active')
				.attr('aria-current', 'location');
		}

		function getCurrentSectionId() {
			if ($secSpotlights.length === 0 || $sectionLinks.length === 0) {
				return null;
			}

			var hashId = (window.location.hash || '').replace('#', '').toLowerCase();
			if (hashId && sectionLinksById[hashId]) {
				return hashId;
			}

			var maxScrollTop = Math.max(0, $(document).height() - $window.height());
			if ($window.scrollTop() >= maxScrollTop - 2) {
				return String($secSpotlights.last().attr('id') || '').toLowerCase();
			}

			var headerOffset = $header.outerHeight() || 0;
			var probe = $window.scrollTop() + headerOffset + (($window.height() - headerOffset) * 0.4);
			var currentId = null;

			$secSpotlights.each(function () {
				var $section = $(this);
				if ($section.offset().top <= probe) {
					currentId = String($section.attr('id') || '').toLowerCase();
				}
			});

			return currentId;
		}

		if ($sectionLinks.length > 0) {
			function refreshActiveSectionInMenu() {
				setActiveSectionLink(getCurrentSectionId());
			}

			$window.on('scroll.menuactive resize.menuactive hashchange.menuactive', refreshActiveSectionInMenu);
			refreshActiveSectionInMenu();
		}
	}

	function normalizePath(pathname) {
		var normalized = String(pathname || '/').toLowerCase();

		normalized = normalized.replace(/\\/g, '/');
		normalized = normalized.replace(/\/+$/, '');

		if (!normalized) {
			return '/';
		}

		return normalized;
	}

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