import os
import pandas as pd
import plotly.express as px
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# 📂 Ruta donde están los archivos CSV
DATA_FOLDER = "data"

# 📋 Diccionario con los archivos CSV que queremos cargar
archivos_csv = {
    "Solar": "consumption.csv",
    "Capacidad Solar": "capacity.csv",
    "Hidroelectricidad": "05 hydropower-consumption.csv",
    "Eólica": "08 wind-generation.csv",
    "Biofuel": "16 biofuel-production.csv",
    "Geotermia": "17 installed-geothermal-capacity.csv",
    "Renovable Total": "02 modern-renewable-energy-consumption.csv"
}

# 📊 Diccionario global para almacenar los DataFrames
dataframes = {}


def cargar_datos():
    """Carga los datos desde los archivos CSV y los almacena en un diccionario global."""
    global dataframes
    for nombre, archivo in archivos_csv.items():
        ruta_csv = os.path.join(DATA_FOLDER, archivo)
        if os.path.exists(ruta_csv):
            try:
                dataframes[nombre] = pd.read_csv(ruta_csv)
                print(f"✅ Datos cargados: {nombre} ({len(dataframes[nombre])} filas)")
            except Exception as e:
                print(f"❌ Error al cargar {nombre}: {e}")
        else:
            print(f"⚠ Archivo no encontrado: {ruta_csv}")


@app.route("/")
def index():
    """Carga la página principal con los países y la tabla de datos."""
    paises = sorted(set(dataframes["Solar"]["Entity"])) if "Solar" in dataframes else []
    return render_template("index.html", paises=paises, tabla_html=generar_tabla())


@app.route("/calcular", methods=["POST"])
def calcular():
    """Calcula el porcentaje de energía renovable según el país y año seleccionado."""
    try:
        pais = request.form.get("pais")
        consumo = float(request.form.get("consumo", 0))
        year = request.form.get("year")

        if not pais or consumo <= 0:
            return jsonify({"error": "Debe seleccionar un país e ingresar el consumo"}), 400

        # 🔄 Si el usuario no ingresa el año, usar el más reciente disponible
        if not year or not year.isdigit():
            year = max(dataframes["Solar"]["Year"].unique())
        else:
            year = int(year)

        # 📊 Obtener datos
        df_solar = dataframes["Solar"]
        datos_pais = df_solar[(df_solar["Entity"] == pais) & (df_solar["Year"] == year)]

        if datos_pais.empty:
            return jsonify({"error": "No hay datos para este país y año"}), 400

        electricidad_solar = datos_pais["Electricity from solar (TWh)"].values[0]
        porcentaje_solar = datos_pais["Solar (% equivalent primary energy)"].values[0]

        # 📌 Calcular porcentaje de energía renovable
        energia_solar_usada = consumo * (porcentaje_solar / 100)
        porcentaje_solar_consumo = (energia_solar_usada / consumo) * 100

        # ✅ Respuesta JSON con la tabla y gráficos
        return jsonify({
            "resultado": f"Para {pais} en {year}, el {porcentaje_solar_consumo:.2f}% de su consumo proviene de energía solar.",
            "tabla_html": generar_tabla(pais),
            "graph_barras_html": generar_grafico_barras(pais),
            "graph_pie_html": generar_grafico_pie(pais)
        })

    except Exception as e:
        return jsonify({"error": f"Error en el cálculo: {str(e)}"}), 500


def generar_tabla(pais_seleccionado=""):
    """Genera una tabla HTML con los datos históricos de un país o todos."""
    tabla_html = ""
    for nombre, df in dataframes.items():
        if not df.empty:
            df_filtrado = df[df["Entity"] == pais_seleccionado] if pais_seleccionado else df
            if not df_filtrado.empty:
                tabla_html += f"<h3>{nombre}</h3>"
                tabla_html += df_filtrado.to_html(classes='table table-striped', index=False)
    return tabla_html


def generar_grafico_barras(pais):
    """Genera un gráfico de barras con los datos de producción de energía."""
    df_solar = dataframes["Solar"]
    df_filtrado = df_solar[df_solar["Entity"] == pais]

    if df_filtrado.empty:
        return "<p>No hay datos disponibles para este gráfico.</p>"

    fig = px.bar(
        df_filtrado,
        x="Year",
        y="Electricity from solar (TWh)",
        title=f"Producción de Energía Solar en {pais}",
        labels={"Electricity from solar (TWh)": "Electricidad Solar (TWh)", "Year": "Año"}
    )
    return fig.to_html(full_html=False)


def generar_grafico_pie(pais):
    """Genera un gráfico de torta con la participación de energías renovables."""
    df_solar = dataframes["Solar"]
    df_filtrado = df_solar[df_solar["Entity"] == pais]

    if df_filtrado.empty:
        return "<p>No hay datos disponibles para este gráfico.</p>"

    fig = px.pie(
        df_filtrado,
        names="Year",
        values="Solar (% equivalent primary energy)",
        title=f"Porcentaje de Energía Solar en {pais}"
    )
    return fig.to_html(full_html=False)


# 🔄 Cargar los datos al iniciar la aplicación
cargar_datos()

if __name__ == "__main__":
    app.run(debug=True)
