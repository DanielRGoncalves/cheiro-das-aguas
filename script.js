
  /* ─── PRODUCTS ─────────────────────────────────────── */
  const PRODUCTS = [
    { id:1, emoji:'☕', badge:'Novidade', name:'Cappuccino 250g', desc:'Nossa receita especial. Blend cremoso com intensidade equilibrada.', price:22.00 }
  ];

  let cart = [];
  let currentStep = 1;
  let selectedPay = 'pix';

  /* ─── RENDER PRODUCTS ──────────────────────────────── */
  const grid = document.getElementById('productGrid');
  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-card__img" aria-hidden="true">${p.emoji}</div>
      <div class="product-card__body">
        <span class="product-card__badge">${p.badge}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.desc}</p>
        <div class="product-card__footer">
          <div class="product-card__price">
            <small>R$</small>
            ${p.price.toFixed(2).replace('.',',')}
          </div>
          <button class="btn-add" data-id="${p.id}" aria-label="Adicionar ${p.name} ao carrinho">
            + Adicionar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  /* ─── CART LOGIC ───────────────────────────────────── */
  function getItem(id){ return cart.find(i => i.id === id); }

  function addToCart(id){
    const prod = PRODUCTS.find(p => p.id === id);
    const existing = getItem(id);
    if(existing){ existing.qty++; }
    else { cart.push({...prod, qty:1}); }
    renderCart();
    showToast(`${prod.emoji} ${prod.name} adicionado!`);
  }

  function removeFromCart(id){
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }

  function changeQty(id, delta){
    const item = getItem(id);
    if(!item) return;
    item.qty += delta;
    if(item.qty < 1) removeFromCart(id);
    else renderCart();
  }

  function calcTotal(){ return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function calcItems(){ return cart.reduce((s, i) => s + i.qty, 0); }
  function fmtBRL(v){ return 'R$ ' + v.toFixed(2).replace('.',','); }

  function renderCart(){
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const totalEl = document.getElementById('cartTotal');
    const badge   = document.getElementById('cartBadge');
    const btnCO   = document.getElementById('btnCheckout');
    const count   = calcItems();

    totalEl.textContent = fmtBRL(calcTotal());
    badge.textContent   = count;
    badge.classList.toggle('hidden', count === 0);
    btnCO.disabled      = count === 0;

    // remove old items
    itemsEl.querySelectorAll('.cart-item').forEach(e => e.remove());

    if(cart.length === 0){
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item__emoji" aria-hidden="true">${item.emoji}</div>
        <div>
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__sub">${fmtBRL(item.price)} / un.</div>
        </div>
        <div class="cart-item__controls">
          <div class="cart-item__price">${fmtBRL(item.price * item.qty)}</div>
          <div class="qty-row">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
            <span class="qty-val" aria-label="Quantidade: ${item.qty}">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="btn-remove" data-id="${item.id}">Remover</button>
        </div>`;
      itemsEl.appendChild(el);
    });
  }

  /* ─── CART PANEL ───────────────────────────────────── */
  function openCart(){
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeCart(){
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('overlay').addEventListener('click', closeCart);

  document.getElementById('cartItems').addEventListener('click', e => {
    const id = +e.target.dataset.id;
    if(!id) return;
    if(e.target.dataset.action === 'inc') changeQty(id, 1);
    else if(e.target.dataset.action === 'dec') changeQty(id, -1);
    else if(e.target.classList.contains('btn-remove')) removeFromCart(id);
  });

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add');
    if(!btn) return;
    const id = +btn.dataset.id;
    addToCart(id);
    btn.textContent = '✓ Adicionado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Adicionar';
      btn.classList.remove('added');
    }, 1800);
  });

  /* ─── CHECKOUT ─────────────────────────────────────── */
  const modal     = document.getElementById('checkoutModal');
  const modalBox  = document.getElementById('modalBox');
  const backdrop  = document.getElementById('modalBackdrop');
  const btnNext   = document.getElementById('btnNext');
  const btnBack   = document.getElementById('btnBack');
  const steps     = [null,
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('stepSuccess')
  ];

  function openModal(){
    closeCart();
    currentStep = 1;
    showStep(1);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('btnCheckout').addEventListener('click', openModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  function showStep(n){
    [1,2,3,4].forEach(i => {
      if(steps[i]) steps[i].style.display = (i === n) ? 'block' : 'none';
    });
    const nav   = document.getElementById('modalNav');
    const title = document.getElementById('modalTitle');
    const titles = ['','Seus dados','Endereço','Pagamento',''];

    title.textContent = titles[n] || 'Pedido confirmado!';
    btnBack.style.display = (n > 1 && n < 4) ? 'block' : 'none';
    nav.style.display     = (n === 4) ? 'none' : 'flex';

    if(n === 3) renderOrderSummary();
    if(n === 4) buildSuccessMsg();

    currentStep = n;
    document.getElementById('modalBox').scrollTop = 0;
  }

  function validateStep(n){
    if(n === 1){
      const name = document.getElementById('fname').value.trim();
      const wpp  = document.getElementById('fwpp').value.trim();
      if(!name){ highlight('fname'); return false; }
      if(wpp.replace(/\D/g,'').length < 10){ highlight('fwpp'); return false; }
    }
    if(n === 2){
      const cep  = document.getElementById('fcep').value.trim();
      const num  = document.getElementById('fnum').value.trim();
      const rua  = document.getElementById('frua').value.trim();
      const bairro = document.getElementById('fbairro').value.trim();
      if(cep.replace(/\D/g,'').length < 8){ highlight('fcep'); return false; }
      if(!num)   { highlight('fnum');    return false; }
      if(!rua)   { highlight('frua');    return false; }
      if(!bairro){ highlight('fbairro'); return false; }
    }
    return true;
  }

  function highlight(id){
    const el = document.getElementById(id);
    el.classList.add('invalid');
    el.focus();
    setTimeout(() => el.classList.remove('invalid'), 2000);
  }

  btnNext.addEventListener('click', () => {
    if(currentStep < 3){
      if(!validateStep(currentStep)) return;
      showStep(currentStep + 1);
    } else if(currentStep === 3){
      
      // Removemos o "fetch" para o backend!
      // Vamos direto para a tela de Sucesso (Passo 4)
      showStep(4);

      // Limpa o carrinho depois de gerar o link do WhatsApp
      cart = [];
      renderCart();
    }
  });

  btnBack.addEventListener('click', () => {
    if(currentStep > 1) showStep(currentStep - 1);
  });

  /* mask CEP */
  document.getElementById('fcep').addEventListener('input', function(){
    let v = this.value.replace(/\D/g,'').slice(0,8);
    if(v.length > 5) v = v.slice(0,5) + '-' + v.slice(5);
    this.value = v;
  });
  /* mask phone */
  document.getElementById('fwpp').addEventListener('input', function(){
    let v = this.value.replace(/\D/g,'').slice(0,11);
    if(v.length > 6) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
    else if(v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
    this.value = v;
  });

  /* payment toggle */
  document.querySelectorAll('.pay-opt').forEach(opt => {
    opt.addEventListener('click', function(){
      document.querySelectorAll('.pay-opt').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      selectedPay = this.querySelector('input').value;
    });
  });

  function renderOrderSummary(){
    const el = document.getElementById('orderSummary');
    let html = '<div class="order-summary__title">Resumo do pedido</div>';
    cart.forEach(i => {
      html += `<div class="order-summary__item"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>${fmtBRL(i.price * i.qty)}</span></div>`;
    });
    html += `<div class="order-summary__total"><span>Total</span><span>${fmtBRL(calcTotal())}</span></div>`;
    el.innerHTML = html;
  }

  function buildSuccessMsg(){
    const name = document.getElementById('fname').value.trim();
    const wpp  = document.getElementById('fwpp').value.replace(/\D/g,'');
    document.getElementById('successMsg').innerHTML =
      `Olá, <strong>${name}</strong>! Seu pedido foi registrado.<br>Entraremos em contato pelo WhatsApp em breve.`;

    let msg = `Olá! Acabei de fazer um pedido no Cheiro das Águas 🎉\n\n`;
    cart.forEach(i => { msg += `• ${i.name} x${i.qty} — ${fmtBRL(i.price * i.qty)}\n`; });
    msg += `\nTotal: ${fmtBRL(calcTotal())}`;
    msg += `\nPagamento: ${selectedPay === 'pix' ? 'Pix' : 'Dinheiro'}`;
    msg += `\nEndereço: ${document.getElementById('frua').value}, ${document.getElementById('fnum').value} — ${document.getElementById('fbairro').value} — CEP ${document.getElementById('fcep').value}`;

    const wppNumber = '5527998480547'; // troque pelo número real
    document.getElementById('wppLink').href =
      `https://wa.me/${wppNumber}?text=${encodeURIComponent(msg)}`;
  }

  /* ─── TOAST ────────────────────────────────────────── */
  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ─── INIT ─────────────────────────────────────────── */
  renderCart();

