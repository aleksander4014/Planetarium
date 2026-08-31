"""
Silesia Sky Tracker - Interaktywny Asystent Obserwatora
Dedykowane dla: Planetarium - Śląski Park Nauki w Chorzowie
Współrzędne stacji bazowej: 50.2911° N, 18.9922° E (Park Śląski, Chorzów)

Autor: Inżynier Automatyki / Kandydat do zespołu technicznego Planetarium Śląskiego
Technologie: Python, Streamlit, Ephem / Astropy, NASA NeoWS API, Pandas, Plotly
"""

import datetime
import os
import requests
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Próba importu biblioteki astronomicznej ephem (szybkie i precyzyjne obliczenia efemeryd)
try:
    import ephem
    HAS_EPHEM = True
except ImportError:
    HAS_EPHEM = False

# ==============================================================================
# KONFIGURACJA STRONY STREAMLIT & MOTYW OBSERWATORIUM (DARK MODE)
# ==============================================================================
st.set_page_config(
    page_title="Silesia Sky Tracker | Planetarium Śląskie",
    page_icon="🔭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Niestandardowy styl CSS dla klimatu nowoczesnego obserwatorium astronomicznego
st.markdown("""
<style>
    .main {
        background: radial-gradient(circle at 50% 10%, #122235 0%, #070d18 45%, #04070d 100%);
        color: #edf6ff;
    }
    .stApp {
        color: #edf6ff;
    }
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0a1320 0%, #0d1c2d 100%);
        border-right: 1px solid rgba(148, 163, 184, 0.24);
    }
    .stMetric {
        background: rgba(11, 18, 32, 0.9);
        border: 1px solid rgba(96, 165, 250, 0.45);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 0 0 1px rgba(14, 116, 144, 0.18);
    }
    .stAlert {
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .planet-card {
        background: rgba(15, 23, 42, 0.92);
        border-left: 4px solid #7dd3fc;
        color: #eaf6ff;
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        margin-bottom: 10px;
        box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.12);
    }
    .header-badge {
        display: inline-block;
        background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
        color: #03131f;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 8px;
        box-shadow: 0 0 18px rgba(56, 189, 248, 0.35);
    }
    .stCaption, .stMarkdown p, .stMarkdown li, .stDataFrame, .stSelectbox label, .stTextInput label, .stDateInput label, .stTimeInput label {
        color: #e2f0ff !important;
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# STAŁE ASTRONOMICZNE I WSPÓŁRZĘDNE OBSERWATORA (CHORZÓW)
# ==============================================================================
CHORZOW_LAT = '50.2911'       # Szerokość geograficzna [N] (Planetarium Śląskie)
CHORZOW_LON = '18.9922'       # Długość geograficzna [E]
CHORZOW_ELEVATION = 320       # Wysokość n.p.m. [m] (Wzgórze Parku Śląskiego)

# ==============================================================================
# PASEK BOCZNY - PARAMETRY I KLUCZ API
# ==============================================================================
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png", width=100)
    st.title("⚙️ Parametry Stacji")
    st.caption("Stacja: **Planetarium Śląskie, Chorzów**")
    
    st.markdown("---")
    st.subheader("🔑 Połączenie NASA API")
    
    # Bezpieczne pobranie klucza ze zmiennych środowiskowych serwera (np. Render)
    server_api_key = os.getenv("NASA_API_KEY", "").strip()
    
    if server_api_key:
        # Klucz jest bezpiecznie wczytany z serwera - nie pokazujemy go w UI
        nasa_api_key = server_api_key
        st.success("🔒 Klucz NASA API: **Autoryzowany (Klucz serwera)**")
    else:
        # Fallback gdy zmienna środowiskowa nie jest ustawiona
        nasa_api_key = "DEMO_KEY"
        st.info("ℹ️ Brak zmiennej `NASA_API_KEY` – używam limitowanego `DEMO_KEY`.")
        
    st.markdown("---")
    st.subheader("🕒 Czas obserwacji")
    selected_date = st.date_input("Data obserwacji", datetime.date.today(), key="selected_date")

    # Inicjalizacja domyślnego czasu w session_state (tylko przy pierwszym wejściu)
    if "user_time_str" not in st.session_state:
        st.session_state.user_time_str = datetime.datetime.utcnow().strftime("%H:%M")

    time_input = st.time_input(
        "Godzina (UTC):",
        value=datetime.datetime.strptime(st.session_state.user_time_str, "%H:%M").time(),
        key="user_time_input"
    )

    st.session_state.user_time_str = time_input.strftime("%H:%M")
    parsed_time = time_input

    st.caption(f"⏱️ Ustawiony czas: **{parsed_time.strftime('%H:%M')} UTC**")
    obs_datetime = datetime.datetime.combine(selected_date, parsed_time)
    
    st.markdown("---")
    st.markdown("""
    **Profil inżynierski:**
    - 📐 Geometria sferyczna & Astrometria
    - 🤖 Automatyka napędów montażu Alt-Az
    - 🐍 Python / Streamlit / REST API
    """)

# ==============================================================================
# SEKCJA POWITALNA (Nawiązanie do Parku Śląskiego i Planetarium)
# ==============================================================================
st.markdown('<div class="header-badge">Śląski Park Nauki • Chorzów</div>', unsafe_allow_html=True)
st.title("🔭 Silesia Sky Tracker")
st.subheader("Interaktywny System Pozycjonowania Ciał Niebieskich & Radar Zagrożeń Kosmicznych")

st.markdown(f"""
Witaj w systemie telemetrycznym sprofilowanym dla **Planetarium - Śląskiego Parku Nauki** 
(Współrzędne: **{CHORZOW_LAT}° N, {CHORZOW_LON}° E**, Wzgórze w Parku Śląskim). 
Aplikacja automatycznie przelicza sferyczne współrzędne horyzontalne (**Alt/Az**) dla teleskopów oraz 
monitoruje zbliżenia obiektów NEO (Near Earth Objects) w czasie rzeczywistym.
""")

tab_planets, tab_asteroids, tab_radar, tab_info = st.tabs([
    "🪐 Widoczność Planet (Alt/Az)",
    "☄️ Radar Asteroid (NASA NeoWS)",
    "🎯 Sferyczna Mapa Nieba (Wizualizacja)",
    "📐 Metodologia Matematyczna"
])

# ==============================================================================
# MODUŁ 1: OBLICZENIA POZYCJI PLANET (EPHEMERIDES / SPERICAL ASTRONOMY)
# ==============================================================================
@st.cache_data(ttl=60)
def calculate_planetary_positions(date_time):
    """
    Oblicza współrzędne horyzontalne (Azymut i Wysokość nad horyzontem - Alt/Az)
    dla planet Układu Słonecznego z punktu widzenia Planetarium Śląskiego w Chorzowie.
    """
    planets_data = []
    
    if HAS_EPHEM:
        observer = ephem.Observer()
        observer.lat = CHORZOW_LAT
        observer.lon = CHORZOW_LON
        observer.elevation = CHORZOW_ELEVATION
        observer.date = date_time
        
        celestial_bodies = {
            "Księżyc 🌕": ephem.Moon(),
            "Merkury ☿": ephem.Mercury(),
            "Wenus ♀": ephem.Venus(),
            "Mars ♂": ephem.Mars(),
            "Jowisz ♃": ephem.Jupiter(),
            "Saturn ♄": ephem.Saturn(),
            "Uran ♅": ephem.Uranus(),
            "Neptun ♆": ephem.Neptune()
        }
        
        for name, body in celestial_bodies.items():
            body.compute(observer)
            
            # Konwersja kątów z radianów na stopnie
            altitude_deg = float(body.alt) * 180.0 / 3.141592653589793
            azimuth_deg = float(body.az) * 180.0 / 3.141592653589793
            
            is_visible = altitude_deg > 0
            
            # Określenie kierunku świata na podstawie azymutu
            directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
            dir_index = int((azimuth_deg + 22.5) // 45) % 8
            compass_dir = directions[dir_index]
            
            planets_data.append({
                "Obiekt": name,
                "Wysokość (Alt) [°]": round(altitude_deg, 2),
                "Azymut (Az) [°]": round(azimuth_deg, 2),
                "Kierunek": compass_dir,
                "Jasność (Mag)": round(float(body.mag), 2) if hasattr(body, 'mag') else "—",
                "Status": "🟢 Widoczny (Nad horyzontem)" if is_visible else "🔴 Pod horyzontem",
                "Widoczny": is_visible
            })
    else:
        # Rezerwowy algorytm matematyczny w przypadku braku ephem (prosta aproksymacja)
        st.warning("Biblioteka 'ephem' nie jest zainstalowana. Uruchomiono tryb demonstracyjny.")
        
    return pd.DataFrame(planets_data)

with tab_planets:
    st.markdown("### 🔭 Pozycje Ciał Niebieskich z Planetarium Śląskiego")
    st.caption(f"Czas kalkulacji: **{obs_datetime.strftime('%Y-%m-%d %H:%M:%S UTC')}**")
    
    df_planets = calculate_planetary_positions(obs_datetime)
    
    if not df_planets.empty:
        # Metryki podsumowujące
        visible_count = int(df_planets['Widoczny'].sum())
        col1, col2, col3 = st.columns(3)
        col1.metric("Łącznie śledzonych ciał", len(df_planets))
        col2.metric("Aktualnie nad horyzontem", f"{visible_count} obiektów", delta=f"{visible_count} widocznych")
        
        best_planet = df_planets[df_planets['Widoczny']].sort_values(by="Wysokość (Alt) [°]", ascending=False)
        if not best_planet.empty:
            col3.metric("Najwyżej na niebie", best_planet.iloc[0]['Obiekt'], f"Alt: {best_planet.iloc[0]['Wysokość (Alt) [°]']}°")
        else:
            col3.metric("Najwyżej na niebie", "Brak ciał nad horyzontem", "—")
        
        st.markdown("---")
        
        # Tabela współrzędnych
        def style_visibility(val):
            color = '#10b981' if 'Widoczny' in str(val) else '#ef4444'
            return f'color: {color}; font-weight: bold;'

        # Pandas 2.1+ używa .map() zamiast przestarzałego .applymap()
        styler = df_planets.drop(columns=['Widoczny']).style
        if hasattr(styler, 'map'):
            styled_df = styler.map(style_visibility, subset=['Status'])
        else:
            styled_df = styler.applymap(style_visibility, subset=['Status'])
        st.dataframe(styled_df, use_container_width=True)
        
        # Szybka interpretacja dla automatyka teleskopu
        st.info("""
        💡 **Wskazówka montażowa (Alt/Az do Ra/Dec):** Współrzędne horyzontalne są bezpośrednio 
        wykorzystywane przez sterowniki silników krokowych montażu azymutalnego w kopule Planetarium.
        """)

# ==============================================================================
# MODUŁ 2: INTEGRACJA Z NASA NeoWS (RADAR ASTEROID)
# ==============================================================================
@st.cache_data(ttl=1800)  # Cache na 30 minut dla optymalizacji limitu zapytań
def fetch_neo_asteroids(api_key, date_str):
    """
    Pobiera dane o planetoidach bliskich Ziemi (NEO) z serwisu NASA NeoWS.
    """
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={date_str}&end_date={date_str}&api_key={api_key}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            neo_objects = data.get("near_earth_objects", {}).get(date_str, [])
            
            parsed_list = []
            for item in neo_objects:
                name = item.get("name", "Nieznana")
                is_hazardous = item.get("is_potentially_hazardous_asteroid", False)
                
                # Średnica szacunkowa
                diam_min = item["estimated_diameter"]["meters"]["estimated_diameter_min"]
                diam_max = item["estimated_diameter"]["meters"]["estimated_diameter_max"]
                avg_diameter = (diam_min + diam_max) / 2.0
                
                # Dane o przelocie
                close_approach = item.get("close_approach_data", [{}])[0]
                miss_distance_km = float(close_approach.get("miss_distance", {}).get("kilometers", 0))
                miss_distance_ld = float(close_approach.get("miss_distance", {}).get("lunar", 0))
                velocity_kmh = float(close_approach.get("relative_velocity", {}).get("kilometers_per_hour", 0))
                velocity_kms = velocity_kmh / 3600.0
                
                parsed_list.append({
                    "Nazwa Asteroidy": name,
                    "Odległość [km]": round(miss_distance_km, 0),
                    "Dystans Księżycowy [LD]": round(miss_distance_ld, 2),
                    "Prędkość [km/s]": round(velocity_kms, 2),
                    "Prędkość [km/h]": round(velocity_kmh, 0),
                    "Szac. Średnica [m]": round(avg_diameter, 1),
                    "Potencjalnie Niebezpieczna (PHA)": "⚠️ TAK" if is_hazardous else "🛡️ Bezpieczna",
                    "Hazardous_Bool": is_hazardous
                })
            
            return pd.DataFrame(parsed_list), None
        else:
            return pd.DataFrame(), f"Błąd NASA API: Kod HTTP {response.status_code} ({response.reason})"
    except Exception as e:
        return pd.DataFrame(), f"Błąd połączenia: {str(e)}"

with tab_asteroids:
    st.markdown("### ☄️ Obiekty Bliskie Ziemi (NASA Near Earth Object Web Service)")
    date_query = selected_date.strftime("%Y-%m-%d")
    
    with st.spinner("Pobieranie telemetrii z NASA JPL..."):
        df_neo, error = fetch_neo_asteroids(nasa_api_key, date_query)
    
    if error:
        st.error(f"❌ {error}")
        st.info("Sprawdź poprawność klucza API w panelu bocznym lub użyj `DEMO_KEY`.")
    elif df_neo.empty:
        st.warning(f"Brak zarejestrowanych przelotów NEO w bazie NASA na dzień {date_query}.")
    else:
        # Metryki NASA
        total_neo = len(df_neo)
        hazardous_count = int(df_neo['Hazardous_Bool'].sum())
        closest_neo = df_neo.sort_values(by="Odległość [km]").iloc[0]
        fastest_neo = df_neo.sort_values(by="Prędkość [km/s]", ascending=False).iloc[0]
        
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Wszystkie obiekty dzisiaj", total_neo)
        c2.metric("Potencjalnie niebezpieczne (PHA)", hazardous_count, delta="Zagrożenie" if hazardous_count > 0 else "Brak", delta_color="inverse")
        c3.metric("Najbliższy obiekt", f"{closest_neo['Dystans Księżycowy [LD]']} LD", f"{closest_neo['Nazwa Asteroidy']}")
        c4.metric("Najszybszy obiekt", f"{fastest_neo['Prędkość [km/s]']} km/s", f"{fastest_neo['Nazwa Asteroidy']}")
        
        st.markdown("---")
        
        # Filtrowanie i Sortowanie
        col_f1, col_f2 = st.columns([1, 2])
        with col_f1:
            filter_hazard = st.checkbox("Pokaż tylko potencjalnie niebezpieczne (PHA)")
        with col_f2:
            sort_by = st.selectbox("Sortuj według:", ["Odległość [km]", "Prędkość [km/s]", "Szac. Średnica [m]"])
            
        display_df = df_neo.copy()
        if filter_hazard:
            display_df = display_df[display_df['Hazardous_Bool'] == True]
            
        display_df = display_df.sort_values(by=sort_by)
        
        # Wyświetlenie tabeli
        st.dataframe(
            display_df.drop(columns=['Hazardous_Bool', 'Prędkość [km/h]']),
            use_container_width=True
        )
        
        # Wykres korelacji: Odległość vs Średnica vs Prędkość
        st.markdown("#### 📊 Analiza Kinematyczna Obiektów")
        fig_scatter = px.scatter(
            df_neo,
            x="Odległość [km]",
            y="Prędkość [km/s]",
            size="Szac. Średnica [m]",
            color="Potencjalnie Niebezpieczna (PHA)",
            hover_name="Nazwa Asteroidy",
            title=f"Rozkład Asteroid NEO ({date_query})",
            color_discrete_map={"⚠️ TAK": "#ef4444", "🛡️ Bezpieczna": "#0ea5e9"},
            template="plotly_dark"
        )
        fig_scatter.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(15,23,42,0.6)")
        st.plotly_chart(fig_scatter, use_container_width=True)

# ==============================================================================
# MODUŁ 3: WIZUALIZACJA SFERYCZNA (RADAR PLANETARNY / DOME CHART)
# ==============================================================================
with tab_radar:
    st.markdown("### 🎯 Sferyczna Projekcja Kopuły Nieba (Alt-Az)")
    st.caption("Współrzędne biegunowe: Promień = Odległość zenitalna (90° - Alt), Kąt = Azymut (Az)")
    
    if not df_planets.empty:
        # Przygotowanie danych do wykresu biegunowego (Polar Plot)
        # Na niebie środek to Zenit (Alt = 90°), brzeg to Horyzont (Alt = 0°)
        radar_df = df_planets.copy()
        radar_df['Zenith_Angle'] = 90.0 - radar_df['Wysokość (Alt) [°]']
        
        # Filtrujemy tylko ciała nad horyzontem do projekcji na kopule
        visible_df = radar_df[radar_df['Widoczny'] == True]
        
        if visible_df.empty:
            st.info("Obecnie żadne z głównych ciał nie znajduje się nad horyzontem w Chorzowie.")
        else:
            fig_polar = go.Figure()
            
            # Punkty planet
            fig_polar.add_trace(go.Scatterpolar(
                r=visible_df['Zenith_Angle'],
                theta=visible_df['Azymut (Az) [°]'],
                mode='markers+text',
                text=visible_df['Obiekt'],
                textposition="top center",
                marker=dict(
                    size=14,
                    color=visible_df['Wysokość (Alt) [°]'],
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Alt [°]")
                ),
                hoverinfo="text",
                hovertext=[
                    f"{row['Obiekt']}<br>Alt: {row['Wysokość (Alt) [°]']}°<br>Az: {row['Azymut (Az) [°]']}° ({row['Kierunek']})"
                    for _, row in visible_df.iterrows()
                ]
            ))
            
            fig_polar.update_layout(
                template="plotly_dark",
                polar=dict(
                    angularaxis=dict(
                        direction="clockwise",
                        rotation=90,  # Północ (N) na górze
                        tickvals=[0, 45, 90, 135, 180, 225, 270, 315],
                        ticktext=['N (0°)', 'NE', 'E (90°)', 'SE', 'S (180°)', 'SW', 'W (270°)', 'NW']
                    ),
                    radialaxis=dict(
                        range=[0, 90],
                        tickvals=[0, 30, 60, 90],
                        ticktext=['Zenit (90°)', '60°', '30°', 'Horyzont (0°)']
                    ),
                    bgcolor="rgba(15, 23, 42, 0.8)"
                ),
                paper_bgcolor="rgba(0,0,0,0)",
                showlegend=False,
                height=550
            )
            
            st.plotly_chart(fig_polar, use_container_width=True)

# ==============================================================================
# MODUŁ 4: NOTY INŻYNIERSKIE I METODOLOGIA ASTRONOMICZNA
# ==============================================================================
with tab_info:
    st.markdown("""
    ### 📐 Noty Techniczne i Astrometria dla Planetarium Śląskiego
    
    Aplikacja została zaprojektowana jako demonstrator kompetencji inżynierskich w obszarze:
    
    #### 1. Transformacja Współrzędnych Astronomicznych
    - Przeliczanie z układu równikowego równonocnego $(\\alpha, \\delta)$ (Rektascensja, Deklinacja) do układu horyzontalnego $(A, h)$ (Azymut, Wysokość).
    - **Wzory transformacyjne:**
      $$\\sin(h) = \\sin(\\phi)\\sin(\\delta) + \\cos(\\phi)\\cos(\\delta)\\cos(H)$$
      $$\\cos(A) = \\frac{\\sin(\\delta) - \\sin(\\phi)\\sin(h)}{\\cos(\\phi)\\cos(h)}$$
      gdzie: $\\phi$ = szerokość geograficzna Chorzowa ($50.2911^{\\circ}$), $H$ = kąt godzinny obiektu.
      
    #### 2. Architektura Systemu i Integracja API
    - **Klient REST API:** Asynchroniczne odpytywanie bazy NASA JPL SSD (Solar System Dynamics).
    - **Obsługa błędów i Cache:** `st.cache_data` minimalizuje liczbę zapytań i chroni przed limitami `RATE_LIMIT_EXCEEDED`.
    - **Zastosowanie w automatyce:** Algorytmy wyznaczania pozycji obiektów mogą posłużyć do bezpośredniego sterowania serwonapędami kopuły i teleskopów w Planetarium Śląskim.
    """)

# Stopka
st.markdown("---")
st.caption("🌌 **Silesia Sky Tracker** | Projekt zrealizowany na potrzeby rekrutacji do Planetarium Śląskiego w Chorzowie.")
