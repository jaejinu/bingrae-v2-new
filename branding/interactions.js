(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const play = (element, frames, options = {}) => {
    if (reduced.matches || !element.animate) return;
    element.getAnimations().forEach(a => a.cancel());
    return element.animate(frames, {duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)', ...options});
  };
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.getAnimations().forEach(a => a.cancel());
  });

  // Hero: an optional, repeatable smile, without moving the reading area.
  const sticker = document.querySelector('.photo-corner');
  const hello = document.createElement('button');
  hello.className = 'photo-corner hello-button';
  hello.type = 'button'; hello.textContent = '☺';
  hello.setAttribute('aria-label', '작은 웃음 보내기');
  sticker.replaceWith(hello);
  hello.addEventListener('click', () => {
    play(hello, [{transform:'rotate(13deg) scale(1)'},{transform:'rotate(-12deg) scale(1.16)'},{transform:'rotate(13deg) scale(1)'}]);
    const stroke = document.querySelector('.smile path');
    play(stroke, [{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}], {duration:900});
  });

  // Name: actual buttons support touch, Enter and Space.
  const nameNote = document.createElement('p');
  nameNote.className = 'name-response'; nameNote.setAttribute('aria-live','polite');
  nameNote.textContent = '빙 · 그 · 레, 글자를 눌러 작은 웃음을 만나보세요.';
  document.querySelector('.name-smile').after(nameNote);
  const messages = ['입가에 번지는 작은 웃음.', '함께할 때 더 따뜻해지는 순간.', '오늘의 일상에도, 빙그레.'];
  document.querySelectorAll('.big-name > span').forEach((letter, index) => {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'name-letter'; button.textContent = letter.textContent;
    button.setAttribute('aria-label', `${letter.textContent} — 웃음 이야기`);
    letter.textContent = ''; letter.append(button);
    button.addEventListener('click', () => {
      nameNote.textContent = messages[index];
      play(button, [{transform:'translateY(0) rotate(0)'},{transform:'translateY(-12px) rotate(-7deg)'},{transform:'translateY(0) rotate(0)'}]);
    });
  });

  // Moments: accessible native dialog with real controls, no hidden hover-only copy.
  const cards = [...document.querySelectorAll('.moment-card')];
  const dialog = document.createElement('dialog'); dialog.className = 'moment-dialog';
  dialog.setAttribute('aria-labelledby','moment-dialog-title');
  dialog.innerHTML = '<div class="moment-dialog-body"><button type="button" class="dialog-close" aria-label="사진 닫기">닫기 ×</button><img class="dialog-image" alt=""><div class="dialog-copy"><p class="dialog-count"></p><h2 id="moment-dialog-title"></h2><p class="dialog-description"></p><div class="dialog-controls"><button type="button" data-direction="-1" aria-label="이전 순간">← 이전</button><button type="button" data-direction="1" aria-label="다음 순간">다음 →</button></div></div></div>';
  document.body.append(dialog);
  let active = 0, opener, savedOverflow = '';
  function showMoment(index) {
    active = (index + cards.length) % cards.length;
    const card = cards[active], source = card.querySelector('img');
    const image = dialog.querySelector('img'); image.src = source.src; image.alt = source.alt;
    dialog.querySelector('h2').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('.dialog-description').textContent = card.querySelector('figcaption p').innerText;
    dialog.querySelector('.dialog-count').textContent = `OUR MOMENTS / 0${active + 1} — 03`;
    play(dialog.querySelector('.dialog-copy'), [{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}]);
  }
  cards.forEach((card,index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'moment-open';
    button.textContent = '순간 크게 보기 ↗'; button.setAttribute('aria-label',`${card.querySelector('h3').textContent} 사진 크게 보기`);
    card.querySelector('.moment-image').append(button);
    button.addEventListener('click', () => {
      opener = button; showMoment(index); savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden'; dialog.showModal();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => showMoment(active + Number(button.dataset.direction))));
  dialog.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight'].includes(event.key)) {event.preventDefault(); showMoment(active + (event.key === 'ArrowLeft' ? -1 : 1));}
  });
  dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => {document.body.style.overflow = savedOverflow; opener?.focus({preventScroll:true});});

  // Promises: keep the selected state visible even when the photo is above the fold.
  const promiseStatus = document.createElement('p'); promiseStatus.className = 'promise-status';
  promiseStatus.setAttribute('aria-live','polite');
  const details = [...document.querySelectorAll('.promise-list details')];
  document.querySelector('.promise-list').prepend(promiseStatus);
  function updatePromiseStatus() {
    const current = details.findIndex(detail => detail.open);
    promiseStatus.textContent = current < 0 ? '궁금한 약속을 선택해 주세요.' : `OUR PROMISE / 0${current + 1} — 03`;
  }
  details.forEach(detail => detail.addEventListener('toggle', updatePromiseStatus)); updatePromiseStatus();

  // Activities: subtle directional tilt, restricted to a mouse/trackpad.
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if(reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${-(event.clientY-rect.top-rect.height/2)/rect.height*4}deg`);
      card.style.setProperty('--tilt-y', `${(event.clientX-rect.left-rect.width/2)/rect.width*4}deg`);
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => card.classList.remove('is-tilting'));
  });

  // Ending: a small local-only response, never a fake shared counter.
  const ending = document.querySelector('.ending-content');
  const smileButton = document.createElement('button'); smileButton.type = 'button';
  smileButton.className = 'leave-smile'; smileButton.textContent = '오늘의 작은 웃음 남기기 ☺';
  smileButton.setAttribute('aria-pressed','false');
  const thanks = document.createElement('p'); thanks.className = 'smile-thanks'; thanks.setAttribute('role','status');
  thanks.textContent = '이 화면에서만 전하는 작은 인사예요.';
  ending.insertBefore(smileButton,ending.querySelector('a')); smileButton.after(thanks);
  smileButton.addEventListener('click', () => {
    if(smileButton.getAttribute('aria-pressed') === 'true') return;
    smileButton.setAttribute('aria-pressed','true'); smileButton.textContent = '웃음이 피어났어요 ☺';
    thanks.textContent = '오늘도 웃을 틈이 있었길. 내일도, 빙그레.';
    play(smileButton,[{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}]);
    if(reduced.matches) return;
    for(let i=0;i<7;i++){
      const particle=document.createElement('span'); particle.className='smile-particle'; particle.textContent='☺';particle.setAttribute('aria-hidden','true');ending.append(particle);
      const animation=play(particle,[{opacity:0,transform:'translate(-50%,0) scale(.5)'},{opacity:1,offset:.2},{opacity:0,transform:`translate(calc(-50% + ${(i-3)*38}px),${-100-Math.abs(i-3)*20}px) rotate(${(i-3)*20}deg) scale(1)`}],{duration:1100});
      if(animation) animation.finished.catch(()=>{}).finally(()=>particle.remove()); else particle.remove();
    }
  });
})();
