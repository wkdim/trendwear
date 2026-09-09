import { useState } from "react";

// Note: there's no backend /api/contact endpoint yet, so this only
// validates client-side and confirms locally. Wiring a real send (the
// backend already has unused nodemailer/EMAIL_* config for this) is a
// follow-up, not part of this pass.
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-5">
      <h2 className="text-center text-warning mb-4">Contact Us</h2>
      {sent && (
        <div className="alert alert-success" role="alert">
          Thanks {form.name || "there"}! We'll get back to you soon.
        </div>
      )}
      <form className="bg-dark text-light p-4 rounded border border-warning" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            name="message"
            className="form-control"
            rows="5"
            placeholder="Write your message..."
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-warning w-100">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;
