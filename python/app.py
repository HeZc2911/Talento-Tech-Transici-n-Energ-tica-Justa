import os
import pandas as pd
import matplotlib.pyplot as plt
from flask import Flask, render_template, send_from_directory




app = Flask(__name__)

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)




app = Flask(__name__)

# Ajustar la ruta si el archivo está en otra carpeta
ruta_base = os.path.dirname(os.path.abspath(__file__))
ruta_csv = os.path.join(ruta_base, "python", "capacity.csv")  # ✅ Cambio aquí

def graficar_produccion_energia():
    try:
        df = pd.read_csv(ruta_csv)
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo en {ruta_csv}")
        return None

    if "Year" not in df.columns or "Entity" not in df.columns or "Solar Capacity" not in df.columns:
        print("❌ Error: El CSV no tiene las columnas esperadas.")
        return None
    
    ultimo_anio = df["Year"].max()
    df_filtrado = df[df["Year"] == ultimo_anio]

    plt.figure(figsize=(12, 6))
    plt.bar(df_filtrado["Entity"], df_filtrado["Solar Capacity"], color="orange")
    plt.xlabel("Región o País")
    plt.ylabel("Capacidad Instalada de Energía Solar (GW o MW)")
    plt.title(f"Producción de Energía Solar en el Año {ultimo_anio}")
    plt.xticks(rotation=90)
    plt.tight_layout()

    ruta_static = os.path.join(ruta_base, "static")
    if not os.path.exists(ruta_static):
        os.makedirs(ruta_static)


    #ruta_imagen = os.path.join(ruta_static, "grafico.png")
    #plt.savefig(ruta_imagen)
    #plt.close()

    return "grafico.png"

@app.route("/")
def index():
    imagen = graficar_produccion_energia()
    return render_template("index.html", imagen=imagen)

    #return render_template("index.html", imagen="grafico.png")

if __name__ == "__main__":
    app.run(debug=True)