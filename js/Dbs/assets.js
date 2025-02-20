let datosGeneracion = {}; // Almacena la electricidad generada desde solar
let datosCapacidad = {}; // Almacena la capacidad instalada solar
let datosPorcentaje = {}; // Almacena el porcentaje de energía solar

// Función para cargar un CSV y guardarlo en un objeto
function cargarDatosDesdeCSV(archivo, objetoDestino, columnaClave) {
    return fetch(archivo)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true, // La primera fila es de encabezados
                dynamicTyping: true, // Convierte números automáticamente
                complete: function (results) {
                    results.data.forEach(row => {
                        const year = row.Year;
                        const valor = row[columnaClave];

                        if (year && valor) {
                            objetoDestino[year] = valor;
                        }
                    });
                }
            });
        })
        .catch(error => console.error(`Error al cargar ${archivo}:`, error));
}

// Cargar los tres archivos de datos
Promise.all([
    cargarDatosDesdeCSV("js/Dbs/consumption.csv", datosGeneracion, "Electricity from solar (TWh)"),
    cargarDatosDesdeCSV("js/Dbs/capacity.csv", datosCapacidad, "Solar Capacity"),
    cargarDatosDesdeCSV("js/Dbs/share.csv", datosPorcentaje, "Solar (% equivalent primary energy)")
]).then(() => {
    console.log("Todos los datos han sido cargados.");
});

// Escuchar el envío del formulario
document.getElementById("solarForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const consumo = parseFloat(document.getElementById("consumo").value);
    let year = parseInt(document.getElementById("year").value);

    if (isNaN(consumo) || consumo <= 0) {
        alert("Por favor, ingrese un valor válido de consumo.");
        return;
    }

    // Seleccionar el año más reciente si no se ingresa un año válido
    if (isNaN(year) || !(year in datosGeneracion)) {
        year = Math.max(...Object.keys(datosGeneracion).map(Number));
    }

    // Obtener los valores del año seleccionado
    const electricidadSolar = datosGeneracion[year] || 0;
    const capacidadSolar = datosCapacidad[year] || 0;
    const porcentajeSolar = datosPorcentaje[year] || 0;

    // Cálculo del porcentaje de energía renovable en el consumo total
    const energiaSolarUsada = consumo * (porcentajeSolar / 100);
    const porcentajeSolarConsumo = (energiaSolarUsada / consumo) * 100;

    // Mostrar el resultado
    document.getElementById("resultado").innerText =
        `Para el año ${year}, el ${porcentajeSolarConsumo.toFixed(4)}% de su consumo eléctrico proviene de energía solar.
         Electricidad solar generada: ${electricidadSolar} TWh.
         Capacidad solar instalada: ${capacidadSolar} GW.`;
});
