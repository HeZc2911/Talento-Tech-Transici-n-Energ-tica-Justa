

/* Esto es de la tabulacion del archivo csv
  // Selecciona el input de archivo
  document.getElementById('csvFile').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
      // Usa PapaParse para leer el archivo CSV
      Papa.parse(file, {
        complete: function(results) {
          console.log(results.data); // Imprime los datos para verificar el contenido
          displayData(results.data);
        }
      });
    }
  });

  // Función para mostrar los datos en la tabla
  function displayData(data) {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar tabla antes de llenarla

    data.forEach(row => {
      const newRow = tableBody.insertRow();
      const yearCell = newRow.insertCell(0);
      const renewableEnergyCell = newRow.insertCell(1);

      yearCell.textContent = row['Año']; // Ajusta según el nombre de tus columnas CSV
      renewableEnergyCell.textContent = row['Energía Renovable']; // Ajusta según el nombre de tus columnas CSV
    });
  }
  */