# BLACK IRON Gym - Painel Administrativo

Painel administrativo front-end para gerenciamento de alunos de uma academia, integrado a uma API externa.

## 🔧 Tecnologias

- HTML
- CSS
- JavaScript
- API REST externa (`https://api-academia-five.vercel.app`)

## 🚀 Funcionalidades

- Tela de login com validação de usuário e senha
- Listagem de atletas cadastrados
- Criação de novo atleta
- Edição de cadastro de atleta existente
- Exclusão de atleta
- Formatação automática de CPF
- Indicador de total de registros
- Logout

## 🧩 Estrutura do projeto

- `index.html` - interface principal
- `style.css` - estilos e layout do painel
- `script.js` - lógica de autenticação, CRUD e requisições à API
- `img/` - recursos visuais usados no projeto

## ⚙️ Como usar

1. Abra o projeto em um editor de código ou servidor local.
2. Execute o `index.html` em um navegador.
3. Insira o usuário e senha para acessar o painel.
4. Use o formulário lateral para cadastrar ou atualizar atletas.
5. Atualize a lista com o botão de recarregar ou após qualquer ação de CRUD.

## 🗂️ Detalhes da API

A aplicação consome os seguintes endpoints da API:

- `POST /login` - autenticação
- `GET /alunos` - listagem de alunos
- `POST /alunos` - criação de aluno
- `PATCH /alunos/:id` - atualização de aluno
- `DELETE /alunos/:id` - exclusão de aluno

## 💡 Observações

- O painel depende de uma conexão com a API externa.
- O CPF é formatado automaticamente enquanto o usuário digita.
- O token de autenticação é armazenado no `localStorage` durante a sessão.

## 📁 Atualização

Se desejar adaptar o projeto para outra API ou rota, atualize a constante `API_BASE_URL` em `script.js`.
