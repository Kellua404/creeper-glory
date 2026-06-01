export default function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`relative z-10 ${className}`}>
      {children}
    </section>
  )
}
