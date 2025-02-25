let datosGeneracion = {}; // {pais: {año: valor}}
let datosCapacidad = {};
let datosPorcentaje = {};

// Función para cargar un CSV y guardarlo en un objeto estructurado por país y año
function cargarDatosDesdeCSV(archivo, objetoDestino, columnaClave) {
    return fetch(archivo)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true, // La primera fila es de encabezados
                dynamicTyping: true, // Convierte números automáticamente
                complete: function (results) {
                    results.data.forEach(row => {
                        const pais = row.Entity;  // Nombre del país
                        const year = row.Year;
                        const valor = row[columnaClave];

                        if (pais && year && valor !== undefined) {
                            if (!objetoDestino[pais]) {
                                objetoDestino[pais] = {}; // Crear objeto del país si no existe
                            }
                            objetoDestino[pais][year] = valor; // Guardar el valor
                        }
                    });
                }
            });
        })
        .catch(error => console.error(`Error al cargar ${archivo}:`, error));
}

// Cargar los archivos de datos
Promise.all([
    cargarDatosDesdeCSV("js/Dbs/consumption.csv", datosGeneracion, "Electricity from solar (TWh)"),
    cargarDatosDesdeCSV("js/Dbs/capacity.csv", datosCapacidad, "Solar Capacity"),
    cargarDatosDesdeCSV("js/Dbs/share.csv", datosPorcentaje, "Solar (% equivalent primary energy)")
]).then(() => {
    console.log("✅ Todos los datos han sido cargados.");
    cargarPaisesEnSelect(); // Llenar el select de países después de cargar los datos
}).catch(error => console.error("❌ Error al cargar los datos:", error));

// Función para llenar el <select> con los países disponibles
function cargarPaisesEnSelect() {
    const selectPais = document.getElementById("pais");
    if (!selectPais) {
        console.error("❌ No se encontró el select de países.");
        return;
    }
    
    selectPais.innerHTML = "<option value=''>Seleccione un país</option>";

    const paises = Object.keys(datosGeneracion).sort();
    paises.forEach(pais => {
        let option = document.createElement("option");
        option.value = pais;
        option.textContent = pais;
        selectPais.appendChild(option);
    });

    console.log("✅ Select de países cargado correctamente.");
}

// Escuchar el envío del formulario
document.getElementById("solarForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const consumo = parseFloat(document.getElementById("consumo").value);
    const pais = document.getElementById("pais").value;
    let year = parseInt(document.getElementById("year").value);

    if (!pais) {
        alert("❌ Por favor, seleccione un país.");
        return;
    }

    if (isNaN(consumo) || consumo <= 0) {
        alert("❌ Por favor, ingrese un valor válido de consumo.");
        return;
    }

    // Seleccionar el año más reciente si no se ingresa un año válido
    if (isNaN(year) || !(datosGeneracion[pais] && year in datosGeneracion[pais])) {
        year = Math.max(...Object.keys(datosGeneracion[pais] || {}).map(Number));
    }

    // Obtener los valores del país y año seleccionado
    const electricidadSolar = (datosGeneracion[pais] && datosGeneracion[pais][year]) || 0;
    const capacidadSolar = (datosCapacidad[pais] && datosCapacidad[pais][year]) || 0;
    const porcentajeSolar = (datosPorcentaje[pais] && datosPorcentaje[pais][year]) || 0;

    // Cálculo del porcentaje de energía renovable en el consumo total
    const energiaSolarUsada = consumo * (porcentajeSolar / 100);
    const porcentajeSolarConsumo = (energiaSolarUsada / consumo) * 100;

    // Mostrar el resultado
    document.getElementById("resultado").innerText =
        `Para el país ${pais} en el año ${year}, el ${porcentajeSolarConsumo.toFixed(4)}% de su consumo eléctrico proviene de energía solar.
         Electricidad solar generada: ${electricidadSolar} TWh.
         Capacidad solar instalada: ${capacidadSolar} GW.`;
});

// Función para mostrar los datos en una tabla
function mostrarDatosEnTabla() {
    const tabla = document.getElementById("tablaEnergia").querySelector("tbody");
    tabla.innerHTML = ""; // Limpiar contenido anterior

    const paisSeleccionado = document.getElementById("pais").value;
    if (!paisSeleccionado || !datosGeneracion[paisSeleccionado]) return;

    const years = Object.keys(datosGeneracion[paisSeleccionado]).sort((a, b) => a - b);

    years.forEach(year => {
        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${year}</td>
            <td>${datosCapacidad[paisSeleccionado][year] || "N/A"} GW</td>
            <td>${datosGeneracion[paisSeleccionado][year] || "N/A"} TWh</td>
            <td>${datosPorcentaje[paisSeleccionado][year] || "N/A"}%</td>
        `;
        tabla.appendChild(fila);
    });

    console.log(`✅ Tabla actualizada para ${paisSeleccionado}`);
}

// Evento para actualizar la tabla al seleccionar un país
document.getElementById("pais").addEventListener("change", mostrarDatosEnTabla);
