// Este arquivo contém a lógica principal em JavaScript do site. Ele gerencia envios de formulários, atualiza o quadro Kanban e controla o estado da aplicação.


    // ======= Kanban =======
    // app.js

// Dados simulados de usuários e sentimentos (armazenados no localStorage)
const STORAGE_USERS = 'usuarios_app_sentimentos';
const STORAGE_SESSAO = 'sessao_ativa';
const STORAGE_SENTIMENTOS = 'sentimentos_enviados';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const userSection = document.getElementById('user-section');
  const profileInfo = document.getElementById('profile-info');
  const profilePic = document.getElementById('profile-pic');
  const profileName = document.getElementById('profile-name');
  const logoutBtn = document.getElementById('logout-btn');
  const openLoginModalBtn = document.getElementById('open-login-modal');
  const registerBtn = document.getElementById('register-btn');

  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const sentimentoForm = document.getElementById('sentimento-form');

  const loginError = document.getElementById('login-error');
  const mensagemSucesso = document.getElementById('mensagem-sucesso');

  const listaSentimentosCard = document.querySelector('.card.mt-4');
  const listaSentimentos = document.getElementById('lista-sentimentos');

  // Inicializa localStorage com array vazio se não existir
  function inicializarStorage() {
    if (!localStorage.getItem(STORAGE_USERS)) localStorage.setItem(STORAGE_USERS, JSON.stringify([]));
    if (!localStorage.getItem(STORAGE_SENTIMENTOS)) localStorage.setItem(STORAGE_SENTIMENTOS, JSON.stringify([]));
  }

  // Obter usuários e sessão
  function getUsuarios() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
  }

  function setUsuarios(usuarios) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(usuarios));
  }

  function getSessao() {
    return JSON.parse(localStorage.getItem(STORAGE_SESSAO));
  }

  function setSessao(usuario) {
    localStorage.setItem(STORAGE_SESSAO, JSON.stringify(usuario));
  }

  function clearSessao() {
    localStorage.removeItem(STORAGE_SESSAO);
  }

  function getSentimentos() {
    return JSON.parse(localStorage.getItem(STORAGE_SENTIMENTOS)) || [];
  }

  function setSentimentos(sentimentos) {
    localStorage.setItem(STORAGE_SENTIMENTOS, JSON.stringify(sentimentos));
  }

  // Atualiza a UI de acordo com sessão
  function atualizarUI() {
    const sessao = getSessao();

    if (sessao) {
      // Usuário logado
      profileInfo.classList.remove('d-none');
      openLoginModalBtn.classList.add('d-none');
      registerBtn.classList.add('d-none');

      profilePic.src = sessao.fotoPerfil || 'https://via.placeholder.com/40';
      profileName.textContent = sessao.nome;

      listaSentimentosCard.classList.remove('d-none');
      carregarSentimentos();
    } else {
      // Não logado
      profileInfo.classList.add('d-none');
      openLoginModalBtn.classList.remove('d-none');
      registerBtn.classList.remove('d-none');

      listaSentimentosCard.classList.add('d-none');
    }
  }

  // Carrega lista de sentimentos na tela (só pra usuário logado)
  function carregarSentimentos() {
    const sentimentos = getSentimentos();
    listaSentimentos.innerHTML = '';

    if (sentimentos.length === 0) {
      listaSentimentos.innerHTML = '<li class="list-group-item text-muted">Nenhum sentimento enviado ainda.</li>';
      return;
    }

    sentimentos.forEach(item => {
      // Exibir "Anônimo" se marcado
      const remetente = item.anonimo ? 'Anônimo' : item.nome;

      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <strong>${remetente}</strong> <small class="text-muted">(${new Date(item.data).toLocaleString()})</small><br>
        Sentimento: <span class="fw-semibold">${item.sentimento}</span><br>
        Comentário: ${item.comentario ? item.comentario : '<em>Sem comentário</em>'}
      `;
      listaSentimentos.appendChild(li);
    });
  }

  // Login
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    loginError.classList.add('d-none');
    const username = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;

    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.username === username && u.senha === password);

    if (usuario) {
      setSessao(usuario);
      loginForm.reset();
      loginModal.hide();
      atualizarUI();
    } else {
      loginError.textContent = 'Usuário ou senha incorretos.';
      loginError.classList.remove('d-none');
    }
  });

  // Registro
  registerForm.addEventListener('submit', e => {
    e.preventDefault();

    const nome = document.getElementById('register-name').value.trim();
    const picInput = document.getElementById('register-pic');
    const username = document.getElementById('register-username').value.trim();
    const senha = document.getElementById('register-password').value;

    const usuarios = getUsuarios();
    if (usuarios.some(u => u.username === username)) {
      alert('Usuário já existe. Escolha outro nome.');
      return;
    }

    // Ler a imagem como base64
    const file = picInput.files[0];
    if (!file) {
      alert('Por favor, selecione uma foto de perfil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const fotoPerfil = reader.result;

      // Adiciona usuário novo
      usuarios.push({ nome, fotoPerfil, username, senha });
      setUsuarios(usuarios);

      registerForm.reset();
      registerModal.hide();
      alert('Usuário registrado com sucesso! Agora faça login.');
    };

    reader.readAsDataURL(file);
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    clearSessao();
    atualizarUI();
  });

  // Form de sentimento
  sentimentoForm.addEventListener('submit', e => {
    e.preventDefault();

    const sessao = getSessao();
    if (!sessao && !document.getElementById('anonimo').checked) {
      alert('Você precisa estar logado ou enviar como anônimo para enviar seu sentimento.');
      return;
    }

    const sentimento = sentimentoForm.sentimento.value;
    const comentario = document.getElementById('comentario').value.trim();
    const anonimo = document.getElementById('anonimo').checked;

    const sentimentos = getSentimentos();
    sentimentos.push({
      nome: anonimo ? 'Anônimo' : (sessao ? sessao.nome : 'Anônimo'),
      sentimento,
      comentario,
      anonimo,
      data: new Date().toISOString(),
    });
    setSentimentos(sentimentos);

    sentimentoForm.reset();
    mensagemSucesso.textContent = 'Sentimento enviado com sucesso!';
    mensagemSucesso.classList.remove('d-none');

    // Atualizar lista se for responsável (logado)
    if (sessao) carregarSentimentos();

    setTimeout(() => {
      mensagemSucesso.classList.add('d-none');
    }, 4000);
  });

  // Botão abrir modal login
  openLoginModalBtn.addEventListener('click', () => {
    loginError.classList.add('d-none');
    loginForm.reset();
    loginModal.show();
  });

  // Inicializar tudo
  inicializarStorage();
  atualizarUI();
});
