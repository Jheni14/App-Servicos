// --- Seleção de Elementos ---
const formModal = document.getElementById('form-modal');
const formModalContent = document.getElementById('modal-content-container');
const remarcarModal = document.getElementById('remarcar-modal');
const remarcarModalContent = document.getElementById('remarcar-modal-content-container');
const infoModal = document.getElementById('info-modal');
const infoModalContent = document.getElementById('info-modal-content-container');
const dadosModal = document.getElementById('dados-modal');
const dadosModalContent = document.getElementById('dados-modal-content-container');
const confirmModal = document.getElementById('confirm-modal');
const mapaModal = document.getElementById('mapa-modal');
const mapaModalContent = document.getElementById('mapa-modal-content-container');
const listaServicos = document.getElementById('lista-servicos');
const confirmYesBtn = document.getElementById('confirm-yes');
const filtroSelect = document.getElementById('servicos3');
const calendarInput = document.getElementById('calendar2');
const localSelect = document.getElementById('local'); 

// --- Variáveis de Controle ---
let itens = JSON.parse(localStorage.getItem('servicos_data')) || [];
let itemToDelete = null;
let apagarTudoPendente = false; // Controla se o "Sim" apaga um item ou tudo
let dataFiltro = new Date().toISOString().slice(0, 10); 

// Lista de Cidades
const cidades = [
    'Apucarana', 'Arapongas', 'Arapuã', 'Ariranha do Ivaí', 'Astorga', 'Bom Sucesso', 
    'Califórnia', 'Cambira', 'Cândido de Abreu', 'Cruzmaltina', 'Faxinal', 'Florida', 
    'Godoy Moreira', 'Grandes Rios', 'Iguaraçu', 'Ivaiporã', 'Jandaia do Sul', 
    'Jardim Alegre', 'Kaloré', 'Lidianópolis', 'Lobato', 'Lunardelli', 'Manoel Ribas', 
    'Marilândia do Sul', 'Marumbi', 'Mauá da Serra', 'Munhoz de Mello', 'Novo Itacolomi', 
    'Rio Bom', 'Rio Branco do Ivaí', 'Rosário do Ivaí', 'Sabáudia', 'Santa Fé', 
    'São João do Ivaí', 'São Pedro do Ivaí'
].sort();

// --- Funções de Persistência ---
function atualizarStorage() {
    localStorage.setItem('servicos_data', JSON.stringify(itens));
}

// --- Funções Auxiliares de Data ---
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
}

// --- Funções de Inicialização ---
function preencherCidades(selectElement) {
    if(!selectElement) return;
    selectElement.innerHTML = '<option value="" disabled selected>Selecione a cidade</option>';
    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        selectElement.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    preencherCidades(localSelect);

    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7); 
    calendarInput.value = mesAtual;
    dataFiltro = mesAtual;

    // Configura botões de Exportar/Importar
    const btnEx = document.getElementById('botaoArquivoEx');
    if(btnEx) btnEx.parentElement.addEventListener('click', exportarDados);
    
    const btnIm = document.getElementById('botaoArquivoIm');
    if(btnIm) btnIm.addEventListener('change', importarDados);

    renderizarLista();
});

// --- Lógica dos Modais ---
function toggleModal(modalType, show) {
    const modais = {
        'form': { el: formModal, content: formModalContent },
        'remarcar': { el: remarcarModal, content: remarcarModalContent },
        'info': { el: infoModal, content: infoModalContent },
        'confirm': { el: confirmModal, content: document.getElementById('confirm-content-container') },
        'mapa': { el: mapaModal, content: mapaModalContent },
        'dados': { el: dadosModal, content: dadosModalContent }
    };

    const target = modais[modalType];
    if (!target) return;

    if (show) {
        if (modalType === 'dados') atualizarAreaDados();

        if (modalType === 'mapa' || modalType === 'dados') {
            target.el.style.display = 'flex';
        } else {
            target.el.classList.add('visible-flex');
            setTimeout(() => target.content.classList.add('visible'), 10);
        }
    } else {
        if (modalType === 'mapa' || modalType === 'dados') {
            target.el.style.display = 'none';
        } else {
            target.content.classList.remove('visible');
            setTimeout(() => target.el.classList.remove('visible-flex'), 300);
        }
    }   
}

