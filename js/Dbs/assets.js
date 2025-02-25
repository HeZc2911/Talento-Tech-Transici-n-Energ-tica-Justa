/* 
 * assets.js - Dashboard de Energía Renovable
 * 
 * Este script carga múltiples archivos CSV, organiza los datos por país y año,
 * y genera los siguientes gráficos usando Chart.js:
 *  - Gráfico de barras: Producción de energía por fuente (Solar, Eólica, Hidro, Biomasa, Geotermia)
 *  - Gráfico de torta: Participación de energías renovables (Renovables Totales, Solar, Eólica, Hidro)
 *  - Gráfico de líneas: Tendencia en la capacidad instalada (Viento, Solar PV, Geotermia)
 *  - Gráfico de área: Comparación entre consumo renovable y convencional (convencional simulado)
 */

/* Variables para almacenar datos organizados por país y año */
let datosGeneracion = {};      // Electricity from solar (TWh)
let datosCapacidad = {};       // Solar Capacity
let datosPorcentaje = {};      // Solar (% equivalent primary energy)
let datosHidroelectrica = {};  // Hydropower Consumption (TWh)
let datosEolica = {};          // Wind Generation (TWh)
let datosBiofuel = {};         // Biofuel Production (TWh)
let datosGeotermica = {};      // Installed Geothermal Capacity (GW)
let datosRenovableTotal = {};  // Modern Renewable Energy Consumption (TWh)

// Datos para gráficos de participación (torta)
let datosShareRenovables = {}; // Share Electricity Renewables
let datosShareHydro = {};      // Share Electricity Hydro
let datosShareWind = {};       // Share Electricity Wind
let datosShareSolar = {};      // Share Electricity Solar

// Datos para gráfico de líneas (capacidad instalada)
let datosCumulativeWind = {};  // Cumulative Installed Wind Energy Capacity (Gigawatts)
let datosSolarPV = {};         // Installed Solar PV Capacity

// Lista de archivos CSV a cargar con su respectiva columna
const archivosCSV = [
    { archivo: "js/Dbs/consumption.csv", objeto: datosGeneracion, columna: "Electricity from solar (TWh)" },
    { archivo: "js/Dbs/capacity.csv", objeto: datosCapacidad, columna: "Solar Capacity" },
    { archivo: "js/Dbs/share.csv", objeto: datosPorcentaje, columna: "Solar (% equivalent primary energy)" },
    { archivo: "js/Dbs/05 hydropower-consumption.csv", objeto: datosHidroelectrica, columna: "Hydropower Consumption (TWh)" },
    { archivo: "js/Dbs/08 wind-generation.csv", objeto: datosEolica, columna: "Wind Generation (TWh)" },
    { archivo: "js/Dbs/16 biofuel-production.csv", objeto: datosBiofuel, columna: "Biofuel Production (TWh)" },
    { archivo: "js/Dbs/17 installed-geothermal-capacity.csv", objeto: datosGeotermica, columna: "Installed Geothermal Capacity (GW)" },
    { archivo: "js/Dbs/02 modern-renewable-energy-consumption.csv", objeto: datosRenovableTotal, columna: "Modern Renewable Energy Consumption (TWh)" },
    { archivo: "js/Dbs/04 share-electricity-renovables.csv", objeto: datosShareRenovables, columna: "Share Electricity Renewables" },
    { archivo: "js/Dbs/07 share-electricity-hydro.csv", objeto: datosShareHydro, columna: "Share Electricity Hydro" },
    { archivo: "js/Dbs/11 share-electricity-wind.csv", objeto: datosShareWind, columna: "Share Electricity Wind" },
    { archivo: "js/Dbs/15 share-electricity-solar.csv", objeto: datosShareSolar, columna: "Share Electricity Solar" },
    { archivo: "js/Dbs/09 cumulative-installed-wind-energy-capacity-gigawatts.csv", objeto: datosCumulativeWind, columna: "Cumulative Installed Wind Energy Capacity (Gigawatts)" },
    { archivo: "js/Dbs/13 installed-solar-PV-capacity.csv", objeto: datosSolarPV, columna: "Installed Solar PV Capacity" }
];

/* Función para cargar un CSV y organizar los datos por país y año */
function cargarDatosDesdeCSV(archivo, objetoDestino, columnaClave) {
    return fetch(archivo)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true, // Ignora líneas vacías
                complete: function(results) {
                    console.log(`📂 Archivo procesado: ${archivo}, Total filas: ${results.data.length}`);
                    results.data.forEach(row => {
                        const pais = row["Entity"] || row["Country"] || row["Region"];
                        const year = row["Year"];
                        const valor = row[columnaClave];

                        if (pais && year && valor !== undefined) {
                            if (!objetoDestino[pais]) {
                                objetoDestino[pais] = {};
                            }
                            objetoDestino[pais][year] = valor;
                        }
                    });
                    console.log(`✅ Datos cargados para ${archivo}:`, objetoDestino);
                }
            });
        })
        .catch(error => console.error(`❌ Error al cargar ${archivo}:`, error));
}



