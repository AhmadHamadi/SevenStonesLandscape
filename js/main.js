(function() {
  'use strict';

  var script = document.querySelector('script[src*="main.js"]');
  var base = script ? script.src.replace(/\/js\/main\.js(\?.*)?$/i, '/') : '/';

  var headerPlaceholder = document.getElementById('header-placeholder');
  var footerPlaceholder = document.getElementById('footer-placeholder');

  function replacePlaceholders() {
    var body = document.body;
    var phone = (body && body.getAttribute('data-phone')) || '+1 (289) 700-0312';
    var email = (body && body.getAttribute('data-email')) || 'info@sevenstoneslandscape.ca';
    var phoneClean = phone.replace(/\s/g, '');

    document.querySelectorAll('a[href="tel:[PHONE]"], a[href^="tel:"]').forEach(function(a) {
      if (a.getAttribute('href') === 'tel:[PHONE]' || a.href.indexOf('[PHONE]') !== -1) a.href = 'tel:' + phoneClean;
      if (a.textContent.trim() === '[PHONE]') a.textContent = phone;
    });
    document.querySelectorAll('a[href="mailto:[EMAIL]"]').forEach(function(a) {
      a.href = 'mailto:' + email;
      if (a.textContent.trim() === '[EMAIL]') a.textContent = email;
    });

    function walk(node) {
      if (node.nodeType === 3) {
        var t = node.textContent;
        if (t.indexOf('[PHONE]') !== -1 || t.indexOf('[EMAIL]') !== -1) {
          node.textContent = t.replace(/\[PHONE\]/g, phone).replace(/\[EMAIL\]/g, email);
        }
        return;
      }
      if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.type === 'application/ld+json') {
        if (node.textContent.indexOf('[PHONE]') !== -1 || node.textContent.indexOf('[EMAIL]') !== -1) {
          node.textContent = node.textContent.replace(/\[PHONE\]/g, phone).replace(/\[EMAIL\]/g, email);
        }
        return;
      }
      for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    }
    walk(body);
  }

  function setPageNav() {
    var path = window.location.pathname || '';
    var nav = document.querySelector('.nav-links');
    var mobile = document.querySelector('.nav-mobile');
    nav && nav.querySelectorAll('a').forEach(function(a) { a.classList.remove('nav-current'); });
    mobile && mobile.querySelectorAll('a').forEach(function(a) { a.classList.remove('nav-current'); });
    if (path.indexOf('about') !== -1) {
      nav && nav.querySelectorAll('a[href*="about"]').forEach(function(a) { a.classList.add('nav-current'); });
      mobile && mobile.querySelectorAll('a[href*="about"]').forEach(function(a) { a.classList.add('nav-current'); });
    } else if (path.indexOf('contact') !== -1) {
      nav && nav.querySelectorAll('a[href*="contact"]').forEach(function(a) { a.classList.add('nav-current'); });
      mobile && mobile.querySelectorAll('a[href*="contact"]').forEach(function(a) { a.classList.add('nav-current'); });
    } else if (path.indexOf('/blog') !== -1) {
      nav && nav.querySelectorAll('a[href*="/blog"]').forEach(function(a) { a.classList.add('nav-current'); });
      mobile && mobile.querySelectorAll('a[href*="/blog"]').forEach(function(a) { a.classList.add('nav-current'); });
    } else if (path.indexOf('service-areas') !== -1) {
      nav && nav.querySelectorAll('a[href*="service-areas"]').forEach(function(a) { a.classList.add('nav-current'); });
      mobile && mobile.querySelectorAll('a[href*="service-areas"]').forEach(function(a) { a.classList.add('nav-current'); });
    } else if (path.indexOf('services') !== -1) {
      nav && nav.querySelectorAll('a[href*="services"]').forEach(function(a) { a.classList.add('nav-current'); });
      mobile && mobile.querySelectorAll('a[href*="services"]').forEach(function(a) { a.classList.add('nav-current'); });
    }
  }

  function runUI() {
    var header = document.getElementById('site-header');
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.nav-mobile');
    var closeBtn = document.querySelector('.nav-mobile .close-btn');
    var backToTop = document.getElementById('back-to-top');

    if (header) {
      window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 40);
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
      }, { passive: true });
    }

    if (backToTop) {
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function openMobile() {
      if (mobileNav) mobileNav.classList.add('open');
      if (toggle) { toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
      document.body.style.overflow = 'hidden';
    }
    function closeMobile() {
      if (mobileNav) {
        mobileNav.classList.remove('open');
        mobileNav.querySelectorAll('.nav-mobile-section.open').forEach(function(s) {
          s.classList.remove('open');
          var t = s.querySelector('.nav-mobile-expand');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
      if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      document.body.style.overflow = '';
    }

    if (toggle) toggle.addEventListener('click', function() {
      mobileNav && mobileNav.classList.contains('open') ? closeMobile() : openMobile();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeMobile);
    if (mobileNav) {
      mobileNav.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', closeMobile);
      });
      mobileNav.querySelectorAll('[data-mobile-dropdown]').forEach(function(section) {
        var expandBtn = section.querySelector('.nav-mobile-expand');
        if (expandBtn) expandBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          section.classList.toggle('open');
          expandBtn.setAttribute('aria-expanded', section.classList.contains('open'));
        });
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) closeMobile();
    });

    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1800;
        var start = null;
        function step(timestamp) {
          if (!start) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.proof-number[data-target]').forEach(function(el) { counterObserver.observe(el); });

    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.faq-item');
        var isOpen = item && item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          openItem.classList.remove('open');
          var q = openItem.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (item && !isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var id = a.getAttribute('href');
        if (id === '#') return;
        var targetEl = document.querySelector(id);
        if (!targetEl || !header) return;
        e.preventDefault();
        var offset = header.offsetHeight + 16;
        var top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('form').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        var valid = true;
        form.querySelectorAll('[required]').forEach(function(field) {
          if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
          } else {
            field.classList.remove('error');
          }
        });
        if (!valid) {
          e.preventDefault();
          var first = form.querySelector('.error, [required]:invalid');
          if (first) first.focus();
        } else {
          var btn = form.querySelector('button[type="submit"]');
          if (btn) {
            btn.disabled = true;
            btn.setAttribute('aria-busy', 'true');
            var originalText = btn.textContent;
            btn.textContent = 'Sending…';
            btn.dataset.originalSubmitText = originalText;
            window.setTimeout(function() {
              if (btn.disabled) {
                btn.disabled = false;
                btn.removeAttribute('aria-busy');
                btn.textContent = btn.dataset.originalSubmitText || originalText;
              }
            }, 12000);
          }
        }
      });
    });
  }

  function showFormThankYou() {
    var params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (!params || !params.get('submitted')) return;
    var el = document.getElementById('form-thank-you');
    if (el) {
      el.hidden = false;
      el.style.display = 'block';
    }
  }

  function injectAndInit() {
    var promises = [];
    if (headerPlaceholder) promises.push(fetch(base + 'partials/header.html').then(function(r) { return r.text(); }));
    if (footerPlaceholder) promises.push(fetch(base + 'partials/footer.html').then(function(r) { return r.text(); }));

    if (promises.length === 0) {
      replacePlaceholders();
      runUI();
      showFormThankYou();
      return;
    }

    Promise.all(promises).then(function(results) {
      if (headerPlaceholder && results[0]) headerPlaceholder.outerHTML = results[0];
      if (footerPlaceholder) {
        var footerHtml = headerPlaceholder ? results[1] : results[0];
        if (footerHtml) footerPlaceholder.outerHTML = footerHtml;
      }
      replacePlaceholders();
      runUI();
      setPageNav();
      showFormThankYou();
    }).catch(function() {
      replacePlaceholders();
      runUI();
      setPageNav();
      showFormThankYou();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAndInit);
  } else {
    injectAndInit();
  }
})();



