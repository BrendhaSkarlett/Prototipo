// Este arquivo contém a lógica principal em JavaScript do site. Ele gerencia envios de formulários, atualiza o quadro Kanban e controla o estado da aplicação.

document.addEventListener('DOMContentLoaded', () => {
    // ======= Kanban =======
    const formulario = document.getElementById('kanban-form');

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const titulo = document.getElementById('task-title').value;
        const descricao = document.getElementById('task-description').value;

        adicionarTarefaKanban(titulo, descricao, 'todo');
        formulario.reset();
    });

    function adicionarTarefaKanban(titulo, descricao, status) {
        const cartao = document.createElement('div');
        cartao.className = 'card mb-2';
        cartao.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${titulo}</h5>
                <p class="card-text">${descricao}</p>
                <div class="mb-2">
                    <label class="form-label">Avaliação:</label>
                    <div>
                        <button class="btn btn-success btn-sm me-1 btn-avaliacao" data-valor="bom">Bom</button>
                        <button class="btn btn-warning btn-sm me-1 btn-avaliacao" data-valor="medio">Médio</button>
                        <button class="btn btn-danger btn-sm btn-avaliacao" data-valor="ruim">Ruim</button>
                    </div>
                    <div class="mt-1" style="font-size:0.9em;" id="avaliacao-resultado"></div>
                </div>
                <div class="mb-2">
                    <label class="form-label">Responder:</label>
                    <textarea class="form-control mb-1 resposta-texto" rows="2" placeholder="Digite sua resposta"></textarea>
                    <div class="form-check">
                        <input class="form-check-input resposta-anonima" type="checkbox" id="anonima-${Math.random().toString(36).substr(2, 5)}">
                        <label class="form-check-label">Enviar como anônimo</label>
                    </div>
                    <button class="btn btn-primary btn-sm mt-1 btn-enviar-resposta">Enviar resposta</button>
                    <div class="mt-1" style="font-size:0.9em;" id="resposta-resultado"></div>
                </div>
            </div>
        `;
        const coluna = document.querySelector(`#${status} .kanban-cards`);
        coluna.appendChild(cartao);

        // Avaliação
        const resultadoAvaliacao = cartao.querySelector('#avaliacao-resultado');
        cartao.querySelectorAll('.btn-avaliacao').forEach(btn => {
            btn.addEventListener('click', function () {
                let valor = this.getAttribute('data-valor');
                let texto = '';
                if (valor === 'bom') texto = 'Avaliação: Bom 👍';
                if (valor === 'medio') texto = 'Avaliação: Médio 😐';
                if (valor === 'ruim') texto = 'Avaliação: Ruim 👎';
                resultadoAvaliacao.textContent = texto;
            });
        });

        // Resposta
        const btnEnviarResposta = cartao.querySelector('.btn-enviar-resposta');
        const respostaTexto = cartao.querySelector('.resposta-texto');
        const respostaAnonima = cartao.querySelector('.resposta-anonima');
        const respostaResultado = cartao.querySelector('#resposta-resultado');

        btnEnviarResposta.addEventListener('click', function () {
            const texto = respostaTexto.value.trim();
            if (!texto) {
                respostaResultado.textContent = 'Digite uma resposta!';
                respostaResultado.classList.add('text-danger');
                return;
            }
            let nome = 'Anônimo';
            if (!respostaAnonima.checked) {
                const nomePerfil = document.getElementById('profile-name');
                nome = nomePerfil && nomePerfil.textContent ? nomePerfil.textContent : 'Usuário';
            }
            respostaResultado.textContent = `Resposta enviada por ${nome}: "${texto}"`;
            respostaResultado.classList.remove('text-danger');
            respostaTexto.value = '';
            respostaAnonima.checked = false;
        });
    }

    // ======= Tema Claro/Escuro =======
    const botaoTema = document.createElement('button');
    botaoTema.id = 'tema-btn';
    botaoTema.className = 'btn btn-dark btn-sm ms-2';
    botaoTema.textContent = 'Modo Escuro';

    // Adiciona o botão ao topo
    const secaoUsuario = document.getElementById('user-section');
    secaoUsuario.appendChild(botaoTema);

    // Aplica o tema salvo
    if (localStorage.getItem('tema') === 'escuro') {
        document.body.classList.add('bg-dark', 'text-light');
        botaoTema.textContent = 'Modo Claro';
        botaoTema.classList.remove('btn-dark');
        botaoTema.classList.add('btn-light');
    }

    botaoTema.addEventListener('click', () => {
        if (document.body.classList.contains('bg-dark')) {
            document.body.classList.remove('bg-dark', 'text-light');
            botaoTema.textContent = 'Modo Escuro';
            botaoTema.classList.remove('btn-light');
            botaoTema.classList.add('btn-dark');
            localStorage.setItem('tema', 'claro');
        } else {
            document.body.classList.add('bg-dark', 'text-light');
            botaoTema.textContent = 'Modo Claro';
            botaoTema.classList.remove('btn-dark');
            botaoTema.classList.add('btn-light');
            localStorage.setItem('tema', 'escuro');
        }
    });

    // ======= Login/Perfil/Registro =======
    const formularioLogin = document.getElementById('login-form');
    const infoPerfil = document.getElementById('profile-info');
    const fotoPerfil = document.getElementById('profile-pic');
    const nomePerfil = document.getElementById('profile-name');
    const botaoSair = document.getElementById('logout-btn');

    // Elementos do modal de registro
    let modalRegistro;
    let formularioRegistro;

    // Modal de registro em português
    function criarModalRegistro() {
        const modalHtml = `
        <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <form id="register-form" enctype="multipart/form-data">
                <div class="modal-header">
                  <h5 class="modal-title" id="registerModalLabel">Registrar nova conta</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <label for="register-name" class="form-label">Nome</label>
                    <input type="text" class="form-control" id="register-name" required>
                  </div>
                  <div class="mb-3">
                    <label for="register-pic" class="form-label">Foto de perfil</label>
                    <input type="file" class="form-control" id="register-pic" accept="image/*" required>
                  </div>
                  <div class="mb-3">
                    <label for="register-username" class="form-label">Usuário</label>
                    <input type="text" class="form-control" id="register-username" required>
                  </div>
                  <div class="mb-3">
                    <label for="register-password" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="register-password" required>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalRegistro = new bootstrap.Modal(document.getElementById('registerModal'));
        formularioRegistro = document.getElementById('register-form');
    }

    // Armazena usuários no localStorage
    function salvarUsuario(usuario) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    function encontrarUsuario(usuario, senha) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        return usuarios.find(u => u.username === usuario && u.password === senha);
    }

    function mostrarPerfil(nome, foto) {
        fotoPerfil.src = foto;
        nomePerfil.textContent = nome;
        infoPerfil.classList.remove('d-none');
        formularioLogin.classList.add('d-none');

        // Mostra mensagem de status de conexão
        let status = document.getElementById('status-conectado');
        if (status) {
            status.innerHTML = `<strong>Conectado como:</strong> ${nome}`;
            status.classList.remove('d-none');
        }
    }

    function sair() {
        infoPerfil.classList.add('d-none');
        formularioLogin.classList.remove('d-none');
        fotoPerfil.src = '';
        nomePerfil.textContent = '';

        // Esconde mensagem de status de conexão
        let status = document.getElementById('status-conectado');
        if (status) {
            status.classList.add('d-none');
        }
    }

    // Botão Registrar
    if (!document.getElementById('register-btn')) {
        const botaoRegistrar = document.createElement('button');
        botaoRegistrar.type = 'button';
        botaoRegistrar.id = 'register-btn';
        botaoRegistrar.className = 'btn btn-outline-primary btn-sm';
        botaoRegistrar.textContent = 'Registrar';
        formularioLogin.appendChild(botaoRegistrar);

        botaoRegistrar.addEventListener('click', () => {
            if (!document.getElementById('registerModal')) {
                criarModalRegistro();
                lidarComRegistro();
            }
            modalRegistro.show();
        });
    }

    // Registro
    function lidarComRegistro() {
        formularioRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('register-name').value;
            const inputFoto = document.getElementById('register-pic');
            const usuario = document.getElementById('register-username').value;
            const senha = document.getElementById('register-password').value;

            let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            if (usuarios.some(u => u.username === usuario)) {
                alert('Usuário já existe!');
                return;
            }

            const arquivo = inputFoto.files[0];
            if (!arquivo) {
                alert('Selecione uma foto!');
                return;
            }

            const leitor = new FileReader();
            leitor.onload = function(evento) {
                const fotoDataUrl = evento.target.result;
                salvarUsuario({ name: nome, pic: fotoDataUrl, username: usuario, password: senha });
                alert('Conta registrada com sucesso! Faça login.');
                modalRegistro.hide();
                formularioRegistro.reset();
            };
            leitor.readAsDataURL(arquivo);
        });
    }

    // Login
    formularioLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const usuario = document.getElementById('login-name').value;
        const senha = document.getElementById('login-password').value;

        const usuarioEncontrado = encontrarUsuario(usuario, senha);
        if (usuarioEncontrado) {
            mostrarPerfil(usuarioEncontrado.name, usuarioEncontrado.pic);
        } else {
            alert('Usuário ou senha inválidos!');
        }
    });

    botaoSair.addEventListener('click', function() {
        sair();
    });

    // --- SENTIMENTOS ---
    const form = document.getElementById('sentimento-form');
    const lista = document.getElementById('lista-sentimentos');
    const mensagemSucesso = document.getElementById('mensagem-sucesso');

    // Carregar sentimentos salvos
    function carregarSentimentos() {
        lista.innerHTML = '';
        const sentimentos = JSON.parse(localStorage.getItem('sentimentos') || '[]');
        sentimentos.reverse().forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            let emoji = '';
            if (item.sentimento === 'Bom') emoji = '😊';
            else if (item.sentimento === 'Mais ou menos') emoji = '😐';
            else emoji = '😞';

            li.innerHTML = `
                <span class="emoji">${emoji}</span>
                <span><strong>${item.sentimento}</strong>${item.anonimo ? ' (Anônimo)' : item.usuario ? ` (${item.usuario})` : ''}</span>
                ${item.comentario ? `<span class="text-muted">- ${item.comentario}</span>` : ''}
            `;
            lista.appendChild(li);
        });
    }

    carregarSentimentos();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const sentimento = form.sentimento.value;
        const comentario = document.getElementById('comentario').value.trim();
        const anonimo = document.getElementById('anonimo').checked;

        let usuario = '';
        if (!anonimo && !loginForm.classList.contains('d-none')) {
            alert('Para enviar não anônimo, faça login!');
            return;
        }
        if (!anonimo && profileName.textContent) {
            usuario = profileName.textContent;
        }

        const novo = { sentimento, comentario, anonimo, usuario };
        let sentimentos = JSON.parse(localStorage.getItem('sentimentos') || '[]');
        sentimentos.push(novo);
        localStorage.setItem('sentimentos', JSON.stringify(sentimentos));

        mensagemSucesso.textContent = 'Sua resposta foi enviada para um dos nossos representantes!';
        mensagemSucesso.classList.remove('d-none');
        form.reset();
        carregarSentimentos();
        setTimeout(() => mensagemSucesso.classList.add('d-none'), 3000);
    });
});