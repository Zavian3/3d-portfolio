export default function Loader({ progress, ready }) {
  return (
    <div className={`loader ${ready ? 'hide' : ''}`} aria-hidden={ready}>
      <div className="loader-inner">
        <p>Initializing neural field</p>
        <div className="bar">
          <span style={{ width: `${Math.min(100, Math.round(progress))}%` }} />
        </div>
      </div>
    </div>
  )
}
