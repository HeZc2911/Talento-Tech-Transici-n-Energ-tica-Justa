let datosGeneracion = {}; // Almacena la electricidad generada desde solar
let datosCapacidad = {}; // Almacena la capacidad instalada solar
let datosPorcentaje = {}; // Almacena el porcentaje de energía solar

// Función para cargar un CSV y guardarlo en un objeto
function cargarDatosDesdeCSV(archivo, objetoDestino, columnaClave) {
    return fetch(archivo)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar ${archivo}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
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
        .catch(error => {
            console.error(error);
            alert(`Error al cargar ${archivo}. Por favor, inténtelo de nuevo.`);
        });
}

// Cargar los tres archivos de datos
Promise.all([
    cargarDatosDesdeCSV("js/Dbs/consumption.csv", datosGeneracion, "Electricity from solar (TWh)"),
    cargarDatosDesdeCSV("js/Dbs/capacity.csv", datosCapacidad, "Solar Capacity"),
    cargarDatosDesdeCSV("js/Dbs/share.csv", datosPorcentaje, "Solar (% equivalent primary energy)")
])
.then(() => {
    console.log("Todos los datos han sido cargados.");
    cargarTablaConsumo();
})
.catch(error => {
    console.error("Error al cargar uno o más archivos:", error);
});

// Función para cargar y mostrar datos en la tabla
function cargarTablaConsumo() {
    if (Object.keys(datosGeneracion).length === 0) {
        console.error("No hay datos de generación cargados.");
        return;
    }

    // Convertir datosGeneracion en un formato compatible con DataTables
    const datosTabla = Object.keys(datosGeneracion).map(year => ({
        Year: year,
        Country: "País no especificado", // Ajusta esto según tus datos
        "Electricity from solar (TWh)": datosGeneracion[year],
        "Electricity from wind (TWh)": 0, // Ajusta esto según tus datos
        "Primary energy consumption per capita (kWh/person)": 0 // Ajusta esto según tus datos
    }));

    inicializarDataTable(datosTabla);
}

// Función para inicializar DataTables
function inicializarDataTable(datos) {
    if ($.fn.DataTable.isDataTable('#energyTable')) {
        $('#energyTable').DataTable().clear().destroy();
    }
    $('#energyTable').DataTable({
        data: datos,
        columns: [
            { data: "Year", title: "Año" },
            { data: "Country", title: "País" },
            { data: "Electricity from solar (TWh)", title: "Energía Solar (TWh)" },
            { data: "Electricity from wind (TWh)", title: "Energía Eólica (TWh)" },
            { data: "Primary energy consumption per capita (kWh/person)", title: "Consumo per cápita (kWh)" }
        ],
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        responsive: true,
        order: [[0, 'desc']]
    });
}

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
    if (consumo === 0) {
        alert("El consumo no puede ser cero.");
        return;
    }
    
    const energiaSolarUsada = consumo * (porcentajeSolar / 100);
    const porcentajeSolarConsumo = (energiaSolarUsada / consumo) * 100;

    // Mostrar el resultado
    document.getElementById("resultado").innerText =
        `Para el año ${year}, el ${porcentajeSolarConsumo.toFixed(4)}% de su consumo eléctrico proviene de energía solar.
         Electricidad solar generada: ${electricidadSolar} TWh.
         Capacidad solar instalada: ${capacidadSolar} GW.`;
});
