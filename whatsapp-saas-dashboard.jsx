import { useState, useEffect, useRef } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CONTACTS = [
  { id: 1, name: "Ramesh Kumar", phone: "+91 98765 43210", tag: "Customer", status: "active", lastMsg: "Thank you for the order!", time: "10:32 AM", unread: 2, avatar: "R", business: "Kirana Store" },
  { id: 2, name: "Priya Sharma", phone: "+91 87654 32109", tag: "Lead", status: "active", lastMsg: "What are your timings?", time: "9:45 AM", unread: 1, avatar: "P", business: "Salon Client" },
  { id: 3, name: "Amit Patel", phone: "+91 76543 21098", tag: "VIP", status: "away", lastMsg: "Is the product available?", time: "Yesterday", unread: 0, avatar: "A", business: "Clinic Patient" },
  { id: 4, name: "Sunita Devi", phone: "+91 65432 10987", tag: "Customer", status: "active", lastMsg: "Please send the invoice", time: "Yesterday", unread: 0, avatar: "S", business: "Coaching Parent" },
  { id: 5, name: "Vikram Singh", phone: "+91 54321 09876", tag: "New", status: "offline", lastMsg: "Hello, I need help", time: "Mon", unread: 3, avatar: "V", business: "New Lead" },
  { id: 6, name: "Meena Joshi", phone: "+91 43210 98765", tag: "Customer", status: "active", lastMsg: "Order delivered! 👍", time: "Mon", unread: 0, avatar: "M", business: "Regular Customer" },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: "them", text: "Hello! I want to place an order", time: "10:20 AM", status: "read" },
    { id: 2, from: "bot", text: "🤖 Welcome to our store! I'm your automated assistant. How can I help you today?\n\n1️⃣ Place Order\n2️⃣ Track Order\n3️⃣ Speak to Agent\n4️⃣ Store Timings", time: "10:20 AM", status: "delivered" },
    { id: 3, from: "them", text: "1", time: "10:21 AM", status: "read" },
    { id: 4, from: "bot", text: "Great! Please share what you'd like to order and your delivery address 📦", time: "10:21 AM", status: "delivered" },
    { id: 5, from: "them", text: "5kg basmati rice, 2kg dal, 1L mustard oil. Deliver to Sector 14, Gurugram", time: "10:25 AM", status: "read" },
    { id: 6, from: "me", text: "Order received! ✅ Total: ₹850. We'll deliver by 6 PM today. Payment: UPI/Cash on delivery.", time: "10:28 AM", status: "read" },
    { id: 7, from: "them", text: "Thank you for the order!", time: "10:32 AM", status: "read" },
  ],
  2: [
    { id: 1, from: "them", text: "Hi, what are your timings?", time: "9:40 AM", status: "read" },
    { id: 2, from: "bot", text: "🤖 Hello Priya! Welcome to Glamour Salon 💇‍♀️\n\nOur timings: Mon-Sat 10AM - 8PM\nSunday: 11AM - 6PM\n\nBook appointment? Reply YES", time: "9:41 AM", status: "delivered" },
    { id: 3, from: "them", text: "What are your timings?", time: "9:45 AM", status: "read" },
  ],
  5: [
    { id: 1, from: "them", text: "Hello, I need help", time: "Mon 3PM", status: "read" },
    { id: 2, from: "them", text: "Anyone there?", time: "Mon 3:05PM", status: "read" },
    { id: 3, from: "them", text: "Please respond", time: "Mon 3:10PM", status: "read" },
  ],
};

const ANALYTICS = {
  totalMessages: 12847,
  messageGrowth: 23,
  activeConversations: 284,
  convGrowth: 12,
  autoResolved: 68,
  broadcastSent: 3420,
  broadcastOpen: 74,
  avgResponse: "1.2 min",
  responseGrowth: -18,
  totalContacts: 1847,
  newContacts: 134,
  revenue: "₹2,84,500",
};

const BROADCASTS = [
  { id: 1, name: "Diwali Sale Offer", sent: 1240, delivered: 1198, read: 891, replied: 156, status: "completed", date: "Oct 28", tag: "Promotion" },
  { id: 2, name: "New Stock Arrival", sent: 856, delivered: 834, read: 612, replied: 89, status: "completed", date: "Oct 25", tag: "Update" },
  { id: 3, name: "Appointment Reminder", sent: 324, delivered: 319, read: 290, replied: 45, status: "running", date: "Today", tag: "Reminder" },
  { id: 4, name: "Weekend Special Menu", sent: 0, delivered: 0, read: 0, replied: 0, status: "scheduled", date: "Nov 2", tag: "Promotion" },
];

const CHATBOT_FLOWS = [
  { id: 1, name: "Welcome Greeting", trigger: "Any new message", responses: 1284, active: true, type: "greeting" },
  { id: 2, name: "Order Status Check", trigger: "Keyword: order, track", responses: 456, active: true, type: "order" },
  { id: 3, name: "Appointment Booking", trigger: "Keyword: book, appointment", responses: 234, active: true, type: "booking" },
  { id: 4, name: "Business Hours", trigger: "Keyword: timing, hours, open", responses: 189, active: true, type: "info" },
  { id: 5, name: "Price Enquiry", trigger: "Keyword: price, cost, rate", responses: 167, active: false, type: "pricing" },
  { id: 6, name: "Human Handoff", trigger: "Keyword: agent, human, help", responses: 98, active: true, type: "handoff" },
];

