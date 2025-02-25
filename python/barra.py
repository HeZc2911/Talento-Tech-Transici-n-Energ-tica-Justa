import os
import pandas as pd
import matplotlib.pyplot as plt

# Obtener la ruta absoluta del directorio donde está el script
ruta_base = os.path.dirname(os.path.abspath(__file__))

# Construir la ruta completa al archivo CSV
ruta_csv = os.path.join(ruta_base, "installed-solar-PV-capacity.csv")

def graficar_produccion_energia(ruta_csv):
    """
    Gráfico de Barras: Producción de Energía Solar
    -------------------------------------------------
    Descripción: Muestra la cantidad de energía producida por la fuente solar 
    en distintas regiones o países en el último año disponible en el dataset.

    Parámetro:
    - ruta_csv: str -> Ruta específica del archivo CSV con los datos de capacidad solar.

    Retorna:
    - Un gráfico de barras con la producción de energía solar por país/región.
    """

    # Cargar los datos desde el archivo CSV
    try:
        df = pd.read_csv(ruta_csv)
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo en {ruta_csv}")
        return

    # Verificar las primeras filas para entender la estructura
    print("Primeras filas del archivo CSV:\n", df.head())

    # Seleccionar el último año disponible en los datos
    if "Year" not in df.columns or "Entity" not in df.columns or "Solar Capacity" not in df.columns:
        print("❌ Error: El archivo CSV no tiene las columnas esperadas.")
        return
    
    ultimo_anio = df["Year"].max()
    df_filtrado = df[df["Year"] == ultimo_anio]

    # Crear el gráfico de barras
    plt.figure(figsize=(12, 6))
    plt.bar(df_filtrado["Entity"], df_filtrado["Solar Capacity"], color="orange")

    # Configurar etiquetas y título
    plt.xlabel("Región o País")
    plt.ylabel("Capacidad Instalada de Energía Solar (GW o MW)")
    plt.title(f"Producción de Energía Solar en el Año {ultimo_anio}")
    plt.xticks(rotation=90)  # Rotar etiquetas para mejor visualización

    # Mostrar el gráfico
    plt.show()

# Llamar a la función con la ruta generada automáticamente
graficar_produccion_energia(ruta_csv)