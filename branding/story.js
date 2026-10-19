(() => {
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.3});document.querySelectorAll('.story-scene>div').forEach(el=>observer.observe(el));}
})();