/* Inicializar los gráficos del dashboard */


/* Cargar todos los archivos CSV */
Promise.all(archivosCSV.map(({ archivo, objeto, columna }) => cargarDatosDesdeCSV(archivo, objeto, columna)))
    .then(() => {
        console.log("✅ Todos los datos han sido cargados.");
        console.log("📊 Datos después de la carga:", { datosGeneracion, datosCapacidad, datosPorcentaje });
        
        cargarPaisesEnSelect();
        mostrarDatosEnTabla();
        if (typeof inicializarGraficos === "function") {
            inicializarGraficos();
        } else {
            console.error("❌ Error: inicializarGraficos() no está definida.");
        }
        
    })
    .catch(error => console.error("❌ Error al cargar los datos:", error));

    function actualizarGraficos(pais, year) {
        console.log(`🔄 Actualizando gráficos para ${pais} en ${year}`);
    
        const produccion = [
            datosGeneracion[pais]?.[year] || 0,
            datosEolica[pais]?.[year] || 0,
            datosHidroelectrica[pais]?.[year] || 0,
            datosBiofuel[pais]?.[year] || 0,
            datosGeotermica[pais]?.[year] || 0
        ];
    
        if (window.chartBar) {
            window.chartBar.data.datasets[0].data = produccion;
            window.chartBar.update();
        } else {
            console.warn("⚠ El gráfico de barras aún no se ha inicializado.");
        }
    
        const participacion = [
            datosShareRenovables[pais]?.[year] || 0,
            datosShareSolar[pais]?.[year] || 0,
            datosShareWind[pais]?.[year] || 0,
            datosShareHydro[pais]?.[year] || 0
        ];
    
        if (window.chartPie) {
            window.chartPie.data.datasets[0].data = participacion;
            window.chartPie.update();
        } else {
            console.warn("⚠ El gráfico de torta aún no se ha inicializado.");
        }
    }
/* Función para llenar el <select> de países */
function cargarPaisesEnSelect() {
    const selectPais = document.getElementById("pais");
    if (!selectPais) return;
    selectPais.innerHTML = "<option value=''>Seleccione un país</option>";
    const paises = Object.keys(datosGeneracion).sort();
    paises.forEach(pais => {
        let option = document.createElement("option");
        option.value = pais;
        option.textContent = pais;
        selectPais.appendChild(option);
    });
}

/* Evento del formulario */
document.getElementById("solarForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const consumo = parseFloat(document.getElementById("consumo").value);
    const pais = document.getElementById("pais").value;
    let year = parseInt(document.getElementById("year").value);
    if (!pais || isNaN(consumo) || consumo <= 0) {
        alert("❌ Ingrese valores válidos.");
        return;
    }
    if (isNaN(year) || !(datosGeneracion[pais] && year in datosGeneracion[pais])) {
        year = Math.max(...Object.keys(datosGeneracion[pais] || {}).map(Number));
    }
    const electricidadSolar = datosGeneracion[pais]?.[year] || 0;
    const capacidadSolar = datosCapacidad[pais]?.[year] || 0;
    const porcentajeSolar = datosPorcentaje[pais]?.[year] || 0;
    const energiaSolarUsada = consumo * (porcentajeSolar / 100);
    const porcentajeSolarConsumo = (energiaSolarUsada / consumo) * 100;
    document.getElementById("resultado").innerText = 
        `Para ${pais} en ${year}, el ${porcentajeSolarConsumo.toFixed(4)}% de su consumo proviene de energía solar.`;
    actualizarGraficos(pais, year);
});

/* Función para generar datos de la tabla */
function generarDatosTabla() {
    const datos = [];
    const paisSeleccionado = document.getElementById("pais").value;
    if (!paisSeleccionado || !datosGeneracion[paisSeleccionado]) return datos;
    const years = Object.keys(datosGeneracion[paisSeleccionado]).sort((a, b) => a - b);
    years.forEach(year => {
        const capacidad = datosCapacidad[paisSeleccionado]?.[year] || "N/A";
        const electricidad = datosGeneracion[paisSeleccionado]?.[year] || "N/A";
        const porcentaje = datosPorcentaje[paisSeleccionado]?.[year] || "N/A";
        datos.push([year, capacidad, electricidad, porcentaje]);
    });
    return datos;
}

/* Inicializar la tabla con DataTables */
function mostrarDatosEnTabla() {
    const datosTabla = generarDatosTabla();

    if (!datosTabla || datosTabla.length === 0) {
        console.warn("⚠ No hay datos disponibles para mostrar en la tabla.");
        return;
    }

    if ($.fn.DataTable.isDataTable("#tablaEnergia")) {
        $('#tablaEnergia').DataTable().clear().rows.add(datosTabla).draw();
    } else {
        $('#tablaEnergia').DataTable({
            data: datosTabla,
            destroy: true,
            columns: [
                { title: "Año" },
                { title: "Capacidad Solar (GW)" },
                { title: "Electricidad Solar (TWh)" },
                { title: "% Solar" }
            ],
            paging: true,
            searching: true
        });
    }
}