window.onclick = (event) => {
    if (event.target.classList.contains('visible-flex') || event.target === mapaModal || event.target === dadosModal) {
        const id = event.target.id.replace('-modal', '');
        toggleModal(id, false);
    }
};

// --- Lógica de Negócio ---

// --- Lógica de Negócio ---

function salvarItem() {
    const nome = document.getElementById('nome').value.trim();
    const local = document.getElementById('local').value;
    const dia = document.getElementById('dia').value; 
    const horario = document.getElementById('horario').value;
    const prioridade = document.getElementById('prioridade').value.trim();

    if (!nome || !dia || !local || !horario || !prioridade) {
        alert("O preenchimento de todos os campos é obrigatório!");
        return;
    }

    const novoItem = {
        id: Date.now(),
        nome,
        local,
        dia, 
        horario,
        prioridade: prioridade || 4,
        feito: false,
    };

    itens.push(novoItem);
    atualizarStorage();
    
    const mesDoItem = dia.slice(0, 7);
    calendarInput.value = mesDoItem;
    dataFiltro = mesDoItem;

    toggleModal('form', false);
    renderizarLista();

    // Limpa os campos, incluindo o textarea e resetando a altura dele
    ['nome', 'local', 'dia', 'horario', 'prioridade'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
        }
    });
    
    toggleModal('form', false);
    renderizarLista();
}

function excluirItem(itemId) {
    itens = itens.filter(i => i.id !== itemId);
    atualizarStorage();
    renderizarLista();
}

// Botão "SIM" do Modal de Confirmação
confirmYesBtn.onclick = () => {
    if (apagarTudoPendente) {
        itens = [];
        atualizarStorage();
        renderizarLista();
        atualizarAreaDados();
        apagarTudoPendente = false;
        toggleModal('dados', false);
    } else if (itemToDelete) {
        excluirItem(itemToDelete);
        itemToDelete = null;
    }
    toggleModal('confirm', false);
    
    setTimeout(() => {
        document.getElementById('confirm-message').textContent = "Você tem certeza que deseja excluir este item?";
    }, 300);
};

function confirmarExclusao(itemId) {
    apagarTudoPendente = false;
    itemToDelete = itemId;
    document.getElementById('confirm-message').textContent = "Você tem certeza que deseja excluir este item?";
    toggleModal('confirm', true);
}

function ApagarDados() {
    apagarTudoPendente = true;
    itemToDelete = null;
    document.getElementById('confirm-message').textContent = "Você tem certeza que deseja apagar TODOS os dados permanentemente?";
    toggleModal('confirm', true);
}

function toggleFeito(itemId) {
    const item = itens.find(i => i.id === itemId);
    if (item) {
        item.feito = !item.feito;
        atualizarStorage();
        renderizarLista();
    }
}

// --- Info ---
function exibirInfoItem(itemId) {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('info-item-id').value = item.id;
    document.getElementById('info-nome').value = item.nome;
    document.getElementById('info-local').value = item.local;
    document.getElementById('info-dia').value = formatDate(item.dia); 
    document.getElementById('info-horario').value = item.horario;
    document.getElementById('info-prioridade').value = item.prioridade;
    
    toggleModal('info', true);
    
    // Timeout para garantir que o modal está visível antes de calcular a altura
    setTimeout(() => autoAjustar(infoObs), 50);
}

// --- Remarcação ---
function remarcarItem(itemId) {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('remarcar-item-id').value = item.id;
    document.getElementById('remarcar-nome').value = item.nome;
    document.getElementById('remarcar-local').value = item.local;
    document.getElementById('remarcar-dia').value = item.dia; 
    document.getElementById('remarcar-horario').value = item.horario;
    document.getElementById('remarcar-prioridade').value = item.prioridade;

    toggleModal('remarcar', true);
    
    setTimeout(() => autoAjustar(remarcarObs), 50);
}

function confirmarRemarcacao() {
    const itemId = parseInt(document.getElementById('remarcar-item-id').value);
    const novaData = document.getElementById('remarcar-dia').value;
    const novoHorario = document.getElementById('remarcar-horario').value;

    const item = itens.find(i => i.id === itemId);
    if (item && novaData) {
        item.dia = novaData;
        item.horario = novoHorario;
        item.observacoes = novasObs; // Atualiza as observações também
        atualizarStorage();
        toggleModal('remarcar', false);
        renderizarLista();
    }
}

