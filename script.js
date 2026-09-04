/* =====================================================================
   TEACHERS' DAY TRIBUTE — SCRIPT
   Vanilla JS only. Organized into small, commented functions.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- 0. Reduced motion check ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Element references ---------- */
  var openingScreen   = document.getElementById('opening');
  var startButton      = document.getElementById('startButton');
  var mainExperience    = document.getElementById('mainExperience');
  var particleField     = document.getElementById('particleField');
  var petalField        = document.getElementById('petalField');
  var cursorGlow        = document.getElementById('cursorGlow');
  var sectionIndicator  = document.getElementById('sectionIndicator');
  var musicControl      = document.getElementById('musicControl');
  var bgMusic           = document.getElementById('bgMusic');
  var typedCodeEl       = document.getElementById('typedCode');

  /* =====================================================================
     2. OPENING SCREEN — start experience on click
     ===================================================================== */
  function startExperience() {
    openingScreen.classList.add('is-leaving');
    mainExperience.hidden = false;
    sectionIndicator.classList.add('is-visible');
    musicControl.classList.add('is-visible');

    // kick off ambient effects only after the visitor has interacted
    if (!reduceMotion) {
      startParticles();
      startPetals();
    }

    // let the browser paint the main experience, then observe it
    requestAnimationFrame(function () {
      initScrollReveal();
      initTypewriter();
      updateActiveIndicator();
    });

    // remove the opening screen from the accessibility tree / layout
    setTimeout(function () {
      openingScreen.style.display = 'none';
    }, 1100);
  }

  startButton.addEventListener('click', startExperience);

  /* =====================================================================
     3. SMOOTH SECTION NAVIGATION (buttons + indicator dots)
     ===================================================================== */
  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-next');
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    // ripple effect on every interactive button
    btn.addEventListener('click', createRipple);
  });

  document.querySelectorAll('.section-indicator .dot').forEach(function (dot) {
    dot.addEventListener('click', function () {
      var targetEl = document.getElementById(dot.getAttribute('data-target'));
      if (targetEl) targetEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function createRipple(e) {
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var ripple = document.createElement('span');
    var size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 700);
  }

  /* =====================================================================
     4. SCROLL-TRIGGERED REVEAL (Intersection Observer)
     ===================================================================== */
  function initScrollReveal() {
    var observerOptions = { threshold: 0.35 };

    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealGroup(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      lineObserver.observe(group);
    });

    var singleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          singleObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-reveal], .code-window, .signature').forEach(function (el) {
      singleObserver.observe(el);
    });

    // section-level activation (theme wash + celebration triggers)
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          if (entry.target.id === 'reveal') triggerCelebration();
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.screen').forEach(function (sec) {
      sectionObserver.observe(sec);
    });

    // keep the side indicator in sync with the visible section
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveDot(entry.target.id);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.screen[id]').forEach(function (sec) {
      navObserver.observe(sec);
    });
  }

  function revealGroup(group) {
    var lines = group.querySelectorAll('[data-reveal-line]');
    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add('is-visible');
      }, reduceMotion ? 0 : i * 450);
    });
  }

  function setActiveDot(sectionId) {
    document.querySelectorAll('.section-indicator .dot').forEach(function (dot) {
      dot.classList.toggle('is-active', dot.getAttribute('data-target') === sectionId);
    });
  }

  function updateActiveIndicator() {
    setActiveDot('opening');
  }

  /* =====================================================================
     5. TYPEWRITER — coding window
     ===================================================================== */
  function initTypewriter() {
    if (!typedCodeEl) return;
    var lines = ['Learning...', 'Understanding...', 'Trying...', 'Failing...', 'Improving...'];
    var codeWindow = document.querySelector('[data-code-window]');
    var started = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          if (reduceMotion) {
            typedCodeEl.textContent = lines.join('\n');
          } else {
            typeLines(lines, 0, '');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    if (codeWindow) observer.observe(codeWindow);
  }

  function typeLines(lines, lineIndex, accumulated) {
    if (lineIndex >= lines.length) return;
    var currentLine = lines[lineIndex];
    var charIndex = 0;

    function typeChar() {
      if (charIndex <= currentLine.length) {
        typedCodeEl.textContent = accumulated + currentLine.slice(0, charIndex);
        charIndex++;
        setTimeout(typeChar, 55);
      } else {
        setTimeout(function () {
          typeLines(lines, lineIndex + 1, accumulated + currentLine + '\n');
        }, 380);
      }
    }
    typeChar();
  }

  /* =====================================================================
     6. AMBIENT PARTICLES & PETALS (lightweight, capped density)
     ===================================================================== */
  function startParticles() {
    var maxParticles = window.innerWidth < 600 ? 14 : 26;
    for (var i = 0; i < maxParticles; i++) {
      spawnParticle(true);
    }
  }

  function spawnParticle(initial) {
    var p = document.createElement('span');
    p.className = 'particle';
    var size = 2 + Math.random() * 3;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = '-5vh';
    p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    var duration = 14 + Math.random() * 12;
    p.style.animationDuration = duration + 's';
    p.style.animationDelay = (initial ? Math.random() * duration : 0) + 's';
    particleField.appendChild(p);

    // recycle the particle once its animation completes
    setTimeout(function () {
      p.remove();
      spawnParticle(false);
    }, (duration + (initial ? duration : 0)) * 1000);
  }

  function startPetals() {
    var maxPetals = window.innerWidth < 600 ? 6 : 10;
    for (var i = 0; i < maxPetals; i++) {
      spawnPetal(true);
    }
  }

  function spawnPetal(initial) {
    var petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = Math.random() > 0.5 ? '❀' : '✿';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.fontSize = (10 + Math.random() * 10) + 'px';
    var duration = 16 + Math.random() * 14;
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = (initial ? Math.random() * duration : 0) + 's';
    petalField.appendChild(petal);

    setTimeout(function () {
      petal.remove();
      spawnPetal(false);
    }, (duration + (initial ? duration : 0)) * 1000);
  }

  /* =====================================================================
     7. CURSOR GLOW (desktop only) + subtle PARALLAX
     ===================================================================== */
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice && !reduceMotion) {
    var mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.style.opacity = '1';

      // gentle parallax on decorative float items near the pointer
      var relX = (e.clientX / window.innerWidth - 0.5);
      var relY = (e.clientY / window.innerHeight - 0.5);
      document.querySelectorAll('.float-item').forEach(function (el, i) {
        var depth = (i % 3 + 1) * 4;
        el.style.transform = 'translate(' + (relX * depth) + 'px,' + (relY * depth) + 'px)';
      });
    });

    (function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    })();
  }

  /* =====================================================================
     8. MUSIC CONTROL — graceful handling if music.mp3 is missing
     ===================================================================== */
  var musicAvailable = true;

  bgMusic.addEventListener('error', function () {
    musicAvailable = false;
  });

  musicControl.addEventListener('click', function () {
    if (!musicAvailable) {
      musicControl.classList.remove('is-playing');
      musicControl.querySelector('.music-control__label').textContent = 'Music unavailable';
      return;
    }

    if (bgMusic.paused) {
      bgMusic.play().then(function () {
        musicControl.classList.add('is-playing');
        musicControl.setAttribute('aria-pressed', 'true');
        musicControl.querySelector('.music-control__label').textContent = 'Music';
      }).catch(function () {
        musicAvailable = false;
        musicControl.querySelector('.music-control__label').textContent = 'Music unavailable';
      });
    } else {
      bgMusic.pause();
      musicControl.classList.remove('is-playing');
      musicControl.setAttribute('aria-pressed', 'false');
    }
  });

  /* =====================================================================
     9. FINAL CELEBRATION — extra burst of petals/particles on reveal
     ===================================================================== */
  var celebrationTriggered = false;

  function triggerCelebration() {
    if (celebrationTriggered || reduceMotion) return;
    celebrationTriggered = true;
    for (var i = 0; i < 18; i++) {
      setTimeout(function () { spawnParticle(false); }, i * 90);
    }
    for (var j = 0; j < 10; j++) {
      setTimeout(function () { spawnPetal(false); }, j * 140);
    }
  }

})();