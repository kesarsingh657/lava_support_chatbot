import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ChevronLeft, X, MessageCircle } from "lucide-react";

const BASE_URL = "http://192.168.114.60:8082";

// Categories mapping based on question content
const CATEGORIES = {
  power: {
    id: "power",
    name: "Power & Battery",
    keywords: ["charging", "battery", "power", "switch", "switching"]
  },
  performance: {
    id: "performance",
    name: "Performance Issues",
    keywords: ["hanging", "freezing", "slow", "overheating", "heating"]
  },
  network: {
    id: "network",
    name: "Network & Internet",

    keywords: ["internet", "network", "sim", "wifi", "hotspot", "data"]
  },
  apps: {
    id: "apps",
    name: "Apps & Software",

    keywords: ["app", "application", "whatsapp", "facebook", "notification", "play store"]
  },
  settings: {
    id: "settings",
    name: "Settings & Features",

    keywords: ["talkback", "call recording", "fingerprint", "applock", "anti-theft", "screen cast", "assistant", "edge light"]
  }
};

const LavaSupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("welcome");
  const [questions, setQuestions] = useState([]);
  const [categorizedQuestions, setCategorizedQuestions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [errors, setErrors] = useState({});
  const [generatedTicketNo, setGeneratedTicketNo] = useState(null);
  const [ticketData, setTicketData] = useState({
    fullName: "",
    email: "",
    phone: "",
    description: ""
  });
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const categorizeQuestion = (question) => {
    const questionLower = question.toLowerCase();

    for (const [key, category] of Object.entries(CATEGORIES)) {
      if (category.keywords.some(keyword => questionLower.includes(keyword))) {
        return key;
      }
    }

    return "settings"; // default category
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chatbot/questions`);
      const data = await res.json();
      const formattedData = data.map(item => ({
        id: item[0],
        question: item[1],
        createdAt: item[2],
        category: categorizeQuestion(item[1])
      }));

      setQuestions(formattedData);

      // Group questions by category
      const grouped = formattedData.reduce((acc, q) => {
        if (!acc[q.category]) {
          acc[q.category] = [];
        }
        acc[q.category].push(q);
        return acc;
      }, {});

      setCategorizedQuestions(grouped);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchAnswers = async (questionId) => {
    setSelectedQuestion(questionId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/chatbot/questions/${questionId}/responses`
      );
      const data = await res.json();
      setAnswers(data);
      setCurrentView("answer");
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const submitFeedback = async (wasHelpful) => {
    try {
      await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion,
          wasHelpful,
          contactNumber: ticketData.phone || null,
          email: ticketData.email || null,
          queryText: ticketData.description || null,
          ticket_no: null,
          created_by: ticketData.fullName || null,
          updated_by: null,
        }),
      });

      setFeedbackType(wasHelpful ? "like" : "dislike");
      setCurrentView("thankYouFeedback");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value) newErrors.email = "Email is required";
      else if (!validateEmail(value)) newErrors.email = "Enter a valid email";
      else delete newErrors.email;
    }

    if (name === "phone") {
      if (value && !validatePhone(value))
        newErrors.phone = "Enter valid 10-digit phone number";
      else delete newErrors.phone;
    }

    if (name === "fullName") {
      if (!value.trim()) newErrors.fullName = "Full name is required";
      else delete newErrors.fullName;
    }

    if (name === "description") {
      if (!value.trim()) newErrors.description = "Description is required";
      else if (value.length > 250)
        newErrors.description = "Max 250 characters allowed";
      else delete newErrors.description;
    }

    setErrors(newErrors);
    setTicketData({ ...ticketData, [name]: value });
  };

  const handleTicketSubmit = async () => {
    let newErrors = {};

    if (!ticketData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!ticketData.email)
      newErrors.email = "Email is required";
    else if (!validateEmail(ticketData.email))
      newErrors.email = "Enter a valid email";

    if (ticketData.phone && !validatePhone(ticketData.phone))
      newErrors.phone = "Enter valid 10-digit phone number";

    if (!ticketData.description.trim())
      newErrors.description = "Description is required";
    else if (ticketData.description.length > 250)
      newErrors.description = "Max 250 characters allowed";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`${BASE_URL}/api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData)
      });

      const data = await res.json();
      setGeneratedTicketNo(data.ticketNo || "TKT-" + Date.now());
      setCurrentView("ticketSuccess");
      setTicketData({
        fullName: "",
        email: "",
        phone: "",
        description: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Ticket submit error:", error);
      alert("Failed to submit ticket. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen && currentView === "categoryList") {
      fetchQuestions();
    }
  }, [isOpen, currentView]);

  const handleBack = () => {
    if (currentView === "answer") {
      setCurrentView("questionList");
      setSelectedQuestion(null);
      setAnswers([]);
    }
    else if (currentView === "questionList") {
      setCurrentView("categoryList");
      setSelectedCategory(null);
    }
    else if (currentView === "categoryList") {
      setCurrentView("welcome");
    }
    else if (currentView === "submitTicket" || currentView === "thankYouFeedback") {
      setCurrentView("welcome");
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView("questionList");

    // Animate questions
    const categoryQuestions = categorizedQuestions[categoryId] || [];
    setVisibleQuestions([]);
    categoryQuestions.forEach((_, index) => {
      setTimeout(() => {
        setVisibleQuestions(prev => [...prev, index]);
      }, index * 150);
    });
  };

  return (
    <>
      <div style={styles.chatIcon} onClick={() => setIsOpen(true)}>
        <MessageCircle size={28} color="white" />
      </div>

      {isOpen && (
        <div style={styles.chatbot}>
          <div style={styles.header}>
            {currentView !== "welcome" && (
              <button style={styles.backButton} onClick={handleBack}>
                <ChevronLeft size={24} />
              </button>
            )}
            <div style={styles.headerContent}>
              <div style={styles.logo}>
                <span style={styles.logolava}>LAVA</span>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {currentView === "welcome" && (
            <div style={styles.body}>
              <div style={styles.welcomeView}>
                <h1 style={styles.welcomeTitle}>Hello there!</h1>
                <p style={styles.welcomeSubtitle}>Chat with us</p>

                <div style={styles.faqSection}>
                  <div style={styles.faqHeader}>
                    <p style={styles.faqTitle}>Frequently Asked Questions</p>
                  </div>
                  <div
                    style={styles.faqCard}
                    onClick={() => {
                      setCurrentView("categoryList");
                      fetchQuestions();
                    }}
                  >
                    <div style={styles.faqIcon}>F</div>
                    <div style={styles.faqText}>Find answers to common questions</div>
                  </div>
                </div>

                <p style={styles.footerText}>Welcome to LAVA Support</p>
              </div>
            </div>
          )}

          {currentView === "categoryList" && (
            <div style={styles.body}>
              <div style={styles.categoryListView}>
                <h2 style={styles.categoryListTitle}>Select a Category</h2>
                <div style={styles.categoriesGrid}>
                  {Object.entries(CATEGORIES).map(([key, category]) => {
                    const count = (categorizedQuestions[key] || []).length;
                    if (count === 0) return null;

                    return (
                      <div
                        key={key}
                        style={styles.categoryCard}
                        onClick={() => handleCategorySelect(key)}
                      >
                        <div style={styles.categoryIconLarge}>{category.icon}</div>
                        <div style={styles.categoryName}>{category.name}</div>
                      </div>

                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentView === "questionList" && selectedCategory && (
            <div style={styles.body}>
              <div style={styles.questionListView}>
                <div style={styles.categoryHeader}>
                  <div style={styles.categoryIconSmall}>
                    {CATEGORIES[selectedCategory].icon}
                  </div>
                  <div>
                    <div style={styles.categoryName}>
                      {CATEGORIES[selectedCategory].name}
                    </div>
                  </div>
                </div>

                <div style={styles.questionsList}>
                  {(categorizedQuestions[selectedCategory] || []).map((q, index) => (
                    <div
                      key={q.id}
                      style={{
                        ...styles.questionItem,
                        opacity: visibleQuestions.includes(index) ? 1 : 0,
                        transform: visibleQuestions.includes(index)
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease'
                      }}
                      onClick={() => fetchAnswers(q.id)}
                    >
                      <span style={styles.questionIcon}>📄</span>
                      <div style={styles.questionText}>{q.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === "answer" && (
            <div style={styles.body}>
              <div style={styles.answerView}>
                <div style={styles.answerHeader}>
                  <div style={styles.answerCategory}>
                    {selectedCategory && CATEGORIES[selectedCategory].name}
                  </div>
                </div>
                <h2 style={styles.answerQuestion}>
                  {questions.find(q => q.id === selectedQuestion)?.question}
                </h2>
                <div style={styles.answerContent}>
                  {answers.map((a, i) => (
                    <div key={i} style={styles.answerSection}>
                      <p style={styles.answerText}>{a[2]}</p>
                    </div>
                  ))}
                </div>
                <div style={styles.feedbackSection}>
                  <p style={styles.feedbackQuestion}>Was this article useful?</p>
                  <div style={styles.feedbackButtons}>
                    <button
                      style={styles.feedbackBtn}
                      onClick={() => submitFeedback(true)}
                    >
                      <ThumbsUp size={20} />
                    </button>
                    <button
                      style={styles.feedbackBtn}
                      onClick={() => submitFeedback(false)}
                    >
                      <ThumbsDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "thankYouFeedback" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  {feedbackType === "like" && (
                    <>
                      <div style={styles.checkmark}>✓</div>
                      <h3 style={styles.thankYouText}>
                        Thank you for your Feedback!
                      </h3>
                      <p style={styles.feedbackMessage}>
                        We're glad this information was helpful 😊
                      </p>

                      <button
                        style={styles.backToHomeBtn}
                        onClick={() => setCurrentView("welcome")}
                      >
                        Back to Home
                      </button>
                    </>
                  )}

                  {feedbackType === "dislike" && (
                    <>
                      <h3 style={styles.thankYouText}>
                        Sorry this didn't help
                      </h3>
                      <p style={styles.feedbackMessage}>
                        We appreciate your feedback. Please submit your query below so we can assist you better.
                      </p>

                      <div style={styles.contactForm}>
                        <input
                          style={errors.fullName ? styles.inputError : styles.input}
                          name="fullName"
                          placeholder="Full Name *"
                          value={ticketData.fullName}
                          onChange={handleTicketChange}
                        />
                        {errors.fullName && <div style={styles.errorText}>{errors.fullName}</div>}

                        <input
                          style={errors.email ? styles.inputError : styles.input}
                          name="email"
                          type="email"
                          placeholder="Registered Email *"
                          value={ticketData.email}
                          onChange={handleTicketChange}
                        />
                        {errors.email && <div style={styles.errorText}>{errors.email}</div>}

                        <input
                          style={errors.phone ? styles.inputError : styles.input}
                          name="phone"
                          placeholder="Phone Number"
                          value={ticketData.phone}
                          onChange={handleTicketChange}
                        />
                        {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}

                        <textarea
                          style={errors.description ? styles.textareaError : styles.textarea}
                          name="description"
                          placeholder="Describe your issue *"
                          value={ticketData.description}
                          onChange={handleTicketChange}
                        />
                        {errors.description && <div style={styles.errorText}>{errors.description}</div>}

                        <button style={styles.submitBtn} onClick={handleTicketSubmit}>
                          Submit Ticket
                        </button>

                        <button
                          style={styles.backToHomeBtn}
                          onClick={() => setCurrentView("welcome")}
                        >
                          Back to Home
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === "ticketSuccess" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  <div style={styles.checkmark}>✓</div>
                  <h3 style={styles.thankYouText}>
                    Ticket Submitted Successfully!
                  </h3>

                  <button
                    style={styles.backToHomeBtn}
                    onClick={() => setCurrentView("welcome")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const styles = {
  chatIcon: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999,
    boxShadow: "0 8px 24px rgba(33, 150, 243, 0.25)",
    transition: "transform 0.2s",
  },
  chatbot: {
    position: "fixed",
    bottom: "95px",
    right: "24px",
    width: "400px",
    height: "600px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    zIndex: 9999,
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)",
    color: "#fff",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "70px",
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: "1",
  },
  logolava: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: "1px",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    background: "#f8f9fa",
  },
  welcomeView: {
    padding: "24px",
    background: "linear-gradient(180deg, #1976D2 0%, #1976D2 45%, #f8f9fa 45%)",
    minHeight: "100%",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
    margin: "0 0 8px 0",
  },
  welcomeSubtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "32px",
  },
  faqSection: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  faqHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  faqTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  faqCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#E3F2FD",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  faqIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#2196F3",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  faqText: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: "12px",
    color: "#666",
    marginTop: "24px",
  },
  categoryListView: {
    padding: "20px",
    minHeight: "100%",
  },
  categoryListTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "16px",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  categoryCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  categoryIconLarge: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  categoryName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "4px",
  },
  categoryCount: {
    fontSize: "12px",
    color: "#666",
  },
  questionListView: {
    padding: "20px",
    minHeight: "100%",
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "white",
    borderRadius: "12px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  categoryIconSmall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#E3F2FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  questionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  questionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  questionIcon: {
    fontSize: "16px",
    marginTop: "2px",
  },
  questionText: {
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.5",
  },
  answerView: {
    padding: "20px",
    minHeight: "100%",
    background: "white",
  },
  answerHeader: {
    marginBottom: "16px",
  },
  answerCategory: {
    fontSize: "12px",
    color: "#666",
  },
  answerQuestion: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  answerContent: {
    marginBottom: "24px",
  },
  answerSection: {
    marginBottom: "16px",
  },
  answerText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  feedbackSection: {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "20px",
    textAlign: "center",
  },
  feedbackQuestion: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "12px",
    fontWeight: "500",
  },
  feedbackButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  feedbackBtn: {
    background: "white",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  input: {
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  inputError: {
    padding: "10px",
    border: "2px solid #f44336",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  textareaError: {
    padding: "10px",
    border: "2px solid #f44336",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  errorText: {
    color: "#f44336",
    fontSize: "12px",
    marginTop: "-8px",
    marginBottom: "4px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
  feedbackView: {
    padding: "20px",
    minHeight: "100%",
    background: "white",
    display: "flex",
    flexDirection: "column",
  },
  feedbackSuccess: {
    textAlign: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  checkmark: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#4CAF50",
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  thankYouText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  feedbackMessage: {
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  backToHomeBtn: {
    background: "transparent",
    color: "#2196F3",
    border: "2px solid #2196F3",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
};

export default LavaSupportChatbot;