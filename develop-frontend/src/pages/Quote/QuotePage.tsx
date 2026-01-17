import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./QuotePage.css";

interface Quote {
  text: string;
  date: string;
  user: string;
}

export default function QuotePage() {
  const [text, setText] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const currentUser =
    localStorage.getItem("currentUser") || "Anonymous";

  useEffect(() => {
    const storedQuotes = JSON.parse(
      localStorage.getItem("quotes") || "[]"
    );
    setQuotes(storedQuotes);
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;

    const newQuote: Quote = {
      text,
      date: new Date().toISOString(),
      user: currentUser,
    };

    const updatedQuotes = [newQuote, ...quotes];
    setQuotes(updatedQuotes);
    localStorage.setItem("quotes", JSON.stringify(updatedQuotes));

    setText("");
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <motion.div
      className="quote-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="quote-title">Client Reviews</h1>

      {/* FORM */}
      <div className="quote-form">
        <textarea
          className="quote-textarea"
          placeholder="Share your experience..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="quote-button" onClick={handleSubmit}>
          Submit Review
        </button>

        {submitted && (
          <p className="quote-success">
            Review submitted successfully
          </p>
        )}
      </div>

      {/* LIST */}
      {quotes.length > 0 && (
        <div className="quote-list">
          {quotes.map((q, index) => (
            <motion.div
              key={index}
              className="quote-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <p className="quote-text">“{q.text}”</p>

              <div className="quote-meta">
                <span>{q.user}</span>
                <span>
                  {new Date(q.date).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
