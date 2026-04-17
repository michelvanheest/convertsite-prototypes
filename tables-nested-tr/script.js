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

    function addFaqItem(btn) {
        const tbody = btn.previousElementSibling.querySelector('tbody');
        const count = tbody.querySelectorAll('.faq-row-header').length + 1;
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td class="faq-row-header" contenteditable="true" data-placeholder="Header ${count}"></td>`;
        const contentRow = document.createElement('tr');
        contentRow.innerHTML = `<td class="faq-row-content" contenteditable="true" data-placeholder="Content ${count}"></td>`;
        tbody.appendChild(headerRow);
        tbody.appendChild(contentRow);
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
