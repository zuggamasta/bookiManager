
document.addEventListener('DOMContentLoaded', () => {
  const addRowBtn = document.getElementById('addRowBtn') as HTMLButtonElement;
  const dataTable = document.getElementById('dataTable') as HTMLTableElement;

  addRowBtn.addEventListener('click', () => {
      const newRow = dataTable.insertRow();
      const nameCell = newRow.insertCell(0);
      const numberCell = newRow.insertCell(1);
      const fileCell = newRow.insertCell(2);
      const previewCell = newRow.insertCell(3);


      nameCell.innerHTML = '<input type="number" name="Sticker Number">';
      numberCell.innerHTML = '<input type="text" name="Name">';
      fileCell.innerHTML = '<input type="file" name="file">';
      previewCell.innerHTML = '<button name="preview">►</button>';

  });
});