// --- Função de Crescimento Automático ---
function autoAjustar(elemento) {
    if (!elemento) return;
    elemento.style.height = 'auto'; 
    elemento.style.height = (elemento.scrollHeight) + 'px';
}
// --- Banco de Dados ---
function atualizarAreaDados() {
    const areaTexto = document.getElementById('dados-textarea');
    if (!areaTexto) return;
    areaTexto.textContent = itens.length === 0 ? "O banco de dados está vazio." : JSON.stringify(itens, null, 2);
}

// --- Filtros e Renderização ---
function getStatus(item) {
    if (item.feito) return 'Feito';
    const agora = new Date();
    const hojeReal = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const dataItem = new Date(item.dia + 'T00:00:00');
    return dataItem < hojeReal ? 'Remarcar' : 'Pendente';
}

function renderizarLista() {
    listaServicos.innerHTML = '';

    const filtroStatus = filtroSelect.value;
    const filtroMesAno = calendarInput.value;
    const termoBusca = document.getElementById('input-busca').value.toLowerCase().trim();

    let filtrados = itens.filter(item => {

        const status = getStatus(item);
        const tarefaMesAno = item.dia.slice(0, 7);

        // 🔎 Busca
        const coincideBusca =
            item.nome.toLowerCase().includes(termoBusca) ||
            item.local.toLowerCase().includes(termoBusca) ||
            item.id.toString().includes(termoBusca) ||
            item.horario.includes(termoBusca) ||
            item.prioridade.toString() === termoBusca;

        if (termoBusca && !coincideBusca) return false;

        // 📅 Filtro por mês
        if (tarefaMesAno !== filtroMesAno) return false;

        // 📌 Filtro por status
        if (filtroStatus === 'Todos os Serviços') return true;
        if (filtroStatus === 'Pendentes') return status === 'Pendente';
        if (filtroStatus === 'Feitos') return item.feito === true;
        if (filtroStatus === 'Remarcar') return status === 'Remarcar';

        return true;
    });

    filtrados.sort((a, b) => {
        const peso = (item) => {
            const s = getStatus(item);
            if (item.feito) return 3;
            if (s === 'Remarcar') return 2;
            return 1;
        };

        if (peso(a) !== peso(b)) return peso(a) - peso(b);
        if (a.dia !== b.dia) return a.dia.localeCompare(b.dia);
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return (a.horario || '').localeCompare(b.horario || '');
    });

    if (filtrados.length === 0) {
        listaServicos.innerHTML =
            `<p style="text-align:center;color:#888;margin-top:20px;">
                Nenhum serviço encontrado.
            </p>`;
        return;
    }

    filtrados.forEach(item => {
        const status = getStatus(item);

        const div = document.createElement('div');
        div.className = 'servico-item';
        div.innerHTML = `
            <input type="checkbox" ${item.feito ? 'checked' : ''} onchange="toggleFeito(${item.id})">

            <div class="servico-info ${item.feito ? 'feito' : ''}">
                <strong>${item.nome}</strong>
                <small>${item.local} | ${formatDate(item.dia)} | ${item.horario || '--:--'}</small>
                <small>Prioridade: ${item.prioridade}</small>
            </div>

            <div class="servico-actions">
                ${status === 'Remarcar' && !item.feito
                    ? `<button class="remarcar-btn" onclick="remarcarItem(${item.id})">Remarcar</button>`
                    : ''}

                <button class="info-btn" onclick="exibirInfoItem(${item.id})">Info</button>
                <button class="delete-btn" onclick="confirmarExclusao(${item.id})">&times;</button>
            </div>
        `;

        listaServicos.appendChild(div);
    });
}

// --- Importar / Exportar ---
function exportarDados() {
    if (itens.length === 0) return alert("Não há dados para exportar.");
    const blob = new Blob([JSON.stringify(itens, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servicos_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importarDados(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            itens = JSON.parse(e.target.result);
            atualizarStorage();
            renderizarLista();
            alert("Dados importados com sucesso!");
        } catch (err) {
            alert("Erro ao ler o arquivo.");
        }
    };
    reader.readAsText(file);
}

// Eventos de Filtro
filtroSelect.onchange = renderizarLista;
calendarInput.onchange = (e) => { 
    dataFiltro = e.target.value; 
    renderizarLista(); 
};
