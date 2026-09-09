function Spinner({ label = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-warning">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="mt-2 mb-0">{label}</p>
    </div>
  );
}

export default Spinner;
