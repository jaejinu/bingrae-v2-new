import { createWordShatter } from './hero-shatter.mjs';
import { createYoplaitTrail } from './yoplait-trail.mjs';

/** Split visually while keeping one continuous phrase for assistive technology. */
function createBouncingCopy(element) {
  const label = element.textContent;
  const accessible = document.createElement('span');
  accessible.className = 'hero__motion-label';
  accessible.textContent = label;
  const copy = document.createElement('span');
  copy.className = 'hero__motion-copy';
  copy.setAttribute('aria-hidden', 'true');
  const letters = [];
  for (const part of label.split(/(\s+)/)) {
    if (/^\s+$/.test(part)) {
      copy.append(document.createTextNode(part));
      continue;
    }
    const word = document.createElement('span');
    word.className = 'hero__motion-word';
    for (const character of Array.from(part)) {
      const letter = document.createElement('span');
      letter.className = 'hero__motion-letter';
      letter.textContent = character;
      word.append(letter);
      letters.push(letter);
    }
    copy.append(word);
  }
  element.replaceChildren(accessible, copy);
  return { element, letters, restore: () => { element.textContent = label; } };
}

/** A single entrance: schedule words -> flying shards -> centered question. */
export function createHeroSequence(root, { gsap, reducedMotion, scrollTo }) {
  const pin = root.querySelector('.hero__pin');
  const tokens = [...root.querySelectorAll('.hero__token')];
  const shatter = createWordShatter(pin, tokens, { gsap, speed: 2 });
  const intro = root.querySelector('.hero__intro');
  const question = root.querySelector('.hero__question');
  const hint = root.querySelector('.hero__scroll');
  const product = root.querySelector('.hero__product');
  const sparks = root.querySelectorAll('.hero__spark');
  const taglines = [...root.querySelectorAll('.hero__tag-line')];
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let introTimeline;
  let scrollTimeline;
  let taglineTimeline;
  let taglinePlayed = false;
  let destroyed = false;

  const questionCopy = createBouncingCopy(question);
  const letters = questionCopy.letters;
  const taglineCopies = taglines.map(createBouncingCopy);
  const taglineLetters = taglineCopies.flatMap(copy => copy.letters);
  const taglineWords = taglines.flatMap(line => [...line.querySelectorAll('.hero__motion-word')]);
  const taglineShatter = createWordShatter(pin, taglineWords, { gsap, speed: 2 });

  // Reuse the approved intro cutout, and stop the global GLB stage targeting it.
  const originalStage = product.getAttribute('data-stage');
  product.removeAttribute('data-stage');
  const productImage = new Image();
  productImage.className = 'hero__product-image';
  productImage.alt = '바나나맛우유';
  productImage.draggable = false;
  productImage.decoding = 'async';
  productImage.src = '/enhancements/products/banana-milk.png';
  product.append(productImage);
  const productShatter = createWordShatter(pin, [productImage], { gsap, speed: 2 });
  const trail = createYoplaitTrail(sparks[0], { gsap });
  hint.disabled = true;

  const phase = value => { root.dataset.heroPhase = value; };
  const context = gsap.context(() => {
    phase('waiting');
    gsap.set(intro, { xPercent: -50, yPercent: -50, x: 0, y: 0, pointerEvents: 'auto' });
    gsap.set(tokens, { autoAlpha: 0, y: 35, scale: .86 });
    gsap.set(question, { autoAlpha: 0, y: 150, scaleX: 1, scaleY: 1 });
    gsap.set(hint, { xPercent: -50, x: 0, autoAlpha: 0, y: 16, scale: .86 });
    gsap.set(product, { autoAlpha: 0, scale: 0 });
    gsap.set(sparks, { autoAlpha: 0, scale: 0 });
    gsap.set(taglines, { autoAlpha: 0, y: 24, yPercent: 0, scaleX: 1, scaleY: 1, '--copy-panel-opacity': 0 });
    root.dataset.taglinePhase = 'waiting';
  }, root);

  function finishIntro() {
    introTimeline?.kill();
    shatter.clear();
    gsap.set(tokens, { autoAlpha: 0 });
    gsap.set(question, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1 });
    gsap.set(letters, { yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0 });
    gsap.set(hint, { autoAlpha: 1, y: 0, scale: 1 });
    hint.disabled = false;
    phase('question');
  }

  function advanceScene() {
    if (hint.disabled) return;
    const trigger = scrollTimeline?.scrollTrigger;
    const destination = trigger
      ? trigger.start + (trigger.end - trigger.start) * .92
      : window.scrollY + root.getBoundingClientRect().bottom;
    scrollTo(destination);
  }
  hint.addEventListener('click', advanceScene);

  function addLetterBounce(timeline, glyphs, start) {
    // The preloader's squash / jump / smaller hops, sized for the card's padding.
    glyphs.forEach((letter, index) => {
      const at = start + index * .065;
      const tilt = index % 2 ? 1 : -1;
      timeline
        .to(letter, { yPercent: 5, scaleX: 1.12, scaleY: .82, duration: .1, ease: 'power1.out' }, at)
        .to(letter, { yPercent: -32, scaleX: .96, scaleY: 1.05, rotation: tilt * 3, duration: .3, ease: 'power2.out' }, at + .1)
        .to(letter, { yPercent: 4, scaleX: 1.1, scaleY: .86, rotation: -tilt, duration: .22, ease: 'power2.in' }, at + .4)
        .to(letter, { yPercent: -15, scaleX: .98, scaleY: 1.03, rotation: -tilt * 2, duration: .22, ease: 'power2.out' }, at + .62)
        .to(letter, { yPercent: 0, scaleX: 1.04, scaleY: .96, rotation: 0, duration: .15, ease: 'power2.in' }, at + .84)
        .to(letter, { yPercent: -6, scaleX: 1, scaleY: 1, duration: .12, ease: 'power2.out' }, at + .99)
        .to(letter, { yPercent: 0, duration: .1, ease: 'power1.in' }, at + 1.11);
    });
    return start + Math.max(0, glyphs.length - 1) * .065 + 1.21;
  }

  function addPanelBounce(timeline, element, start) {
    const lift = Math.min(10, parseFloat(getComputedStyle(element).fontSize) * .16);
    timeline
      .to(element, { '--copy-panel-opacity': 1, duration: .12, ease: 'power1.out' }, start)
      .to(element, { y: lift * .3, scaleX: 1.018, scaleY: .94, duration: .1, ease: 'power1.out' }, start)
      .to(element, { y: -lift, scaleX: .995, scaleY: 1.018, duration: .18, ease: 'power2.out' }, start + .1)
      .to(element, { y: 0, scaleX: 1, scaleY: 1, duration: .22, ease: 'power2.inOut' }, start + .28);
    return start + .5;
  }

  function resetTaglines() {
    taglineTimeline?.kill();
    taglineShatter.clear();
    productShatter.clear();
    trail.reset();
    gsap.set(productImage, { autoAlpha: 1 });
    gsap.set(taglineWords, { autoAlpha: 1 });
    taglinePlayed = false;
    root.dataset.taglinePhase = 'waiting';
    gsap.set(taglines, { autoAlpha: 0, y: 24, yPercent: 0, scaleX: 1, scaleY: 1, '--copy-panel-opacity': 0 });
    gsap.set(taglineLetters, { yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0 });
  }

  context.add('playTaglines', () => {
    if (taglinePlayed || destroyed) return;
    taglinePlayed = true;
    root.dataset.taglinePhase = 'letters';
    taglineTimeline = gsap.timeline({ paused: true })
      .to(taglines, { autoAlpha: 1, y: 0, duration: .55, stagger: .12, ease: 'back.out(1.15)' }, 0);
    const letterEnds = taglineCopies.map((copy, index) => addLetterBounce(taglineTimeline, copy.letters, .5 + index * .18));
    const panelAt = Math.max(...letterEnds) + .06;
    taglineTimeline.call(() => { root.dataset.taglinePhase = 'panels'; }, [], panelAt);
    taglines.forEach(element => addPanelBounce(taglineTimeline, element, panelAt));
    // Keep the settled copy readable, then reuse the opening's glyph shards.
    const shatterAt = panelAt + 1.9;
    taglineTimeline.call(() => {
      root.dataset.taglinePhase = 'scatter';
      taglineShatter.burst();
      gsap.set(taglines, { autoAlpha: 0, '--copy-panel-opacity': 0 });
    }, [], shatterAt);
    taglineTimeline.to({}, { duration: 1.1 }, shatterAt);
    taglineTimeline.call(() => {
      root.dataset.taglinePhase = 'product-scatter';
      productShatter.burst();
      gsap.set([...sparks].slice(1), { autoAlpha: 0 });
    }, [], shatterAt + 1.15);
    taglineTimeline.call(() => {
      root.dataset.taglinePhase = 'star-trail';
      const trigger = scrollTimeline.scrollTrigger;
      trail.start({ start: trigger.start + (trigger.end - trigger.start) * .85, end: trigger.end + window.innerHeight });
    }, [], shatterAt + 2.25);
  });

  // Scrolling positions the scene; its copy plays in real time after arrival.
  context.add('setupScroll', () => {
    if (scrollTimeline || reducedMotion()) return;
    scrollTimeline = gsap.timeline({
      onUpdate() {
        const progress = this.progress();
        if (progress < .3 && taglinePlayed) resetTaglines();
        if (progress >= .35 && started) {
          if (!taglinePlayed) context.playTaglines();
          taglineTimeline.totalTime(Math.min(1, Math.max(0, (progress - .35) / .5)) * taglineTimeline.duration(), false);
        }
      },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.2}`,
        pin: true,
        scrub: .8,
        invalidateOnRefresh: true,
        onUpdate: trigger => {
          // Scrolling can skip the entrance; never hold up navigation.
          if (started && trigger.progress > .015 && root.dataset.heroPhase !== 'question') finishIntro();
          if (started && root.dataset.heroPhase === 'question') hint.disabled = trigger.progress > .05;
          intro.style.pointerEvents = trigger.progress > .05 ? 'none' : 'auto';
        },
      },
    })
      .fromTo(intro, { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: .25 }, 0)
      .to(product, { autoAlpha: 1, scale: 1, rotation: 0, ease: 'back.out(1.6)', duration: .2 }, .1)
      .to(sparks, { autoAlpha: 1, scale: 1, stagger: .05, duration: .15, ease: 'back.out(3)' }, .25).to({}, { duration: .7 }, .4);
  });

  context.add('playIntro', () => {
    phase('words');
    // Begin scattering just after the final word finishes entering.
    const scatterAt = 1.35;
    const questionAt = scatterAt + 1.25;
    const bounceAt = questionAt + 1;
    introTimeline = gsap.timeline({ onComplete: () => { hint.disabled = false; phase('question'); } })
      .to(tokens, { autoAlpha: 1, y: 0, scale: 1, duration: .55, stagger: { each: .025, from: 'center' }, ease: 'back.out(1.4)' }, 0)
      .call(() => { phase('scatter'); shatter.burst(); }, [], scatterAt)
      .call(() => phase('question-rise'), [], questionAt)
      .to(question, { autoAlpha: 1, y: 0, duration: .95, ease: 'back.out(1.15)' }, questionAt)
      .call(() => phase('question-bounce'), [], bounceAt);
    const bounceEnd = addLetterBounce(introTimeline, letters, bounceAt);
    const scrollAt = bounceEnd + .12;
    introTimeline
      .call(() => phase('scroll-reveal'), [], scrollAt)
      .to(hint, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.5)' }, scrollAt);
    introTimeline.timeScale(2);
  });

  function syncMotionPreference() {
    if (destroyed) return;
    if (reducedMotion()) {
      scrollTimeline?.scrollTrigger?.kill();
      scrollTimeline?.kill();
      scrollTimeline = undefined;
      gsap.set(intro, { opacity: 1, y: 0, pointerEvents: 'auto' });
      gsap.set(product, { autoAlpha: 0, scale: 0 });
      gsap.set(sparks, { autoAlpha: 0, scale: 0 });
      resetTaglines();
      if (started) finishIntro();
    } else {
      context.setupScroll();
    }
  }
  const observer = new MutationObserver(syncMotionPreference);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  preference.addEventListener('change', syncMotionPreference);
  context.setupScroll();

  return {
    start() {
      if (started || destroyed) return;
      started = true;
      if (reducedMotion() || (scrollTimeline?.scrollTrigger?.progress ?? 0) > .015) finishIntro();
      else context.playIntro();
      if ((scrollTimeline?.progress() ?? 0) >= .65 && !reducedMotion()) context.playTaglines();
    },
    destroy() {
      destroyed = true;
      observer.disconnect();
      preference.removeEventListener('change', syncMotionPreference);
      hint.removeEventListener('click', advanceScene);
      shatter.clear();
      taglineShatter.clear();
      productShatter.clear();
      trail.destroy();
      taglineTimeline?.kill();
      context.revert();
      questionCopy.restore();
      taglineCopies.forEach(copy => copy.restore());
      productImage.remove();
      if (originalStage !== null) product.setAttribute('data-stage', originalStage);
      delete root.dataset.taglinePhase;
      delete root.dataset.heroPhase;
    },
  };
}

