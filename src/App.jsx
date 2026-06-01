import VoidCanvas from './components/VoidCanvas'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Legend from './components/Legend'
import Powers from './components/Powers'
import Glory from './components/Glory'
import ExplosionButton from './components/ExplosionButton'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="relative min-h-screen bg-night-900">
      <VoidCanvas />
      <Navbar />
      <main>
        <Hero />
        <Legend />
        <Powers />
        <Glory />
        <ExplosionButton />
      </main>
      <Footer />
    </div>
  )
}
