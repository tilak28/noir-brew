"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const menuItems = [
  { name: "Midnight Cortado", note: "Double ristretto · smoked vanilla · oat", price: "$7" },
  { name: "Noir Cloud", note: "Cold brew · black sesame · cream", price: "$8" },
  { name: "Velvet Mocha", note: "70% cacao · espresso · sea salt", price: "$8" },
  { name: "After Hours", note: "Espresso · tonic · charred orange", price: "$7" },
];

const suggestions = ["What should I try?", "Do you have oat milk?", "When are you open?"];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? "mark mark-small" : "mark"} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 32.5V14l28 20V15.5" />
      <path d="M10 14l28 20" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" /></svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15a4 4 0 0 1-4 4H8l-5 2 1.4-4.2A7.8 7.8 0 0 1 4 14V9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Good evening. I’m Noir, your café concierge. Looking for a drink recommendation or planning a visit?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!response.ok || !response.body) throw new Error("Unable to connect");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: full }]);
      }
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "The line went quiet for a moment. Please try again, or call us at (212) 555-0147." }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <header className="site-header">
          <a href="#home" className="brand" aria-label="Noir Brew home">
            <Mark />
            <span>NOIR—BREW</span>
          </a>
          <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
            <a href="#menu" onClick={closeMenu}>Menu</a>
            <a href="#story" onClick={closeMenu}>Our story</a>
            <a href="#visit" onClick={closeMenu}>Visit</a>
          </nav>
          <button className="nav-chat" onClick={() => setChatOpen(true)}>
            Ask Noir <span><ArrowIcon /></span>
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span /><span />
          </button>
        </header>

        <div className="hero-copy">
          <p className="eyebrow"><span /> Crafted after dark</p>
          <h1>Coffee with<br /><em>character.</em></h1>
          <p className="hero-description">Small-batch coffee, slow evenings, and a room designed for lingering. Welcome to your new nightly ritual.</p>
          <div className="hero-actions">
            <a href="#menu" className="button button-light">Explore the menu <ArrowIcon /></a>
            <button className="text-link" onClick={() => setChatOpen(true)}>Ask our concierge <span>↗</span></button>
          </div>
        </div>

        <div className="hero-meta">
          <div><span>Find us</span><p>47 Mercer Street<br />New York, NY</p></div>
          <div><span>Tonight</span><p>Open until 12 AM</p></div>
        </div>
        <a className="scroll-cue" href="#menu" aria-label="Scroll to menu"><span>Scroll</span><i /></a>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow dark"><span /> The evening edit</p>
          <h2>Dark roasts.<br /><em>Bright ideas.</em></h2>
          <p>Our signature drinks are built for unhurried conversations and late-night inspiration.</p>
        </div>
        <div className="menu-list">
          {menuItems.map((item, index) => (
            <article className="menu-item" key={item.name}>
              <span className="item-number">0{index + 1}</span>
              <div><h3>{item.name}</h3><p>{item.note}</p></div>
              <strong>{item.price}</strong>
            </article>
          ))}
          <button className="button button-dark" onClick={() => setChatOpen(true)}>Find your drink <ArrowIcon /></button>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-panel">
          <p className="eyebrow"><span /> Since the late hours</p>
          <h2>A café for the<br /><em>in-between.</em></h2>
          <p>Noir-Brew began with a simple thought: the best conversations rarely happen in a hurry. We roast in small batches, pour with care, and stay open late.</p>
          <a href="#visit" className="text-link light">Our corner of Mercer <span>↗</span></a>
        </div>
        <div className="story-quote"><span>“</span><p>Come for the coffee.<br />Stay for what unfolds.</p></div>
      </section>

      <section className="visit-section" id="visit">
        <div>
          <p className="eyebrow dark"><span /> Make it a ritual</p>
          <h2>Meet us<br /><em>after dark.</em></h2>
        </div>
        <div className="visit-details">
          <div><span>Address</span><p>47 Mercer Street<br />New York, NY 10013</p></div>
          <div><span>Hours</span><p>Mon–Thu&nbsp; 7 AM – 11 PM<br />Fri–Sun&nbsp; 7 AM – 12 AM</p></div>
          <a className="button button-dark" href="https://maps.google.com/?q=47+Mercer+Street+New+York" target="_blank" rel="noreferrer">Get directions <ArrowIcon /></a>
        </div>
      </section>

      <footer>
        <a href="#home" className="brand"><Mark /><span>NOIR—BREW</span></a>
        <p>Small batch. Open late. Always considered.</p>
        <span>© 2026 Noir-Brew</span>
      </footer>

      <button className={chatOpen ? "chat-launcher is-open" : "chat-launcher"} onClick={() => setChatOpen(!chatOpen)} aria-label={chatOpen ? "Close concierge" : "Open concierge"}>
        {chatOpen ? <span className="close-icon">×</span> : <><ChatIcon /><span>Ask Noir</span></>}
      </button>

      <aside className={chatOpen ? "chat-panel open" : "chat-panel"} aria-hidden={!chatOpen} aria-label="Noir café concierge">
        <div className="chat-header">
          <div className="chat-avatar"><Mark small /></div>
          <div><strong>Noir</strong><span><i /> Café concierge</span></div>
          <button onClick={() => setChatOpen(false)} aria-label="Close chat">×</button>
        </div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === "assistant" && <div className="mini-avatar"><Mark small /></div>}
              <p>{message.content || <span className="typing"><i /><i /><i /></span>}</p>
            </div>
          ))}
          {messages.length === 1 && <div className="suggestions">{suggestions.map(s => <button key={s} onClick={() => void sendMessage(s)}>{s}</button>)}</div>}
          <div ref={endRef} />
        </div>
        <form className="chat-input" onSubmit={onSubmit}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about coffee, hours, or your visit…" disabled={loading} aria-label="Message Noir" />
          <button type="submit" disabled={!input.trim() || loading} aria-label="Send message"><ArrowIcon /></button>
        </form>
        <p className="chat-note">Powered by AI · Responses may vary</p>
      </aside>
    </main>
  );
}
