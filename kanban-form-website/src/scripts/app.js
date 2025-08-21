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

    // Botão de apagar conta
    let btnApagar = document.getElementById('delete-account-btn');
    if (btnApagar) btnApagar.remove();

    if (sessao) {
      // Usuário logado
      profileInfo.classList.remove('d-none');
      openLoginModalBtn.classList.add('d-none');
      registerBtn.classList.add('d-none');

      profilePic.src = sessao.fotoPerfil || 'https://via.placeholder.com/40';
      profileName.textContent = sessao.nome;

      // Adiciona botão de apagar conta (exceto admin)
      if (sessao.username !== 'admin') {
        const btn = document.createElement('button');
        btn.id = 'delete-account-btn';
        btn.className = 'btn btn-outline-danger btn-sm ms-2';
        btn.textContent = 'Apagar Conta';
        btn.onclick = function() {
          if (confirm('Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.')) {
            apagarConta(sessao.username);
          }
        };
        profileInfo.appendChild(btn);
      }

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

  // Função para apagar conta
  function apagarConta(username) {
    // Remove usuário
    let usuarios = getUsuarios();
    usuarios = usuarios.filter(u => u.username !== username);
    setUsuarios(usuarios);
    // Remove sessão
    clearSessao();
    // Remove todos os sentimentos do usuário (inclusive anônimos enviados por ele)
    let sentimentos = getSentimentos();
    sentimentos = sentimentos.filter(s => {
      // Se sentimento foi enviado por esse usuário (anônimo ou não), remove
      if (s.anonimo && s.username === username) return false;
      if (!s.anonimo && s.username === username) return false;
      return true;
    });
    setSentimentos(sentimentos);
    atualizarUI();
    alert('Conta e sentimentos apagados com sucesso.');
  }

  // Carrega lista de sentimentos na tela (restrito por usuário)
  function carregarSentimentos() {
    const sentimentos = getSentimentos();
    listaSentimentos.innerHTML = '';
    const sessao = getSessao();

    // Se não houver sentimentos
    if (sentimentos.length === 0) {
      listaSentimentos.innerHTML = '<li class="list-group-item text-muted">Nenhum sentimento enviado ainda.</li>';
      return;
    }

    // Se responsável (admin), mostra todos
    if (sessao && sessao.username === 'admin') {
      sentimentos.forEach((item, idx) => {
        const remetente = item.anonimo ? 'Anônimo' : item.nome;
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
          <strong>${remetente}</strong> <small class="text-muted">(${new Date(item.data).toLocaleString()})</small><br>
          Sentimento: <span class="fw-semibold">${item.sentimento}</span><br>
          Comentário: <span class="comentario-texto">${item.comentario ? item.comentario : '<em>Sem comentário</em>'}</span>
        `;
        listaSentimentos.appendChild(li);
      });
      return;
    }

    // Usuário comum: só vê os próprios sentimentos (anônimos ou não)
    const sentimentosFiltrados = sentimentos.filter((item, idx) => {
      if (sessao && item.username === sessao.username) return true;
      return false;
    });

    if (sentimentosFiltrados.length === 0) {
      listaSentimentos.innerHTML = '<li class="list-group-item text-muted">Você ainda não enviou sentimentos e não há sentimentos anônimos.</li>';
      return;
    }

    sentimentosFiltrados.forEach((item, idx) => {
      const remetente = item.anonimo ? 'Anônimo' : item.nome;
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <strong>${remetente}</strong> <small class="text-muted">(${new Date(item.data).toLocaleString()})</small><br>
        Sentimento: <span class="fw-semibold">${item.sentimento}</span><br>
        Comentário: <span class="comentario-texto">${item.comentario ? item.comentario : '<em>Sem comentário</em>'}</span>
      `;

      // Permitir edição e exclusão para sentimentos do usuário logado (anônimos ou não)
      if (sessao && item.username === sessao.username) {
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-sm btn-outline-primary ms-2';
        btnEditar.textContent = 'Editar comentário';
        btnEditar.onclick = function() {
          editarComentario(item, idx);
        };
        li.appendChild(btnEditar);

        const btnApagar = document.createElement('button');
        btnApagar.className = 'btn btn-sm btn-outline-danger ms-2';
        btnApagar.textContent = 'Apagar comentário';
        btnApagar.onclick = function() {
          apagarComentario(item);
        };
        li.appendChild(btnApagar);
      }
      listaSentimentos.appendChild(li);
    });

  // Função para apagar comentário
  function apagarComentario(item) {
    if (confirm('Tem certeza que deseja apagar este comentário?')) {
      let sentimentos = getSentimentos();
      sentimentos = sentimentos.filter(s => !(s.data === item.data && s.username === item.username && s.sentimento === item.sentimento));
      setSentimentos(sentimentos);
      carregarSentimentos();
    }
  }
  }

  // Função para editar comentário
  function editarComentario(item, idx) {
    const novoComentario = prompt('Editar comentário:', item.comentario || '');
    if (novoComentario !== null) {
      // Atualiza sentimento no storage
      let sentimentos = getSentimentos();
      // Procura pelo sentimento correto (por data, username e sentimento)
      const index = sentimentos.findIndex(s => s.data === item.data && s.username === item.username && s.sentimento === item.sentimento);
      if (index !== -1) {
        sentimentos[index].comentario = novoComentario;
        setSentimentos(sentimentos);
        carregarSentimentos();
      }
    }
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
      username: sessao ? sessao.username : undefined,
      sentimento,
      comentario,
      anonimo,
      data: new Date().toISOString(),
    });
    setSentimentos(sentimentos);

    // Mensagem motivadora conforme o sentimento
    let mensagemMotivadora = '';
    if (sentimento === 'Bom') {
      mensagemMotivadora = 'Continue assim! Que seu dia seja incrível!';
    } else if (sentimento === 'Mais ou menos') {
      mensagemMotivadora = 'Dias assim acontecem. Respire fundo, tudo pode melhorar!';
    } else if (sentimento === 'Ruim') {
      mensagemMotivadora = 'Lembre-se: você não está sozinho. Procure apoio e cuide de você!';
    }

    sentimentoForm.reset();
    mensagemSucesso.textContent = 'Sentimento enviado com sucesso! ' + mensagemMotivadora;
    mensagemSucesso.classList.remove('d-none');

    // Atualizar lista se for responsável (logado)
    if (sessao) carregarSentimentos();

    setTimeout(() => {
      mensagemSucesso.classList.add('d-none');
    }, 5000);
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
