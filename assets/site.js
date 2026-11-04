(function () {
  // ---- ports popover on the map ----
  var inner = document.querySelector('.map-inner');
  var dataEl = document.getElementById('ports-data');
  if (inner && dataEl) {
    var ports = JSON.parse(dataEl.textContent);
    var pop = inner.querySelector('.pop');
    var current = null, hideTimer = null;

    function setActive(id) {
      inner.querySelectorAll('[data-id]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-id') === id);
      });
    }
    function show(id) {
      clearTimeout(hideTimer);
      var d = ports[id];
      if (!d) return;
      var anchor = inner.querySelector('.dest[data-id="' + id + '"] text');
      var r = anchor.getBoundingClientRect(), ir = inner.getBoundingClientRect();
      pop.innerHTML = '<small>' + d.label + '</small><h4>' + d.name + '</h4><ul>' +
        d.ports.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
      pop.hidden = false;
      var x = r.left + r.width / 2 - ir.left;
      var half = pop.offsetWidth / 2 + 8;
      x = Math.max(half, Math.min(inner.offsetWidth - half, x));
      var y = r.top - ir.top;
      if (y < pop.offsetHeight + 20) { // not enough room above: show below
        pop.style.transform = 'translate(-50%, 14px)';
        y = r.bottom - ir.top;
        pop.classList.add('below');
      } else {
        pop.style.transform = '';
        pop.classList.remove('below');
      }
      pop.style.left = x + 'px';
      pop.style.top = y + 'px';
      current = id;
      setActive(id);
    }
    function hide() {
      pop.hidden = true;
      current = null;
      setActive(null);
    }
    function hideSoon() { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 180); }

    inner.querySelectorAll('[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.addEventListener('mouseenter', function () { show(id); });
      el.addEventListener('mouseleave', hideSoon);
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (current === id && e.pointerType !== 'mouse') hide(); else show(id);
      });
      if (el.classList.contains('dest')) {
        el.addEventListener('focus', function () { show(id); });
        el.addEventListener('blur', hideSoon);
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(id); }
        });
      }
    });
    pop.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    pop.addEventListener('mouseleave', hideSoon);
    document.addEventListener('click', function (e) { if (!pop.contains(e.target)) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  }

  // ---- quote form -> WhatsApp ----
  var form = document.querySelector('form.quote-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var ar = document.documentElement.lang === 'ar';
    var f = form.elements;
    var type = f.type.options[f.type.selectedIndex].text;
    var L = ar
      ? ['مرحباً Silk Road Highway، أريد عرض سعر شحن.', 'الاسم', 'الهاتف', 'الشحنة', 'من', 'إلى', 'التفاصيل']
      : ['Hello Silk Road Highway, I’d like a shipping quote.', 'Name', 'Phone', 'Shipping', 'From', 'To', 'Details'];
    var msg = [L[0], '',
      L[1] + ': ' + f.name.value,
      L[2] + ': ' + f.phone.value,
      L[3] + ': ' + type,
      L[4] + ': ' + f.from.value,
      L[5] + ': ' + f.to.value,
      L[6] + ': ' + f.details.value].join('\n');
    var url = 'https://wa.me/97455897286?text=' + encodeURIComponent(msg);
    var w = window.open(url, '_blank');
    if (w) w.opener = null; else location.href = url;
  });
})();
