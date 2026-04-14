// Referências do DOM
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const userInfo = document.getElementById('userInfo');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const loginError = document.getElementById('loginError');

const alunoForm = document.getElementById('alunoForm');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const totalAlunosEl = document.getElementById('totalAlunos');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('formTitle');

// Estado da aplicação
let isEditing = false;
// Dados fictícios para simulação
let alunosData = [
    { id: 4, nome: "pedro", cpf: "123.456.789-10", status: "Ativo" },
    { id: 3, nome: "Gustavo Martins", cpf: "777.777.777-77", status: "Ativo" },
    { id: 2, nome: "Carlos Mendes", cpf: "111.111.111-11", status: "Ativo" },
    { id: 1, nome: "Maria Oliveira", cpf: "987.654.321-00", status: "Ativo" }
];

// --- 1. Controle de Telas ---

function showLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function showAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    carregarAlunos(); // Carrega os dados ao entrar
}

// --- 2. Simulação de Login ---

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('password').value;

    // Login simples para demonstração (admin / 123)
    if (usuario === 'admin' && senha === '123') {
        loginForm.reset();
        loginError.classList.add('hidden');
        showAdmin();
    } else {
        loginError.classList.remove('hidden');
    }
});

btnLogout.addEventListener('click', showLogin);

// --- 3. CRUD Alunos ---

function carregarAlunos() {
    tabelaAlunos.innerHTML = '';
    totalAlunosEl.textContent = alunosData.length;

    // Inverte a ordem para exibir os IDs mais altos primeiro (simulando banco de dados)
    const sortedAlunos = [...alunosData].sort((a, b) => b.id - a.id);

    sortedAlunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${aluno.nome}</strong>
                <span class="atleta-id">Atleta PRO ID: #${aluno.id}</span>
            </td>
            <td>${aluno.cpf}</td>
            <td>${aluno.status}</td>
            <td class="action-buttons">
                <button onclick="editAluno(${aluno.id})" class="btn-edit">✎</button>
                <button onclick="deleteAluno(${aluno.id})" class="btn-delete">🗑</button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
}

alunoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('alunoId').value;
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const status = document.getElementById('status').value;

    if (isEditing) {
        // Modo Edição
        const index = alunosData.findIndex(a => a.id == id);
        if (index !== -1) {
            alunosData[index] = { ...alunosData[index], nome, cpf, status };
        }
        cancelEditing(); // Volta ao modo cadastro
    } else {
        // Modo Cadastro
        const novoId = alunosData.length > 0 ? Math.max(...alunosData.map(a => a.id)) + 1 : 1;
        alunosData.push({ id: novoId, nome, cpf, status });
        alunoForm.reset();
    }
    carregarAlunos();
});

function editAluno(id) {
    const aluno = alunosData.find(a => a.id == id);
    if (!aluno) return;

    isEditing = true;
    formTitle.textContent = "✎ EDITAR ATLETA";
    btnCancelar.classList.remove('hidden');

    document.getElementById('alunoId').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf').value = aluno.cpf;
    document.getElementById('status').value = aluno.status;
}

function cancelEditing() {
    isEditing = false;
    formTitle.textContent = "+ NOVO CADASTRO";
    btnCancelar.classList.add('hidden');
    alunoForm.reset();
}

btnCancelar.addEventListener('click', cancelEditing);

function deleteAluno(id) {
    if (!confirm(`Confirmar exclusão definitiva do cadastro PRO #${id}?`)) return;
    alunosData = alunosData.filter(a => a.id != id);
    carregarAlunos();
}

// Inicialização
showLogin(); // Começa na tela de login