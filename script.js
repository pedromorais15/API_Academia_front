const API_BASE_URL = 'https://api-academia-five.vercel.app'; 

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
            loginError.classList.remove('hidden');
            setTimeout(() => loginError.classList.add('hidden'), 3000);
        }
    } catch (erro) {
        alert("Erro de conexão com o servidor.");
    }
});

btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('gymToken');
    mostrarLogin();
});

// GET ALUNOS
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`);
        if (resposta.ok) {
            alunos = await resposta.json();
            renderizarTabela();
        }
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarTabela() {
    tabelaAlunos.innerHTML = '';
    totalAlunosEl.textContent = alunos.length;

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-blue-500";
        
        // Estilo dinâmico para os status
        let statusClass = "bg-slate-700 text-slate-300";
        if(aluno.status === 'Ativo') statusClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        if(aluno.status === 'Inativo') statusClass = "bg-red-500/10 text-red-400 border border-red-500/20";

        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-white">${aluno.nome}</div>
                <div class="text-[10px] text-slate-500 uppercase tracking-tighter">Matrícula: #${aluno.id}</div>
            </td>
            <td class="px-6 py-4 text-slate-400 font-mono">${aluno.cpf}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusClass}">
                    ${aluno.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="prepararEdicao('${aluno.id}')" class="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletarAluno('${aluno.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors ml-2">
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
            alert("Erro: " + erro.error);
        }
    } catch (err) {
        console.error(err);
    }
});

function prepararEdicao(id) {
    const aluno = alunos.find(a => String(a.id) === String(id));
    if (aluno) {
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('cpf').value = aluno.cpf;
        document.getElementById('status').value = aluno.status;
        formTitle.innerHTML = `<span class="w-2 h-8 bg-yellow-500 rounded-full"></span> EDITAR ALUNO`;
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function deletarAluno(id) {
    if (!confirm("Confirmar exclusão definitiva?")) return;
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
    formTitle.innerHTML = `<span class="w-2 h-8 bg-blue-500 rounded-full"></span> NOVO CADASTRO`;
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