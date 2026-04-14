// URL da sua API na Vercel
const API_BASE_URL = 'https://api-academia-five.vercel.app'; 

// Referências
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

const alunoForm = document.getElementById('alunoForm');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const totalAlunosEl = document.getElementById('totalAlunos');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('formTitle');

let tokenAtual = localStorage.getItem('gymToken') || null;
let alunos = [];

// Início
function iniciarApp() {
    if (tokenAtual) {
        mostrarPainelAdmin();
        carregarAlunos();
    } else {
        mostrarLogin();
    }
}

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('password').value;

    try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuario, senha: senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            tokenAtual = dados.token;
            localStorage.setItem('gymToken', tokenAtual);
            loginForm.reset();
            mostrarPainelAdmin();
            carregarAlunos();
        } else {
            loginError.textContent = dados.error || "Erro ao logar";
            loginError.classList.remove('hidden');
        }
    } catch (erro) {
        alert("Erro de conexão com a API.");
    }
});

// LOGOUT
btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('gymToken');
    mostrarLogin();
});

// LISTAR ALUNOS (GET)
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'GET'
            // O GET de alunos no seu Python não tem @token_obrigatorio, 
            // então não precisa de Header de Authorization aqui.
        });

        if (resposta.ok) {
            alunos = await resposta.json();
            renderizarTabela();
        }
    } catch (erro) {
        console.error("Erro ao buscar alunos:", erro);
    }
}

function renderizarTabela() {
    tabelaAlunos.innerHTML = '';
    totalAlunosEl.textContent = alunos.length;

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-700">${aluno.nome}</td>
            <td class="px-6 py-4 text-slate-500">${aluno.cpf}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-black uppercase ${
                    aluno.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                    aluno.status === 'Inativo' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }">${aluno.status}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="prepararEdicao('${aluno.id}')" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                <button onclick="deletarAluno('${aluno.id}')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
}

// SALVAR (POST OU PATCH)
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('alunoId').value;
    const alunoData = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        status: document.getElementById('status').value
    };

    try {
        // Se tem ID, usa PATCH (seu backend aceita PATCH para tudo)
        // Se não tem ID, usa POST
        const url = id ? `${API_BASE_URL}/alunos/${id}` : `${API_BASE_URL}/alunos`;
        const metodo = id ? 'PATCH' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}`
            },
            body: JSON.stringify(alunoData)
        });

        if (resposta.ok) {
            limparFormulario();
            carregarAlunos();
            if(id) alert("Aluno atualizado!");
        } else {
            const erro = await resposta.json();
            alert("Erro: " + erro.error);
        }
    } catch (err) {
        console.error(err);
    }
});

// AUXILIARES
function prepararEdicao(id) {
    const aluno = alunos.find(a => String(a.id) === String(id));
    if (aluno) {
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('cpf').value = aluno.cpf;
        document.getElementById('status').value = aluno.status;
        formTitle.innerHTML = `<i class="fas fa-edit text-yellow-500"></i> Editando Aluno`;
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function deletarAluno(id) {
    if (!confirm("Deseja realmente excluir este aluno?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/alunos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (res.ok) carregarAlunos();
    } catch (err) { alert("Erro ao deletar"); }
}

function limparFormulario() {
    alunoForm.reset();
    document.getElementById('alunoId').value = '';
    formTitle.innerHTML = `<i class="fas fa-user-plus text-yellow-500"></i> Novo Aluno`;
    btnCancelar.classList.add('hidden');
}

function mostrarLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function mostrarPainelAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
}

iniciarApp();