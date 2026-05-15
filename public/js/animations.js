/* ============================================
   NATOURS - Frontend Animations & Interactions
   IntersectionObserver scroll reveals,
   button ripple effects, smooth interactions
   ============================================ */
(function () {
  'use strict';

  // --- Scroll Reveal with IntersectionObserver ---
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  // --- Auto-add reveal classes to key elements ---
  function autoAddRevealClasses() {
    // Cards
    document.querySelectorAll('.card').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 0.12 + 's';
    });
    // Review cards
    document.querySelectorAll('.reviews__card').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = i * 0.1 + 's';
    });
    // Form containers
    document.querySelectorAll('.user-view__form-container, .login-form, .signup-form').forEach(function (el) {
      el.classList.add('reveal-scale');
    });
    // Headings
    document.querySelectorAll('.heading-secondary').forEach(function (el) {
      el.classList.add('reveal');
    });
    // CTA
    var cta = document.querySelector('.cta');
    if (cta) cta.classList.add('reveal');
    // Overview boxes
    document.querySelectorAll('.overview-box__detail').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = i * 0.06 + 's';
    });
    // Edit profile banner
    var banner = document.querySelector('.edit-profile-banner');
    if (banner) banner.classList.add('reveal');
  }

  // --- Button Ripple Effect ---
  function initRippleEffect() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn, .btn-small, .nav__el--cta, .update-me-link');
      if (!btn) return;
      var ripple = document.createElement('span');
      ripple.classList.add('ripple');
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  }

  // --- Navbar scroll effect ---
  function initNavbarScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    var scrolled = false;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50 && !scrolled) {
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
        header.style.borderBottomColor = 'rgba(139,92,246,0.2)';
        scrolled = true;
      } else if (window.scrollY <= 50 && scrolled) {
        header.style.boxShadow = '';
        header.style.borderBottomColor = '';
        scrolled = false;
      }
    }, { passive: true });
  }

  // --- Smooth anchor scrolling ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // --- Tour Map with Leaflet ---
  function initTourMap() {
    var mapEl = document.getElementById('map');
    if (!mapEl || !mapEl.dataset.locations) return;
    
    var locations = JSON.parse(mapEl.dataset.locations);
    if (!locations || !locations.length) return;
    
    var map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([39.0, -98.0], 4);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    var bounds = L.latLngBounds();
    
    var customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#38bdf8" width="32px" height="32px" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); transform: translate(-16px, -32px);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    
    locations.forEach(function(loc) {
      if (loc.coordinates) {
        // GeoJSON uses [lng, lat] while Leaflet uses [lat, lng]
        var latLng = [loc.coordinates[1], loc.coordinates[0]];
        L.marker(latLng, { icon: customIcon })
          .addTo(map)
          .bindPopup('<p style="font-weight:700; color: #8b5cf6; margin:0; padding:0;">Day ' + loc.day + ': ' + loc.description + '</p>', { autoClose: false })
          .openPopup();
        bounds.extend(latLng);
      }
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        paddingTopLeft: [50, 300],
        paddingBottomRight: [50, 150]
      });
    }
  }

  // --- Initialize all ---
  function init() {
    autoAddRevealClasses();
    initScrollReveal();
    initRippleEffect();
    initNavbarScroll();
    initSmoothScroll();
    initTourMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
