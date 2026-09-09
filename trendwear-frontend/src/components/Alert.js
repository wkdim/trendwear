// A dismissable Bootstrap alert used in place of window.alert() so errors
// and confirmations render inline instead of blocking a native popup.
function Alert({ variant = "danger", children, onClose }) {
  if (!children) return null;

  return (
    <div className={`alert alert-${variant} alert-dismissible`} role="alert">
      {children}
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
}

export default Alert;
