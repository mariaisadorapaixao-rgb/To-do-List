const formTarefa = document.getElementById('formTarefa');
const inputTarefa = document.getElementById('inputTarefa');
const listaTarefas = document.getElementById('listaTarefas');
const selecionarTudo = document.getElementById('selecionarTudo');
const btnExcluirSelecionadas = document.getElementById('btnExcluirSelecionadas');

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
    atualizarSelecionarTudo();
  });

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'btn-remover';
  botaoRemover.textContent = 'Excluir';

  botaoRemover.addEventListener('click', function () {
    li.remove();
    verificarListaVazia();
    atualizarSelecionarTudo();
  });

  tarefa.appendChild(checkbox);
  tarefa.appendChild(span);
  li.appendChild(tarefa);
  li.appendChild(botaoRemover);

  listaTarefas.appendChild(li);
  verificarListaVazia();
}

  function atualizarSelecionarTudo() {
    if (!selecionarTudo) return;
    const checkboxes = listaTarefas.querySelectorAll('li input[type="checkbox"]');
    if (checkboxes.length === 0) {
      selecionarTudo.checked = false;
      return;
    }
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selecionarTudo.checked = allChecked;
  }

  if (btnExcluirSelecionadas) {
    btnExcluirSelecionadas.addEventListener('click', function () {
      const checkeds = listaTarefas.querySelectorAll('li input[type="checkbox"]:checked');
      if (checkeds.length === 0) {
        alert('Nenhuma tarefa selecionada.');
        return;
      }
      if (!confirm(`Excluir ${checkeds.length} tarefa(s) selecionada(s)?`)) return;
      Array.from(checkeds).forEach(cb => {
        const li = cb.closest('li');
        if (li) li.remove();
      });
      verificarListaVazia();
      atualizarSelecionarTudo();
    });
  }

  if (selecionarTudo) {
    selecionarTudo.addEventListener('change', function () {
      const checkboxes = listaTarefas.querySelectorAll('li input[type="checkbox"]');
      Array.from(checkboxes).forEach(cb => {
        cb.checked = selecionarTudo.checked;
        const li = cb.closest('li');
        const span = li ? li.querySelector('.tarefa-texto') : null;
        if (span) span.classList.toggle('concluida', cb.checked);
      });
      atualizarSelecionarTudo();
    });
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
