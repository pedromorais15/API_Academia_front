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

// 1. AUTENTICAÇÃO
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
            localStorage.setItem('gymToken', tokenAtual); 
            
            loginForm.reset(); 
            mostrarPainelAdmin();
            carregarAlunos(); 
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});

btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('gymToken');
    mostrarLogin(); 
});

// 2. READ (Listar Alunos)
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'GET',
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
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

function renderizarTabela() {
    tabelaAlunos.innerHTML = ''; 
    totalAlunosEl.textContent = alunos.length;

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${aluno.nome}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${aluno.cpf}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${aluno.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${aluno.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
                <button onclick="editarAluno('${aluno.id}')" class="text-red-600 hover:text-red-900 mr-3">Editar</button>
                <button onclick="deletarAluno('${aluno.id}')" class="text-gray-400 hover:text-red-600">Excluir</button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
}

// 3. CREATE / UPDATE
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('alunoId').value;
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const status = document.getElementById('status').value;

    const alunoData = { nome, cpf, status };

    try {
        let url = `${API_BASE_URL}/alunos`;
        let metodo = 'POST'; 

        if (id) {
            url = `${API_BASE_URL}/alunos/${id}`;
            metodo = 'PUT'; 
        }

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
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
});

function editarAluno(id) {
    const aluno = alunos.find(a => String(a.id) === String(id)); 
    if (aluno) {
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('cpf').value = aluno.cpf;
        document.getElementById('status').value = aluno.status;

        formTitle.textContent = "Editar Aluno";
        btnCancelar.classList.remove('hidden');
    }
}

function deletarAluno(id) {
    if (!confirm("Excluir cadastro do aluno?")) return;
    fetch(`${API_BASE_URL}/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenAtual}` }
    }).then(res => { if(res.ok) carregarAlunos(); });
}

btnCancelar.addEventListener('click', limparFormulario);

function limparFormulario() {
    alunoForm.reset();
    document.getElementById('alunoId').value = '';
    formTitle.textContent = "Cadastrar Aluno";
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