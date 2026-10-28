import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const tokenConfig = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem('agritechToken')}` },
})

const pestWatchlist = [
  {
    title: 'Aphids and whiteflies',
    crops: 'Vegetables, cotton, pulses',
    signs: 'Clusters of small insects, curled leaves, sticky honeydew, or yellowing.',
    action: 'Inspect the underside of leaves, remove badly affected growth, and ask a local extension worker before applying a treatment.',
  },
  {
    title: 'Fall armyworm',
    crops: 'Maize and other cereals',
    signs: 'Window-like leaf damage, fresh frass, or caterpillars deep in the plant whorl.',
    action: 'Check whorls regularly, remove visible larvae where practical, and use locally approved controls only when confirmed.',
  },
  {
    title: 'Fruit borers',
    crops: 'Tomato, okra, pulses',
    signs: 'Small holes in fruit or pods, often with frass near the entry point.',
    action: 'Remove and safely dispose of affected fruit, monitor plants frequently, and seek crop-specific local advice.',
  },
]

const soilGuidance = {
  alluvial: 'Often fertile and suitable for many crops. Keep nutrients balanced and watch drainage near waterways.',
  black: 'Often holds moisture well. Avoid working very wet soil and plan drainage during heavy rain.',
  red: 'Can drain quickly and may need organic matter and soil-test-based nutrient planning.',
  laterite: 'Can be acidic and low in some nutrients. Use a soil test before choosing amendments or crops.',
  sandy: 'Drains quickly and may need more frequent irrigation and organic matter to improve water retention.',
  clay: 'Can hold water and nutrients. Avoid compaction and check drainage before planting sensitive crops.',
}

const weatherDescription = (code) => {
  if (code === 0) return 'Clear sky'
  if ([1, 2].includes(code)) return 'Mostly clear'
  if (code === 3) return 'Cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain showers'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Weather conditions'
}

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  : 'Not specified'

const formatPrice = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value) || 0)

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)

  const [farms, setFarms] = useState([])
  const [showFarmForm, setShowFarmForm] = useState(false)
  const [editingFarmId, setEditingFarmId] = useState('')
  const [farmName, setFarmName] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [landArea, setLandArea] = useState('')
  const [soilType, setSoilType] = useState('')
  const [farmMessage, setFarmMessage] = useState('')
  const [farmLoading, setFarmLoading] = useState(false)

  const [crops, setCrops] = useState([])
  const [showCropForm, setShowCropForm] = useState(false)
  const [cropFarm, setCropFarm] = useState('')
  const [cropName, setCropName] = useState('')
  const [cropVariety, setCropVariety] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [cropStatus, setCropStatus] = useState('Planned')
  const [cropMessage, setCropMessage] = useState('')
  const [cropLoading, setCropLoading] = useState(false)

  const [weatherLocation, setWeatherLocation] = useState('')
  const [weather, setWeather] = useState(null)
  const [weatherMessage, setWeatherMessage] = useState('')
  const [weatherLoading, setWeatherLoading] = useState(false)

  const [products, setProducts] = useState([])
  const [productMessage, setProductMessage] = useState('')
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState('')
  const [productForm, setProductForm] = useState({ name: '', description: '', category: 'Seeds', price: '', quantity: '' })
  const [bookings, setBookings] = useState([])
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [resourceBooking, setResourceBooking] = useState({ productId: '', quantity: 1, bookingDate: '' })
  const [consultation, setConsultation] = useState({ expertName: '', topic: '', bookingDate: '' })

  const [adminStats, setAdminStats] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminMessage, setAdminMessage] = useState('')

  useEffect(() => {
    axios.get(`${API}/products`)
      .then((response) => setProducts(response.data))
      .catch(() => setProductMessage('Could not load the marketplace.'))

    const token = sessionStorage.getItem('agritechToken')
    if (token) {
      axios.get(`${API}/users/me`, tokenConfig())
        .then(async (response) => {
          setLoggedInUser(response.data.user)
          const results = await Promise.allSettled([
            axios.get(`${API}/farms`, tokenConfig()),
            axios.get(`${API}/crops`, tokenConfig()),
            axios.get(`${API}/bookings`, tokenConfig()),
          ])
          if (results[0].status === 'fulfilled') {
            setFarms(results[0].value.data)
            if (results[0].value.data[0]) setWeatherLocation(results[0].value.data[0].location)
          }
          if (results[1].status === 'fulfilled') setCrops(results[1].value.data)
          if (results[2].status === 'fulfilled') setBookings(results[2].value.data)
          if (response.data.user.role === 'admin') {
            const adminResults = await Promise.allSettled([
              axios.get(`${API}/admin/stats`, tokenConfig()),
              axios.get(`${API}/admin/users`, tokenConfig()),
              axios.get(`${API}/admin/bookings`, tokenConfig()),
            ])
            if (adminResults[0].status === 'fulfilled') setAdminStats(adminResults[0].value.data.stats)
            if (adminResults[1].status === 'fulfilled') setAdminUsers(adminResults[1].value.data)
            if (adminResults[2].status === 'fulfilled') setBookings(adminResults[2].value.data)
          }
        })
        .catch(() => sessionStorage.removeItem('agritechToken'))
    }
  }, [])

  const loadFarms = async () => {
    const token = sessionStorage.getItem('agritechToken')
    if (!token) return setFarms([])
    try {
      const response = await axios.get(`${API}/farms`, tokenConfig())
      setFarms(response.data)
      if (response.data[0]) setWeatherLocation((current) => current || response.data[0].location)
    } catch (error) {
      setFarmMessage(error.response?.data?.message || 'Could not load your farms.')
    }
  }

  const loadCrops = async () => {
    const token = sessionStorage.getItem('agritechToken')
    if (!token) return setCrops([])
    try {
      const response = await axios.get(`${API}/crops`, tokenConfig())
      setCrops(response.data)
    } catch (error) {
      setCropMessage(error.response?.data?.message || 'Could not load your crops.')
    }
  }

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`)
      setProducts(response.data)
    } catch (error) {
      setProductMessage(error.response?.data?.message || 'Could not load the marketplace.')
    }
  }

  const loadBookings = async () => {
    if (!sessionStorage.getItem('agritechToken')) return setBookings([])
    try {
      const response = await axios.get(`${API}/bookings`, tokenConfig())
      setBookings(response.data)
    } catch (error) {
      setBookingMessage(error.response?.data?.message || 'Could not load your booking requests.')
    }
  }

  const handleAuth = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)
    try {
      const endpoint = isRegister ? '/register' : '/login'
      const response = await axios.post(`${API}/users${endpoint}`, {
        ...(isRegister && { name }), email, password,
      })
      sessionStorage.setItem('agritechToken', response.data.token)
      setLoggedInUser(response.data.user)
      setMessage(response.data.message)
      setName('')
      setEmail('')
      setPassword('')
      await Promise.all([loadFarms(), loadCrops(), loadBookings(), loadProducts()])
      if (response.data.user.role === 'admin') {
        const [statsResponse, usersResponse, bookingsResponse] = await Promise.all([
          axios.get(`${API}/admin/stats`, tokenConfig()),
          axios.get(`${API}/admin/users`, tokenConfig()),
          axios.get(`${API}/admin/bookings`, tokenConfig()),
        ])
        setAdminStats(statsResponse.data.stats)
        setAdminUsers(usersResponse.data)
        setBookings(bookingsResponse.data)
      }
      setTimeout(() => { setShowLogin(false); setMessage('') }, 800)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not connect to the server. Check that the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const openAuth = (registerMode = false) => {
    setIsRegister(registerMode)
    setMessage('')
    setShowLogin(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('agritechToken')
    setLoggedInUser(null)
    setFarms([])
    setCrops([])
    setBookings([])
    setAdminStats(null)
    setAdminUsers([])
    setFarmMessage('')
    setCropMessage('')
    setBookingMessage('')
  }

  const resetFarmForm = () => {
    setShowFarmForm(false)
    setEditingFarmId('')
    setFarmName('')
    setFarmLocation('')
    setLandArea('')
    setSoilType('')
  }

  const handleFarmSubmit = async (event) => {
    event.preventDefault()
    setFarmMessage('')
    setFarmLoading(true)
    const payload = {
      farmName,
      location: farmLocation,
      landArea: landArea === '' ? 0 : Number(landArea),
      soilType,
    }
    try {
      const response = editingFarmId
        ? await axios.patch(`${API}/farms/${editingFarmId}`, payload, tokenConfig())
        : await axios.post(`${API}/farms`, payload, tokenConfig())
      setFarmMessage(response.data.message)
      resetFarmForm()
      await loadFarms()
    } catch (error) {
      setFarmMessage(error.response?.data?.message || 'Could not save farm.')
    } finally {
      setFarmLoading(false)
    }
  }

  const startFarmEdit = (farm) => {
    setEditingFarmId(farm._id)
    setFarmName(farm.farmName)
    setFarmLocation(farm.location)
    setLandArea(String(farm.landArea ?? ''))
    setSoilType(farm.soilType || '')
    setShowFarmForm(true)
    setFarmMessage('')
    document.querySelector('#farm-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const deleteFarm = async (farm) => {
    if (!window.confirm(`Delete ${farm.farmName} and all crop records linked to it?`)) return
    try {
      await axios.delete(`${API}/farms/${farm._id}`, tokenConfig())
      setFarmMessage('Farm deleted.')
      await Promise.all([loadFarms(), loadCrops()])
    } catch (error) {
      setFarmMessage(error.response?.data?.message || 'Could not delete farm.')
    }
  }

  const handleAddCrop = async (event) => {
    event.preventDefault()
    setCropMessage('')
    setCropLoading(true)
    try {
      const response = await axios.post(`${API}/crops`, {
        farm: cropFarm, cropName, variety: cropVariety, plantingDate, status: cropStatus,
      }, tokenConfig())
      setCrops((current) => [response.data.crop, ...current])
      setCropFarm('')
      setCropName('')
      setCropVariety('')
      setPlantingDate('')
      setCropStatus('Planned')
      setShowCropForm(false)
      setCropMessage('Crop saved successfully! 🌱')
    } catch (error) {
      setCropMessage(error.response?.data?.message || 'Could not save crop.')
    } finally {
      setCropLoading(false)
    }
  }

  const updateCrop = async (cropId, updates) => {
    setCropMessage('')
    try {
      const response = await axios.patch(`${API}/crops/${cropId}`, updates, tokenConfig())
      setCrops((current) => current.map((crop) => crop._id === cropId ? response.data.crop : crop))
      setCropMessage('Crop progress updated.')
    } catch (error) {
      setCropMessage(error.response?.data?.message || 'Could not update crop.')
    }
  }

  const deleteCrop = async (crop) => {
    if (!window.confirm(`Delete the ${crop.cropName} crop record?`)) return
    try {
      await axios.delete(`${API}/crops/${crop._id}`, tokenConfig())
      setCrops((current) => current.filter((item) => item._id !== crop._id))
      setCropMessage('Crop deleted.')
    } catch (error) {
      setCropMessage(error.response?.data?.message || 'Could not delete crop.')
    }
  }

  const getWeather = async (event) => {
    event.preventDefault()
    setWeatherMessage('')
    setWeatherLoading(true)
    try {
      const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: weatherLocation, count: 1, language: 'en', format: 'json' },
      })
      const place = geo.data.results?.[0]
      if (!place) throw new Error('No matching location found. Try adding a town or state.')
      const forecast = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: place.latitude,
          longitude: place.longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          forecast_days: 5,
          timezone: 'auto',
          temperature_unit: 'celsius',
          wind_speed_unit: 'kmh',
        },
      })
      setWeather({ place, data: forecast.data })
    } catch (error) {
      setWeather(null)
      setWeatherMessage(error.response?.data?.reason || error.message || 'Could not load weather. Try again.')
    } finally {
      setWeatherLoading(false)
    }
  }

  const submitBooking = async (event, type) => {
    event.preventDefault()
    setBookingMessage('')
    setBookingLoading(true)
    try {
      const payload = type === 'resource'
        ? { bookingType: 'resource', productId: resourceBooking.productId, quantity: Number(resourceBooking.quantity), bookingDate: resourceBooking.bookingDate }
        : { bookingType: 'consultation', ...consultation }
      const response = await axios.post(`${API}/bookings`, payload, tokenConfig())
      setBookings((current) => [response.data.booking, ...current])
      setBookingMessage(response.data.message)
      if (type === 'resource') setResourceBooking({ productId: '', quantity: 1, bookingDate: '' })
      else setConsultation({ expertName: '', topic: '', bookingDate: '' })
    } catch (error) {
      setBookingMessage(error.response?.data?.message || 'Could not send the booking request.')
    } finally {
      setBookingLoading(false)
    }
  }

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', category: 'Seeds', price: '', quantity: '' })
    setEditingProductId('')
    setProductFormOpen(false)
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    setProductMessage('')
    try {
      const response = editingProductId
        ? await axios.patch(`${API}/products/${editingProductId}`, productForm, tokenConfig())
        : await axios.post(`${API}/products`, productForm, tokenConfig())
      setProductMessage(response.data.message)
      resetProductForm()
      await loadProducts()
    } catch (error) {
      setProductMessage(error.response?.data?.message || 'Could not save product.')
    }
  }

  const startProductEdit = (product) => {
    setEditingProductId(product._id)
    setProductForm({
      name: product.name, description: product.description || '', category: product.category,
      price: String(product.price), quantity: String(product.quantity),
    })
    setProductFormOpen(true)
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remove ${product.name} from the marketplace?`)) return
    try {
      const response = await axios.delete(`${API}/products/${product._id}`, tokenConfig())
      setProductMessage(response.data.message)
      await loadProducts()
    } catch (error) {
      setProductMessage(error.response?.data?.message || 'Could not remove product.')
    }
  }

  const changeRole = async (userId, role) => {
    try {
      const response = await axios.patch(`${API}/admin/users/${userId}/role`, { role }, tokenConfig())
      setAdminUsers((current) => current.map((user) => user._id === userId ? { ...user, role: response.data.user.role } : user))
      setAdminMessage(response.data.message)
    } catch (error) {
      setAdminMessage(error.response?.data?.message || 'Could not change user role.')
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const response = await axios.patch(`${API}/admin/bookings/${bookingId}/status`, { status }, tokenConfig())
      setBookings((current) => current.map((booking) => booking._id === bookingId ? response.data.booking : booking))
    } catch (error) {
      setAdminMessage(error.response?.data?.message || 'Could not update booking status.')
    }
  }

  const soilSummary = farms.length
    ? [...new Set(farms.map((farm) => farm.soilType).filter(Boolean))]
    : []

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">🌱 AgriTech</a>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#my-farms">My Farms</a>
          <a href="#my-crops">My Crops</a>
          <a href="#weather">Weather & Soil</a>
          <a href="#alerts">Pest Alerts</a>
          <a href="#market">Market</a>
        </nav>
        {loggedInUser ? (
          <div className="account-actions">
            <span>Hi, {loggedInUser.name}</span>
            {loggedInUser.role === 'admin' && <a className="admin-link" href="#admin">Admin</a>}
            <button className="login" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="login" onClick={() => openAuth(false)}>Login / Register</button>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-text">
            <p className="tag">SMART FARMING • BETTER FUTURE</p>
            <h1>Grow Smarter.<br />Harvest Better.</h1>
            <p>Manage your farms and crops, check local weather, and find useful resources for your growing season.</p>
            <a className="primary-btn" href="#my-farms">Explore Your Farm →</a>
          </div>
          <div className="hero-icon" aria-hidden="true">🌾</div>
        </section>

        <section className="dashboard" aria-labelledby="dashboard-heading">
          <h2 id="dashboard-heading">Your Farming Dashboard</h2>
          <p className="subtitle">Tools and information to help you manage your farm.</p>
          <div className="cards">
            <article className="card"><span className="card-icon">🌱</span><h3>Crop Monitoring</h3><p>Track crops and update their progress.</p><a href="#my-crops">View crops →</a></article>
            <article className="card"><span className="card-icon">🌤️</span><h3>Weather & Soil</h3><p>Check a local forecast and read soil guidance.</p><a href="#weather">Check conditions →</a></article>
            <article className="card"><span className="card-icon">🛒</span><h3>Farm Marketplace</h3><p>Explore seeds, fertilizer and farming supplies.</p><a href="#market">Explore products →</a></article>
            <article className="card"><span className="card-icon">🐛</span><h3>Pest Watch</h3><p>Review common signs and prevention guidance.</p><a href="#alerts">View pest guidance →</a></article>
          </div>
        </section>

        <section className="dashboard farms-section" id="my-farms">
          <h2>🚜 My Farms</h2>
          <p className="subtitle">Manage your farm locations, land area and soil details.</p>
          {loggedInUser ? <>
            <button className="login-submit section-action" onClick={() => { if (showFarmForm) resetFarmForm(); else setShowFarmForm(true); setFarmMessage('') }}>{showFarmForm ? 'Cancel' : '+ Add New Farm'}</button>
            {showFarmForm && <form id="farm-form" className="farm-form" onSubmit={handleFarmSubmit}>
              <h3>{editingFarmId ? 'Edit Farm' : 'Add a Farm'}</h3>
              <input placeholder="Farm Name" value={farmName} onChange={(event) => setFarmName(event.target.value)} required />
              <input placeholder="Farm Location" value={farmLocation} onChange={(event) => setFarmLocation(event.target.value)} required />
              <input type="number" placeholder="Land Area (acres)" value={landArea} onChange={(event) => setLandArea(event.target.value)} min="0" step="any" />
              <select value={soilType} onChange={(event) => setSoilType(event.target.value)}>
                <option value="">Select Soil Type</option><option>Alluvial</option><option>Black</option><option>Red</option><option>Laterite</option><option>Sandy</option><option>Clay</option><option>Other</option>
              </select>
              <button className="login-submit" disabled={farmLoading}>{farmLoading ? 'Saving…' : editingFarmId ? 'Update Farm' : 'Save Farm'}</button>
            </form>}
            {farmMessage && <p className="status-message" role="status">{farmMessage}</p>}
            <div className="cards record-grid">
              {farms.map((farm) => <article className="card record-card" key={farm._id}>
                <span className="card-icon">🌾</span><h3>{farm.farmName}</h3>
                <p>📍 {farm.location}</p><p>📐 {farm.landArea ?? 0} acres</p><p>🌱 {farm.soilType || 'Soil type not specified'}</p>
                <div className="inline-actions"><button className="small-button" onClick={() => startFarmEdit(farm)}>Edit</button><button className="small-button danger-button" onClick={() => deleteFarm(farm)}>Delete</button></div>
              </article>)}
            </div>
            {!farms.length && !showFarmForm && <p className="empty-state">No farms added yet.</p>}
          </> : <p className="empty-state">Please log in to add and view your farms.</p>}
        </section>

        <section className="dashboard farms-section" id="my-crops">
          <h2>🌱 My Crops</h2><p className="subtitle">Add crop records and update their growing progress.</p>
          {loggedInUser ? <>
            {farms.length ? <button className="login-submit section-action" onClick={() => { setShowCropForm((value) => !value); setCropMessage('') }}>{showCropForm ? 'Cancel' : '+ Add New Crop'}</button> : <p className="empty-state">Add a farm before adding its crops.</p>}
            {showCropForm && farms.length > 0 && <form className="farm-form" onSubmit={handleAddCrop}>
              <h3>Add a Crop</h3>
              <select value={cropFarm} onChange={(event) => setCropFarm(event.target.value)} required><option value="">Select Farm</option>{farms.map((farm) => <option key={farm._id} value={farm._id}>{farm.farmName}</option>)}</select>
              <input placeholder="Crop Name" value={cropName} onChange={(event) => setCropName(event.target.value)} required />
              <input placeholder="Variety (optional)" value={cropVariety} onChange={(event) => setCropVariety(event.target.value)} />
              <label className="field-label">Planting Date<input type="date" value={plantingDate} onChange={(event) => setPlantingDate(event.target.value)} required /></label>
              <select value={cropStatus} onChange={(event) => setCropStatus(event.target.value)}><option>Planned</option><option>Growing</option><option>Harvested</option></select>
              <button className="login-submit" disabled={cropLoading}>{cropLoading ? 'Saving…' : 'Save Crop'}</button>
            </form>}
            {cropMessage && <p className="status-message" role="status">{cropMessage}</p>}
            <div className="cards record-grid">
              {crops.map((crop) => <article className="card record-card" key={crop._id}>
                <span className="card-icon">🌱</span><h3>{crop.cropName}</h3>
                <p>🚜 Farm: {crop.farm?.farmName || 'Farm'}</p><p>🌾 Variety: {crop.variety || 'Not specified'}</p><p>📅 Planted: {formatDate(crop.plantingDate)}</p>
                <label className="field-label">Progress status<select value={crop.status} onChange={(event) => updateCrop(crop._id, { status: event.target.value })}><option>Planned</option><option>Growing</option><option>Harvested</option></select></label>
                <button className="small-button danger-button" onClick={() => deleteCrop(crop)}>Delete crop</button>
              </article>)}
            </div>
            {!crops.length && farms.length > 0 && <p className="empty-state">No crops added yet.</p>}
          </> : <p className="empty-state">Please log in to add and view your crops.</p>}
        </section>

        <section className="dashboard" id="weather">
          <h2>🌦️ Weather & Soil</h2><p className="subtitle">Get a five-day forecast for a town or farm location, plus general soil guidance.</p>
          <form className="weather-form" onSubmit={getWeather}>
            <label className="field-label">Town, city or district<input value={weatherLocation} onChange={(event) => setWeatherLocation(event.target.value)} placeholder="e.g. Pune, Maharashtra" required /></label>
            <button className="login-submit" disabled={weatherLoading}>{weatherLoading ? 'Loading forecast…' : 'Get local forecast'}</button>
          </form>
          {weatherMessage && <p className="status-message" role="status">{weatherMessage}</p>}
          {weather && <div className="weather-panel">
            <div className="weather-current"><p className="eyebrow">CURRENT CONDITIONS · {weather.place.name}{weather.place.admin1 ? `, ${weather.place.admin1}` : ''}</p><strong>{Math.round(weather.data.current.temperature_2m)}°C</strong><span>{weatherDescription(weather.data.current.weather_code)}</span><p>Feels like {Math.round(weather.data.current.apparent_temperature)}°C · Humidity {weather.data.current.relative_humidity_2m}% · Wind {Math.round(weather.data.current.wind_speed_10m)} km/h</p></div>
            <div className="forecast-grid">{weather.data.daily.time.map((day, index) => <article className="forecast-day" key={day}><strong>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</strong><span>{weatherDescription(weather.data.daily.weather_code[index])}</span><b>{Math.round(weather.data.daily.temperature_2m_max[index])}° / {Math.round(weather.data.daily.temperature_2m_min[index])}°</b><small>Rain chance {weather.data.daily.precipitation_probability_max[index] ?? 0}%</small></article>)}</div>
            <p className="attribution">Forecast from Open-Meteo. Weather is guidance; check local advisories before making time-sensitive farm decisions.</p>
          </div>}
          <div className="soil-panel">
            <h3>Soil health guidance</h3>
            <p className="small-note">General information only. Soil tests provide farm-specific nutrient and pH results.</p>
            {loggedInUser && soilSummary.length ? <div className="soil-grid">{soilSummary.map((soil) => <article key={soil}><strong>{soil}</strong><p>{soilGuidance[soil.toLowerCase()] || 'Use a local soil test to understand pH, nutrients and crop suitability before making amendments.'}</p></article>)}</div> : <p className="empty-state">Log in and add soil types to your farms to see matching guidance.</p>}
          </div>
        </section>

        <section className="dashboard" id="alerts">
          <h2>🐛 Pest Alerts & Crop Guidance</h2><p className="subtitle">Common signs to watch for and practical prevention steps.</p>
          <div className="notice-box"><strong>General watchlist, not live regional alerts.</strong> Pest pressure varies by location and season. Confirm a diagnosis with a local agricultural extension service before applying any pesticide.</div>
          <div className="cards guidance-grid">{pestWatchlist.map((alert) => <article className="card guidance-card" key={alert.title}><span className="card-icon">🔎</span><h3>{alert.title}</h3><p><strong>Common on:</strong> {alert.crops}</p><p><strong>Look for:</strong> {alert.signs}</p><p><strong>What to do:</strong> {alert.action}</p></article>)}</div>
        </section>

        <section className="dashboard" id="market">
          <h2>🛒 Farm Marketplace</h2><p className="subtitle">Browse available farming supplies and send a reservation request.</p>
          {loggedInUser?.role === 'admin' && <button className="login-submit section-action" onClick={() => { setProductFormOpen((value) => !value); setEditingProductId('') }}>{productFormOpen ? 'Close product form' : '+ Add marketplace product'}</button>}
          {productFormOpen && loggedInUser?.role === 'admin' && <form className="farm-form" onSubmit={submitProduct}>
            <h3>{editingProductId ? 'Edit product' : 'Add product'}</h3>
            <input placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
            <textarea placeholder="Description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} rows="3" />
            <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}><option>Seeds</option><option>Fertilizer</option><option>Tools</option><option>Irrigation</option><option>Equipment</option><option>Other</option></select>
            <input type="number" min="0" step="0.01" placeholder="Price (₹)" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required />
            <input type="number" min="0" step="1" placeholder="Available quantity" value={productForm.quantity} onChange={(event) => setProductForm({ ...productForm, quantity: event.target.value })} required />
            <button className="login-submit">{editingProductId ? 'Update product' : 'Save product'}</button>
          </form>}
          {productMessage && <p className="status-message" role="status">{productMessage}</p>}
          {products.length ? <div className="cards product-grid">{products.map((product) => <article className="card product-card" key={product._id}><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description || 'Farm supply available for request.'}</p><strong>{formatPrice(product.price)}</strong><p>{product.quantity > 0 ? `${product.quantity} available` : 'Currently out of stock'}</p>{loggedInUser && <button className="small-button" disabled={product.quantity < 1} onClick={() => { setResourceBooking({ productId: product._id, quantity: 1, bookingDate: '' }); document.querySelector('#resource-booking')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}>Request product</button>}{loggedInUser?.role === 'admin' && <div className="inline-actions"><button className="small-button" onClick={() => startProductEdit(product)}>Edit</button><button className="small-button danger-button" onClick={() => deleteProduct(product)}>Remove</button></div>}</article>)}</div> : <p className="empty-state">No products are listed yet.{loggedInUser?.role === 'admin' ? ' Add the first product above.' : ' Check back later.'}</p>}
          {loggedInUser && <form id="resource-booking" className="farm-form booking-form" onSubmit={(event) => submitBooking(event, 'resource')}>
            <h3>Request a product reservation</h3>
            <select value={resourceBooking.productId} onChange={(event) => setResourceBooking({ ...resourceBooking, productId: event.target.value })} required><option value="">Select a product</option>{products.filter((product) => product.quantity > 0).map((product) => <option key={product._id} value={product._id}>{product.name} — {formatPrice(product.price)}</option>)}</select>
            <input type="number" min="1" max={products.find((product) => product._id === resourceBooking.productId)?.quantity || undefined} value={resourceBooking.quantity} onChange={(event) => setResourceBooking({ ...resourceBooking, quantity: event.target.value })} required />
            <label className="field-label">Requested date<input type="date" value={resourceBooking.bookingDate} onChange={(event) => setResourceBooking({ ...resourceBooking, bookingDate: event.target.value })} required /></label>
            <button className="login-submit" disabled={bookingLoading}>{bookingLoading ? 'Sending…' : 'Send reservation request'}</button>
          </form>}
        </section>

        <section className="dashboard" id="guidance">
          <h2>👩‍🌾 Expert Guidance</h2><p className="subtitle">Request an agricultural consultation and keep track of your booking requests.</p>
          {loggedInUser ? <>
            <form className="farm-form booking-form" onSubmit={(event) => submitBooking(event, 'consultation')}>
              <h3>Request a consultation</h3>
              <input placeholder="Expert or service name" value={consultation.expertName} onChange={(event) => setConsultation({ ...consultation, expertName: event.target.value })} required />
              <input placeholder="What do you need help with?" value={consultation.topic} onChange={(event) => setConsultation({ ...consultation, topic: event.target.value })} required />
              <label className="field-label">Preferred date<input type="date" value={consultation.bookingDate} onChange={(event) => setConsultation({ ...consultation, bookingDate: event.target.value })} required /></label>
              <button className="login-submit" disabled={bookingLoading}>{bookingLoading ? 'Sending…' : 'Request consultation'}</button>
            </form>
            {bookingMessage && <p className="status-message" role="status">{bookingMessage}</p>}
            <h3 className="subheading">Your booking requests</h3>
            {bookings.length ? <div className="booking-list">{bookings.map((booking) => <article key={booking._id} className="booking-row"><div><strong>{booking.bookingType === 'resource' ? booking.product?.name || 'Product request' : booking.expertName}</strong><p>{booking.bookingType === 'resource' ? `Quantity ${booking.quantity}` : booking.topic} · {formatDate(booking.bookingDate)}</p></div><span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span></article>)}</div> : <p className="empty-state">You have no booking requests yet.</p>}
          </> : <p className="empty-state">Log in to request a consultation or reserve a marketplace product.</p>}
        </section>

        {loggedInUser?.role === 'admin' && <section className="dashboard admin-section" id="admin">
          <h2>🛠️ Administrator Dashboard</h2><p className="subtitle">Manage marketplace listings, account roles and booking requests.</p>
          {adminMessage && <p className="status-message" role="status">{adminMessage}</p>}
          {adminStats && <div className="stats-grid">{Object.entries({ 'Users': adminStats.totalUsers, 'Farms': adminStats.totalFarms, 'Crops': adminStats.totalCrops, 'Products': adminStats.totalProducts, 'Bookings': adminStats.totalBookings }).map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>}
          <h3 className="subheading">User roles</h3>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change access</th></tr></thead><tbody>{adminUsers.map((user) => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td><select value={user.role} onChange={(event) => changeRole(user._id, event.target.value)}><option value="farmer">Farmer</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div>
          <h3 className="subheading">All booking requests</h3>
          <div className="booking-list">{bookings.map((booking) => <article key={booking._id} className="booking-row"><div><strong>{booking.bookingType === 'resource' ? booking.product?.name || 'Product request' : booking.expertName}</strong><p>{booking.farmer?.name || 'Farmer'} · {booking.bookingType === 'resource' ? `Quantity ${booking.quantity}` : booking.topic} · {formatDate(booking.bookingDate)}</p></div><select value={booking.status} onChange={(event) => changeBookingStatus(booking._id, event.target.value)}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></article>)}</div>
        </section>}

        <section className="help"><h2>Farming is easier when you have the right support.</h2><p>Technology for farmers. Opportunities for a better harvest.</p></section>
      </main>

      <footer>© 2026 AgriTech | Empowering Farmers Through Digital Technology</footer>

      {showLogin && <div className="modal-overlay" onClick={() => setShowLogin(false)}>
        <div className="login-modal" onClick={(event) => event.stopPropagation()}>
          <button className="close-modal" onClick={() => setShowLogin(false)} aria-label="Close login window">×</button>
          <h2>{isRegister ? 'Create Account' : 'Welcome Back!'}</h2>
          <p>{isRegister ? 'Join AgriTech and grow smarter.' : 'Login to your AgriTech account.'}</p>
          <form onSubmit={handleAuth}>
            {isRegister && <input type="text" placeholder="Full Name" value={name} onChange={(event) => setName(event.target.value)} required />}
            <input type="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input type="password" placeholder="Password (at least 8 characters)" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            {message && <p role="status" aria-live="polite">{message}</p>}
            <button className="login-submit" type="submit" disabled={isLoading}>{isLoading ? 'Please wait…' : isRegister ? 'Register' : 'Login'}</button>
          </form>
          <p className="switch-auth">{isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}<button type="button" onClick={() => { setIsRegister((value) => !value); setMessage('') }}>{isRegister ? 'Login' : 'Register'}</button></p>
        </div>
      </div>}
    </div>
  )
}

export default App
