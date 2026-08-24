const formTarefa = document.getElementById('formTarefa');
const inputTarefa = document.getElementById('inputTarefa');
const listaTarefas = document.getElementById('listaTarefas');

formTarefa.addEventListener('submit', function (event) {
  event.preventDefault();

  const texto = inputTarefa.value.trim();

  if (texto === '') {
    inputTarefa.focus();
    return;
  }

  criarTarefa(texto);
  inputTarefa.value = '';
  inputTarefa.focus();
});

function criarTarefa(texto) {
  const li = document.createElement('li');

  const tarefa = document.createElement('div');
  tarefa.className = 'tarefa';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const span = document.createElement('span');
  span.className = 'tarefa-texto';
  span.textContent = texto;

  checkbox.addEventListener('change', function () {
    span.classList.toggle('concluida', checkbox.checked);
  });

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'btn-remover';
  botaoRemover.textContent = 'Excluir';

  botaoRemover.addEventListener('click', function () {
    li.remove();
    verificarListaVazia();
  });

  tarefa.appendChild(checkbox);
  tarefa.appendChild(span);
  li.appendChild(tarefa);
  li.appendChild(botaoRemover);

  listaTarefas.appendChild(li);
  verificarListaVazia();
}

function verificarListaVazia() {
  const itens = listaTarefas.querySelectorAll('li');

  if (itens.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'Nenhuma tarefa adicionada ainda.';
    vazio.id = 'mensagemVazia';
    listaTarefas.appendChild(vazio);
  } else {
    const mensagem = document.getElementById('mensagemVazia');
    if (mensagem) mensagem.remove();
  }
}

verificarListaVazia();
