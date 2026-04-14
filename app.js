const API_BASE_URL = 'https://api-academia-five.vercel.app/'; 

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

const alunoForm = document.getElementById('alunoForm');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('formTitle');

let tokenAtual = localStorage.getItem('adminToken') || null;
let alunos = [];

function iniciarApp() {
    if (tokenAtual) {
        mostrarPainelAdmin();
        carregarAlunos();
    } else {
        mostrarLogin();
    }
}

// LOGIN (Baseado no modelo de Charadas)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuario, senha: password })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            tokenAtual = dados.token;
            localStorage.setItem('adminToken', tokenAtual);
            loginForm.reset();
            mostrarPainelAdmin();
            carregarAlunos();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (erro) {
        alert("Erro ao conectar com a API.");
    }
});

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    tokenAtual = null;
    mostrarLogin();
});

// LISTAR (READ)
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });

        if (resposta.status === 401) {
            btnLogout.click();
            return;
        }

        if (resposta.ok) {
            alunos = await resposta.json();
            renderizarTabela();
        }
    } catch (erro) { console.error(erro); }
}

function renderizarTabela() {
    tabelaAlunos.innerHTML = '';
    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="text-sm font-bold text-white uppercase">${aluno.nome}</div>
                <div class="text-[10px] text-gray-500 font-mono tracking-tighter">${aluno.cpf}</div>
            </td>
            <td class="px-6 py-4">
                <span class="text-[9px] font-black px-2 py-1 rounded-md border ${aluno.status === 'ATIVO' ? 'border-palmeirasGreen text-palmeirasGreen bg-palmeirasGreen/5' : 'border-red-500 text-red-500 bg-red-500/5'}">
                    ${aluno.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="editarAluno(${aluno.id})" class="text-gray-500 hover:text-palmeirasGreen mr-3 transition-colors">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletarAluno(${aluno.id})" class="text-gray-500 hover:text-red-500 transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
}

// SALVAR (POST / PATCH)
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('alunoId').value;
    const alunoData = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        status: document.getElementById('status').value
    };

    try {
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
        } else {
            const erro = await resposta.json();
            alert(erro.error);
        }
    } catch (e) { alert("Erro de rede."); }
});

function editarAluno(id) {
    const aluno = alunos.find(a => a.id == id);
    if (aluno) {
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('cpf').value = aluno.cpf;
        document.getElementById('status').value = aluno.status;
        formTitle.textContent = "Editar Cadastro";
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function deletarAluno(id) {
    if (!confirm("Excluir este atleta permanentemente?")) return;
    const resposta = await fetch(`${API_BASE_URL}/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenAtual}` }
    });
    if (resposta.ok) carregarAlunos();
}

function limparFormulario() {
    alunoForm.reset();
    document.getElementById('alunoId').value = '';
    formTitle.textContent = "Novo Cadastro";
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