const API_URL = 'https://todos-api-jade.vercel.app/todos';

const formTarefa = document.getElementById('formTarefa');
const inputTarefa = document.getElementById('inputTarefa');
const listaTarefas = document.getElementById('listaTarefas');
const selecionarTudo = document.getElementById('selecionarTudo');
const btnExcluirSelecionadas = document.getElementById('btnExcluirSelecionadas');

let tarefas = [];

function normalizarTarefa(item) {
  const id = item?.id ?? item?._id ?? item?.uuid ?? item?.key;
  const texto = item?.name ?? item?.text ?? item?.title ?? item?.task ?? 'Tarefa sem nome';
  const concluida = Boolean(item?.completed ?? item?.done ?? item?.concluido ?? item?.finished ?? false);

  return {
    id,
    texto: String(texto),
    concluida,
  };
}

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.todos)) return data.todos;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function obterMensagemVazia() {
  return document.getElementById('mensagemVazia');
}

function atualizarSelecionarTudo() {
  if (!selecionarTudo) return;

  const checkboxes = listaTarefas.querySelectorAll('li input[type="checkbox"]');
  if (checkboxes.length === 0) {
    selecionarTudo.checked = false;
    return;
  }

  selecionarTudo.checked = Array.from(checkboxes).every((cb) => cb.checked);
}

function renderizarLista() {
  listaTarefas.innerHTML = '';

  if (tarefas.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.id = 'mensagemVazia';
    vazio.textContent = 'Nenhuma tarefa adicionada ainda.';
    listaTarefas.appendChild(vazio);
    if (selecionarTudo) selecionarTudo.checked = false;
    return;
  }

  tarefas.forEach((tarefa) => {
    const li = document.createElement('li');
    li.dataset.id = String(tarefa.id);

    const tarefaWrap = document.createElement('div');
    tarefaWrap.className = 'tarefa';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarefa.concluida;

    const span = document.createElement('span');
    span.className = 'tarefa-texto';
    span.textContent = tarefa.texto;
    if (tarefa.concluida) {
      span.classList.add('concluida');
    }

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'btn-remover';
    botaoRemover.textContent = 'Excluir';

    checkbox.addEventListener('change', async function () {
      try {
        await atualizarTarefaStatus(tarefa.id, checkbox.checked);
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        alert(error.message || 'Não foi possível atualizar a tarefa.');
      }
      renderizarLista();
      atualizarSelecionarTudo();
    });

    botaoRemover.addEventListener('click', async function () {
      try {
        await excluirTarefa(tarefa.id);
      } catch (error) {
        alert(error.message || 'Não foi possível excluir a tarefa.');
        return;
      }
      tarefas = tarefas.filter((item) => String(item.id) !== String(tarefa.id));
      renderizarLista();
      atualizarSelecionarTudo();
    });

    tarefaWrap.appendChild(checkbox);
    tarefaWrap.appendChild(span);
    li.appendChild(tarefaWrap);
    li.appendChild(botaoRemover);
    listaTarefas.appendChild(li);
  });

  atualizarSelecionarTudo();
}

function mostrarMensagemErro(mensagem) {
  const mensagemExistente = obterMensagemVazia();
  if (mensagemExistente) {
    mensagemExistente.classList.add('error');
    mensagemExistente.textContent = mensagem;
    return;
  }

  const itemErro = document.createElement('li');
  itemErro.className = 'vazio error';
  itemErro.id = 'mensagemVazia';
  itemErro.textContent = mensagem;
  listaTarefas.appendChild(itemErro);
}

async function carregarTarefas() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) {
      throw new Error(`Erro ao buscar tarefas (${resposta.status}).`);
    }

    const dados = await resposta.json();
    const itens = extrairLista(dados);
    tarefas = itens.map(normalizarTarefa).filter((tarefa) => tarefa.id !== undefined && tarefa.id !== null);
    renderizarLista();
  } catch (error) {
    tarefas = [];
    mostrarMensagemErro(error.message || 'Não foi possível carregar as tarefas.');
  }
}

async function criarTarefaNoServidor(texto) {
  const payload = {
    name: texto,
    order: tarefas.length + 1,
  };

  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resposta.ok) {
    throw new Error(`Não foi possível criar a tarefa (${resposta.status}).`);
  }

  const dados = await resposta.json();
  const item = Array.isArray(dados) ? dados[0] : dados?.data ?? dados?.item ?? dados;
  const tarefaNova = normalizarTarefa(item ?? { name: texto, completed: false });

  tarefas = [...tarefas, tarefaNova];
  renderizarLista();
}

async function atualizarTarefaStatus(id, concluida) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Não foi possível identificar a tarefa.');
  }

  tarefas = tarefas.map((item) => {
    if (String(item.id) === String(id)) {
      return { ...item, concluida };
    }
    return item;
  });

  return;
}

async function excluirTarefa(id) {
  const resposta = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!resposta.ok) {
    throw new Error(`Não foi possível excluir a tarefa (${resposta.status}).`);
  }
}

async function excluirSelecionadas() {
  const selecionadas = Array.from(listaTarefas.querySelectorAll('li input[type="checkbox"]:checked'));

  if (selecionadas.length === 0) {
    alert('Nenhuma tarefa selecionada.');
    return;
  }

  if (!confirm(`Excluir ${selecionadas.length} tarefa(s) selecionada(s)?`)) {
    return;
  }

  try {
    await Promise.all(
      selecionadas.map(async (checkbox) => {
        const li = checkbox.closest('li');
        const id = li?.dataset?.id;
        if (id) {
          await excluirTarefa(id);
        }
      })
    );

    tarefas = tarefas.filter((tarefa) => !selecionadas.some((checkbox) => {
      const li = checkbox.closest('li');
      return String(li?.dataset?.id) === String(tarefa.id);
    }));

    renderizarLista();
    atualizarSelecionarTudo();
  } catch (error) {
    alert(error.message || 'Não foi possível excluir as tarefas selecionadas.');
  }
}

if (formTarefa) {
  formTarefa.addEventListener('submit', async function (event) {
    event.preventDefault();

    const texto = inputTarefa.value.trim();
    if (texto === '') {
      inputTarefa.focus();
      return;
    }

    try {
      await criarTarefaNoServidor(texto);
      inputTarefa.value = '';
      inputTarefa.focus();
    } catch (error) {
      alert(error.message || 'Não foi possível adicionar a tarefa.');
    }
  });
}

if (btnExcluirSelecionadas) {
  btnExcluirSelecionadas.addEventListener('click', excluirSelecionadas);
}

if (selecionarTudo) {
  selecionarTudo.addEventListener('change', async function () {
    const checkboxes = Array.from(listaTarefas.querySelectorAll('li input[type="checkbox"]'));
    if (checkboxes.length === 0) return;

    try {
      tarefas = tarefas.map((tarefa) => ({ ...tarefa, concluida: selecionarTudo.checked }));
      renderizarLista();
    } catch (error) {
      alert(error.message || 'Não foi possível atualizar o status das tarefas.');
    }
  });
}

carregarTarefas();
