const URL_API = 'https://api-academia-npw8skh2a-pedro-mrs15s-projects.vercel.app';

// CREDENCIAIS PARA AUTO-LOGIN (Ajuste conforme seu .env)
const USUARIO_ADM = "black_iron"; 
const SENHA_ADM = "black_iron777"; 

let TOKEN_JWT = "";

// 1. FUNÇÃO DE LOGIN (OBTER TOKEN)
async function realizarLogin() {
    const statusLabel = document.getElementById('auth-status');
    try {
        const res = await fetch(`${URL_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: USUARIO_ADM, senha: SENHA_ADM })
        });
        const dados = await res.json();
        
        if (res.ok) {
            TOKEN_JWT = dados.token;
            statusLabel.innerText = "ACESSO AUTORIZADO";
            statusLabel.classList.replace('text-gray-500', 'text-palmeirasGreen');
            listarAlunos();
        } else {
            statusLabel.innerText = "ERRO DE AUTENTICAÇÃO";
            statusLabel.classList.add('text-red-500');
        }
    } catch (e) {
        statusLabel.innerText = "OFFLINE";
    }
}

// 2. LISTAR ALUNOS (GET público)
async function listarAlunos() {
    try {
        const res = await fetch(`${URL_API}/alunos`);
        const alunos = await res.json();
        const container = document.getElementById('lista-container');
        container.innerHTML = '';

        alunos.forEach(aluno => {
            const card = document.createElement('div');
            card.className = "bg-darkCard border border-darkBorder p-5 rounded-2xl flex justify-between items-center";
            card.innerHTML = `
                <div>
                    <h4 class="text-white font-bold uppercase">${aluno.nome}</h4>
                    <p class="text-xs text-gray-500 font-mono">ID: ${aluno.id} | CPF: ${aluno.cpf} | ${aluno.status}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="prepararEdicao(${aluno.id}, '${aluno.nome}', '${aluno.cpf}', '${aluno.status}')" class="p-2 hover:bg-palmeirasGreen hover:text-black rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L12 14.207l-5 1 1-5 12.414-12.414z"></path></svg>
                    </button>
                    <button onclick="deletarAluno(${aluno.id})" class="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

// 3. SALVAR (COM O TOKEN NO HEADER)
document.getElementById('form-aluno').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('aluno-id').value;
    const dados = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        status: document.getElementById('status').value
    };

    // Aqui está o segredo: enviando o token que o auth.py exige
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN_JWT}` 
    };

    const url = id ? `${URL_API}/alunos/${parseInt(id)}` : `${URL_API}/alunos`;
    const metodo = id ? 'PATCH' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: headers,
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            document.getElementById('form-aluno').reset();
            document.getElementById('aluno-id').value = "";
            document.getElementById('btn-salvar').innerText = "Confirmar Cadastro";
            listarAlunos();
            alert("Sucesso!");
        } else {
            const erro = await res.json();
            alert("Erro: " + erro.error);
        }
    } catch (e) { alert("Falha na conexão."); }
});

// 4. DELETAR
async function deletarAluno(id) {
    if (!confirm("Excluir?")) return;
    try {
        const res = await fetch(`${URL_API}/alunos/${parseInt(id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
        });
        if (res.ok) listarAlunos();
    } catch (e) { alert("Erro ao deletar."); }
}

function prepararEdicao(id, nome, cpf, status) {
    document.getElementById('aluno-id').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('cpf').value = cpf;
    document.getElementById('status').value = status;
    document.getElementById('btn-salvar').innerText = "Atualizar Atleta";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicializar fazendo login primeiro
realizarLogin();