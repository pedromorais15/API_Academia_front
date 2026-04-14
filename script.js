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
const cpfInput = document.getElementById('cpf');

let tokenAtual = null; // Começa sempre como null para mostrar login primeiro
let alunos = [];

// ==================== FUNÇÃO PARA LIMITAR E FORMATAR CPF ====================
function formatarCPF(valor) {
    // Remove tudo que não é número
    let cpf = valor.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (cpf.length > 11) {
        cpf = cpf.slice(0, 11);
    }
    
    // Aplica máscara
    if (cpf.length <= 3) {
        return cpf;
    } else if (cpf.length <= 6) {
        return cpf.replace(/(\d{3})(\d)/, '$1.$2');
    } else if (cpf.length <= 9) {
        return cpf.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
    } else {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
    }
}

function limitarCPF(event) {
    let valor = event.target.value;
    valor = formatarCPF(valor);
    event.target.value = valor;
}

// Adiciona evento de limitação de CPF
if (cpfInput) {
    cpfInput.addEventListener('input', limitarCPF);
}

function iniciarApp() {
    // SEMPRE mostra a tela de login primeiro
    mostrarLogin();
    
    // Limpa qualquer token antigo
    localStorage.removeItem('gymToken');
    tokenAtual = null;
}

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('password').value;

    // Desabilita o botão durante o login
    const btnSubmit = loginForm.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = '⏳ VERIFICANDO...';
    btnSubmit.disabled = true;

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
            // Limpa explicitamente os campos de senha
            document.getElementById('password').value = '';
            document.getElementById('usuario').value = '';
            mostrarPainelAdmin();
            carregarAlunos();
        } else {
            loginError.classList.remove('hidden');
            setTimeout(() => loginError.classList.add('hidden'), 4000);
            // Limpa apenas o campo senha em caso de erro
            document.getElementById('password').value = '';
        }
    } catch (erro) {
        loginError.textContent = "Erro de conexão com a API!";
        loginError.classList.remove('hidden');
        setTimeout(() => loginError.classList.add('hidden'), 4000);
        document.getElementById('password').value = '';
    } finally {
        // Reabilita o botão
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
});

btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('gymToken');
    mostrarLogin();
    // Limpa os campos de login
    document.getElementById('usuario').value = '';
    document.getElementById('password').value = '';
    // Limpa o formulário de aluno também
    limparFormulario();
});

// GET ALUNOS
async function carregarAlunos() {
    if (!tokenAtual) return;
    
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

    alunos.sort((a, b) => b.id - a.id);

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        
        let statusClass = "";
        if(aluno.status === 'Ativo') statusClass = "status-ativo";
        if(aluno.status === 'Inativo') statusClass = "status-inativo";

        tr.innerHTML = `
            <td style="padding: 1rem 1.5rem;">
                <div style="font-weight: 900; color: var(--cinza-claro); font-size: 1rem;">${aluno.nome}</div>
                <div style="font-size: 0.7rem; color: var(--cinza-medio); letter-spacing: 1px; margin-top: 4px;">Atleta PRO ID: #${aluno.id}</div>
            </td>
            <td style="padding: 1rem 1.5rem; color: var(--cinza-medio); font-family: monospace;">${aluno.cpf}</td>
            <td style="padding: 1rem 1.5rem;">
                <span class="status-badge ${statusClass}">${aluno.status}</span>
            </td>
            <td style="padding: 1rem 1.5rem; text-align: right;">
                <button onclick="prepararEdicao('${aluno.id}')" class="btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletarAluno('${aluno.id}')" class="btn-delete">
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
    
    if (!tokenAtual) {
        alert("Sessão expirada! Faça login novamente.");
        mostrarLogin();
        return;
    }
    
    // Valida CPF antes de enviar
    const cpfSemMascara = document.getElementById('cpf').value.replace(/\D/g, '');
    if (cpfSemMascara.length !== 11) {
        alert("CPF deve conter 11 dígitos!");
        return;
    }
    
    const id = document.getElementById('alunoId').value;
    const alunoData = {
        nome: document.getElementById('nome').value,
        cpf: cpfSemMascara,
        status: document.getElementById('status').value
    };

    // Desabilita botão durante salvamento
    const btnSave = alunoForm.querySelector('.btn-save');
    const textoOriginal = btnSave.textContent;
    btnSave.textContent = '⏳ SALVANDO...';
    btnSave.disabled = true;

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
            alert(id ? "Cadastro atualizado com sucesso!" : "Cadastro realizado com sucesso!");
        } else {
            const erro = await resposta.json();
            alert("Falha ao salvar: " + erro.error);
            if (resposta.status === 401) {
                // Token expirado
                mostrarLogin();
            }
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão ao tentar salvar");
    } finally {
        btnSave.textContent = textoOriginal;
        btnSave.disabled = false;
    }
});

function prepararEdicao(id) {
    const aluno = alunos.find(a => String(a.id) === String(id));
    if (aluno) {
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        // Aplica máscara ao CPF ao editar
        document.getElementById('cpf').value = formatarCPF(aluno.cpf);
        document.getElementById('status').value = aluno.status;
        formTitle.innerHTML = '✏️ ATUALIZAR CADASTRO';
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function deletarAluno(id) {
    if (!tokenAtual) {
        alert("Sessão expirada! Faça login novamente.");
        mostrarLogin();
        return;
    }
    
    if (!confirm("Confirmar exclusão definitiva do cadastro deste aluno?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/alunos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (res.ok) {
            carregarAlunos();
            alert("Aluno removido com sucesso!");
        } else if (res.status === 401) {
            mostrarLogin();
        } else {
            alert("Erro ao remover aluno");
        }
    } catch (err) { 
        alert("Erro de conexão ao tentar deletar"); 
    }
}

function limparFormulario() {
    alunoForm.reset();
    document.getElementById('alunoId').value = '';
    document.getElementById('cpf').value = '';
    formTitle.innerHTML = '+ NOVO CADASTRO';
    btnCancelar.classList.add('hidden');
}

function mostrarLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    userInfo.classList.add('hidden');
    // Garante que os campos estejam limpos
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('password');
    if (usuarioInput) usuarioInput.value = '';
    if (senhaInput) senhaInput.value = '';
}

function mostrarPainelAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
}

// Inicializar aplicação - SEMPRE mostra login primeiro
iniciarApp();