const TEMPLATES = [
  { id: 1, name: "Order Confirmation", category: "Transactional", text: "✅ Hello {{name}}, your order #{{order_id}} has been confirmed! Total: ₹{{amount}}. Expected delivery: {{date}}.", status: "approved" },
  { id: 2, name: "Appointment Reminder", category: "Reminder", text: "⏰ Reminder: Your appointment at {{business}} is tomorrow at {{time}}. Reply CONFIRM or CANCEL.", status: "approved" },
  { id: 3, name: "Payment Due", category: "Transactional", text: "💳 Dear {{name}}, your payment of ₹{{amount}} is due on {{date}}. Pay via UPI: {{upi_id}}", status: "approved" },
  { id: 4, name: "Festival Offer", category: "Marketing", text: "🎉 Happy {{festival}}! Get {{discount}}% OFF on all products. Valid till {{date}}. Shop now: {{link}}", status: "pending" },
  { id: 5, name: "Feedback Request", category: "Engagement", text: "🌟 Hi {{name}}, how was your experience with us? Rate 1-5. Your feedback helps us improve!", status: "approved" },
];

const PLANS = [
  { id: "starter", name: "Starter", price: "₹999", period: "/month", color: "#10b981", contacts: "500 contacts", messages: "2,000 msgs/mo", features: ["1 WhatsApp Number", "Basic Chatbot", "5 Broadcast Lists", "Order Notifications", "Email Support"], popular: false },
  { id: "growth", name: "Growth", price: "₹2,499", period: "/month", color: "#6366f1", contacts: "2,500 contacts", messages: "10,000 msgs/mo", features: ["3 WhatsApp Numbers", "Advanced AI Chatbot", "Unlimited Broadcasts", "CRM Integration", "Analytics Dashboard", "Priority Support"], popular: true },
  { id: "pro", name: "Pro", price: "₹4,999", period: "/month", color: "#f59e0b", contacts: "Unlimited contacts", messages: "Unlimited msgs", features: ["10 WhatsApp Numbers", "Custom AI Training", "API Access", "White Label Option", "Dedicated Manager", "24/7 Phone Support"], popular: false },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
    broadcast: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
    bot: "M12 2a2 2 0 012 2c0 .74-.4 1.38-1 1.72V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.72c-.6-.34-1-.98-1-1.72a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
    analytics: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
    template: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z",
    crm: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    settings: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
    send: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
    tag: "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
    filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    refresh: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
    trending: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function WhatsAppSaaS() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedContact, setSelectedContact] = useState(MOCK_CONTACTS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES[1] || []);
  const [inputMsg, setInputMsg] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchContact, setSearchContact] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const msgEndRef = useRef(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function selectContact(c) {
    setSelectedContact(c);
    setMessages(MOCK_MESSAGES[c.id] || []);
  }

  function sendMessage() {
    if (!inputMsg.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: inputMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "sent" };
    setMessages((m) => [...m, newMsg]);
    setInputMsg("");
    // Simulate bot reply
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: "🤖 Message received! Our team will respond shortly. For instant help, type MENU.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "delivered" }]);
    }, 1200);
  }

  const filteredContacts = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.phone.includes(searchContact)
  );

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0" />
            </svg>
          </div>
          <div>
            <div style={s.logoName}>AvantikaChat</div>
            <div style={s.logoPlan}>Growth Plan</div>
          </div>
        </div>

        <nav style={s.nav}>
          {[
            { id: "dashboard", icon: "dashboard", label: "Dashboard" },
            { id: "inbox", icon: "chat", label: "Inbox" },
            { id: "broadcast", icon: "broadcast", label: "Broadcast" },
            { id: "chatbot", icon: "bot", label: "Chatbot" },
            { id: "templates", icon: "template", label: "Templates" },
            { id: "crm", icon: "crm", label: "CRM" },
            { id: "analytics", icon: "analytics", label: "Analytics" },
            { id: "pricing", icon: "tag", label: "Plans & Pricing" },
          ].map((item) => (
            <button key={item.id} style={{ ...s.navItem, ...(activeNav === item.id ? s.navActive : {}) }} onClick={() => setActiveNav(item.id)}>
              <Icon name={item.icon} size={18} />
              <span style={s.navLabel}>{item.label}</span>
              {item.id === "inbox" && <span style={s.navBadge}>6</span>}
            </button>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.agentStatus}>
            <div style={s.agentAvatar}>SK</div>
            <div>
              <div style={s.agentName}>Suresh Kumar</div>
              <div style={s.agentOnline}><span style={s.onlineDot} />Online</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={s.main}>

        {/* ─── DASHBOARD ─────────────────────────────────────────── */}
        {activeNav === "dashboard" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div>
                <h1 style={s.pageTitle}>Good morning, Suresh! 🙏</h1>
                <p style={s.pageSub}>Here's your WhatsApp business overview for today</p>
              </div>
              <div style={s.headerActions}>
                <button style={s.iconBtn}><Icon name="bell" size={18} /></button>
                <button style={s.iconBtn}><Icon name="refresh" size={18} /></button>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={s.statsGrid}>
              {[
                { label: "Messages Today", value: "1,284", growth: "+23%", icon: "chat", color: "#25d366", bg: "#dcfce7" },
                { label: "Active Chats", value: "284", growth: "+12%", icon: "whatsapp", color: "#6366f1", bg: "#ede9fe" },
                { label: "Auto Resolved", value: "68%", growth: "+5%", icon: "bot", color: "#f59e0b", bg: "#fef3c7" },
                { label: "Broadcast Reach", value: "3,420", growth: "+34%", icon: "broadcast", color: "#ec4899", bg: "#fce7f3" },
              ].map((stat) => (
                <div key={stat.label} style={s.statCard}>
                  <div style={{ ...s.statIcon, background: stat.bg, color: stat.color }}>
                    <Icon name={stat.icon} size={20} />
                  </div>
                  <div style={s.statValue}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                  <div style={{ ...s.statGrowth, color: stat.color }}>
                    <Icon name="trending" size={12} /> {stat.growth} vs last week
                  </div>
                </div>
              ))}
            </div>

            {/* Recent conversations + Quick Actions */}
            <div style={s.dashRow}>
              <div style={s.dashCard}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>Recent Conversations</h3>
                  <button style={s.viewAllBtn} onClick={() => setActiveNav("inbox")}>View All →</button>
                </div>
                {MOCK_CONTACTS.slice(0, 4).map((c) => (
                  <div key={c.id} style={s.recentRow} onClick={() => { setActiveNav("inbox"); selectContact(c); }}>
                    <div style={{ ...s.avatar, background: avatarColor(c.name) }}>{c.avatar}</div>
                    <div style={s.recentInfo}>
                      <div style={s.recentName}>{c.name}</div>
                      <div style={s.recentMsg}>{c.lastMsg}</div>
                    </div>
                    <div style={s.recentMeta}>
                      <div style={s.recentTime}>{c.time}</div>
                      {c.unread > 0 && <div style={s.unreadBadge}>{c.unread}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.dashCard}>
                <div style={s.cardHeader}><h3 style={s.cardTitle}>Quick Actions</h3></div>
                <div style={s.quickActions}>
                  {[
                    { label: "Send Broadcast", icon: "broadcast", color: "#6366f1", action: () => setShowBroadcastModal(true) },
                    { label: "New Template", icon: "template", color: "#f59e0b", action: () => setActiveNav("templates") },
                    { label: "View Analytics", icon: "analytics", color: "#ec4899", action: () => setActiveNav("analytics") },
                    { label: "Manage Chatbot", icon: "bot", color: "#25d366", action: () => setActiveNav("chatbot") },
                    { label: "Import Contacts", icon: "crm", color: "#0ea5e9", action: () => setActiveNav("crm") },
                    { label: "Upgrade Plan", icon: "tag", color: "#f43f5e", action: () => setActiveNav("pricing") },
                  ].map((a) => (
                    <button key={a.label} style={{ ...s.quickBtn, borderColor: a.color + "40" }} onClick={a.action}>
                      <span style={{ color: a.color }}><Icon name={a.icon} size={18} /></span>
                      <span style={s.quickLabel}>{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* Today's Highlights */}
                <div style={s.highlights}>
                  <div style={s.highlightItem}><span style={s.highlightDot} />Diwali broadcast: 74% open rate 🎉</div>
                  <div style={s.highlightItem}><span style={{ ...s.highlightDot, background: "#f59e0b" }} />5 new leads from chatbot today</div>
                  <div style={s.highlightItem}><span style={{ ...s.highlightDot, background: "#ec4899" }} />Avg response time: 1.2 min ⚡</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── INBOX ──────────────────────────────────────────────── */}
        {activeNav === "inbox" && (
          <div style={s.inboxLayout} className="fadeIn">
            {/* Contact List */}
            <div style={s.contactList}>
              <div style={s.inboxHeader}>
                <h2 style={s.inboxTitle}>Inbox</h2>
                <span style={s.inboxCount}>{MOCK_CONTACTS.length} chats</span>
              </div>
              <div style={s.searchBox}>
                <Icon name="search" size={15} />
                <input style={s.searchInput} placeholder="Search contacts..." value={searchContact} onChange={e => setSearchContact(e.target.value)} />
              </div>
              <div style={s.filterRow}>
                {["All", "Unread", "VIP", "Leads"].map(f => (
                  <button key={f} style={{ ...s.filterChip, ...(f === "All" ? s.filterActive : {}) }}>{f}</button>
                ))}
              </div>
              {filteredContacts.map((c) => (
                <div key={c.id} style={{ ...s.contactRow, ...(selectedContact?.id === c.id ? s.contactSelected : {}) }} onClick={() => selectContact(c)}>
                  <div style={s.contactAvatarWrap}>
                    <div style={{ ...s.avatar, background: avatarColor(c.name) }}>{c.avatar}</div>
                    <div style={{ ...s.statusDot, background: c.status === "active" ? "#25d366" : c.status === "away" ? "#f59e0b" : "#9ca3af" }} />
                  </div>
                  <div style={s.contactInfo}>
                    <div style={s.contactName}>{c.name}</div>
                    <div style={s.contactPreview}>{c.lastMsg}</div>
                  </div>
                  <div style={s.contactMeta}>
                    <div style={s.contactTime}>{c.time}</div>
                    {c.unread > 0 && <div style={s.unreadBadge}>{c.unread}</div>}
                    <div style={{ ...s.tagChip, background: tagColor(c.tag) + "20", color: tagColor(c.tag) }}>{c.tag}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Window */}
            <div style={s.chatWindow}>
              {/* Chat Header */}
              <div style={s.chatHeader}>
                <div style={{ ...s.avatar, background: avatarColor(selectedContact?.name) }}>{selectedContact?.avatar}</div>
                <div style={s.chatHeaderInfo}>
                  <div style={s.chatName}>{selectedContact?.name}</div>
                  <div style={s.chatSub}>{selectedContact?.phone} · {selectedContact?.business}</div>
                </div>
                <div style={s.chatHeaderActions}>
                  <button style={{ ...s.tagChip, background: tagColor(selectedContact?.tag) + "20", color: tagColor(selectedContact?.tag), border: "none", cursor: "default" }}>{selectedContact?.tag}</button>
                  <button style={s.iconBtn} title="Use Template" onClick={() => setShowTemplateModal(true)}>
                    <Icon name="template" size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={s.msgList}>
                <div style={s.dateLabel}>Today</div>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ ...s.msgRow, justifyContent: msg.from === "them" ? "flex-start" : "flex-end" }}>
                    {msg.from === "bot" && <div style={s.botAvatar}>🤖</div>}
                    <div style={{
                      ...s.bubble,
                      ...(msg.from === "them" ? s.bubbleThem : msg.from === "bot" ? s.bubbleBot : s.bubbleMe)
                    }}>
                      {msg.from === "bot" && <div style={s.botLabel}>AutoReply</div>}
                      <div style={s.msgText}>{msg.text}</div>
                      <div style={s.msgMeta}>
                        {msg.time}
                        {msg.from === "me" && <span style={s.msgStatus}> ✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>

              {/* Input */}
              <div style={s.chatInput}>
                <button style={s.quickReplyBtn} onClick={() => setShowTemplateModal(true)}>📋 Templates</button>
                <input
                  style={s.msgInput}
                  placeholder="Type a message..."
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button style={s.sendBtn} onClick={sendMessage}>
                  <Icon name="send" size={18} />
                </button>
              </div>
            </div>

            {/* Contact Details Panel */}
            <div style={s.contactDetails}>
              <div style={s.detailHeader}>Contact Info</div>
              <div style={{ ...s.detailAvatar, background: avatarColor(selectedContact?.name) }}>{selectedContact?.avatar}</div>
              <div style={s.detailName}>{selectedContact?.name}</div>
              <div style={s.detailPhone}>{selectedContact?.phone}</div>
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Business Type</div>
                <div style={s.detailValue}>{selectedContact?.business}</div>
              </div>
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Customer Tag</div>
                <div style={{ ...s.tagChip, background: tagColor(selectedContact?.tag) + "20", color: tagColor(selectedContact?.tag), alignSelf: "flex-start" }}>{selectedContact?.tag}</div>
              </div>
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Notes</div>
                <textarea style={s.notesArea} placeholder="Add notes about this customer..." rows={3} />
              </div>
              <button style={{ ...s.sendBtn, width: "100%", justifyContent: "center", gap: "8px" }}>
                <Icon name="tag" size={14} /> Update Tags
              </button>
            </div>
          </div>
        )}

        {/* ─── BROADCAST ─────────────────────────────────────────── */}
        {activeNav === "broadcast" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div><h1 style={s.pageTitle}>Broadcast Manager</h1><p style={s.pageSub}>Send bulk messages to your customer lists</p></div>
              <button style={s.primaryBtn} onClick={() => setShowBroadcastModal(true)}>
                <Icon name="plus" size={16} /> New Broadcast
              </button>
            </div>
            <div style={s.broadcastGrid}>
              {BROADCASTS.map((b) => (
                <div key={b.id} style={s.broadcastCard}>
                  <div style={s.broadcastTop}>
                    <div>
                      <div style={s.broadcastName}>{b.name}</div>
                      <div style={s.broadcastDate}>{b.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={s.bcTag}>{b.tag}</span>
                      <span style={{ ...s.statusBadge, background: b.status === "completed" ? "#dcfce7" : b.status === "running" ? "#fef3c7" : "#f3f4f6", color: b.status === "completed" ? "#16a34a" : b.status === "running" ? "#d97706" : "#6b7280" }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  <div style={s.broadcastStats}>
                    {[["Sent", b.sent, "#6366f1"], ["Delivered", b.delivered, "#25d366"], ["Read", b.read, "#0ea5e9"], ["Replied", b.replied, "#f59e0b"]].map(([label, val, color]) => (
                      <div key={label} style={s.bcStat}>
                        <div style={{ ...s.bcStatNum, color }}>{val.toLocaleString()}</div>
                        <div style={s.bcStatLabel}>{label}</div>
                        {b.sent > 0 && <div style={s.bcBar}><div style={{ ...s.bcBarFill, width: `${Math.round(val / b.sent * 100)}%`, background: color }} /></div>}
                      </div>
                    ))}
                  </div>
                  {b.sent > 0 && <div style={s.openRate}>Open Rate: <strong style={{ color: "#25d366" }}>{Math.round(b.read / b.sent * 100)}%</strong></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CHATBOT ───────────────────────────────────────────── */}
        {activeNav === "chatbot" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div><h1 style={s.pageTitle}>Chatbot Flows</h1><p style={s.pageSub}>Automate replies and resolve queries without human intervention</p></div>
              <button style={s.primaryBtn}><Icon name="plus" size={16} /> New Flow</button>
            </div>
            <div style={s.botGrid}>
              {CHATBOT_FLOWS.map((flow) => (
                <div key={flow.id} style={s.botCard}>
                  <div style={s.botCardTop}>
                    <div style={{ ...s.botIcon, background: flowColor(flow.type) + "20", color: flowColor(flow.type) }}>
                      {flowEmoji(flow.type)}
                    </div>
                    <label style={s.toggle}>
                      <input type="checkbox" defaultChecked={flow.active} style={{ display: "none" }} />
                      <div style={{ ...s.toggleTrack, background: flow.active ? "#25d366" : "#d1d5db" }}>
                        <div style={{ ...s.toggleThumb, transform: flow.active ? "translateX(16px)" : "translateX(0)" }} />
                      </div>
                    </label>
                  </div>
                  <div style={s.botName}>{flow.name}</div>
                  <div style={s.botTrigger}>Trigger: <em>{flow.trigger}</em></div>
                  <div style={s.botReplies}>{flow.responses.toLocaleString()} auto-replies sent</div>
                  <button style={s.editFlowBtn}>Edit Flow →</button>
                </div>
              ))}
            </div>

            {/* Greeting Preview */}
            <div style={s.greetingPreview}>
              <h3 style={s.cardTitle}>Welcome Message Preview</h3>
              <div style={s.phoneFrame}>
                <div style={s.phoneHeader}>WhatsApp Business</div>
                <div style={s.phoneChat}>
                  <div style={s.previewBubble}>
                    🤖 <strong>Welcome to our store!</strong><br /><br />
                    Hello! I'm your automated assistant. How can I help?<br /><br />
                    1️⃣ Place Order<br />
                    2️⃣ Track Order<br />
                    3️⃣ Business Hours<br />
                    4️⃣ Speak to Agent<br /><br />
                    <em>Reply with a number to continue</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TEMPLATES ─────────────────────────────────────────── */}
        {activeNav === "templates" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div><h1 style={s.pageTitle}>Message Templates</h1><p style={s.pageSub}>Pre-approved WhatsApp templates for all your business needs</p></div>
              <button style={s.primaryBtn}><Icon name="plus" size={16} /> New Template</button>
            </div>
            <div style={s.templatesGrid}>
              {TEMPLATES.map((t) => (
                <div key={t.id} style={s.templateCard}>
                  <div style={s.templateTop}>
                    <span style={s.templateCategory}>{t.category}</span>
                    <span style={{ ...s.statusBadge, background: t.status === "approved" ? "#dcfce7" : "#fef3c7", color: t.status === "approved" ? "#16a34a" : "#d97706" }}>{t.status}</span>
                  </div>
                  <div style={s.templateName}>{t.name}</div>
                  <div style={s.templateText}>{t.text}</div>
                  <div style={s.templateActions}>
                    <button style={s.useTemplateBtn} onClick={() => { setShowTemplateModal(false); setInputMsg(t.text); setActiveNav("inbox"); }}>Use in Chat</button>
                    <button style={s.editFlowBtn}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CRM ───────────────────────────────────────────────── */}
        {activeNav === "crm" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div><h1 style={s.pageTitle}>Customer CRM</h1><p style={s.pageSub}>Manage all your contacts and customer relationships</p></div>
              <button style={s.primaryBtn}><Icon name="plus" size={16} /> Import Contacts</button>
            </div>
            <div style={s.crmStats}>
              {[["Total Contacts", "1,847", "#6366f1"], ["New This Month", "134", "#25d366"], ["VIP Customers", "89", "#f59e0b"], ["Inactive (30d)", "203", "#ef4444"]].map(([label, val, color]) => (
                <div key={label} style={s.crmStatCard}>
                  <div style={{ ...s.crmStatNum, color }}>{val}</div>
                  <div style={s.crmStatLabel}>{label}</div>
                </div>
              ))}
            </div>
            <div style={s.crmTable}>
              <div style={s.tableHeader}>
                {["Name", "Phone", "Tag", "Business", "Last Contact", "Actions"].map(h => (
                  <div key={h} style={s.th}>{h}</div>
                ))}
              </div>
              {MOCK_CONTACTS.map((c) => (
                <div key={c.id} style={s.tableRow}>
                  <div style={s.td}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ ...s.avatar, width: "30px", height: "30px", fontSize: "12px", background: avatarColor(c.name) }}>{c.avatar}</div>{c.name}</div></div>
                  <div style={s.td}>{c.phone}</div>
                  <div style={s.td}><span style={{ ...s.tagChip, background: tagColor(c.tag) + "20", color: tagColor(c.tag) }}>{c.tag}</span></div>
                  <div style={s.td}>{c.business}</div>
                  <div style={s.td}>{c.time}</div>
                  <div style={s.td}><button style={s.editFlowBtn} onClick={() => { setActiveNav("inbox"); selectContact(c); }}>Chat →</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ANALYTICS ─────────────────────────────────────────── */}
        {activeNav === "analytics" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pageHeader}>
              <div><h1 style={s.pageTitle}>Analytics</h1><p style={s.pageSub}>Track performance of your WhatsApp business communication</p></div>
              <select style={s.dateSelect}><option>Last 7 days</option><option>Last 30 days</option><option>Last 3 months</option></select>
            </div>
            <div style={s.analyticsGrid}>
              {[
                { label: "Total Messages", value: "12,847", sub: "+23% vs last week", color: "#6366f1" },
                { label: "Active Conversations", value: "284", sub: "+12% vs last week", color: "#25d366" },
                { label: "Auto-Resolved by Bot", value: "68%", sub: "+5% vs last week", color: "#f59e0b" },
                { label: "Avg Response Time", value: "1.2 min", sub: "-18% faster", color: "#ec4899" },
                { label: "New Contacts", value: "134", sub: "This month", color: "#0ea5e9" },
                { label: "Broadcast Open Rate", value: "74%", sub: "Industry avg: 28%", color: "#f43f5e" },
              ].map((m) => (
                <div key={m.label} style={s.metricCard}>
                  <div style={{ ...s.metricValue, color: m.color }}>{m.value}</div>
                  <div style={s.metricLabel}>{m.label}</div>
                  <div style={s.metricSub}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Message volume chart (CSS bars) */}
            <div style={s.chartCard}>
              <h3 style={s.cardTitle}>Message Volume — Last 7 Days</h3>
              <div style={s.barChart}>
                {[["Mon", 820], ["Tue", 1240], ["Wed", 960], ["Thu", 1480], ["Fri", 1100], ["Sat", 680], ["Sun", 420]].map(([day, val]) => (
                  <div key={day} style={s.barCol}>
                    <div style={{ ...s.bar, height: `${val / 15}px`, background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
                    <div style={s.barLabel}>{day}</div>
                    <div style={s.barVal}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.analyticsRow}>
              <div style={s.chartCard}>
                <h3 style={s.cardTitle}>Top Chatbot Flows</h3>
                {CHATBOT_FLOWS.slice(0, 4).map((f) => (
                  <div key={f.id} style={s.flowRow}>
                    <span style={s.flowEmoji}>{flowEmoji(f.type)}</span>
                    <div style={s.flowInfo}>
                      <div style={s.flowName}>{f.name}</div>
                      <div style={s.flowBar}><div style={{ ...s.flowBarFill, width: `${f.responses / 13}%` }} /></div>
                    </div>
                    <span style={s.flowCount}>{f.responses}</span>
                  </div>
                ))}
              </div>
              <div style={s.chartCard}>
                <h3 style={s.cardTitle}>Customer Tags Distribution</h3>
                {[["Customer", 62, "#25d366"], ["Lead", 18, "#6366f1"], ["VIP", 12, "#f59e0b"], ["New", 8, "#ec4899"]].map(([tag, pct, color]) => (
                  <div key={tag} style={s.tagRow}>
                    <span style={s.tagName}>{tag}</span>
                    <div style={s.tagBar}><div style={{ ...s.tagBarFill, width: `${pct}%`, background: color }} /></div>
                    <span style={s.tagPct}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PRICING ───────────────────────────────────────────── */}
        {activeNav === "pricing" && (
          <div style={s.page} className="fadeIn">
            <div style={s.pricingHeader}>
              <div style={s.pricingBadge}>💰 Made for Indian SMBs</div>
              <h1 style={s.pricingTitle}>Simple, Affordable Plans</h1>
              <p style={s.pricingSubtitle}>Start free, scale as you grow. No hidden charges. Pay in INR.</p>
            </div>
            <div style={s.plansGrid}>
              {PLANS.map((plan) => (
                <div key={plan.id} style={{ ...s.planCard, ...(plan.popular ? s.planPopular : {}), borderColor: plan.popular ? plan.color : "#e5e7eb" }}>
                  {plan.popular && <div style={{ ...s.popularBadge, background: plan.color }}>⭐ Most Popular</div>}
                  <div style={{ ...s.planColor, color: plan.color }}>{plan.name}</div>
                  <div style={s.planPrice}>{plan.price}<span style={s.planPeriod}>{plan.period}</span></div>
                  <div style={s.planLimits}>{plan.contacts} · {plan.messages}</div>
                  <div style={s.planFeatures}>
                    {plan.features.map(f => (
                      <div key={f} style={s.planFeature}><span style={{ color: plan.color }}>✓</span> {f}</div>
                    ))}
                  </div>
                  <button style={{ ...s.planBtn, background: plan.popular ? plan.color : "white", color: plan.popular ? "white" : plan.color, borderColor: plan.color }}>
                    {plan.popular ? "Start Free Trial" : "Get Started"}
                  </button>
                  <div style={s.planNote}>14-day free trial · No credit card needed</div>
                </div>
              ))}
            </div>
            <div style={s.trustRow}>
              {["🔒 Secure Payments", "🇮🇳 GST Invoice Included", "⚡ Setup in 10 Minutes", "📞 Hindi & English Support"].map(t => (
                <div key={t} style={s.trustItem}>{t}</div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── BROADCAST MODAL ── */}
      {showBroadcastModal && (
        <div style={s.modalOverlay} onClick={() => setShowBroadcastModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>New Broadcast</h3>
              <button style={s.closeBtn} onClick={() => setShowBroadcastModal(false)}><Icon name="close" size={18} /></button>
            </div>
            <div style={s.modalBody}>
              <label style={s.fieldLabel}>Campaign Name</label>
              <input style={s.field} placeholder="e.g. Diwali Sale Offer" />
              <label style={s.fieldLabel}>Select Contact List</label>
              <select style={s.field}><option>All Customers (1,847)</option><option>VIP Customers (89)</option><option>New Leads (134)</option><option>Inactive Customers (203)</option></select>
              <label style={s.fieldLabel}>Message Template</label>
              <select style={s.field}><option>Festival Offer Template</option><option>New Stock Arrival</option><option>Payment Reminder</option></select>
              <label style={s.fieldLabel}>Message Preview</label>
              <textarea style={{ ...s.field, height: "100px", resize: "none" }} placeholder="🎉 Happy Diwali! Get 20% OFF on all products. Valid till Oct 31. Shop now!" />
              <label style={s.fieldLabel}>Schedule</label>
              <select style={s.field}><option>Send Now</option><option>Schedule for Later</option></select>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowBroadcastModal(false)}>Cancel</button>
              <button style={s.primaryBtn} onClick={() => { setShowBroadcastModal(false); alert("✅ Broadcast scheduled successfully!"); }}>
                <Icon name="send" size={14} /> Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE MODAL ── */}
      {showTemplateModal && (
        <div style={s.modalOverlay} onClick={() => setShowTemplateModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Choose Template</h3>
              <button style={s.closeBtn} onClick={() => setShowTemplateModal(false)}><Icon name="close" size={18} /></button>
            </div>
            <div style={s.modalBody}>
              {TEMPLATES.filter(t => t.status === "approved").map(t => (
                <div key={t.id} style={{ ...s.templateCard, cursor: "pointer", marginBottom: "10px" }} onClick={() => { setInputMsg(t.text); setShowTemplateModal(false); }}>
                  <div style={s.templateTop}><span style={s.templateCategory}>{t.category}</span></div>
                  <div style={s.templateName}>{t.name}</div>
                  <div style={s.templateText}>{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avatarColor(name) {
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#0ea5e9","#f43f5e","#8b5cf6","#14b8a6"];
  let hash = 0;
  for (let i = 0; i < (name||"").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
function tagColor(tag) {
  return { VIP: "#f59e0b", Customer: "#25d366", Lead: "#6366f1", New: "#0ea5e9" }[tag] || "#9ca3af";
}
function flowColor(type) {
  return { greeting: "#25d366", order: "#6366f1", booking: "#f59e0b", info: "#0ea5e9", pricing: "#ec4899", handoff: "#f43f5e" }[type] || "#9ca3af";
}
function flowEmoji(type) {
  return { greeting: "👋", order: "📦", booking: "📅", info: "ℹ️", pricing: "💰", handoff: "👤" }[type] || "🤖";
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow: hidden; }
  .fadeIn { animation: fadeIn 0.35s ease both; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  input, select, textarea, button { font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
  button { transition: all 0.15s; }
  button:hover { filter: brightness(0.95); }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: { display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b", overflow: "hidden" },

  // Sidebar
  sidebar: { width: "220px", background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoIcon: { width: "36px", height: "36px", background: "#25d366", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoName: { color: "#fff", fontWeight: 700, fontSize: "15px" },
  logoPlan: { color: "#25d366", fontSize: "10px", fontWeight: 500 },
  nav: { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "13px", fontWeight: 500, position: "relative", textAlign: "left" },
  navActive: { background: "rgba(37,211,102,0.15)", color: "#25d366" },
  navLabel: { flex: 1 },
  navBadge: { background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "10px", padding: "1px 6px", minWidth: "18px", textAlign: "center" },
  sidebarBottom: { padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  agentStatus: { display: "flex", alignItems: "center", gap: "10px" },
  agentAvatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#25d366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 },
  agentName: { color: "#fff", fontSize: "12px", fontWeight: 600 },
  agentOnline: { display: "flex", alignItems: "center", gap: "4px", color: "#25d366", fontSize: "11px" },
  onlineDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#25d366", display: "inline-block" },

  // Main
  main: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" },
  page: { flex: 1, overflowY: "auto", padding: "24px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  pageTitle: { fontSize: "22px", fontWeight: 700, color: "#0f172a" },
  pageSub: { fontSize: "13px", color: "#64748b", marginTop: "3px" },
  headerActions: { display: "flex", gap: "8px" },

  // Buttons
  primaryBtn: { display: "flex", alignItems: "center", gap: "6px", background: "#25d366", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  iconBtn: { background: "#f1f5f9", border: "none", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
  cancelBtn: { background: "#f1f5f9", color: "#374151", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  statIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" },
  statValue: { fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" },
  statLabel: { fontSize: "12px", color: "#64748b", marginBottom: "6px" },
  statGrowth: { fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 },

  // Dashboard
  dashRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  dashCard: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  viewAllBtn: { fontSize: "12px", color: "#25d366", background: "none", border: "none", cursor: "pointer", fontWeight: 600 },
  recentRow: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f8fafc", cursor: "pointer" },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontSize: "13px", fontWeight: 600, color: "#0f172a" },
  recentMsg: { fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  recentMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  recentTime: { fontSize: "11px", color: "#94a3b8" },
  unreadBadge: { background: "#25d366", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "10px", padding: "1px 6px", minWidth: "18px", textAlign: "center" },
  quickActions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" },
  quickBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "#f8fafc", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 500 },
  quickLabel: { color: "#374151" },
  highlights: { borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" },
  highlightItem: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" },
  highlightDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#25d366", flexShrink: 0 },

  // Avatar
  avatar: { width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "14px", flexShrink: 0 },

  // Inbox
  inboxLayout: { display: "flex", flex: 1, height: "100vh", overflow: "hidden" },
  contactList: { width: "280px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0, overflowY: "auto" },
  inboxHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #f1f5f9" },
  inboxTitle: { fontSize: "16px", fontWeight: 700 },
  inboxCount: { fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#94a3b8" },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "13px", color: "#374151", background: "transparent" },
  filterRow: { display: "flex", gap: "6px", padding: "8px 12px", borderBottom: "1px solid #f1f5f9" },
  filterChip: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "transparent", cursor: "pointer", color: "#64748b", fontWeight: 500 },
  filterActive: { background: "#dcfce7", borderColor: "#25d366", color: "#16a34a" },
  contactRow: { display: "flex", alignItems: "center", gap: "10px", padding: "12px", cursor: "pointer", borderBottom: "1px solid #f8fafc" },
  contactSelected: { background: "#f0fdf4" },
  contactAvatarWrap: { position: "relative", flexShrink: 0 },
  statusDot: { position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", border: "2px solid white" },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" },
  contactPreview: { fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  contactMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  contactTime: { fontSize: "10px", color: "#94a3b8" },
  tagChip: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", fontWeight: 600 },

  // Chat
  chatWindow: { flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc" },
  chatHeader: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0" },
  chatHeaderInfo: { flex: 1 },
  chatName: { fontSize: "14px", fontWeight: 700, color: "#0f172a" },
  chatSub: { fontSize: "11px", color: "#94a3b8" },
  chatHeaderActions: { display: "flex", gap: "8px", alignItems: "center" },
  msgList: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" },
  dateLabel: { textAlign: "center", fontSize: "11px", color: "#94a3b8", background: "#e2e8f0", borderRadius: "10px", padding: "3px 12px", alignSelf: "center" },
  msgRow: { display: "flex", gap: "6px", alignItems: "flex-end" },
  botAvatar: { fontSize: "16px", flexShrink: 0, marginBottom: "4px" },
  bubble: { maxWidth: "68%", padding: "10px 14px", borderRadius: "14px", fontSize: "13px", lineHeight: 1.55 },
  bubbleThem: { background: "#fff", borderBottomLeftRadius: "4px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" },
  bubbleBot: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderBottomLeftRadius: "4px" },
  bubbleMe: { background: "#dcfce7", borderBottomRightRadius: "4px" },
  botLabel: { fontSize: "9px", color: "#25d366", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px", textTransform: "uppercase" },
  msgText: { color: "#1e293b", whiteSpace: "pre-line" },
  msgMeta: { fontSize: "10px", color: "#94a3b8", textAlign: "right", marginTop: "4px" },
  msgStatus: { color: "#25d366" },
  chatInput: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#fff", borderTop: "1px solid #e2e8f0" },
  quickReplyBtn: { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", cursor: "pointer", color: "#374151", whiteSpace: "nowrap" },
  msgInput: { flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "9px 16px", fontSize: "13px", outline: "none", background: "#f8fafc" },
  sendBtn: { background: "#25d366", color: "white", border: "none", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },

  // Contact Detail Panel
  contactDetails: { width: "220px", borderLeft: "1px solid #e2e8f0", background: "#fff", padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" },
  detailHeader: { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  detailAvatar: { width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "20px", alignSelf: "center" },
  detailName: { fontSize: "15px", fontWeight: 700, textAlign: "center", color: "#0f172a" },
  detailPhone: { fontSize: "12px", color: "#64748b", textAlign: "center" },
  detailSection: { display: "flex", flexDirection: "column", gap: "4px" },
  detailLabel: { fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 },
  detailValue: { fontSize: "13px", color: "#374151" },
  notesArea: { border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", fontSize: "12px", color: "#374151", outline: "none", resize: "none", width: "100%" },

  // Broadcast
  broadcastGrid: { display: "flex", flexDirection: "column", gap: "14px" },
  broadcastCard: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  broadcastTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  broadcastName: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  broadcastDate: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  bcTag: { background: "#ede9fe", color: "#7c3aed", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 },
  statusBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 },
  broadcastStats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" },
  bcStat: { textAlign: "center" },
  bcStatNum: { fontSize: "20px", fontWeight: 700 },
  bcStatLabel: { fontSize: "11px", color: "#94a3b8", marginBottom: "4px" },
  bcBar: { height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" },
  bcBarFill: { height: "100%", borderRadius: "2px" },
  openRate: { fontSize: "12px", color: "#64748b", textAlign: "right", marginTop: "12px" },

  // Chatbot
  botGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" },
  botCard: { background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  botCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  botIcon: { width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  toggle: { cursor: "pointer" },
  toggleTrack: { width: "36px", height: "20px", borderRadius: "10px", position: "relative", transition: "background 0.2s" },
  toggleThumb: { width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
  botName: { fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  botTrigger: { fontSize: "11px", color: "#64748b", marginBottom: "6px" },
  botReplies: { fontSize: "12px", color: "#25d366", fontWeight: 600, marginBottom: "12px" },
  editFlowBtn: { background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", color: "#374151", cursor: "pointer" },
  greetingPreview: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  phoneFrame: { maxWidth: "300px", margin: "16px auto 0", background: "#e8f5e9", borderRadius: "16px", overflow: "hidden", border: "1px solid #c8e6c9" },
  phoneHeader: { background: "#075e54", color: "#fff", padding: "10px 14px", fontSize: "13px", fontWeight: 600 },
  phoneChat: { padding: "12px" },
  previewBubble: { background: "#fff", borderRadius: "12px", padding: "12px", fontSize: "13px", lineHeight: 1.6, color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" },

  // Templates
  templatesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" },
  templateCard: { background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  templateTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  templateCategory: { fontSize: "11px", background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 },
  templateName: { fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" },
  templateText: { fontSize: "12px", color: "#64748b", lineHeight: 1.6, marginBottom: "12px" },
  templateActions: { display: "flex", gap: "8px" },
  useTemplateBtn: { background: "#25d366", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },

  // CRM
  crmStats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" },
  crmStatCard: { background: "#fff", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  crmStatNum: { fontSize: "24px", fontWeight: 700 },
  crmStatLabel: { fontSize: "12px", color: "#64748b", marginTop: "2px" },
  crmTable: { background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1fr 1fr", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid #f8fafc", alignItems: "center" },
  th: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" },
  td: { fontSize: "13px", color: "#374151" },

  // Analytics
  analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" },
  metricCard: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  metricValue: { fontSize: "28px", fontWeight: 700, marginBottom: "4px" },
  metricLabel: { fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "2px" },
  metricSub: { fontSize: "11px", color: "#94a3b8" },
  chartCard: { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "16px" },
  barChart: { display: "flex", gap: "12px", alignItems: "flex-end", height: "120px", marginTop: "16px" },
  barCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 },
  bar: { width: "100%", borderRadius: "6px 6px 0 0", minHeight: "4px" },
  barLabel: { fontSize: "11px", color: "#94a3b8" },
  barVal: { fontSize: "10px", color: "#64748b" },
  analyticsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  flowRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f8fafc" },
  flowEmoji: { fontSize: "18px" },
  flowInfo: { flex: 1 },
  flowName: { fontSize: "12px", fontWeight: 600, marginBottom: "4px" },
  flowBar: { height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" },
  flowBarFill: { height: "100%", background: "linear-gradient(90deg,#25d366,#16a34a)", borderRadius: "2px" },
  flowCount: { fontSize: "12px", fontWeight: 700, color: "#25d366" },
  tagRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" },
  tagName: { fontSize: "12px", fontWeight: 600, width: "70px" },
  tagBar: { flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" },
  tagBarFill: { height: "100%", borderRadius: "3px" },
  tagPct: { fontSize: "12px", fontWeight: 700, width: "35px", textAlign: "right" },
  dateSelect: { border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", color: "#374151", outline: "none", background: "#fff" },

  // Pricing
  pricingHeader: { textAlign: "center", marginBottom: "32px" },
  pricingBadge: { display: "inline-block", background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: 600, padding: "4px 14px", borderRadius: "20px", marginBottom: "14px" },
  pricingTitle: { fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" },
  pricingSubtitle: { fontSize: "14px", color: "#64748b" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  planCard: { background: "#fff", borderRadius: "16px", padding: "24px", border: "2px solid #e5e7eb", position: "relative" },
  planPopular: { boxShadow: "0 8px 24px rgba(99,102,241,0.2)" },
  popularBadge: { position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 14px", borderRadius: "20px", whiteSpace: "nowrap" },
  planColor: { fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
  planPrice: { fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" },
  planPeriod: { fontSize: "14px", fontWeight: 400, color: "#94a3b8" },
  planLimits: { fontSize: "12px", color: "#64748b", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" },
  planFeatures: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
  planFeature: { fontSize: "13px", color: "#374151", display: "flex", gap: "6px", alignItems: "flex-start" },
  planBtn: { width: "100%", padding: "11px", borderRadius: "10px", border: "2px solid", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "8px" },
  planNote: { fontSize: "11px", color: "#94a3b8", textAlign: "center" },
  trustRow: { display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" },
  trustItem: { fontSize: "13px", color: "#64748b", fontWeight: 500 },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "16px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "80vh", display: "flex", flexDirection: "column" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" },
  modalTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a" },
  closeBtn: { background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
  modalBody: { padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" },
  modalFooter: { padding: "16px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "8px" },
  fieldLabel: { fontSize: "12px", fontWeight: 600, color: "#374151" },
  field: { border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: "#374151", outline: "none", width: "100%", background: "#f8fafc" },
};
