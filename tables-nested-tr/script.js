document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    let selectedCell = null;
    let selectedColumn = null;

    // Wrap existing cell content in .cell-content divs
    table.querySelectorAll('tbody td:not(.row-number):not(.faq-cell)').forEach(cell => {
        const div = document.createElement('div');
        div.className = 'cell-content';
        div.innerHTML = cell.innerHTML;
        cell.innerHTML = '';
        cell.appendChild(div);
    });

    function updateRowHeights() {
        table.querySelectorAll('tbody tr').forEach(row => {
            const faqCell = row.querySelector('.faq-cell');
            const cellContents = row.querySelectorAll('.cell-content');
            if (!faqCell || !cellContents.length) return;

            const faqTbody = faqCell.querySelector('.faq-inner tbody');
            const hasContent = faqTbody && faqTbody.children.length > 0;

            if (hasContent) {
                // faqCell.offsetHeight = actual rendered row height (all cells share it)
                // subtract 16px for the 8px top+bottom padding on the other cells
                const maxH = faqCell.offsetHeight - 16;
                cellContents.forEach(div => div.style.maxHeight = maxH + 'px');
            } else {
                cellContents.forEach(div => div.style.maxHeight = '');
            }
        });
    }

    requestAnimationFrame(() => requestAnimationFrame(updateRowHeights));

    table.addEventListener('input', (e) => {
        if (e.target.closest('.faq-inner')) {
            requestAnimationFrame(() => requestAnimationFrame(updateRowHeights));
        }
    });

    table.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-faq-btn');
        if (addBtn) {
            addFaqItem(addBtn);
            return;
        }

        const header = e.target.closest('th');
        if (header) {
            selectColumn(header);
            return;
        }

        const cell = e.target.closest('td');
        if (!cell || cell.classList.contains('row-number') || cell.classList.contains('faq-cell')) {
            deselectColumn();
            return;
        }

        selectCell(cell);
    });

    const headerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <rect width="11.9997" height="11.9997" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.03115 3.25254C8.09447 3.09967 8.24364 3 8.4091 3H10.5909C10.7564 3 10.9055 3.09967 10.9688 3.25254C11.0322 3.4054 10.9972 3.58136 10.8802 3.69836L9.78927 4.78926C9.62951 4.94902 9.37049 4.94902 9.21073 4.78926L8.11983 3.69836C8.00283 3.58136 7.96783 3.4054 8.03115 3.25254ZM9.39672 3.81818L9.5 3.92145L9.60328 3.81818H9.39672Z" fill="#535353"/>
  <path d="M9.5 3.92145L9.39672 3.81818H9.60328L9.5 3.92145Z" fill="#535353"/>
  <path d="M1 3.95453H6.5" stroke="#535353" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1 8.57953H6.5" stroke="#A3A3A3" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    const contentIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <rect width="11.9997" height="11.9997" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.03115 3.25254C8.09447 3.09967 8.24364 3 8.4091 3H10.5909C10.7564 3 10.9055 3.09967 10.9688 3.25254C11.0322 3.4054 10.9972 3.58136 10.8802 3.69836L9.78927 4.78926C9.62951 4.94902 9.37049 4.94902 9.21073 4.78926L8.11983 3.69836C8.00283 3.58136 7.96783 3.4054 8.03115 3.25254ZM9.39672 3.81818L9.5 3.92145L9.60328 3.81818H9.39672Z" fill="#A3A3A3"/>
  <path d="M9.5 3.92145L9.39672 3.81818H9.60328L9.5 3.92145Z" fill="#A3A3A3"/>
  <path d="M1 3.95453H6.5" stroke="#A3A3A3" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1 8.57953H6.5" stroke="#535353" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    function addFaqItem(btn) {
        const tbody = btn.previousElementSibling.querySelector('tbody');
        const count = tbody.querySelectorAll('.faq-row-header').length + 1;
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td class="faq-row-header">${headerIcon}<span contenteditable="true" data-placeholder="Header ${count}"></span></td>`;
        const contentRow = document.createElement('tr');
        contentRow.innerHTML = `<td class="faq-row-content">${contentIcon}<span contenteditable="true" data-placeholder="Content ${count}"></span></td>`;
        tbody.appendChild(headerRow);
        tbody.appendChild(contentRow);
        requestAnimationFrame(() => requestAnimationFrame(updateRowHeights));
    }

    function selectCell(cell) {
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            deselectHeaderAndRowNumber(selectedCell);
        }
        cell.classList.add('selected');
        selectedCell = cell;
        highlightHeaderAndRowNumber(cell);

        cell.addEventListener('dblclick', enableEditing);
    }

    function enableEditing(e) {
        const cell = e.currentTarget;
        const contentDiv = cell.querySelector('.cell-content');
        const content = contentDiv ? contentDiv.textContent : cell.textContent;

        cell.classList.add('editing');
        cell.innerHTML = `<input type="text" value="${content}">`;
        const input = cell.querySelector('input');
        input.focus();
        input.setSelectionRange(0, input.value.length);

        input.addEventListener('blur', () => {
            cell.classList.remove('editing');
            cell.innerHTML = `<div class="cell-content">${input.value}</div>`;
        });

        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === 'Escape') {
                input.blur();
                ev.preventDefault();
            }
        });
    }

    function exitEditMode(cell) {
        const input = cell.querySelector('input');
        cell.classList.remove('editing');
        cell.innerHTML = `<div class="cell-content">${input.value}</div>`;
    }

    function selectColumn(header) {
        if (selectedColumn) {
            deselectColumn();
        }
        const columnIndex = header.cellIndex;
        table.style.setProperty('--selected-column', columnIndex + 1);
        table.classList.add('column-selected');
        selectedColumn = header;
    }

    function deselectColumn() {
        if (selectedColumn) {
            table.classList.remove('column-selected');
            selectedColumn = null;
        }
    }

    function highlightHeaderAndRowNumber(cell) {
        const rowIndex = cell.parentElement.rowIndex;
        const cellIndex = cell.cellIndex;

        const header = table.querySelector(`thead th:nth-child(${cellIndex + 1})`);
        const rowNumber = table.querySelector(`tbody tr:nth-child(${rowIndex}) td.row-number`);

        if (header) header.classList.add('highlighted');
        if (rowNumber) rowNumber.classList.add('highlighted');
    }

    function deselectHeaderAndRowNumber(cell) {
        const rowIndex = cell.parentElement.rowIndex;
        const cellIndex = cell.cellIndex;

        const header = table.querySelector(`thead th:nth-child(${cellIndex + 1})`);
        const rowNumber = table.querySelector(`tbody tr:nth-child(${rowIndex}) td.row-number`);

        if (header) header.classList.remove('highlighted');
        if (rowNumber) rowNumber.classList.remove('highlighted');
    }

    document.addEventListener('keydown', (e) => {
        if (!selectedCell) return;

        if (selectedCell.classList.contains('editing')) return;

        switch (e.key) {
            case 'Escape':
                deselectCell();
                deselectColumn();
                break;
            case 'Enter':
                e.preventDefault();
                enableEditing({ currentTarget: selectedCell });
                break;
            case 'ArrowUp':
                moveTo(selectedCell, 0, -1);
                break;
            case 'ArrowDown':
                moveTo(selectedCell, 0, 1);
                break;
            case 'ArrowLeft':
                moveTo(selectedCell, -1, 0);
                break;
            case 'ArrowRight':
                moveTo(selectedCell, 1, 0);
                break;
        }
    });

    function deselectCell() {
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            deselectHeaderAndRowNumber(selectedCell);
            selectedCell = null;
        }
    }

    function moveTo(currentCell, deltaX, deltaY) {
        const currentRow = currentCell.parentElement;
        const tbody = currentRow.parentElement;
        const targetRowIndex = currentRow.rowIndex - 1 + deltaY;
        const targetRow = tbody.rows[targetRowIndex];

        if (targetRow) {
            const targetCellIndex = currentCell.cellIndex + deltaX;
            const targetCell = targetRow.cells[targetCellIndex];

            if (targetCell && !targetCell.classList.contains('row-number')) {
                selectCell(targetCell);
            }
        }
    }
});
